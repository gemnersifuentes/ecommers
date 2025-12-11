<?php
// Test del endpoint de variantes
echo "Testing POST /productos/35/variantes endpoint\n";
echo "==========================================\n\n";

$data = json_encode([
    'producto_id' => 35,
    'precio' => 50.00,
    'stock' => 10,
    'valores' => [1] // Asumiendo que existe el valor ID 1 (Negro)
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/productos/35/variantes');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";

if ($httpCode == 200) {
    echo "✅ POST exitoso\n";
} else {
    echo "❌ POST falló\n";
}
?>
