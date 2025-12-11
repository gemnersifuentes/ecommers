<?php
require_once 'backend/config/conexion.php';

$db = new Database();
$conn = $db->getConnection();

// Check pedidos
$stmt = $conn->query("SELECT * FROM pedidos");
$pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Total pedidos: " . count($pedidos) . "\n\n";

foreach ($pedidos as $pedido) {
    echo "Pedido ID: " . $pedido['id'] . "\n";
    echo "Usuario ID: " . $pedido['usuario_id'] . "\n";
    echo "Numero: " . $pedido['numero_pedido'] . "\n";
    echo "Total: " . $pedido['total'] . "\n";
    echo "Estado: " . $pedido['estado'] . "\n";
    echo "Fecha: " . $pedido['fecha'] . "\n";
    
    // Get items
    $stmtItems = $conn->prepare("SELECT * FROM detalle_pedido WHERE pedido_id = ?");
    $stmtItems->execute([$pedido['id']]);
    $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);
    echo "Items count: " . count($items) . "\n";
    
    echo "---\n\n";
}
?>
