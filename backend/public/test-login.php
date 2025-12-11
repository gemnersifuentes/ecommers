<?php
// Archivo de prueba para verificar login
// Acceder a: http://localhost:8000/test-login.php

require_once __DIR__ . '/../config/conexion.php';

header('Content-Type: text/plain; charset=utf-8');
header('Access-Control-Allow-Origin: *');

echo "=== TEST DE LOGIN ===\n\n";

// 1. Verificar que existe el usuario
$stmt = $db->prepare("SELECT id, nombre, correo, clave, rol, activo FROM usuarios WHERE correo = ?");
$stmt->execute(['admin@tiendatec.com']);
$usuario = $stmt->fetch(PDO::FETCH_ASSOC);

echo "1. Usuario encontrado:\n";
print_r($usuario);
echo "\n\n";

if (!$usuario) {
    echo "❌ ERROR: El usuario no existe en la base de datos\n";
    exit;
}

if ($usuario['activo'] != 1) {
    echo "❌ ERROR: El usuario está inactivo\n";
    exit;
}

// 2. Verificar el hash de la contraseña
$passwordInput = 'admin123';
$hashEnBD = $usuario['clave'];

echo "2. Verificación de contraseña:\n";
echo "   - Contraseña ingresada: $passwordInput\n";
echo "   - Hash en BD: $hashEnBD\n";
echo "   - Longitud del hash: " . strlen($hashEnBD) . "\n\n";

// 3. Probar password_verify
$esValida = password_verify($passwordInput, $hashEnBD);

echo "3. Resultado de password_verify: " . ($esValida ? '✅ CORRECTO' : '❌ INCORRECTO') . "\n\n";

// 4. Generar un nuevo hash para comparar
$nuevoHash = password_hash($passwordInput, PASSWORD_BCRYPT);
echo "4. Nuevo hash generado:\n";
echo "   $nuevoHash\n\n";

// 5. Verificar con el nuevo hash
$esValidoNuevo = password_verify($passwordInput, $nuevoHash);
echo "5. Verificación con nuevo hash: " . ($esValidoNuevo ? '✅ CORRECTO' : '❌ INCORRECTO') . "\n\n";

// 6. Recomendación
if (!$esValida) {
    echo "❌ PROBLEMA ENCONTRADO:\n";
    echo "El hash en la base de datos NO es válido para la contraseña 'admin123'\n\n";
    echo "SOLUCIÓN: Ejecuta este SQL en phpMyAdmin:\n\n";
    echo "UPDATE usuarios SET clave = '$nuevoHash' WHERE correo = 'admin@tiendatec.com';\n\n";
} else {
    echo "✅ TODO OK: El login debería funcionar correctamente\n";
}
?>
