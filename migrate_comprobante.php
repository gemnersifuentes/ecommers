<?php
require_once __DIR__ . '/backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();

try {
    $db->exec("ALTER TABLE pedidos ADD COLUMN comprobante_pago VARCHAR(255) DEFAULT NULL;");
    echo "Column 'comprobante_pago' added successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
