<?php
// Test para ver qué devuelve el API cuando obtenemos un producto por ID
$producto_id = 38; // Producto de prueba
$url = "http://localhost:8000/productos/$producto_id";
$response = @file_get_contents($url);

echo "=== TEST: GET /productos/$producto_id ===\n\n";

if ($response === false) {
    echo "❌ Error: No se pudo obtener el producto\n";
} else {
    $data = json_decode($response, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "✅ Producto obtenido correctamente\n\n";
        echo "Estructura de datos:\n";
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    } else {
        echo "❌ Error: Respuesta no es JSON válido\n";
        echo "Respuesta: $response\n";
    }
}
