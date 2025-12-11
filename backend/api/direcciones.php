<?php
// backend/api/direcciones.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/conexion.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"));

// Obtener ID de la URL si existe
$request_uri = $_SERVER['REQUEST_URI'];
$uri_parts = explode('/', $request_uri);
$id = isset($uri_parts[count($uri_parts) - 1]) && is_numeric($uri_parts[count($uri_parts) - 1]) 
    ? intval($uri_parts[count($uri_parts) - 1]) 
    : null;

try {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Obtener dirección específica
                $stmt = $db->prepare("SELECT * FROM direcciones WHERE id = ?");
                $stmt->execute([$id]);
                $direccion = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($direccion) {
                    echo json_encode($direccion);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Dirección no encontrada']);
                }
            } else {
                // Obtener todas las direcciones de un usuario
                $usuario_id = $_GET['usuario_id'] ?? null;
                
                // Log for debugging
                error_log("Direcciones GET request - usuario_id: " . ($usuario_id ?? 'null'));
                
                if (!$usuario_id) {
                    http_response_code(400);
                    echo json_encode(['error' => 'usuario_id requerido']);
                    exit;
                }
                
                // Verificar conexión
                if (!$db) {
                    http_response_code(500);
                    echo json_encode(['error' => 'Error de conexión a base de datos']);
                    exit;
                }
                
                // Usar Alias para mantener compatibilidad con frontend
                $stmt = $db->prepare("
                    SELECT 
                        id, usuario_id,
                        nombre_contacto as nombre_destinatario,
                        telefono, direccion, departamento, provincia, distrito,
                        cod_postal as codigo_postal,
                        referencia,
                        es_principal as es_predeterminada,
                        fecha_creacion
                    FROM direcciones 
                    WHERE usuario_id = ? 
                    ORDER BY es_principal DESC, fecha_creacion DESC
                ");
                $stmt->execute([$usuario_id]);
                $direcciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode($direcciones);
            }
            break;
            
        case 'POST':
            // Crear nueva dirección
            // Log incoming data
            error_log("Direcciones POST request data: " . json_encode($data));

            if (!$data) {
                http_response_code(400);
                echo json_encode(['error' => 'Datos inválidos']);
                exit;
            }
            
            $db->beginTransaction();
            
            // Si se marca como predeterminada, quitar flag de las demás
            if (!empty($data->es_predeterminada)) {
                $stmt = $db->prepare("UPDATE direcciones SET es_principal = 0 WHERE usuario_id = ?");
                $stmt->execute([$data->usuario_id]);
            }
            
            // Insertar nueva dirección
            $stmt = $db->prepare("
                INSERT INTO direcciones 
                (usuario_id, nombre_contacto, telefono, direccion, departamento, 
                 provincia, distrito, cod_postal, referencia, es_principal) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data->usuario_id,
                $data->nombre_destinatario,
                $data->telefono,
                $data->direccion,
                $data->departamento,
                $data->provincia,
                $data->distrito,
                $data->codigo_postal ?? null,
                $data->referencia ?? null,
                !empty($data->es_predeterminada) ? 1 : 0
            ]);
            
            $direccion_id = $db->lastInsertId();
            $db->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Dirección creada exitosamente',
                'direccion_id' => $direccion_id
            ]);
            break;
            
        case 'PUT':
            // Actualizar dirección existente
            if (!$id || !$data) {
                http_response_code(400);
                echo json_encode(['error' => 'ID y datos requeridos']);
                exit;
            }
            
            $db->beginTransaction();
            
            // Si se marca como predeterminada, quitar flag de las demás
            if (!empty($data->es_predeterminada)) {
                // Obtener usuario_id de la dirección
                $stmt = $db->prepare("SELECT usuario_id FROM direcciones WHERE id = ?");
                $stmt->execute([$id]);
                $direccion = $stmt->fetch(PDO::FETCH_ASSOC);
                
                $stmt = $db->prepare("UPDATE direcciones SET es_principal = 0 WHERE usuario_id = ?");
                $stmt->execute([$direccion['usuario_id']]);
            }
            
            // Actualizar dirección
            $stmt = $db->prepare("
                UPDATE direcciones SET
                    nombre_contacto = ?,
                    telefono = ?,
                    direccion = ?,
                    departamento = ?,
                    provincia = ?,
                    distrito = ?,
                    cod_postal = ?,
                    referencia = ?,
                    es_principal = ?
                WHERE id = ?
            ");
            
            $stmt->execute([
                $data->nombre_destinatario,
                $data->telefono,
                $data->direccion,
                $data->departamento,
                $data->provincia,
                $data->distrito,
                $data->codigo_postal ?? null,
                $data->referencia ?? null,
                !empty($data->es_predeterminada) ? 1 : 0,
                $id
            ]);
            
            $db->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Dirección actualizada exitosamente'
            ]);
            break;
            
        case 'DELETE':
            // Eliminar dirección
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID requerido']);
                exit;
            }
            
            // Verificar que no sea la única dirección del usuario
            $stmt = $db->prepare("SELECT usuario_id FROM direcciones WHERE id = ?");
            $stmt->execute([$id]);
            $direccion = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$direccion) {
                http_response_code(404);
                echo json_encode(['error' => 'Dirección no encontrada']);
                exit;
            }
            
            // Contar direcciones del usuario
            $stmt = $db->prepare("SELECT COUNT(*) as total FROM direcciones WHERE usuario_id = ?");
            $stmt->execute([$direccion['usuario_id']]);
            $count = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            if ($count <= 1) {
                http_response_code(400);
                echo json_encode(['error' => 'No puedes eliminar tu única dirección']);
                exit;
            }
            
            $db->beginTransaction();
            
            // Verificar si la dirección a eliminar es predeterminada
            $stmt = $db->prepare("SELECT es_principal FROM direcciones WHERE id = ?");
            $stmt->execute([$id]);
            $es_predeterminada = $stmt->fetch(PDO::FETCH_ASSOC)['es_principal'];
            
            // Eliminar dirección
            $stmt = $db->prepare("DELETE FROM direcciones WHERE id = ?");
            $stmt->execute([$id]);
            
            // Si era predeterminada, marcar otra como predeterminada
            if ($es_predeterminada) {
                $stmt = $db->prepare("
                    UPDATE direcciones 
                    SET es_principal = 1 
                    WHERE usuario_id = ? 
                    ORDER BY fecha_creacion DESC 
                    LIMIT 1
                ");
                $stmt->execute([$direccion['usuario_id']]);
            }
            
            $db->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Dirección eliminada exitosamente'
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido']);
            break;
    }
    
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
