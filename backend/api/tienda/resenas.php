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

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Listar reseñas de un producto
    $productoId = isset($_GET['producto_id']) ? intval($_GET['producto_id']) : null;
    
    if (!$productoId) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de producto requerido']);
        exit();
    }

    try {
        $stmt = $db->prepare("
            SELECT r.*, u.nombre as usuario_nombre 
            FROM resenas r
            JOIN usuarios u ON r.usuario_id = u.id
            WHERE r.producto_id = ?
            ORDER BY r.fecha_creacion DESC
        ");
        $stmt->execute([$productoId]);
        $resenas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($resenas);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al obtener reseñas: ' . $e->getMessage()]);
    }

} elseif ($method === 'POST') {
    // Crear nueva reseña
    $user = authenticate(); // Requiere login
    if (!$user) exit();

    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['producto_id']) || !isset($input['calificacion'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Datos incompletos']);
        exit();
    }

    try {
        // Verificar si ya existe reseña
        $stmtCheck = $db->prepare("SELECT id FROM resenas WHERE producto_id = ? AND usuario_id = ?");
        $stmtCheck->execute([$input['producto_id'], $user['id']]);
        if ($stmtCheck->fetch()) {
            http_response_code(409); // Conflict
            echo json_encode(['error' => 'Ya has calificado este producto']);
            exit();
        }

        $stmt = $db->prepare("
            INSERT INTO resenas (producto_id, usuario_id, calificacion, comentario, fecha_creacion)
            VALUES (?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $input['producto_id'],
            $user['id'],
            $input['calificacion'],
            $input['comentario'] ?? null
        ]);

        echo json_encode(['message' => 'Reseña creada exitosamente']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al crear reseña: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
