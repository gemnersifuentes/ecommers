<?php
// API de servicios
require_once __DIR__ . '/../config/conexion.php';

// Debug
error_log("API Servicios accessed. Method: " . $_SERVER['REQUEST_METHOD']);

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
    $method = 'PUT';
}
$id = isset($_GET['id']) ? $_GET['id'] : null;

// Handle JSON or Form Data
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

function uploadImage($file) {
    // Definir directorio absoluto
    $target_dir = __DIR__ . "/../uploads/servicios/";
    
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
    }
    
    $fileName = basename($file["name"]);
    $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    // Valid types
    $allowTypes = array('jpg', 'png', 'jpeg', 'gif', 'webp', 'svg');
    if (!in_array($fileType, $allowTypes)) {
        error_log("Upload failed: Invalid file type " . $fileType);
        return null;
    }

    $newFileName = uniqid('svc_') . '.' . $fileType;
    $targetFilePath = $target_dir . $newFileName;
    
    if (move_uploaded_file($file["tmp_name"], $targetFilePath)) {
        return "/uploads/servicios/" . $newFileName;
    }
    
    error_log("Upload failed: move_uploaded_file error");
    return null;
}

switch ($method) {
    case 'GET':
        if ($id) {
            try {
                $stmt = $db->prepare("SELECT * FROM servicios WHERE id = ?");
                $stmt->execute([$id]);
                $servicio = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($servicio) {
                    echo json_encode($servicio);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Servicio no encontrado']);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener servicio: ' . $e->getMessage()]);
            }
        } else {
            try {
                $stmt = $db->prepare("SELECT * FROM servicios WHERE activo = 1 ORDER BY nombre");
                $stmt->execute();
                $servicios = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($servicios);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener servicios: ' . $e->getMessage()]);
            }
        }
        break;

    case 'POST':
        if (!isset($input['nombre']) || !isset($input['precio'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Nombre y precio son requeridos']);
            exit;
        }

        try {
            $imagenPath = null;
            if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] == 0) {
                $imagenPath = uploadImage($_FILES['imagen']);
            }

            // Check if duracion column exists or just ignore for now to be safe with strict request? 
            // I'll try to include it if input has it.
            
            $stmt = $db->prepare("INSERT INTO servicios (nombre, descripcion, precio, imagen) VALUES (?, ?, ?, ?)");
            
            if ($stmt->execute([$input['nombre'], $input['descripcion'] ?? null, $input['precio'], $imagenPath])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Servicio creado exitosamente',
                    'id' => $db->lastInsertId(),
                    'imagen' => $imagenPath
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al crear servicio']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear servicio: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de servicio requerido']);
            exit;
        }

        // For PUT with File, PHP doesn't parse $_FILES natively for PUT method.
        // Frontend must send POST with _method=PUT or we handle POST with ID as PUT?
        // Or standard REST: PUT is ID specific.
        // If sending FormData, usually standard is POST.
        // But let's assume if it is POST and ID is present in URL, we treat as UPDATE?
        // Actually, simplest is to check if it's a POST request simulating PUT or just update logic in POST?
        // Standard in this app seems to be separate PUT case.
        // But uploading files via PUT is tricky in PHP.
        // I will use logic: If `$_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['id'])` -> Treat as Update?
        // Or client sends POST.
        // For now, I'll update PUT block but warn that PHP can't read files in PUT directly easily.
        // Strategy: Client sends POST for update if file is present.
        
        // However, I can try to read standard PUT. But file upload in PUT is raw stream.
        // Better: Use POST for everything with file uploads.
        // But `serviciosService.update` calls `api.put`. I need to change that in Frontend to `api.post` with `_method` override or just handle `POST` with `id` here.
        
        // Let's modify logic: catch POST with ID as Update?
        // OR just rely on the fact that I will change frontend to send POST.
        
        try {
            $imagenPath = null;
            $sqlUpdateImage = "";
            $params = [$input['nombre'], $input['descripcion'] ?? null, $input['precio']];
            
            if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] == 0) {
                $imagenPath = uploadImage($_FILES['imagen']);
                if ($imagenPath) {
                    $sqlUpdateImage = ", imagen = ?";
                    $params[] = $imagenPath;
                }
            }

            $params[] = $id;
            
            $stmt = $db->prepare("UPDATE servicios SET nombre = ?, descripcion = ?, precio = ?" . $sqlUpdateImage . " WHERE id = ?");
            
            if ($stmt->execute($params)) {
                echo json_encode(['success' => true, 'message' => 'Servicio actualizado exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al actualizar servicio']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar servicio: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de servicio requerido']);
            exit;
        }

        try {
            $stmt = $db->prepare("UPDATE servicios SET activo = 0 WHERE id = ?");
            
            if ($stmt->execute([$id])) {
                echo json_encode(['success' => true, 'message' => 'Servicio eliminado exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al eliminar servicio']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar servicio: ' . $e->getMessage()]);
        }
        break;
}
?>
