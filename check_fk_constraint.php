<?php
require_once 'backend/config/conexion.php';
$db = new Database();
$conn = $db->getConnection();

// Check the foreign key constraint
$stmt = $conn->query("SHOW CREATE TABLE detalle_pedido");
$result = $stmt->fetch(PDO::FETCH_ASSOC);
echo "Current detalle_pedido structure:\n";
echo $result['Create Table'] . "\n\n";

// Check if there are any variaciones
$stmt = $conn->query("SELECT COUNT(*) as total FROM variaciones");
$varCount = $stmt->fetch(PDO::FETCH_ASSOC);
echo "Total variaciones in DB: " . $varCount['total'] . "\n";
?>
