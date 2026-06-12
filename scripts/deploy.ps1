#Requires -Version 5.1
<#
.SYNOPSIS
  Konum Online — FTP yedek + yükleme
.DESCRIPTION
  1) Sunucudaki mevcut siteyi _backups/ altına indirir
  2) Yerel deploy dosyalarını FTP'ye yükler
  3) form/config.php sunucuda yoksa yükler (mevcutsa dokunmaz)
#>
param(
  [switch]$NoBackup,
  [switch]$NoUpload,
  [int]$KeepBackups = 0
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$envFile = Join-Path $root ".ftp-deploy.env"

if (-not (Test-Path $envFile)) {
  Write-Error "`.ftp-deploy.env` bulunamadı. `.ftp-deploy.example.env` dosyasını kopyalayıp doldurun."
}

Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
  $name, $value = $_ -split '=', 2
  Set-Item -Path "env:$($name.Trim())" -Value $value.Trim()
}

if (-not $env:FTP_HOST -or -not $env:FTP_USER -or -not $env:FTP_PASS) {
  Write-Error "FTP_HOST, FTP_USER ve FTP_PASS .ftp-deploy.env içinde tanımlı olmalı."
}

if ($KeepBackups -le 0) {
  $KeepBackups = if ($env:KEEP_BACKUPS) { [int]$env:KEEP_BACKUPS } else { 10 }
}

$remotePath = ($env:FTP_REMOTE_PATH -replace '\\', '/').Trim('/')
$ftpBase = "ftp://$($env:FTP_HOST)/$remotePath"
$cred = "$($env:FTP_USER):$($env:FTP_PASS)"
$stamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupRoot = Join-Path $root "_backups"
$backupDir = Join-Path $backupRoot $stamp

$excludeRel = @(
  'deploy.md', '.gitignore', 'assets\text.md', 'assets/text.md',
  '.ftp-deploy.env', '.ftp-deploy.example.env'
)

function Invoke-Curl {
  param([string[]]$CurlArgs)
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'SilentlyContinue'
  & curl.exe @CurlArgs 2>&1 | Out-Null
  $code = $LASTEXITCODE
  $ErrorActionPreference = $prev
  return $code
}

function Test-FtpDirectory {
  param([string]$Url)
  return (Invoke-Curl @('-sS', '--user', $cred, "$Url/", '--list-only')) -eq 0
}

function Get-FtpEntries {
  param([string]$Url)
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'SilentlyContinue'
  $raw = curl.exe -sS --user $cred "$Url/" --list-only 2>&1
  $code = $LASTEXITCODE
  $ErrorActionPreference = $prev
  if ($code -ne 0) { return @() }
  return $raw -split "`n" | ForEach-Object { $_.Trim() } | Where-Object {
    $_ -and $_ -ne '.' -and $_ -ne '..'
  }
}

function Get-FtpEntryName {
  param([string]$Entry)
  $e = $Entry.Trim().Replace('\', '/')
  if (-not $e -or $e -eq '.' -or $e -eq '..') { return $null }
  return ($e -split '/')[-1]
}

function Backup-FtpRecursive {
  param(
    [string]$Url,
    [string]$LocalPrefix
  )
  foreach ($entry in (Get-FtpEntries $Url)) {
    $entryName = Get-FtpEntryName $entry
    if (-not $entryName) { continue }
    $childUrl = "$Url/$entryName"
    $localPath = Join-Path $LocalPrefix $entryName
    if (Test-FtpDirectory $childUrl) {
      New-Item -ItemType Directory -Force -Path $localPath | Out-Null
      Backup-FtpRecursive $childUrl $localPath
    }
    else {
      $parent = Split-Path $localPath -Parent
      if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
      }
      $code = Invoke-Curl @('-sS', '--user', $cred, '-o', $localPath, $childUrl)
      if ($code -ne 0) {
        Write-Warning "Yedeklenemedi: $entryName"
      }
    }
  }
}

