<?php
// Test authentication directly
require_once '../config/conexion.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo "Database connection failed";
    exit;
}

// Test login with admin credentials
$correo = 'admin@tiendatec.com';
$clave = 'admin123';

try {
    $stmt = $db->prepare("SELECT id, nombre, correo, clave, rol FROM usuarios WHERE correo = ? AND activo = 1");
    $stmt->execute([$correo]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usuario) {
        echo "User found: " . $usuario['nombre'] . "\n";
        echo "Correo: " . $usuario['correo'] . "\n";
        echo "Rol: " . $usuario['rol'] . "\n";
        
        if (password_verify($clave, $usuario['clave'])) {
            echo "PASSWORD CORRECT - LOGIN WOULD SUCCEED\n";
        } else {
            echo "PASSWORD INCORRECT - LOGIN WOULD FAIL\n";
            echo "Password hash in DB: " . $usuario['clave'] . "\n";
        }
    } else {
        echo "User not found\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>