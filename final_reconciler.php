<?php
require_once __DIR__ . '/backend/config/conexion.php';
$pdo = $database->getConnection();

echo "Reconciliando base de datos...\n";
$sql = "UPDATE pedidos p SET p.total = (SELECT COALESCE(SUM(dp.subtotal), 0) FROM detalle_pedido dp WHERE dp.pedido_id = p.id)";
$stmt = $pdo->query($sql);
echo "Filas actualizadas: " . $stmt->rowCount() . "\n";

echo "\nVerificando totales finales:\n";
$res1 = $pdo->query("SELECT SUM(total) FROM pedidos WHERE estado != 'Cancelado'")->fetchColumn();
$res2 = $pdo->query("
    SELECT SUM(dp.subtotal) 
    FROM detalle_pedido dp 
    JOIN pedidos p ON dp.pedido_id = p.id 
    WHERE p.estado != 'Cancelado'
")->fetchColumn();

echo "Suma Pedidos: " . number_format($res1, 2) . "\n";
echo "Suma Detalles: " . number_format($res2, 2) . "\n";
echo "Diferencia: " . ($res1 - $res2) . "\n";
?>
