<?php
try {
    $pdo = new PDO("mysql:host=localhost;dbname=db_tienda_redhard", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== VERIFICACIÓN TABLA CARRITO ===\n\n";
    
    // Ver si la tabla existe
    $stmt = $pdo->query("SHOW TABLES LIKE 'carrito'");
    if ($stmt->rowCount() == 0) {
        echo "❌ ERROR: La tabla 'carrito' NO EXISTE\n";
        exit;
    }
    
    echo "✓ Tabla 'carrito' existe\n\n";
    
    // Ver estructura
    echo "Estructura de la tabla:\n";
    $stmt = $pdo->query("DESCRIBE carrito");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "  - {$row['Field']} ({$row['Type']}) {$row['Key']}\n";
    }
    
    // Ver contenido
    echo "\n\nContenido actual:\n";
    $stmt = $pdo->query("SELECT * FROM carrito");
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($items) == 0) {
        echo "⚠️ La tabla está VACÍA\n";
    } else {
        foreach ($items as $item) {
            echo "  ID: {$item['id']}, Usuario: {$item['usuario_id']}, Producto: {$item['producto_id']}, Variante: " . ($item['variante_id'] ?? 'NULL') . ", Cantidad: {$item['cantidad']}\n";
        }
    }
    
    // Verificar usuarios
    echo "\n\nUsuarios en la BD:\n";
    $stmt = $pdo->query("SELECT id, nombre, correo FROM usuarios LIMIT 5");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "  Usuario ID: {$row['id']}, Nombre: {$row['nombre']},Correo: {$row['correo']}\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() ."\n";
}
