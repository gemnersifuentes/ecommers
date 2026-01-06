<?php
require_once __DIR__ . '/backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();

$stmt = $db->query("DESCRIBE usuarios");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
