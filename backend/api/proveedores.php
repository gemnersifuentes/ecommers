<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM proveedores WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        } else {
            $stmt = $db->prepare("SELECT * FROM proveedores ORDER BY nombre ASC");
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        if (!isset($input['nombre'])) {
            http_response_code(400);
            echo json_encode(['message' => 'El nombre es requerido']);
            exit;
        }

        $sql = "INSERT INTO proveedores (nombre, ruc, telefono, email, direccion, activo) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($sql);
        if ($stmt->execute([
            $input['nombre'],
            $input['ruc'] ?? null,
            $input['telefono'] ?? null,
            $input['email'] ?? null,
            $input['direccion'] ?? null,
            $input['activo'] ?? 1
        ])) {
            echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Error al crear proveedor']);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID requerido']);
            exit;
        }
        $sql = "UPDATE proveedores SET nombre = ?, ruc = ?, telefono = ?, email = ?, direccion = ?, activo = ? WHERE id = ?";
        $stmt = $db->prepare($sql);
        if ($stmt->execute([
            $input['nombre'],
            $input['ruc'] ?? null,
            $input['telefono'] ?? null,
            $input['email'] ?? null,
            $input['direccion'] ?? null,
            $input['activo'] ?? 1,
            $id
        ])) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Error al actualizar proveedor']);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID requerido']);
            exit;
        }
        
        // Verificar si tiene compras asociadas
        $check = $db->prepare("SELECT COUNT(*) FROM compras WHERE proveedor_id = ?");
        $check->execute([$id]);
        if ($check->fetchColumn() > 0) {
            http_response_code(400);
            echo json_encode(['message' => 'No se puede eliminar un proveedor con compras registradas.']);
            exit;
        }

        $stmt = $db->prepare("DELETE FROM proveedores WHERE id = ?");
        if ($stmt->execute([$id])) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Error al eliminar proveedor']);
        }
        break;
}
?>
