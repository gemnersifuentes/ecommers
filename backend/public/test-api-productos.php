<?php
// Test del endpoint de productos
echo "Testing GET /productos endpoint\n";
echo "==========================================\n\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/productos');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response Start: " . substr($response, 0, 500) . "...\n";

$data = json_decode($response, true);
if (is_array($data) && isset($data[0])) {
    echo "✅ Response is an array of products.\n";
} elseif (is_array($data) && isset($data['error'])) {
    echo "❌ Response is an error object: " . $data['error'] . "\n";
} else {
    echo "❓ Response is unknown format.\n";
}
?>
