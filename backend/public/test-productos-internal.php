<?php
// Mock environment
$_SERVER['REQUEST_METHOD'] = 'GET';
$method = 'GET';
$id = null;
$_GET = []; // No params

// Capture output
ob_start();
require_once __DIR__ . '/../config/conexion.php';
$db = (new Database())->getConnection();

// Include API logic (we need to be careful as it might exit)
// We'll wrap it in a function or just include it if it doesn't have a class structure
// Looking at productos.php, it's a procedural script that runs immediately.
// It uses $db, $method, $id variables.

// We need to define $input as well
$input = [];

// Execute
require __DIR__ . '/../api/productos.php';

$output = ob_get_clean();

echo "=== API OUTPUT ===\n";
echo substr($output, 0, 500) . "...\n";

$data = json_decode($output, true);
if (json_last_error() === JSON_ERROR_NONE) {
    if (isset($data['error'])) {
        echo "❌ API returned error: " . $data['error'] . "\n";
    } elseif (is_array($data)) {
        echo "✅ API returned array with " . count($data) . " items.\n";
    } else {
        echo "❓ API returned unknown JSON structure.\n";
    }
} else {
    echo "❌ API returned invalid JSON.\n";
}
?>
