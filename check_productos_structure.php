<?php
require_once __DIR__ . '/backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "=== ESTRUCTURA DE LA TABLA PRODUCTOS ===\n\n";
    
    $stmt = $db->query("DESCRIBE productos");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Columnas en la tabla:\n";
    foreach ($columns as $col) {
        echo "  - {$col['Field']} ({$col['Type']}) {$col['Null']} {$col['Key']}\n";
    }
    
    echo "\n=== CAMPOS QUE EL UPDATE INTENTA USAR ===\n";
    $expectedFields = [
        'nombre', 'descripcion', 'marca_id', 'imagen', 'galeria_imagenes', 
        'categoria_id', 'precio_base', 'stock',
        'meta_titulo', 'meta_descripcion', 'palabras_clave', 'slug', 
        'destacado', 'nuevo', 'etiquetas',
        'sku', 'peso', 'largo', 'ancho', 'alto', 'envio_gratis', 'stock_minimo',
        'condicion', 'garantia_meses', 'marca_fabricante', 'modelo', 'video_url', 
        'politica_devolucion_dias', 'activo'
    ];
    
    $existingCols = array_column($columns, 'Field');
    
    foreach ($expectedFields as $field) {
        $exists = in_array($field, $existingCols);
        echo ($exists ? "✓" : "✗") . " $field\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
