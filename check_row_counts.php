<?php
require_once __DIR__ . '/backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();

$vCount = $db->query("SELECT COUNT(*) FROM variaciones")->fetchColumn();
echo "variaciones: $vCount\n";

$pvCount = $db->query("SELECT COUNT(*) FROM producto_variantes")->fetchColumn();
echo "producto_variantes: $pvCount\n";
?>
