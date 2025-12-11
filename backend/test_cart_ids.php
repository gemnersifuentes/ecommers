<?php
// Test directo de la query de carrito
try {
    $pdo = new PDO("mysql:host=localhost;dbname=db_tienda_redhard", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== DATOS DEL CARRITO ===\n\n";
    
    // Simular un usuario (usa el ID de un usuario que tenga items)
    $usuario_id = 1;
    
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
    
    echo "Usuario ID: $usuario_id\n";
    echo "Total items: " . count($items) . "\n\n";
    
    foreach ($items as $item) {
        $itemId = $item['variante_id'] 
            ? $item['producto_id'] . '-' . $item['variante_id']
            : (string)$item['producto_id'];
            
        echo "Cart DB ID: {$item['cart_id']}\n";
        echo "Producto ID: {$item['producto_id']}\n";
        echo "Variante ID: " . ($item['variante_id'] ?? 'NULL') . "\n";
        echo "Cantidad: {$item['cantidad']}\n";
        echo "Item ID generado: '$itemId'\n";
        echo "---\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
