<?php
// Updated test - use existing user and product
$payload = [
    'usuario_id' => 1,
    'total' => 100,
    'shipping' => [
        'nombre' => 'Test User',
        'direccion' => 'Test Address 123',
        'departamento' => 'Lima',
        'provincia' => 'Lima',
        'distrito' => 'Miraflores',
        'cp' => '15074',
        'telefono' => '999999999'
    ],
    'items' => [
        [
            'id' => 37, // Product ID from screenshot
            'cantidad' => 1,
            'precio' => 100,
            'variacion_id' => null // No variation for this test
        ]
    ]
];

$ch = curl_init('http://localhost:8000/api/tienda/pedidos.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";

if ($httpCode != 200) {
 echo "\nError log:\n";
    if (file_exists('error_log_pedidos.txt')) {
        $lines = file('error_log_pedidos.txt');
        echo implode('', array_slice($lines, -10)); // Last 10 lines
    }
}
?>
