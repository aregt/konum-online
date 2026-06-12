<?php
declare(strict_types=1);

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    respond(false, 'Form yapılandırması bulunamadı. Lütfen form/config.example.php dosyasını config.php olarak kopyalayın.');
}

require_once $configPath;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    respond(false, 'Geçersiz istek yöntemi.');
}

if (!empty($_POST['_hp'] ?? '')) {
    respond(true, 'Mesajınız alındı. En kısa sürede dönüş yapacağız.');
}

$startedAt = filter_var($_POST['form_ts'] ?? '', FILTER_VALIDATE_INT);
$now = time();
if (!$startedAt || ($now - $startedAt) < 3 || ($now - $startedAt) > 3600) {
    respond(false, 'Form çok hızlı gönderildi veya oturum süresi doldu. Lütfen sayfayı yenileyip tekrar deneyin.');
}

if (!checkRateLimit()) {
    respond(false, 'Çok sık gönderim yaptınız. Lütfen birkaç dakika sonra tekrar deneyin.');
}

$name = sanitizeSingleLine($_POST['name'] ?? '', 120);
$business = sanitizeSingleLine($_POST['business'] ?? '', 160);
$sector = sanitizeSingleLine($_POST['sector'] ?? '', 80);
$district = sanitizeSingleLine($_POST['district'] ?? '', 80);
$phone = sanitizeSingleLine($_POST['phone'] ?? '', 40);
$message = sanitizeText($_POST['message'] ?? '', 4000);

if ($name === '' || $business === '' || $sector === '' || $district === '' || $phone === '' || $message === '') {
    respond(false, 'Lütfen tüm zorunlu alanları doldurun.');
}

if (!defined('FORM_RECIPIENT') || !filter_var(FORM_RECIPIENT, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Form alıcı adresi yapılandırılmamış.');
}

$from = defined('FORM_FROM') && filter_var(FORM_FROM, FILTER_VALIDATE_EMAIL)
    ? FORM_FROM
    : 'noreply@konum.online';

$subject = 'Konum Online iletişim formu: ' . $business;
$body = implode("\n", [
    'Ad Soyad: ' . $name,
    'İşletme: ' . $business,
    'Sektör: ' . $sector,
    'İlçe: ' . $district,
    'Telefon: ' . $phone,
    '',
    'Mesaj:',
    $message,
    '',
    'Gönderim: ' . gmdate('Y-m-d H:i:s') . ' UTC',
    'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'),
]);

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: ' . $from,
    'Reply-To: ' . $from,
];

$sent = @mail(FORM_RECIPIENT, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    respond(false, 'Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin veya WhatsApp üzerinden yazın.');
}

recordRateLimit();
respond(true, 'Mesajınız alındı. En kısa sürede size dönüş yapacağız.');

function sanitizeText(string $value, int $max): string
{
    $value = trim(str_replace(["\0", "\r"], '', $value));
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
    $value = strip_tags($value);
    if (mb_strlen($value) > $max) {
        $value = mb_substr($value, 0, $max);
    }
    return $value;
}

function sanitizeSingleLine(string $value, int $max): string
{
    $value = str_replace(["\r", "\n"], ' ', $value);
    $value = sanitizeText($value, $max);
    $value = preg_replace('/\s+/u', ' ', $value) ?? '';
    return trim($value);
}

function checkRateLimit(): bool
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
    $last = $_SESSION['konum_form_last'] ?? 0;
    return (time() - (int) $last) >= 120;
}

function recordRateLimit(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
    $_SESSION['konum_form_last'] = time();
}

function wantsJson(): bool
{
    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    $requestedWith = $_SERVER['HTTP_X_REQUESTED_WITH'] ?? '';
    return str_contains($accept, 'application/json') || $requestedWith === 'fetch';
}

function respond(bool $ok, string $message): void
{
    if (wantsJson()) {
        http_response_code($ok ? 200 : 400);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $status = $ok ? 'success' : 'error';
    $target = '/iletisim/?status=' . rawurlencode($status) . '&msg=' . rawurlencode($message);
    header('Location: ' . $target, true, 303);
    exit;
}
