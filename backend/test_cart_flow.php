<?php
// Test completo del flujo del carrito (Backend)
header('Content-Type: text/plain');

require_once __DIR__ . '/config/conexion.php';

echo "=== INICIO TEST DE FLUJO DE CARRITO ===\n\n";

$usuario_id = 1; // Usuario de prueba
echo "Usuario ID: $usuario_id\n";

// 1. Limpiar carrito existente
echo "\n1. Limpiando carrito...\n";
$stmt = $pdo->prepare("DELETE FROM carrito WHERE usuario_id = ?");
$stmt->execute([$usuario_id]);
echo "✓ Carrito vaciado\n";

// 2. Agregar producto SIN variante (ej: ID 36)
echo "\n2. Agregando producto SIN variante (ID 36)...\n";
// Simular POST
$producto_id = 36;
$cantidad = 1;

// Verificar stock primero (como hace el endpoint ahora)
$stmtStock = $pdo->prepare("SELECT stock FROM productos WHERE id = ?");
$stmtStock->execute([$producto_id]);
$stock = $stmtStock->fetchColumn();
echo "Stock disponible: " . ($stock !== false ? $stock : "No encontrado") . "\n";

// Insertar
$stmt = $pdo->prepare("INSERT INTO carrito (usuario_id, producto_id, variante_id, cantidad) VALUES (?, ?, NULL, ?)");
$stmt->execute([$usuario_id, $producto_id, $cantidad]);
$id1 = $pdo->lastInsertId();
echo "✓ Item agregado. ID BD: $id1\n";

// 3. Agregar producto CON variante (ej: ID 42, variante 4)
echo "\n3. Agregando producto CON variante (ID 42, Var 4)...\n";
$producto_id2 = 42;
$variante_id2 = 4;

$stmt = $pdo->prepare("INSERT INTO carrito (usuario_id, producto_id, variante_id, cantidad) VALUES (?, ?, ?, ?)");
$stmt->execute([$usuario_id, $producto_id2, $variante_id2, $cantidad]);
$id2 = $pdo->lastInsertId();
echo "✓ Item agregado. ID BD: $id2\n";

// 4. Leer carrito (GET)
echo "\n4. Leyendo carrito (Simulación GET)...\n";
$stmt = $pdo->prepare("
    SELECT 
        c.id as cart_id,
        c.producto_id,
        c.variante_id,
        c.cantidad
    FROM carrito c
    WHERE c.usuario_id = ?
");
$stmt->execute([$usuario_id]);
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Items encontrados: " . count($items) . "\n";

foreach ($items as $item) {
    $itemId = $item['variante_id'] 
        ? $item['producto_id'] . '-' . $item['variante_id']
        : (string)$item['producto_id'];
    
    echo "  - BD ID: {$item['cart_id']} | Prod: {$item['producto_id']} | Var: " . ($item['variante_id'] ?? 'NULL') . " | GENERATED ID: '$itemId'\n";
}

// 5. Eliminar item específico (DELETE)
echo "\n5. Eliminando item SIN variante (ID esperado: '36')...\n";
$itemIdToDelete = "36";

// Lógica de DELETE
$parts = explode('-', $itemIdToDelete);
$p_id = intval($parts[0]);
$v_id = isset($parts[1]) ? intval($parts[1]) : null;

echo "  Parseado: Prod=$p_id, Var=" . ($v_id ?? 'NULL') . "\n";

if ($v_id) {
    $stmt = $pdo->prepare("DELETE FROM carrito WHERE usuario_id = ? AND producto_id = ? AND variante_id = ?");
    $stmt->execute([$usuario_id, $p_id, $v_id]);
} else {
    $stmt = $pdo->prepare("DELETE FROM carrito WHERE usuario_id = ? AND producto_id = ? AND variante_id IS NULL");
    $stmt->execute([$usuario_id, $p_id]);
}

echo "  Filas afectadas: " . $stmt->rowCount() . "\n";

// 6. Verificar final
echo "\n6. Verificación final...\n";
$stmt = $pdo->prepare("SELECT count(*) FROM carrito WHERE usuario_id = ?");
$stmt->execute([$usuario_id]);
$count = $stmt->fetchColumn();
echo "Items restantes en carrito: $count (Debería ser 1)\n";

echo "\n=== FIN TEST ===\n";
