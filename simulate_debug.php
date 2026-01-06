<?php
define('TEST_MODE', true);
$_SERVER['REQUEST_METHOD'] = 'POST';

// Datos de prueba: Cliente Invitado
$testData = [
    'items' => [
        [
            'producto' => ['id' => 1, 'nombre' => 'Test Product'],
            'precio' => 100,
            'cantidad' => 1,
            'variacion' => ['id' => 1]
        ]
    ],
    'usuario_id' => null,
    'correo' => 'test_guest_' . time() . '@test.com',
    'total' => 118,
    'metodo_envio' => 'domicilio',
    'metodo_pago' => 'tarjeta',
    'guardar_direccion' => true,
    'shipping' => [
        'nombre' => 'Guest Tester',
        'direccion' => 'Calle de Pruebas 456',
        'departamento' => 'Lima',
        'provincia' => 'Lima',
        'distrito' => 'Miraflores',
        'cp' => '15047',
        'telefono' => '987654321',
        'referencia' => 'Frente al parque'
    ]
];

// Mock de la entrada
$data = json_decode(json_encode($testData));

echo "--- Iniciando Simulación Debug ---\n";

try {
    include 'backend/api/tienda/pedidos.php';
    echo "Simulación completada.\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
