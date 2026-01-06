<?php
require_once __DIR__ . '/backend/config/conexion.php';
$pdo = $database->getConnection();

echo "--- DETECTANDO DUPLICACIÓN EN EL JOIN DEL CHART ---\n";
$stmt = $pdo->query("
    SELECT dp.id as dp_id, COUNT(*) as occurs, GROUP_CONCAT(c.nombre) as cats
    FROM detalle_pedido dp
    JOIN productos p ON dp.producto_id = p.id
    JOIN categorias c ON p.categoria_id = c.id
    JOIN pedidos ped ON dp.pedido_id = ped.id
    WHERE ped.estado != 'Cancelado'
    GROUP BY dp.id
    HAVING occurs > 1
    LIMIT 20
");

$found = false;
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $found = true;
    echo "DP_ID: {$row['dp_id']} | Ocurrencias: {$row['occurs']} | Categorías: {$row['cats']}\n";
}

if (!$found) {
    echo "No se encontraron duplicaciones en el join.\n";
}

// Check for the exact difference: 1862
echo "\n--- INVESTIGANDO DIFERENCIA DE 1862 ---\n";
$stmt = $pdo->query("SELECT id, total FROM pedidos WHERE total = 1862 OR total BETWEEN 1861 AND 1863");
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "Pedido encontrado con total similar a la diferencia: ID: {$row['id']}, Total: {$row['total']}\n";
}
?>
