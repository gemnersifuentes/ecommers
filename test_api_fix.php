<?php
// Test rápido del API
$url = 'http://localhost:8000/productos?page=1&limit=1';
$response = @file_get_contents($url);

if ($response === false) {
    echo "❌ Error: No se pudo conectar al API\n";
    echo "URL: $url\n";
} else {
    $data = json_decode($response, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "✅ API funcionando correctamente\n";
        echo "Total productos: " . ($data['total'] ?? count($data)) . "\n";
        if (isset($data['data']) && count($data['data']) > 0) {
            $p = $data['data'][0];
            echo "Producto de ejemplo:\n";
            echo "  - ID: " . ($p['id'] ?? 'N/A') . "\n";
            echo "  - Nombre: " . ($p['nombre'] ?? 'N/A') . "\n";
            echo "  - Precio Base: " . ($p['precio_base'] ?? 'N/A') . "\n";
            echo "  - Precio Final: " . ($p['precio_final'] ?? 'N/A') . "\n";
        }
    } else {
        echo "❌ Error: Respuesta no es JSON válido\n";
        echo "Respuesta: " . substr($response, 0, 200) . "\n";
    }
}
