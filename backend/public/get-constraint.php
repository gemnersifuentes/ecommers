<?php
require_once __DIR__ . '/../config/conexion.php';
$db = (new Database())->getConnection();

$stmt = $db->query("
    SELECT CONSTRAINT_NAME 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'db_tienda_redhard' 
    AND TABLE_NAME = 'detalle_pedido'
    AND REFERENCED_TABLE_NAME = 'producto_atributos'
");
$row = $stmt->fetch(PDO::FETCH_ASSOC);
echo "Constraint Name: " . ($row['CONSTRAINT_NAME'] ?? 'NOT FOUND') . "\n";
?>
