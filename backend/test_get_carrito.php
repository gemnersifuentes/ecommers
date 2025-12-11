<?php
// Test directo del endpoint GET del carrito
header('Content-Type: application/json');

try {
    $pdo = new PDO("mysql:host=localhost;dbname=db_tienda_redhard", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Usar el primer usuario que tenga items
    $stmtUser = $pdo->query("SELECT DISTINCT usuario_id FROM carrito LIMIT 1");
    $usuario = $stmtUser->fetch(PDO::FETCH_ASSOC);
    
    if (!$usuario) {
        echo json_encode(['error' => 'No hay items en ningún carrito']);
        exit;
    }
    
    $usuario_id = $usuario['usuario_id'];
    echo "Usuario ID: $usuario_id\n\n";
    
    // Query igual que en carrito.php
    $stmt = $pdo->prepare("
        SELECT 
            c.id as cart_id,
            c.producto_id,
            c.variante_id,
            c.cantidad,
            p.nombre as producto_nombre,
            p.imagen as producto_imagen,
            p.precio_base,
            v.precio as variante_precio,
            v.sku as variante_sku,
            COALESCE(v.precio, p.precio_base) as precio
        FROM carrito c
        INNER JOIN productos p ON c.producto_id = p.id
        LEFT JOIN producto_variantes v ON c.variante_id = v.id
        WHERE c.usuario_id = ?
    ");
    $stmt->execute([$usuario_id]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Total items en BD: " . count($items) . "\n\n";
    
    // Formatear como en el endpoint
    $formattedItems = array_map(function($item) use ($pdo) {
        $itemId = $item['variante_id'] 
            ? $item['producto_id'] . '-' . $item['variante_id']
            : (string)$item['producto_id'];
        
        echo "Generando item:\n";
        echo "  cart_id (BD): {$item['cart_id']}\n";
        echo "  producto_id: {$item['producto_id']}\n";
        echo "  variante_id: " . ($item['variante_id'] ?? 'NULL') . "\n";
        echo "  itemId generado: '$itemId'\n";
        echo "  nombre: {$item['producto_nombre']}\n";
        echo "---\n";
        
        return [
            'id' => $itemId,
            'producto' => [
                'id' => $item['producto_id'],
                'nombre' => $item['producto_nombre']
            ],
            'variacion' => $item['variante_id'] ? ['id' => $item['variante_id']] : null,
            'cantidad' => intval($item['cantidad']),
            'precio' => floatval($item['precio']),
            'subtotal' => floatval($item['precio']) * intval($item['cantidad'])
        ];
    }, $items);
    
    echo "\n\nJSON final:\n";
    echo json_encode($formattedItems, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
