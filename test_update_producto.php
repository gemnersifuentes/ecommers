<?php
// Test de actualización de producto
require_once __DIR__ . '/backend/config/conexion.php';

header('Content-Type: application/json');

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "=== TEST DE ACTUALIZACIÓN ===\n\n";
    
    // Obtener el primer producto para probar
    $stmt = $db->query("SELECT * FROM productos LIMIT 1");
    $producto = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$producto) {
        echo "No hay productos para probar\n";
        exit;
    }
    
    echo "Producto a actualizar: ID={$producto['id']}, Nombre={$producto['nombre']}\n\n";
    
    // Simular el UPDATE como lo hace el backend
    $id = $producto['id'];
    
    // Datos de prueba (usando los mismos del producto)
    $input = [
        'nombre' => $producto['nombre'] . ' UPDATED',
        'descripcion' => $producto['descripcion'],
        'marca_id' => $producto['marca_id'],
        'imagen' => $producto['imagen'],
        'galeria_imagenes' => $producto['galeria_imagenes'],
        'categoria_id' => $producto['categoria_id'],
        'precio_base' => $producto['precio_base'],
        'stock' => $producto['stock'],
        'activo' => 1,
        'destacado' => $producto['destacado'] ?? 0,
        'nuevo' => $producto['nuevo'] ?? 0
    ];
    
    echo "Ejecutando UPDATE...\n";
    
    $sql = "UPDATE productos 
            SET nombre = ?, descripcion = ?, marca_id = ?, imagen = ?, galeria_imagenes = ?, 
                categoria_id = ?, precio_base = ?, stock = ?,
                meta_titulo = ?, meta_descripcion = ?, palabras_clave = ?, slug = ?, 
                destacado = ?, nuevo = ?, etiquetas = ?,
                sku = ?, peso = ?, largo = ?, ancho = ?, alto = ?, envio_gratis = ?, stock_minimo = ?,
                condicion = ?, garantia_meses = ?, marca_fabricante = ?, modelo = ?, video_url = ?, 
                politica_devolucion_dias = ?, activo = ?
            WHERE id = ?";
    
    $stmt = $db->prepare($sql);
    
    $result = $stmt->execute([
        $input['nombre'],
        $input['descripcion'],
        $input['marca_id'],
        $input['imagen'],
        $input['galeria_imagenes'],
        $input['categoria_id'],
        $input['precio_base'],
        $input['stock'],
        // SEO
        null, null, null, null,
        $input['destacado'],
        $input['nuevo'],
        null,
        // Logística
        null, null, null, null, null,
        0, 5,
        // Info
        'nuevo', 12, null, null, null, 30,
        // Activo
        $input['activo'],
        // ID
        $id
    ]);
    
    if ($result) {
        echo "✅ UPDATE exitoso!\n";
        echo "Filas afectadas: " . $stmt->rowCount() . "\n";
    } else {
        echo "❌ UPDATE falló\n";
        print_r($stmt->errorInfo());
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Línea: " . $e->getLine() . "\n";
    echo "Archivo: " . $e->getFile() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString();
}
