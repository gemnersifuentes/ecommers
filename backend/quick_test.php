<?php
// Test simple y directo
$pdo = new PDO("mysql:host=localhost;dbname=db_tienda_redhard", "root", "");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "=== TEST RÁPIDO ===\n\n";

// 1. Ver si hay items en carrito
$stmt = $pdo->query("SELECT * FROM carrito");
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Items en BD: " . count($items) . "\n";

if (count($items) > 0) {
    foreach ($items as $item) {
        echo "  - ID: {$item['id']}, Usuario: {$item['usuario_id']}, Producto: {$item['producto_id']}, Variante: " . ($item['variante_id'] ?? 'NULL') . "\n";
    }
} else {
    echo "TABLA VACÍA - Los items NO se están guardando!\n";
}

// 2. Intentar agregar un item de prueba
echo "\nAgregando item de prueba...\n";
try {
    $stmt = $pdo->prepare("INSERT INTO carrito (usuario_id, producto_id, variante_id, cantidad) VALUES (1, 36, NULL, 1)");
    $stmt->execute();
    echo "✓ Item agregado exitosamente\n";
    
    // Verificar
    $stmt = $pdo->query("SELECT * FROM carrito WHERE usuario_id = 1");
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Items del usuario 1: " . count($items) . "\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
