<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/conexion.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : null;

$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        if (isset($action) && $action === 'atributos') {
            try {
                // Obtener todos los atributos disponibles (estructura jerárquica)
                $stmt = $db->query("SELECT id, nombre, permite_precio FROM atributos WHERE activo = 1 ORDER BY nombre");
                $atributos = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $result = [];

                foreach ($atributos as $attr) {
                    // Obtener valores para este atributo
                    $stmtVal = $db->prepare("SELECT id, valor, color_hex FROM atributo_valores WHERE atributo_id = ? AND activo = 1 ORDER BY valor");
                    $stmtVal->execute([$attr['id']]);
                    $valores = $stmtVal->fetchAll(PDO::FETCH_ASSOC);

                    if (count($valores) > 0) {
                         $attr['valores'] = $valores;
                         $result[] = $attr;
                    }
                }
                
                echo json_encode($result);
            } catch (Exception $e) {
                error_log("Error en catalogos/atributos: " . $e->getMessage());
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener catálogos: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint no encontrado']);
        }
        break;

    case 'POST':
        // POST /catalogos/atributos - Crear nuevo atributo o valor (Opcional, para admin futuro)
        // Por ahora no implementado
        http_response_code(501);
        echo json_encode(['error' => 'No implementado']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}
?>
