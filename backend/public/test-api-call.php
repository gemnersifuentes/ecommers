<?php
// Simular una petición GET a productos/1
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/productos/1';

// Cargar la conexión
require_once __DIR__ . '/../config/conexion.php';

$database = new Database();
$db = $database->getConnection();

// Simular las variables que normalmente vienen del router
$method = 'GET';
$path = '/productos/1';
$id = 1;

echo "Probando endpoint GET /productos/1\n";
echo "=====================================\n\n";

// Ejecutar el mismo código que productos.php
ob_start();
try {
    include __DIR__ . '/../api/productos.php';
    $output = ob_get_clean();
    echo "✅ RESPUESTA DEL ENDPOINT:\n";
    echo $output . "\n";
} catch (Exception $e) {
    ob_end_clean();
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
