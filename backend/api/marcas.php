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
$id = isset($_GET['id']) ? $_GET['id'] : (isset($_SERVER['PATH_INFO']) ? trim($_SERVER['PATH_INFO'], '/') : null);

// Intentar extraer ID si viene en la ruta
if (!$id && isset($_SERVER['REQUEST_URI'])) {
    $parts = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
    if (end($parts) && is_numeric(end($parts))) {
        $id = end($parts);
    }
}

$input = json_decode(file_get_contents('php://input'), true);

// Soporte para _method override (para FormData con PUT)
if (isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
    $method = 'PUT';
}

switch ($method) {
    case 'GET':
        if ($id) {
            try {
                $stmt = $db->prepare("SELECT m.*, (SELECT COUNT(*) FROM productos p WHERE p.marca_id = m.id AND p.activo = 1) as total_productos FROM marcas m WHERE m.id = ?");
                $stmt->execute([$id]);
                $marca = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($marca) {
                    echo json_encode($marca);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Marca no encontrada']);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener marca: ' . $e->getMessage()]);
            }
        } else {
            try {
                // En el panel de administración queremos ver todas las marcas (activas e inactivas)
                $stmt = $db->prepare("SELECT * FROM marcas ORDER BY activo DESC, nombre ASC");
                $stmt->execute();
                $marcas = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($marcas);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener marcas: ' . $e->getMessage()]);
            }
        }
        break;

    case 'POST':
        $nombre = $_POST['nombre'] ?? $input['nombre'] ?? null;
        $descripcion = $_POST['descripcion'] ?? $input['descripcion'] ?? null;
        $activo = $_POST['activo'] ?? $input['activo'] ?? 1;

        if (!$nombre) {
            http_response_code(400);
            echo json_encode(['message' => 'El nombre es requerido']);
            exit;
        }

        try {
            $logoPath = null;
            
            // Manejar subida de logo
            if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../uploads/marcas/';
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                
                $extension = pathinfo($_FILES['logo']['name'], PATHINFO_EXTENSION);
                $filename = uniqid('brand_') . '.' . $extension;
                $targetPath = $uploadDir . $filename;
                
                if (move_uploaded_file($_FILES['logo']['tmp_name'], $targetPath)) {
                    $logoPath = '/uploads/marcas/' . $filename;
                }
            }

            $stmt = $db->prepare("INSERT INTO marcas (nombre, descripcion, logo, activo) VALUES (?, ?, ?, ?)");
            
            if ($stmt->execute([$nombre, $descripcion, $logoPath, $activo])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Marca creada exitosamente',
                    'id' => $db->lastInsertId()
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al crear marca']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear marca: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de marca requerido']);
            exit;
        }

        $nombre = $_POST['nombre'] ?? $input['nombre'] ?? null;
        $descripcion = $_POST['descripcion'] ?? $input['descripcion'] ?? null;
        $activo = isset($_POST['activo']) ? $_POST['activo'] : (isset($input['activo']) ? $input['activo'] : null);

        try {
            $logoPath = null;
            
            // Manejar subida de nuevo logo
            if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../uploads/marcas/';
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                
                $extension = pathinfo($_FILES['logo']['name'], PATHINFO_EXTENSION);
                $filename = uniqid('brand_') . '.' . $extension;
                $targetPath = $uploadDir . $filename;
                
                if (move_uploaded_file($_FILES['logo']['tmp_name'], $targetPath)) {
                    $logoPath = '/uploads/marcas/' . $filename;
                }
            }
            
            $sql = "UPDATE marcas SET nombre = ?, descripcion = ?";
            $params = [$nombre, $descripcion];
            
            if ($activo !== null) {
                $sql .= ", activo = ?";
                $params[] = $activo;
            }
            
            if ($logoPath) {
                $sql .= ", logo = ?";
                $params[] = $logoPath;
            }
            
            $sql .= " WHERE id = ?";
            $params[] = $id;
            
            $stmt = $db->prepare($sql);
            $success = $stmt->execute($params);
            
            if ($success) {
                echo json_encode(['success' => true, 'message' => 'Marca actualizada exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al actualizar marca']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar marca: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de marca requerido']);
            exit;
        }

        try {
            $stmt = $db->prepare("UPDATE marcas SET activo = 0 WHERE id = ?");
            
            if ($stmt->execute([$id])) {
                echo json_encode(['success' => true, 'message' => 'Marca eliminada exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al eliminar marca']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar marca: ' . $e->getMessage()]);
        }
        break;
}
?>
