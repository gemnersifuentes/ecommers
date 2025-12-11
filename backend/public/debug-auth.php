<?php
// Debug authentication path
require_once '../config/conexion.php';

$database = new Database();
$db = $database->getConnection();

// Debug the path and other variables
echo "Method: " . $_SERVER['REQUEST_METHOD'] . "\n";
echo "Request URI: " . $_SERVER['REQUEST_URI'] . "\n";
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
echo "Path: " . $path . "\n";
echo "Path contains 'login': " . (strpos($path, 'login') !== false ? 'Yes' : 'No') . "\n";
echo "Path contains 'register': " . (strpos($path, 'register') !== false ? 'Yes' : 'No') . "\n";

// Test login with admin credentials if this is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    echo "Input data: " . print_r($input, true) . "\n";
    
    if (!isset($input['correo']) || !isset($input['clave'])) {
        echo "Missing correo or clave\n";
    } else {
        echo "Correo: " . $input['correo'] . "\n";
        echo "Clave: " . $input['clave'] . "\n";
        
        try {
            $stmt = $db->prepare("SELECT id, nombre, correo, clave, rol FROM usuarios WHERE correo = ? AND activo = 1");
            $stmt->execute([$input['correo']]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario) {
                echo "User found: " . $usuario['nombre'] . "\n";
                
                if (password_verify($input['clave'], $usuario['clave'])) {
                    echo "PASSWORD CORRECT - LOGIN SUCCESS\n";
                } else {
                    echo "PASSWORD INCORRECT\n";
                }
            } else {
                echo "User not found\n";
            }
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage() . "\n";
        }
    }
}
?>