<?php
require_once 'backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();

try {
    $db->exec("ALTER TABLE pedidos ADD COLUMN metodo_pago VARCHAR(50) DEFAULT 'Tarjeta de Crédito/Débito' AFTER estado");
    echo "Columna 'metodo_pago' agregada exitosamente.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
