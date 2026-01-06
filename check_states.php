<?php
require_once __DIR__ . '/backend/config/conexion.php';
$pdo = $database->getConnection();

echo "--- ESTADOS DE PEDIDOS ---\n";
$stmt = $pdo->query("SELECT estado, COUNT(*) as qty, SUM(total) as total FROM pedidos GROUP BY estado");
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "Estado: '{$row['estado']}' | Qty: {$row['qty']} | Sum Total: " . number_format($row['total'], 2) . "\n";
}

echo "\n--- ITEMS CON PEDIDOS CANCELADOS ---\n";
$stmt = $pdo->query("
    SELECT SUM(dp.subtotal) as total 
    FROM detalle_pedido dp 
    JOIN pedidos p ON dp.pedido_id = p.id 
    WHERE p.estado = 'Cancelado'
");
echo "Total subtotal en items de pedidos cancelados: " . number_format($stmt->fetchColumn(), 2) . "\n";
?>
