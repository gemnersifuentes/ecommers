<?php
require_once 'backend/config/conexion.php';

$database = new Database();
$db = $database->getConnection();

$stmt = $db->query('DESCRIBE producto_variantes');
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Estructura de producto_variantes:\n\n";
foreach ($columns as $col) {
    echo $col['Field'] . " - " . $col['Type'] . " - " . $col['Null'] . " - " . $col['Key'] . "\n";
}
