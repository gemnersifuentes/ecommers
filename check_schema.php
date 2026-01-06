<?php
require_once 'backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();
$stmt = $db->query("DESCRIBE pedidos");
$columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
echo implode(", ", $columns);
?>
