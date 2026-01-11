<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../config/auth_helper.php';

// Verificar que sea admin
verificarAdmin();

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !isset($data['type'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Faltan datos (id, type)"]);
    exit;
}

$id = $data['id'];
$type = $data['type'];

try {
    // Caso especial: Marcar todo como visto
    if ($id === 'all') {
        $tablesToClear = [];
        if ($type === 'global') {
            $tablesToClear = ['pedidos', 'mensajes_contacto', 'reservaciones_servicios', 'productos', 'variaciones'];
        } else {
            switch ($type) {
                case 'pedido': $tablesToClear = ['pedidos']; break;
                case 'mensaje': $tablesToClear = ['mensajes_contacto']; break;
                case 'servicio': $tablesToClear = ['reservaciones_servicios']; break;
                case 'stock': $tablesToClear = ['productos', 'variaciones']; break;
            }
        }

        foreach ($tablesToClear as $table) {
        if ($table === 'productos' || $table === 'variaciones') {
            $db->exec("UPDATE $table SET visto_admin = NOW()");
        } else {
            $db->exec("UPDATE $table SET visto_admin = 1");
        }
    }
        
        echo json_encode(["success" => true, "message" => "Notificaciones marcadas como vistas"]);
        exit;
    }

    // Caso normal: Marcar un ID específico
    switch ($type) {
        case 'pedido':
            $stmt = $db->prepare("UPDATE pedidos SET visto_admin = 1 WHERE id = ?");
            break;
        case 'mensaje':
            $stmt = $db->prepare("UPDATE mensajes_contacto SET visto_admin = 1 WHERE id = ?");
            break;
        case 'servicio':
            $stmt = $db->prepare("UPDATE reservaciones_servicios SET visto_admin = 1 WHERE id = ?");
            break;
        case 'stock':
            // Marcar con la fecha actual para que desaparezca temporalmente
            $stmt1 = $db->prepare("UPDATE productos SET visto_admin = NOW() WHERE id = ?");
            $stmt1->execute([$id]);
            $stmt = $db->prepare("UPDATE variaciones SET visto_admin = NOW() WHERE id = ?");
            break;
        case 'stock_v2': 
             $stmt = $db->prepare("UPDATE variaciones SET visto_admin = NOW() WHERE id = ?");
             break;
        default:
            throw new Exception("Tipo de notificación no válido");
    }

    $stmt->execute([$id]);

    echo json_encode(["success" => true, "message" => "Notificación marcada como vista"]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
