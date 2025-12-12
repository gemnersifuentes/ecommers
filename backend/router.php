<?php
// Router para el servidor PHP incorporado
// Este archivo maneja el enrutamiento de las solicitudes

// Headers CORS para permitir peticiones desde el frontend
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar peticiones OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Servir archivos estáticos desde uploads
if (preg_match('/\.(?:png|jpg|jpeg|gif|webp|avif|bmp|svg|mp4|webm|ogg|mov)$/', $uri)) {
    $filePath = __DIR__ . $uri;
    
    if (file_exists($filePath)) {
        $mimeType = mime_content_type($filePath);
        header('Content-Type: ' . $mimeType);
        header('Access-Control-Allow-Origin: *');
        readfile($filePath);
        exit;
    }
    
    http_response_code(404);
    echo json_encode(['error' => 'Imagen no encontrada', 'path' => $filePath]);
    exit;
}

// Servir archivos PHP directos (test-*.php, etc)
if (preg_match('/\.php$/', $uri)) {
    $filePath = __DIR__ . $uri;
    
    // Primero intentar en raíz de backend
    if (file_exists($filePath)) {
        require $filePath;
        exit;
    }
    
    // Luego intentar en public
    $publicPath = __DIR__ . '/public' . $uri;
    if (file_exists($publicPath)) {
        require $publicPath;
        exit;
    }
}

// Manejar rutas de tienda
if (preg_match('/^\/tienda\/productos(?:\/(\d+))?$/', $uri, $matches)) {
    require_once __DIR__ . '/config/conexion.php';
    
    // Si hay ID en la URL, pasarlo a $_GET para que el script lo vea
    if (isset($matches[1])) {
        $_GET['id'] = $matches[1];
    }
    
    require __DIR__ . '/api/tienda/productos.php';
    exit();
}

if (preg_match('/^\/tienda\/resenas(?:\/(\d+))?$/', $uri, $matches)) {
    require_once __DIR__ . '/config/conexion.php';
    require __DIR__ . '/api/tienda/resenas.php';
    exit();
}

if (preg_match('/^\/tienda\/favoritos(?:\/(\d+))?$/', $uri, $matches)) {
    require_once __DIR__ . '/config/conexion.php';
    require __DIR__ . '/api/tienda/favoritos.php';
    exit();
}

if (preg_match('/^\/tienda\/categorias(?:\/(\d+))?$/', $uri, $matches)) {
    require_once __DIR__ . '/config/conexion.php';
    require __DIR__ . '/api/tienda/categorias.php';
    exit();
}

// Manejar rutas de API - ACTUALIZADO para soportar guiones en IDs (ej: 36-4)
if (preg_match('/^\/api\/(\w+)(?:\/([\w\-]+))?(?:\/([\w\-]+))?(?:\/([\w\-]+))?$/', $uri, $matches)) {
    // Conectar a la base de datos
    require_once __DIR__ . '/config/conexion.php';
    $pdo = $database->getConnection(); // Definir $pdo para que los archivos API puedan usarlo
    
    $resource = $matches[1]; // productos, categorias, descuentos, auth, carrito, etc.
    $param1 = $matches[2] ?? null; // Puede ser ID, ID compuesto (ej: 36-4), o acción (login, register)
    $param2 = $matches[3] ?? null; // Puede ser ID o sub-recurso
    $param3 = $matches[4] ?? null; // Sub-recurso adicional
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Determinar si es una ruta especial como /categorias/{id}/atributos
    $action = null;
    $id = null;
    $subResource = null;
    
    if (is_numeric($param1)) {
        $id = $param1;
        $subResource = $param2; // ej: "atributos"
    } else {
        $action = $param1; // ej: "login", "register"
        if (is_numeric($param2)) {
            $id = $param2;
        }
    }
    
    // Variable $path para compatibilidad con código existente
    $path = $uri;
    
    $apiFile = __DIR__ . '/api/' . $resource . '.php';
    
    if (file_exists($apiFile)) {
        require $apiFile;
        exit();
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint no encontrado: ' . $resource]);
        exit();
    }
}

// Para todas las demás solicitudes, usar el index.php de public
$_SERVER['SCRIPT_NAME'] = '/index.php';
require __DIR__ . '/public/index.php';
