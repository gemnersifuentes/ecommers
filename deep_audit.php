<?php
require_once __DIR__ . '/backend/config/conexion.php';
$pdo = $database->getConnection();

echo "--- AUDITORÍA DE DISCREPANCIAS ---\n";

// 1. Total general desde Pedidos
$resPedidos = $pdo->query("SELECT SUM(total) as t FROM pedidos WHERE estado != 'Cancelado'")->fetch(PDO::FETCH_ASSOC);
$totalPedidos = $resPedidos['t'];

// 2. Total general desde Detalles
$resDetalles = $pdo->query("
    SELECT SUM(dp.subtotal) as t 
    FROM detalle_pedido dp 
    JOIN pedidos p ON dp.pedido_id = p.id 
    WHERE p.estado != 'Cancelado'
")->fetch(PDO::FETCH_ASSOC);
$totalDetalles = $resDetalles['t'];

echo "Total Pedidos Table: " . number_format($totalPedidos, 2) . "\n";
echo "Total Detalles Table: " . number_format($totalDetalles, 2) . "\n";
echo "Diferencia (Detalles - Pedidos): " . ($totalDetalles - $totalPedidos) . "\n\n";

// 3. Buscar pedidos específicos con diferencia
echo "Pedidos con discrepancia (Total != Sum Subtotales):\n";
$stmt = $pdo->query("
    SELECT p.id, p.numero_pedido, p.total, SUM(dp.subtotal) as sum_det 
    FROM pedidos p 
    LEFT JOIN detalle_pedido dp ON p.id = dp.pedido_id 
    GROUP BY p.id 
    HAVING ABS(p.total - sum_det) > 0.01 
    LIMIT 10
");
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "ID: {$row['id']} | Num: {$row['numero_pedido']} | Col Total: {$row['total']} | Sum Det: {$row['sum_det']} | Diff: " . ($row['sum_det'] - $row['total']) . "\n";
}

// 4. Buscar detalles sin categoría (que podrían estar faltando en el chart si se usa INNER JOIN)
// Pero el user dice que el chart es MÁS, no menos.
// Si el chart es más, tal vez hay duplicación.

// 5. Verificar si hay duplicación por JOINS en el chart query
$sqlChart = "
    SELECT COUNT(*) as count, SUM(dp.subtotal) as total
    FROM detalle_pedido dp
    JOIN productos p ON dp.producto_id = p.id
    JOIN categorias c ON p.categoria_id = c.id
    JOIN pedidos ped ON dp.pedido_id = ped.id
    WHERE ped.estado != 'Cancelado'
";
$resChartAudit = $pdo->query($sqlChart)->fetch(PDO::FETCH_ASSOC);
echo "\nAudit de Query de Chart:\n";
echo "Count de items: " . $resChartAudit['count'] . "\n";
echo "Total Sumado: " . number_format($resChartAudit['total'], 2) . "\n";

// Comparar con detalle_pedido puro
$sqlPure = "SELECT COUNT(*) as count, SUM(subtotal) as total FROM detalle_pedido dp JOIN pedidos p ON dp.pedido_id = p.id WHERE p.estado != 'Cancelado'";
$resPure = $pdo->query($sqlPure)->fetch(PDO::FETCH_ASSOC);
echo "\nAudit de Detalle Puro:\n";
echo "Count de items: " . $resPure['count'] . "\n";
echo "Total Sumado: " . number_format($resPure['total'], 2) . "\n";

if ($resChartAudit['count'] > $resPure['count']) {
    echo "\n!!! ALERTA: La query del chart está duplicando registros debido a los JOINS !!!\n";
    
    // Investigar duplicación
    $stmtDup = $pdo->query("
        SELECT dp.id, COUNT(*) as occurs
        FROM detalle_pedido dp
        JOIN productos p ON dp.producto_id = p.id
        JOIN categorias c ON p.categoria_id = c.id
        JOIN pedidos ped ON dp.pedido_id = ped.id
        WHERE ped.estado != 'Cancelado'
        GROUP BY dp.id
        HAVING occurs > 1
        LIMIT 5
    ");
    while($row = $stmtDup->fetch(PDO::FETCH_ASSOC)) {
        echo "DP_ID: {$row['id']} aparece {$row['occurs']} veces en la query del chart.\n";
    }
}
?>
