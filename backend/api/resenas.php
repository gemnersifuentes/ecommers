<?php
/**
 * API para Reseñas de Productos
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Get reviews for a product
        $producto_id = isset($_GET['producto_id']) ? (int)$_GET['producto_id'] : 0;
        
        if (!$producto_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'producto_id is required']);
            exit;
        }
        
        // Get reviews with user info
        $stmt = $db->prepare("
            SELECT 
                r.*,
                u.nombre as usuario_nombre,
                u.pais as usuario_pais
            FROM resenas r
            LEFT JOIN usuarios u ON r.usuario_id = u.id
            WHERE r.producto_id = ?
            ORDER BY r.fecha_creacion DESC
        ");
        $stmt->execute([$producto_id]);
        $resenas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calculate stats
        $total = count($resenas);
        $promedio = 0;
        $verificadas = 0;
        
        if ($total > 0) {
            $suma = 0;
            foreach ($resenas as $resena) {
                $suma += $resena['calificacion'];
                // Assuming all are verified for now since there's no field
            }
            $promedio = round($suma / $total, 1);
            $verificadas = $total; // All verified
        }
        
        echo json_encode([
            'success' => true,
            'resenas' => $resenas,
            'total' => $total,
            'promedio' => $promedio,
            'verificadas' => $verificadas
        ]);
        
    } elseif ($method === 'POST') {
        // Create new review
        $input = json_decode(file_get_contents('php://input'), true);
        
        $required = ['producto_id', 'usuario_id', 'calificacion', 'comentario'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => "$field is required"]);
                exit;
            }
        }
        
        $stmt = $db->prepare("
            INSERT INTO resenas (producto_id, usuario_id, calificacion, comentario)
            VALUES (?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $input['producto_id'],
            $input['usuario_id'],
            $input['calificacion'],
            $input['comentario']
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Review created successfully',
            'id' => $db->lastInsertId()
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
