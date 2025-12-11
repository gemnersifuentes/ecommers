<?php
require_once __DIR__ . '/backend/config/conexion.php';

$database = new Database();
$db = $database->getConnection();

echo "<h1>Debug Data Integrity</h1>";

// Check producto_variantes
$sql = "SELECT count(*) as total FROM producto_variantes";
$stmt = $db->query($sql);
$total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
echo "Total Variantes: $total<br>";

$sql = "SELECT count(*) as total_with_attr FROM producto_variantes WHERE atributo_valor_id IS NOT NULL";
$stmt = $db->query($sql);
$withAttr = $stmt->fetch(PDO::FETCH_ASSOC)['total_with_attr'];
echo "Variantes con atributo_valor_id: $withAttr<br>";

// Show some sample data
$sql = "SELECT * FROM producto_variantes LIMIT 5";
$stmt = $db->query($sql);
echo "<pre>";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
echo "</pre>";
?>
