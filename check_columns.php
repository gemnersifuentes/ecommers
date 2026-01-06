<?php
require_once __DIR__ . '/backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();

echo "--- Table: variaciones ---\n";
$stmt = $db->query("DESCRIBE variaciones");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n--- Table: producto_variantes ---\n";
$stmt = $db->query("DESCRIBE producto_variantes");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
