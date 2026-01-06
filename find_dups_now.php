<?php
require_once __DIR__ . '/backend/config/conexion.php';
$pdo = $database->getConnection();

echo "--- BUSCANDO DUPLICADOS EN EL JOIN DE CATEGORÍAS ---\n";

$stmt = $pdo->query("
    SELECT dp.id, COUNT(*) as qty, GROUP_CONCAT(c.nombre) as names
    FROM detalle_pedido dp
    JOIN productos p ON dp.producto_id = p.id
    JOIN categorias c ON p.categoria_id = c.id
    JOIN pedidos ped ON dp.pedido_id = ped.id
    WHERE ped.estado != 'Cancelado'
    GROUP BY dp.id
    HAVING qty > 1
");

while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "DP_ID: {$row['id']} duplicated {$row['qty']} times. Cats: {$row['names']}\n";
}

echo "\n--- VERIFICANDO TOTALES POR RECURSO ---\n";
echo "1. SUM(total) FROM pedidos: " . $pdo->query("SELECT SUM(total) FROM pedidos WHERE estado != 'Cancelado'")->fetchColumn() . "\n";
echo "2. SUM(subtotal) FROM detalle_pedido JOIN pedidos: " . $pdo->query("SELECT SUM(dp.subtotal) FROM detalle_pedido dp JOIN pedidos p ON dp.pedido_id = p.id WHERE p.estado != 'Cancelado'")->fetchColumn() . "\n";
echo "3. SUM(subtotal) FROM categorical join: " . $pdo->query("
    SELECT SUM(dp.subtotal)
    FROM detalle_pedido dp
    JOIN productos p ON dp.producto_id = p.id
    JOIN categorias c ON p.categoria_id = c.id
    JOIN pedidos ped ON dp.pedido_id = ped.id
    WHERE ped.estado != 'Cancelado'
")->fetchColumn() . "\n";
?>
