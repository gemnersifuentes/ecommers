<?php
header('Content-Type: text/html; charset=UTF-8');

require_once '../config/conexion.php';

$database = new Database();
$db = $database->getConnection();

echo "<h2>Actualizar Contraseñas de Usuarios</h2>";

// Hashear las contraseñas correctamente
$usuarios = [
    ['correo' => 'admin@tiendatec.com', 'clave' => 'admin123'],
    ['correo' => 'empleado@tiendatec.com', 'clave' => 'admin123']
];

echo "<table border='1' cellpadding='10'>";
echo "<tr><th>Correo</th><th>Nueva Contraseña</th><th>Estado</th></tr>";

foreach ($usuarios as $user) {
    $claveHash = password_hash($user['clave'], PASSWORD_BCRYPT);
    
    try {
        $stmt = $db->prepare("UPDATE usuarios SET clave = ? WHERE correo = ?");
        $stmt->execute([$claveHash, $user['correo']]);
        
        echo "<tr>";
        echo "<td>{$user['correo']}</td>";
        echo "<td>{$user['clave']}</td>";
        echo "<td style='color: green;'>✓ Actualizado</td>";
        echo "</tr>";
    } catch (Exception $e) {
        echo "<tr>";
        echo "<td>{$user['correo']}</td>";
        echo "<td>{$user['clave']}</td>";
        echo "<td style='color: red;'>✗ Error: " . $e->getMessage() . "</td>";
        echo "</tr>";
    }
}

echo "</table>";

// Verificar que funcione
echo "<hr>";
echo "<h3>Verificación del Login</h3>";

$correo_test = 'admin@tiendatec.com';
$clave_test = 'admin123';

$stmt = $db->prepare("SELECT id, nombre, correo, clave, rol FROM usuarios WHERE correo = ?");
$stmt->execute([$correo_test]);
$usuario = $stmt->fetch(PDO::FETCH_ASSOC);

if ($usuario && password_verify($clave_test, $usuario['clave'])) {
    echo "<p style='color: green; font-weight: bold; font-size: 20px;'>✓✓✓ ¡CONTRASEÑAS ACTUALIZADAS CORRECTAMENTE!</p>";
    echo "<p>Ahora puedes hacer login con:</p>";
    echo "<ul>";
    echo "<li><strong>Email:</strong> admin@tiendatec.com</li>";
    echo "<li><strong>Password:</strong> admin123</li>";
    echo "</ul>";
    echo "<p><a href='http://localhost:5173' target='_blank'>Ir a la aplicación</a></p>";
} else {
    echo "<p style='color: red;'>✗ Error en la verificación</p>";
}
?>
