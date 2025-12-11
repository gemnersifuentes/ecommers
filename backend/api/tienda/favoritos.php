<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../config/auth_middleware.php';

try {
    $database = new Database();
    $db = $database->getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit();
}

$user = authenticate(); // Todo requiere login
if (!$user) exit();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Listar favoritos del usuario
    try {
        $stmt = $db->prepare("
            SELECT p.*, f.fecha_creacion as fecha_agregado
            FROM favoritos f
            JOIN productos p ON f.producto_id = p.id
            WHERE f.usuario_id = ?
            ORDER BY f.fecha_creacion DESC
        ");
        $stmt->execute([$user['id']]);
        $favoritos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Aquí idealmente deberíamos enriquecer con precios/descuentos igual que en productos.php
        // Por simplicidad ahora devolvemos datos básicos
        
        echo json_encode($favoritos);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al obtener favoritos: ' . $e->getMessage()]);
    }

} elseif ($method === 'POST') {
    // Toggle favorito
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['producto_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de producto requerido']);
        exit();
    }

    try {
        // Verificar si ya es favorito
        $stmtCheck = $db->prepare("SELECT id FROM favoritos WHERE producto_id = ? AND usuario_id = ?");
        $stmtCheck->execute([$input['producto_id'], $user['id']]);
        $favorito = $stmtCheck->fetch();

        if ($favorito) {
            // Eliminar
            $stmt = $db->prepare("DELETE FROM favoritos WHERE id = ?");
            $stmt->execute([$favorito['id']]);
            echo json_encode(['message' => 'Eliminado de favoritos', 'es_favorito' => false]);
        } else {
            // Agregar
            $stmt = $db->prepare("INSERT INTO favoritos (producto_id, usuario_id, fecha_creacion) VALUES (?, ?, NOW())");
            $stmt->execute([$input['producto_id'], $user['id']]);
            echo json_encode(['message' => 'Agregado a favoritos', 'es_favorito' => true]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al procesar favorito: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
