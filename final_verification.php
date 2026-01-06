<?php
require_once __DIR__ . '/backend/config/conexion.php';
$pdo = $database->getConnection();

echo "--- VERIFICACIÓN MATEMÁTICA FINAL ---\n";

// 1. Total desde la tabla pedidos
$stmtVentasTotal = $pdo->prepare("SELECT SUM(total) as total FROM pedidos WHERE estado != 'Cancelado'");
$stmtVentasTotal->execute();
$totalPedidos = floatval($stmtVentasTotal->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

// 2. Total desde la tabla detalle_pedido (Categorías)
$stmtVentasCategoria = $pdo->prepare("
    SELECT SUM(dp.subtotal) as total
    FROM detalle_pedido dp
    JOIN pedidos ped ON dp.pedido_id = ped.id
    WHERE ped.estado != 'Cancelado'
");
$stmtVentasCategoria->execute();
$totalDetalles = floatval($stmtVentasCategoria->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

echo "Total Pedidos (Card): " . number_format($totalPedidos, 2) . "\n";
echo "Total Detalles (Chart): " . number_format($totalDetalles, 2) . "\n";
echo "Diferencia: " . ($totalPedidos - $totalDetalles) . "\n";

if (abs($totalPedidos - $totalDetalles) < 0.01) {
    echo "\n[OK] LOS DATOS COINCIDEN PERFECTAMENTE CON LA BD.\n";
} else {
    echo "\n[ERROR] SIGUE HABIENDO UNA DISCREPANCIA.\n";
}
echo "--------------------------------------\n";
?>
