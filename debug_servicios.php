<?php
require_once 'backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();
$stmt = $db->query("SELECT id, nombre, activo FROM servicios");
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Count: " . count($results) . "\n";
print_r($results);
?>
