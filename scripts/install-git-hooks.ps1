#Requires -Version 5.1
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$hookSrc = Join-Path $root ".githooks\post-commit"
$gitDir = git -C $root rev-parse --git-dir 2>$null
if (-not $gitDir) {
  Write-Error "Git deposu bulunamadı."
}
$hookDest = Join-Path (Resolve-Path (Join-Path $root $gitDir)) "hooks\post-commit"

Copy-Item $hookSrc $hookDest -Force
Write-Host "post-commit hook kuruldu: $hookDest" -ForegroundColor Green
Write-Host "Her commit sonrası scripts/deploy.ps1 çalışacak (.ftp-deploy.env gerekli)." -ForegroundColor Cyan
Write-Host "Kaldırmak için: Remove-Item '$hookDest'" -ForegroundColor DarkGray