function Get-DeployFiles {
  Get-ChildItem -Path $root -Recurse -File | Where-Object {
    $rel = $_.FullName.Substring($root.Length + 1)
    if ($rel -match '^(\.git|\.gstack|\.githooks|_arsiv|_backups|arasitrma|scripts)\\') { return $false }
    if ($excludeRel -contains $rel) { return $false }
    if ($rel -eq 'form\config.php') { return $false }
    return $true
  }
}

function Upload-DeployFiles {
  $files = Get-DeployFiles
  $ok = 0
  $fail = 0
  foreach ($f in $files) {
    $rel = $f.FullName.Substring($root.Length + 1).Replace('\', '/')
    $url = "$ftpBase/$rel"
    $code = Invoke-Curl @('-sS', '--ftp-create-dirs', '-T', $f.FullName, '--user', $cred, $url)
    if ($code -ne 0) {
      Write-Host "FAIL $rel" -ForegroundColor Red
      $fail++
    }
    else {
      Write-Host "OK   $rel" -ForegroundColor Green
      $ok++
    }
  }

  # config.php: only upload if missing on server
  $configUrl = "$ftpBase/form/config.php"
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'SilentlyContinue'
  $configList = curl.exe -sS --user $cred "$ftpBase/form/" --list-only 2>&1
  $ErrorActionPreference = $prev
  if ($configList -notmatch 'config\.php') {
    $tmp = Join-Path $env:TEMP "konum-form-config.php"
    @(
      '<?php',
      "define('FORM_RECIPIENT', 'bayram@konum.online');",
      "define('FORM_FROM', 'noreply@konum.online');"
    ) | Set-Content -Path $tmp -Encoding UTF8
    $code = Invoke-Curl @('-sS', '--ftp-create-dirs', '-T', $tmp, '--user', $cred, $configUrl)
    if ($code -eq 0) {
      Write-Host "OK   form/config.php (ilk kurulum)" -ForegroundColor Green
      $ok++
    }
    else {
      Write-Host "FAIL form/config.php" -ForegroundColor Red
      $fail++
    }
  }
  else {
    Write-Host "SKIP form/config.php (sunucuda mevcut)" -ForegroundColor DarkYellow
  }

  return @{ Ok = $ok; Fail = $fail }
}

function Prune-OldBackups {
  if (-not (Test-Path $backupRoot)) { return }
  $dirs = Get-ChildItem $backupRoot -Directory | Sort-Object Name -Descending
  if ($dirs.Count -le $KeepBackups) { return }
  $dirs | Select-Object -Skip $KeepBackups | ForEach-Object {
    Write-Host "Eski yedek siliniyor: $($_.Name)" -ForegroundColor DarkGray
    Remove-Item $_.FullName -Recurse -Force
  }
}

Write-Host "Konum Online deploy" -ForegroundColor Cyan
Write-Host "Hedef: $ftpBase"

if (-not $NoBackup) {
  Write-Host "`n[1/2] Sunucu yedeği alınıyor -> _backups/$stamp" -ForegroundColor Cyan
  New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
  $gitHash = try { git -C $root rev-parse --short HEAD 2>$null } catch { $null }
  if ($gitHash) {
    Set-Content -Path (Join-Path $backupDir "git-commit.txt") -Value $gitHash -Encoding UTF8
  }
  Backup-FtpRecursive $ftpBase $backupDir
  Prune-OldBackups
  Write-Host "Yedek tamam." -ForegroundColor Green
}

if (-not $NoUpload) {
  Write-Host "`n[2/2] Dosyalar yükleniyor..." -ForegroundColor Cyan
  $result = Upload-DeployFiles
  Write-Host "`nÖzet: $($result.Ok) başarılı, $($result.Fail) hata" -ForegroundColor $(if ($result.Fail -eq 0) { 'Green' } else { 'Red' })
  if ($result.Fail -gt 0) { exit 1 }
}

Write-Host "`nBitti: https://konum.online/" -ForegroundColor Cyan
