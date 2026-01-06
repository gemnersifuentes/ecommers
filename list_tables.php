<?php
require_once __DIR__ . '/backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();
$stmt = $db->query("SHOW TABLES");
print_r($stmt->fetchAll(PDO::FETCH_COLUMN));
?>
