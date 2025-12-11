<?php
require_once __DIR__ . '/../config/conexion.php';
// require_once '../config/cors.php'; // This might not exist or be needed for CLI script

$database = new Database();
$db = $database->getConnection();

try {
    // 1. Total from pedidos table
    $stmt1 = $db->prepare("SELECT SUM(total) as total_pedidos FROM pedidos WHERE estado != 'Cancelado'");
    $stmt1->execute();
    $totalPedidos = $stmt1->fetch(PDO::FETCH_ASSOC)['total_pedidos'];

    // 2. Total from detalle_pedido using precio_unitario (SKIPPED - column might not exist)
    $totalDetalles = 0; 
    /*
    $stmt2 = $db->prepare("
        SELECT SUM(dp.cantidad * dp.precio_unitario) as total_detalles 
        FROM detalle_pedido dp 
        JOIN pedidos p ON dp.pedido_id = p.id 
        WHERE p.estado != 'Cancelado'
    ");
    $stmt2->execute();
    $totalDetalles = $stmt2->fetch(PDO::FETCH_ASSOC)['total_detalles'];
    */

    // 3. Total from detalle_pedido using productos.precio_base (what is currently used)
    $stmt3 = $db->prepare("
        SELECT SUM(dp.cantidad * prod.precio_base) as total_detalles_base
        FROM detalle_pedido dp 
        JOIN pedidos p ON dp.pedido_id = p.id 
        JOIN productos prod ON dp.producto_id = prod.id
        WHERE p.estado != 'Cancelado'
    ");
    $stmt3->execute();
    // 4. Count orders without details
    $stmt4 = $db->prepare("SELECT COUNT(*) as count FROM pedidos WHERE id NOT IN (SELECT DISTINCT pedido_id FROM detalle_pedido)");
    $stmt4->execute();
    $ordersWithoutDetails = $stmt4->fetch(PDO::FETCH_ASSOC)['count'];

    // 5. Sum of total from orders without details
    $stmt5 = $db->prepare("SELECT SUM(total) as total_orphaned FROM pedidos WHERE id NOT IN (SELECT DISTINCT pedido_id FROM detalle_pedido)");
    $stmt5->execute();
    $totalOrphaned = $stmt5->fetch(PDO::FETCH_ASSOC)['total_orphaned'];

    echo json_encode([
        'total_pedidos_table' => $totalPedidos,
        'total_detalles_precio_unitario' => $totalDetalles,
        'total_detalles_precio_base' => $totalDetallesBase,
        'difference_pedidos_vs_detalles' => $totalPedidos - $totalDetallesBase,
        'orders_without_details_count' => $ordersWithoutDetails,
        'total_sales_from_orphaned_orders' => $totalOrphaned
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
