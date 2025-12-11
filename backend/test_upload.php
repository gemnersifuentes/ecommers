<?php
// Script de prueba para verificar subida de archivos
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

echo "=== TEST DE SUBIDA DE ARCHIVOS ===\n\n";

echo "POST data:\n";
print_r($_POST);
echo "\n\n";

echo "FILES data:\n";
print_r($_FILES);
echo "\n\n";

echo "Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'No definido') . "\n\n";

if (isset($_FILES['imagen_file'])) {
    echo "Archivo detectado!\n";
    echo "Nombre: " . $_FILES['imagen_file']['name'] . "\n";
    echo "Tamaño: " . $_FILES['imagen_file']['size'] . " bytes\n";
    echo "Error: " . $_FILES['imagen_file']['error'] . "\n";
    echo "Tipo: " . $_FILES['imagen_file']['type'] . "\n";
    
    if ($_FILES['imagen_file']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../public/uploads/banners/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $ext = pathinfo($_FILES['imagen_file']['name'], PATHINFO_EXTENSION);
        $newName = 'test_' . time() . '.' . $ext;
        $destination = $uploadDir . $newName;
        
        if (move_uploaded_file($_FILES['imagen_file']['tmp_name'], $destination)) {
            echo "\n✅ ÉXITO: Archivo guardado en: " . $destination . "\n";
        } else {
            echo "\n❌ ERROR: No se pudo mover el archivo\n";
        }
    } else {
        echo "\n❌ ERROR en upload: " . $_FILES['imagen_file']['error'] . "\n";
    }
} else {
    echo "❌ No se recibió ningún archivo\n";
}
?>
