<?php
require_once __DIR__ . '/../config/conexion.php';
$db = (new Database())->getConnection();

echo "=== INSPECCIONANDO CONSTRAINTS ===\n";

// Ver constraints de detalle_pedido
$stmt = $db->query("
    SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'db_tienda_redhard' 
    AND TABLE_NAME = 'detalle_pedido'
    AND REFERENCED_TABLE_NAME IS NOT NULL
");

$constraints = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($constraints);
?>
