<?php
// Probar el endpoint PUT de productos
require_once __DIR__ . '/../config/conexion.php';

$database = new Database();
$db = $database->getConnection();

// Simular una petición PUT
$_SERVER['REQUEST_METHOD'] = 'PUT';
$method = 'PUT';
$id = 35; // ID del producto que se está editando

// Datos de prueba (simular lo que envía el frontend)
$input = [
    'nombre' => 'Producto Test',
    'descripcion' => 'Descripción test',
    'marca_id' => 1,
    'imagen' => '/uploads/productos/test.jpg',
    'galeria_imagenes' => null,
    'categoria_id' => 1,
    'precio_base' => 45,
    'stock' => 100
];

echo "Probando actualización de producto ID: $id\n";
echo "=====================================\n\n";

try {
    $stmt = $db->prepare("
        UPDATE productos 
        SET nombre = ?, descripcion = ?, marca_id = ?, imagen = ?, galeria_imagenes = ?, categoria_id = ?, precio_base = ?, stock = ? 
        WHERE id = ?
    ");
    
    $result = $stmt->execute([
        $input['nombre'],
        $input['descripcion'] ?? null,
        $input['marca_id'] ?? null,
        $input['imagen'] ?? null,
        $input['galeria_imagenes'] ?? null,
        $input['categoria_id'] ?? null,
        $input['precio_base'],
        $input['stock'] ?? 0,
        $id
    ]);
    
    if ($result) {
        echo "✅ Actualización exitosa\n";
        echo "Filas afectadas: " . $stmt->rowCount() . "\n";
    } else {
        echo "❌ La actualización falló\n";
        print_r($stmt->errorInfo());
    }
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Código: " . $e->getCode() . "\n";
}

// Verificar que el producto existe
echo "\n\nVerificando producto:\n";
try {
    $stmt = $db->prepare("SELECT * FROM productos WHERE id = ?");
    $stmt->execute([$id]);
    $producto = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($producto) {
        echo "✅ Producto encontrado:\n";
        echo "  - Nombre: {$producto['nombre']}\n";
        echo "  - Precio: {$producto['precio_base']}\n";
        echo "  - Stock: {$producto['stock']}\n";
    } else {
        echo "❌ Producto no encontrado\n";
    }
} catch (Exception $e) {
    echo "❌ Error al buscar producto: " . $e->getMessage() . "\n";
}
?>
