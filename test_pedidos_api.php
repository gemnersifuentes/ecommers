<?php
// Test the pedidos API
$url = "http://localhost:8000/api/tienda/pedidos.php?usuario_id=1";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: " . $http_code . "\n\n";
echo "Response:\n";
echo $response;
?>
