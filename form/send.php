<?php
/**
 * İletişim formu endpoint — Görev 3'te tamamlanacak.
 * Alıcı adresi config.php üzerinden okunacak (koda gömülmez).
 */
http_response_code(503);
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'ok' => false,
    'message' => 'Form henüz yapılandırılmadı.',
]);
