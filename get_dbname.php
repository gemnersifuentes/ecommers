<?php
require_once __DIR__ . '/backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();
$stmt = $db->query("SELECT DATABASE()");
echo $stmt->fetchColumn();
?>
