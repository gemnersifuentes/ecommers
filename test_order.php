<?php
// Mock payload
$payload = [
    'usuario_id' => 1,
    'total' => 100,
    'shipping' => [
        'nombre' => 'Test',
        'direccion' => 'Test Dir',
        'departamento' => '01',
        'provincia' => '0101',
        'distrito' => '010101',
        'cp' => '12345',
        'telefono' => '999999999'
    ],
    'items' => [
        [
            'id' => 37, // Assuming product 37 exists from screenshot
            'cantidad' => 1,
            'precio' => 100,
            'variacion_id' => 10 // Assuming 10 exists from screenshot
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

if ($httpCode == 500) {
    echo "\nContent of error_log_pedidos.txt:\n";
    if (file_exists('error_log_pedidos.txt')) {
        echo file_get_contents('error_log_pedidos.txt');
    }
}
?>
