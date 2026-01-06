<?php
require_once __DIR__ . '/backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();

echo "--- Table: pedidos ---\n";
$stmt = $db->query("DESCRIBE pedidos");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
