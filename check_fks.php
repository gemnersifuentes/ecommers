<?php
require_once __DIR__ . '/backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();

$stmt = $db->query("
    SELECT COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_NAME = 'pedidos' 
    AND TABLE_SCHEMA = 'db_tienda_redhard'
    AND REFERENCED_TABLE_NAME IS NOT NULL
");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
