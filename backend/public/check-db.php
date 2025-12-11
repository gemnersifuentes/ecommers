<?php
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/conexion.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo json_encode(['error' => 'No database connection']);
    exit;
}

echo json_encode(['success' => 'Database connection successful']);

// Check if admin user exists
try {
    $stmt = $db->prepare("SELECT id, nombre, correo, rol, activo FROM usuarios WHERE correo = 'admin@tiendatec.com'");
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "\n";
        echo json_encode(['admin_user' => $user]);
    } else {
        echo "\n";
        echo json_encode(['message' => 'Admin user not found']);
    }
} catch (Exception $e) {
    echo "\n";
    echo json_encode(['error' => 'Error checking admin user: ' . $e->getMessage()]);
}
?>