<?php
// Simular el POST que falla
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';

// Datos de prueba (carrito mínimo)
$testData = [
    'items' => [
        [
            'id' => 1,
            'nombre' => 'Test Product',
            'precio' => 100,
            'cantidad' => 1
        ]
    ],
    'usuario_id' => null, // Test guest path
    'correo' => 'guest' . time() . '@test.com',
    'total' => 100,
    'metodo_envio' => 'domicilio',
    'metodo_pago' => 'contraentrega',
    'shipping' => [
        'nombre' => 'Test Client',
        'direccion' => 'Calle Falsa 123',
        'telefono' => '999888777',
        'correo' => 'test@client.com'
    ]
];

// Inyectar datos en php://input es difícil desde el mismo script, 
// así que modificare pedidos.php temporalmente para leer de una variable si existe.
// O mejor, uso curl sobre el propio servidor si está corriendo, o incluyo pedidos.php directamente.

// Para incluir pedidos.php y que tome los datos, debo definir $data antes o engañar a file_get_contents.
// Usaremos un truco: definimos una variable global que pedidos.php leerá.

echo "--- Iniciando Simulación de Checkout ---\n";

try {
    // Engañamos a pedidos.php para que use nuestros datos de prueba
    define('TEST_MODE', true);
    $data = (object)$testData;
    $data->items = json_decode(json_encode($testData['items']));
    $data->shipping = (object)$testData['shipping'];

    // Incluimos el archivo. Nota: pedidos.php tiene su propio manejo de $data al inicio.
    // Vamos a modificar pedidos.php ligeramente para facilitar el debug.
    
    include 'backend/api/tienda/pedidos.php';

} catch (Exception $e) {
    echo "ERROR CAPTURADO: " . $e->getMessage() . "\n";
} catch (Error $err) {
    echo "FATAL ERROR CAPTURADO: " . $err->getMessage() . "\n";
    echo "Trace: " . $err->getTraceAsString() . "\n";
}
?>
