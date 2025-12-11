<?php
// Test POST directo simulando lo que hace el frontend
header('Content-Type: text/plain');

$pdo = new PDO("mysql:host=localhost;dbname=db_tienda_redhard", "root", "");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "=== TEST POST CARRITO ===\n\n";

// Simular usuario autenticado
$usuario_id = 1;
$producto_id = 36;
$variante_id = null;
$cantidad = 1;

echo "Datos a insertar:\n";
echo "  Usuario: $usuario_id\n";
echo "  Producto: $producto_id\n";
echo "  Variante: " . ($variante_id ?? 'NULL') . "\n";
echo "  Cantidad: $cantidad\n\n";

// Limpiar carrito primero
$stmt = $pdo->prepare("DELETE FROM carrito WHERE usuario_id = ?");
$stmt->execute([$usuario_id]);
echo "✓ Carrito limpiado\n\n";

// Intentar INSERT
echo "Ejecutando INSERT...\n";
try {
    $stmt = $pdo->prepare("INSERT INTO carrito (usuario_id, producto_id, variante_id, cantidad) VALUES (?, ?, ?, ?)");
    $result = $stmt->execute([$usuario_id, $producto_id, $variante_id, $cantidad]);
    $id = $pdo->lastInsertId();
    
    echo "✓ INSERT ejecutado. Last ID: $id\n";
    echo "  Result: " . ($result ? "TRUE" : "FALSE") . "\n";
    echo "  Rows affected: " . $stmt->rowCount() . "\n\n";
    
    // Verificar inmediatamente
    echo "Verificando en BD...\n";
    $stmt = $pdo->prepare("SELECT * FROM carrito WHERE id = ?");
    $stmt->execute([$id]);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($item) {
        echo "✓ ENCONTRADO en BD:\n";
        echo "  ID: {$item['id']}\n";
        echo "  Usuario: {$item['usuario_id']}\n";
        echo "  Producto: {$item['producto_id']}\n";
        echo "  Variante: " . ($item['variante_id'] ?? 'NULL') . "\n";
        echo "  Cantidad: {$item['cantidad']}\n";
    } else {
        echo "❌ NO ENCONTRADO - Item no existe en BD!\n";
    }
    
    // Contar todos
    echo "\nTotal items en carrito:\n";
    $stmt = $pdo->query("SELECT COUNT(*) FROM carrito");
    $count = $stmt->fetchColumn();
    echo "  Count: $count\n";
    
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
