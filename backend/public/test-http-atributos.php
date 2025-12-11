<?php
// Test del endpoint completo via HTTP
echo "Testing /productos/35/atributos endpoint\n";
echo "==========================================\n\n";

// Test GET
echo "1. GET /productos/35/atributos\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/productos/35/atributos');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "   HTTP Code: $httpCode\n";
if ($httpCode == 200) {
    echo "   ✅ Response: " . substr($response, 0, 200) . "...\n";
} else {
    echo "   ❌ Error response: $response\n";
}

// Test POST
echo "\n2. POST /productos/35/atributos\n";
$data = json_encode([
    'tipo' => 'color',
    'valor' => 'Azul Test',
    'stock' => 25
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/productos/35/atributos');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "   HTTP Code: $httpCode\n";
echo "   Response: $response\n";

if ($httpCode == 200) {
    echo "   ✅ POST exitoso\n";
} else {
    echo "   ❌ POST falló\n";
}

echo "\n==========================================\n";
?>
