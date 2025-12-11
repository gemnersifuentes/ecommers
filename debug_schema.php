<?php
require_once 'backend/config/conexion.php';
$db = new Database();
$conn = $db->getConnection();

echo "--- PEDIDOS ---\n";
$stmt = $conn->query('DESCRIBE pedidos');
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    print_r($row);
}

echo "\n--- DETALLE_PEDIDO ---\n";
$stmt = $conn->query('DESCRIBE detalle_pedido');
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    print_r($row);
}
?>
