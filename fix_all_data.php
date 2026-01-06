<?php
require_once __DIR__ . '/backend/config/conexion.php';
$pdo = $database->getConnection();

echo "--- LISTA DE DISCREPANCIAS ---\n";
$stmt = $pdo->query("
    SELECT p.id, p.numero_pedido, p.total, p.estado, 
           (SELECT SUM(subtotal) FROM detalle_pedido WHERE pedido_id = p.id) as real_sum 
    FROM pedidos p 
    WHERE p.estado != 'Cancelado'
    HAVING ABS(p.total - real_sum) > 0.01
");

$found = false;
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $found = true;
    echo "ID: {$row['id']} | Num: {$row['numero_pedido']} | Col Total: {$row['total']} | Sum Det: {$row['real_sum']} | Diff: " . ($row['real_sum'] - $row['total']) . " | Estado: {$row['estado']}\n";
    
    // Auto-fix
    $pdo->prepare("UPDATE pedidos SET total = ? WHERE id = ?")->execute([$row['real_sum'], $row['id']]);
}

if (!$found) {
    echo "No se encontraron discrepancias directas en pedidos activos.\n";
} else {
    echo "¡Discrepancias corregidas!\n";
}

// Check for items with NO category
echo "\n--- ITEMS SIN CATEGORÍA ---\n";
$stmt = $pdo->query("
    SELECT dp.id, dp.pedido_id, dp.subtotal, p.nombre, p.categoria_id 
    FROM detalle_pedido dp 
    JOIN productos p ON dp.producto_id = p.id 
    WHERE p.categoria_id IS NULL OR NOT EXISTS (SELECT 1 FROM categorias WHERE id = p.categoria_id)
");
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "DP_ID: {$row['id']} | Ped: {$row['pedido_id']} | Sub: {$row['subtotal']} | Prod: {$row['nombre']} | Cat: " . ($row['categoria_id'] ?? 'NULL') . "\n";
}

?>
