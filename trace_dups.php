<?php
require_once __DIR__ . '/backend/config/conexion.php';
$pdo = $database->getConnection();

echo "--- BUSCANDO FILAS DUPLICADAS POR JOIN ---\n";
// Seleccionamos dp.id y contamos cuántas veces aparece tras los joins
$stmt = $pdo->query("
    SELECT dp.id as target_id, COUNT(*) as occurs
    FROM detalle_pedido dp
    JOIN productos p ON dp.producto_id = p.id
    JOIN categorias c ON p.categoria_id = c.id
    JOIN pedidos ped ON dp.pedido_id = ped.id
    WHERE ped.estado != 'Cancelado'
    GROUP BY dp.id
    HAVING occurs > 1
");

$found = false;
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $found = true;
    echo "DP_ID: {$row['target_id']} - Ocurrencias: {$row['occurs']}\n";
    
    // Ver por qué se duplica
    $sub = $pdo->prepare("
        SELECT p.id as p_id, c.id as c_id, c.nombre as c_name, ped.id as ped_id
        FROM detalle_pedido dp
        JOIN productos p ON dp.producto_id = p.id
        JOIN categorias c ON p.categoria_id = c.id
        JOIN pedidos ped ON dp.pedido_id = ped.id
        WHERE dp.id = ?
    ");
    $sub->execute([$row['target_id']]);
    while($s = $sub->fetch(PDO::FETCH_ASSOC)) {
        echo "  -> Prod: {$s['p_id']} | Cat: {$s['c_id']} ({$s['c_name']}) | Ped: {$s['ped_id']}\n";
    }
}

if (!$found) echo "No se encontraron duplicados por dp.id.\n";

// ¿Y si es por el productos join?
echo "\n--- VERIFICANDO SI UN PRODUCTO TIENE MÚLTIPLES CATEGORÍAS (EN TEORÍA IMPOSIBLE) ---\n";
$stmt = $pdo->query("SELECT id, COUNT(*) as c FROM productos GROUP BY id HAVING c > 1");
if ($stmt->fetch()) echo "¡PRODUCTOS TIENE IDS DUPLICADOS!\n";
else echo "Productos OK.\n";
?>
