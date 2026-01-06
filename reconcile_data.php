<?php
require_once __DIR__ . '/backend/config/conexion.php';
$pdo = $database->getConnection();

echo "Reconciliando totales de pedidos con el detalle...\n";

// Update total in pedidos to be exactly the sum of its details
$sql = "UPDATE pedidos p 
        SET p.total = (
            SELECT COALESCE(SUM(dp.subtotal), 0) 
            FROM detalle_pedido dp 
            WHERE dp.pedido_id = p.id
        )
        WHERE (SELECT COUNT(*) FROM detalle_pedido WHERE pedido_id = p.id) > 0";

$stmt = $pdo->query($sql);
echo "Pedidos actualizados: " . $stmt->rowCount() . "\n";

// Verify top 5
$stmt = $pdo->query("SELECT p.id, p.total, (SELECT SUM(subtotal) FROM detalle_pedido WHERE pedido_id = p.id) as sum_real FROM pedidos p LIMIT 5");
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "ID: {$row['id']} | Col Total: {$row['total']} | Sum Detalles: {$row['sum_real']}\n";
}
?>
