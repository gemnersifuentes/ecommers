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
$id = isset($_GET['id']) ? $_GET['id'] : null;
$subResource = isset($_GET['sub']) ? $_GET['sub'] : null;

$input = json_decode(file_get_contents('php://input'), true);

// Soporte para _method override (para FormData con PUT)
if (isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
    $method = 'PUT';
}

// Manejar sub-recurso /categorias/{id}/atributos
if (isset($subResource) && $subResource === 'atributos' && $id) {
    try {
        // Obtener todos los atributos y valores disponibles para productos de esta categoría
        // Obtener atributos y categorizarlos inteligentemente
        // Obtener todos los atributos y valores disponibles para productos de esta categoría
        // ESQUEMA 3 TABLAS: productos -> producto_variantes -> atributo_valores -> atributos
        $sql = "SELECT DISTINCT a.nombre as atributo_nombre, av.id as valor_id, av.valor, av.color_hex
                FROM productos p
                INNER JOIN producto_variantes pv ON p.id = pv.producto_id
                INNER JOIN atributo_valores av ON pv.atributo_valor_id = av.id
                INNER JOIN atributos a ON av.atributo_id = a.id
                WHERE p.categoria_id = ? AND p.activo = 1 AND pv.activo = 1
                ORDER BY a.nombre, av.valor";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$id]);
        $rawAttributes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $processedAttributes = [];
        
        foreach ($rawAttributes as $row) {
            $processedAttributes[] = [
                'atributo_nombre' => $row['atributo_nombre'],
                'valor_id' => $row['valor_id'],
                'valor' => $row['valor'],
                'color_hex' => $row['color_hex']
            ];
        }

        // Ya vienen ordenados por SQL
        
        echo json_encode($processedAttributes);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al obtener atributos: ' . $e->getMessage()]);
        exit;
    }
}

// Manejar sub-recurso /categorias/{id}/marcas
if (isset($subResource) && $subResource === 'marcas' && $id) {
    try {
        // Obtener marcas asociadas a productos de esta categoría
        $sql = "SELECT DISTINCT m.id, m.nombre
                FROM productos p
                INNER JOIN marcas m ON p.marca_id = m.id
                WHERE p.categoria_id = ? AND p.activo = 1 AND m.activo = 1
                ORDER BY m.nombre";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$id]);
        $marcas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($marcas);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al obtener marcas: ' . $e->getMessage()]);
        exit;
    }
}

switch ($method) {
    case 'GET':
        if ($id) {
            try {
                $stmt = $db->prepare("SELECT c.*, (SELECT COUNT(*) FROM productos p WHERE p.categoria_id = c.id AND p.activo = 1) as total_productos FROM categorias c WHERE c.id = ?");
                $stmt->execute([$id]);
                $categoria = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($categoria) {
                    echo json_encode($categoria);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Categoría no encontrada']);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener categoría: ' . $e->getMessage()]);
            }
        } else {
            try {
                // En el panel de administración queremos ver todas las categorías (activas e inactivas)
                $stmt = $db->prepare("SELECT * FROM categorias ORDER BY activo DESC, nombre ASC");
                $stmt->execute();
                $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($categorias);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener categorías: ' . $e->getMessage()]);
            }
        }
        break;

    case 'POST':
        // Usar $_POST para FormData y $input para JSON
        $nombre = $_POST['nombre'] ?? $input['nombre'] ?? null;
        $descripcion = $_POST['descripcion'] ?? $input['descripcion'] ?? null;
        $activo = $_POST['activo'] ?? $input['activo'] ?? 1;
        
        if (!$nombre) {
            http_response_code(400);
            echo json_encode(['message' => 'El nombre es requerido']);
            exit;
        }

        try {
            $imagenPath = null;
            
            // Manejar subida de imagen
            if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../uploads/categorias/';
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                
                $extension = pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION);
                $filename = uniqid('cat_') . '.' . $extension;
                $targetPath = $uploadDir . $filename;
                
                if (move_uploaded_file($_FILES['imagen']['tmp_name'], $targetPath)) {
                    $imagenPath = '/uploads/categorias/' . $filename;
                }
            }
            
            $stmt = $db->prepare("INSERT INTO categorias (nombre, descripcion, imagen, activo) VALUES (?, ?, ?, ?)");
            
            if ($stmt->execute([$nombre, $descripcion, $imagenPath, $activo])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Categoría creada exitosamente',
                    'id' => $db->lastInsertId()
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al crear categoría']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear categoría: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de categoría requerido']);
            exit;
        }

        $nombre = $_POST['nombre'] ?? $input['nombre'] ?? null;
        $descripcion = $_POST['descripcion'] ?? $input['descripcion'] ?? null;
        $activo = isset($_POST['activo']) ? $_POST['activo'] : (isset($input['activo']) ? $input['activo'] : null);

        try {
            $imagenPath = null;
            
            // Manejar subida de nueva imagen
            if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../uploads/categorias/';
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                
                $extension = pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION);
                $filename = uniqid('cat_') . '.' . $extension;
                $targetPath = $uploadDir . $filename;
                
                if (move_uploaded_file($_FILES['imagen']['tmp_name'], $targetPath)) {
                    $imagenPath = '/uploads/categorias/' . $filename;
                }
            }
            
            $sql = "UPDATE categorias SET nombre = ?, descripcion = ?";
            $params = [$nombre, $descripcion];
            
            if ($activo !== null) {
                $sql .= ", activo = ?";
                $params[] = $activo;
            }
            
            if ($imagenPath) {
                $sql .= ", imagen = ?";
                $params[] = $imagenPath;
            }
            
            $sql .= " WHERE id = ?";
            $params[] = $id;
            
            $stmt = $db->prepare($sql);
            $success = $stmt->execute($params);
            
            if ($success) {
                echo json_encode(['success' => true, 'message' => 'Categoría actualizada exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al actualizar categoría']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar categoría: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de categoría requerido']);
            exit;
        }

        try {
            $stmt = $db->prepare("UPDATE categorias SET activo = 0 WHERE id = ?");
            
            if ($stmt->execute([$id])) {
                echo json_encode(['success' => true, 'message' => 'Categoría eliminada exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al eliminar categoría']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar categoría: ' . $e->getMessage()]);
        }
        break;
}
?>
