<?php
require_once __DIR__ . '/../config/conexion.php';

$db = (new Database())->getConnection();

echo "Probando consulta de producto...\n\n";

// Probar si existe la vista
echo "1. Verificando si existe vista_productos_con_descuento:\n";
try {
    $stmt = $db->query("SHOW TABLES LIKE 'vista_productos_con_descuento'");
    $result = $stmt->fetch();
    if ($result) {
        echo "   ✅ Vista existe\n";
    } else {
        echo "   ❌ Vista NO existe\n";
    }
} catch (Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n";
}

// Probar consulta directa a producto
echo "\n2. Probando consulta directa a productos:\n";
try {
    $stmt = $db->prepare("
        SELECT p.*, 
               c.nombre as categoria_nombre,
               m.nombre as marca_nombre,
               p.precio_base as precio_final,
               0 as descuento_aplicado,
               0 as tiene_descuento
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN marcas m ON p.marca_id = m.id
        WHERE p.id = 1
    ");
    $stmt->execute();
    $producto = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($producto) {
        echo "   ✅ Consulta exitosa\n";
        echo "   Producto: " . $producto['nombre'] . "\n";
    } else {
        echo "   ⚠️  No se encontró producto con ID 1\n";
    }
} catch (Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n";
}

// Probar con la vista
echo "\n3. Probando consulta con vista:\n";
try {
    $stmt = $db->prepare("SELECT * FROM vista_productos_con_descuento WHERE id = 1");
    $stmt->execute();
    $producto = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($producto) {
        echo "   ✅ Vista funciona correctamente\n";
        echo "   Producto: " . $producto['nombre'] . "\n";
    } else {
        echo "   ⚠️  No se encontró producto en la vista\n";
    }
} catch (Exception $e) {
    echo "   ❌ Error con vista: " . $e->getMessage() . "\n";
}

// Listar productos disponibles
echo "\n4. Productos en la base de datos:\n";
try {
    $stmt = $db->query("SELECT id, nombre FROM productos LIMIT 5");
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($productos as $p) {
        echo "   ID: {$p['id']} - {$p['nombre']}\n";
    }
} catch (Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n";
}
?>
