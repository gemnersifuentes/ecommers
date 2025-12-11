<?php
require_once 'backend/config/conexion.php';
$db = (new Database())->getConnection();

echo "--- PRODUCTO_VARIANTES ---\n";
$rows = $db->query("SELECT * FROM producto_variantes LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
print_r($rows);

echo "--- ATRIBUTO_VALORES ---\n";
$rows = $db->query("SELECT * FROM atributo_valores LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
print_r($rows);
?>
