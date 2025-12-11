<?php
require_once 'backend/config/conexion.php';
$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->query("SHOW COLUMNS FROM detalle_pedido LIKE 'variacion_id'");
$column = $stmt->fetch(PDO::FETCH_ASSOC);

print_r($column);
?>
