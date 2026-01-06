<?php
require_once __DIR__ . '/backend/config/conexion.php';
$stmt = $db->query("SELECT google_client_id FROM ajustes LIMIT 1");
$res = $stmt->fetch(PDO::FETCH_ASSOC);
echo "CURRENT_ID: " . ($res['google_client_id'] ?? 'NONE') . "\n";
