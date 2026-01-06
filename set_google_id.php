<?php
require_once __DIR__ . '/backend/config/conexion.php';
$test_id = "722357321566-dummy-id.apps.googleusercontent.com";
$stmt = $db->prepare("UPDATE ajustes SET google_client_id = ? WHERE id = 1");
if ($stmt->execute([$test_id])) {
    echo "✅ CLIENT_ID actualizado exitosamente en DB.\n";
} else {
    echo "❌ Falló la actualización.\n";
}
?>
