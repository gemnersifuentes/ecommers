<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../config/auth_helper.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = $database->getConnection();

// Función auxiliar para extraer ID de la URL
function getBannerIdFromUri() {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $uriParts = explode('/', trim($uri, '/'));
    
    foreach ($uriParts as $index => $part) {
        if ($part === 'banners' && isset($uriParts[$index + 1])) {
            $potentialId = $uriParts[$index + 1];
            if (is_numeric($potentialId)) {
                return (int)$potentialId;
            }
        }
    }
    return null;
}

// Función para obtener datos (JSON o POST)
function getRequestData() {
    $contentType = $_SERVER["CONTENT_TYPE"] ?? '';
    if (strpos($contentType, 'application/json') !== false) {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
    return $_POST;
}

// Función para manejar subida de archivos
function handleImageUpload() {
    error_log("=== INICIO handleImageUpload ===");
    error_log("FILES: " . print_r($_FILES, true));
    
    if (!isset($_FILES['imagen_file'])) {
        error_log("No se encontró imagen_file en FILES");
        return null;
    }
    
    if ($_FILES['imagen_file']['error'] !== UPLOAD_ERR_OK) {
        error_log("Error en upload: " . $_FILES['imagen_file']['error']);
        return null;
    }

    $file = $_FILES['imagen_file'];
    $fileName = $file['name'];
    $fileTmpName = $file['tmp_name'];
    $fileSize = $file['size'];
    $fileError = $file['error'];
    $fileType = $file['type'];

    error_log("Archivo recibido: $fileName, Tamaño: $fileSize, Tipo: $fileType");

    $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp', 'tiff'];

    if (!in_array($fileExt, $allowed)) {
        error_log("Extensión no permitida: $fileExt");
        return null;
    }

    if ($fileError !== 0) {
        error_log("Error de archivo: $fileError");
        return null;
    }

    if ($fileSize >= 20000000) {
        error_log("Archivo muy grande: $fileSize bytes");
        return null;
    }

    $fileNameNew = uniqid('banner_', true) . "." . $fileExt;
    $uploadDir = __DIR__ . '/../uploads/banners/';
    
    error_log("Directorio de destino: $uploadDir");
    
    if (!file_exists($uploadDir)) {
        error_log("Creando directorio: $uploadDir");
        if (!mkdir($uploadDir, 0777, true)) {
            error_log("ERROR: No se pudo crear el directorio");
            return null;
        }
    }
    
    $fileDestination = $uploadDir . $fileNameNew;
    error_log("Destino final: $fileDestination");
    
    if (move_uploaded_file($fileTmpName, $fileDestination)) {
        error_log("Archivo movido exitosamente a: $fileDestination");
        $relativePath = '/uploads/banners/' . $fileNameNew;
        error_log("Ruta relativa: $relativePath");
        return $relativePath;
    } else {
        error_log("ERROR: No se pudo mover el archivo");
        return null;
    }
}

// GET - Obtener banners
if ($method === 'GET') {
    try {
        $tipo = isset($_GET['tipo']) ? $_GET['tipo'] : null;
        $activo = isset($_GET['activo']) ? $_GET['activo'] : null;
        
        $sql = "SELECT * FROM banners WHERE 1=1";
        $params = [];
        
        if ($tipo) {
            $sql .= " AND tipo = ?";
            $params[] = $tipo;
        }
        
        if ($activo !== null) {
            $sql .= " AND activo = ?";
            $params[] = $activo;
        }
        
        if ($activo == 1) {
            $sql .= " AND (fecha_inicio IS NULL OR fecha_inicio <= NOW())";
            $sql .= " AND (fecha_fin IS NULL OR fecha_fin >= NOW())";
        }
        
        $sql .= " ORDER BY tipo, orden ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $banners = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($banners);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// POST - Crear o Actualizar (si hay ID)
elseif ($method === 'POST') {
    try {
        verificarAutenticacion();
        verificarAdmin();
        
        $id = getBannerIdFromUri();
        $data = getRequestData();
        $uploadedImage = handleImageUpload();
        
        // Si se subió imagen, usarla. Si no, usar la URL proporcionada o mantener la existente (en update)
        $imagen = $uploadedImage ?? ($data['imagen'] ?? '');
        
        if ($id) {
            // UPDATE
            error_log("POST (UPDATE) /api/banners/$id");
            
            // Si no hay nueva imagen, mantener la anterior
            if (empty($imagen)) {
                $stmt = $pdo->prepare("SELECT imagen FROM banners WHERE id = ?");
                $stmt->execute([$id]);
                $current = $stmt->fetch(PDO::FETCH_ASSOC);
                $imagen = $current['imagen'] ?? '';
            }
            
            $sql = "UPDATE banners SET 
                    tipo = ?, titulo = ?, subtitulo = ?, descripcion = ?, 
                    texto_boton = ?, link = ?, imagen = ?, gradiente = ?, 
                    orden = ?, activo = ?, fecha_inicio = ?, fecha_fin = ?
                    WHERE id = ?";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['tipo'] ?? 'carousel',
                $data['titulo'],
                $data['subtitulo'] ?? null,
                $data['descripcion'] ?? null,
                $data['texto_boton'] ?? null,
                $data['link'] ?? null,
                $imagen,
                $data['gradiente'] ?? null,
                $data['orden'] ?? 0,
                isset($data['activo']) ? (int)$data['activo'] : 1,
                $data['fecha_inicio'] ?? null,
                $data['fecha_fin'] ?? null,
                $id
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Banner actualizado exitosamente',
                'id' => $id,
                'imagen' => $imagen
            ]);
            
        } else {
            // CREATE
            error_log("POST (CREATE) /api/banners");
            
            $sql = "INSERT INTO banners (tipo, titulo, subtitulo, descripcion, texto_boton, link, imagen, gradiente, orden, activo, fecha_inicio, fecha_fin) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['tipo'] ?? 'carousel',
                $data['titulo'],
                $data['subtitulo'] ?? null,
                $data['descripcion'] ?? null,
                $data['texto_boton'] ?? null,
                $data['link'] ?? null,
                $imagen,
                $data['gradiente'] ?? null,
                $data['orden'] ?? 0,
                isset($data['activo']) ? (int)$data['activo'] : 1,
                $data['fecha_inicio'] ?? null,
                $data['fecha_fin'] ?? null
            ]);
            
            echo json_encode([
                'success' => true,
                'id' => $pdo->lastInsertId(),
                'message' => 'Banner creado exitosamente',
                'imagen' => $imagen
            ]);
        }
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error de base de datos: ' . $e->getMessage()]);
    } catch(Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// PUT - Actualizar banner (Legacy JSON support)
elseif ($method === 'PUT') {
    try {
        verificarAutenticacion();
        verificarAdmin();
        
        $id = getBannerIdFromUri();
        if (!$id) throw new Exception("ID no válido");
        
        $data = getRequestData();
        
        $sql = "UPDATE banners SET 
                tipo = ?, titulo = ?, subtitulo = ?, descripcion = ?, 
                texto_boton = ?, link = ?, imagen = ?, gradiente = ?, 
                orden = ?, activo = ?, fecha_inicio = ?, fecha_fin = ?
                WHERE id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['tipo'] ?? 'carousel',
            $data['titulo'],
            $data['subtitulo'] ?? null,
            $data['descripcion'] ?? null,
            $data['texto_boton'] ?? null,
            $data['link'] ?? null,
            $data['imagen'] ?? '',
            $data['gradiente'] ?? null,
            $data['orden'] ?? 0,
            isset($data['activo']) ? (int)$data['activo'] : 1,
            $data['fecha_inicio'] ?? null,
            $data['fecha_fin'] ?? null,
            $id
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Banner actualizado exitosamente',
            'id' => $id
        ]);
    } catch(Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// DELETE - Eliminar banner
elseif ($method === 'DELETE') {
    try {
        verificarAutenticacion();
        verificarAdmin();
        
        $id = getBannerIdFromUri();
        if (!$id) throw new Exception("ID no válido");
        
        // Opcional: Eliminar archivo de imagen si es local
        $stmt = $pdo->prepare("SELECT imagen FROM banners WHERE id = ?");
        $stmt->execute([$id]);
        $banner = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($banner && strpos($banner['imagen'], '/uploads/') === 0) {
            $filePath = __DIR__ . '/../../public' . $banner['imagen'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }
        
        $stmt = $pdo->prepare("DELETE FROM banners WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true, 'message' => 'Banner eliminado exitosamente']);
    } catch(Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
