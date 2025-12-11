<?php
// Test script para verificar los datos del producto
$url = 'http://localhost:8000/productos';
$response = file_get_contents($url . '?page=1&limit=1');
$data = json_decode($response, true);

echo "=== RESPUESTA DEL API ===\n";
if (isset($data['data']) && count($data['data']) > 0) {
    $producto = $data['data'][0];
    echo "✅ Producto encontrado:\n";
    echo "ID: " . ($producto['id'] ?? 'N/A') . "\n";
    echo "Nombre: " . ($producto['nombre'] ?? 'N/A') . "\n";
    echo "Precio Base: " . ($producto['precio_base'] ?? 'N/A') . "\n";
    echo "Precio Final: " . ($producto['precio_final'] ?? 'N/A') . "\n";
    echo "Tiene Descuento: " . ($producto['tiene_descuento'] ?? 'N/A') . "\n";
    echo "Descuento Valor: " . ($producto['descuento_valor'] ?? 'N/A') . "\n";
    echo "Descuento Tipo: " . ($producto['descuento_tipo'] ?? 'N/A') . "\n";
    echo "\n=== ESTRUCTURA COMPLETA ===\n";
    print_r($producto);
} else {
    echo "❌ No se encontraron productos\n";
    echo "Respuesta: " . substr($response, 0, 500) . "\n";
}
