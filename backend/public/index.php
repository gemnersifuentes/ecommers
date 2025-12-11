<?php
// API Router para servidor PHP incorporado
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Conexión a base de datos
require_once __DIR__ . '/../config/conexion.php';

try {
   $database = new Database();
    $db = $database->getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a base de datos: ' . $e->getMessage()]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Eliminar el slash inicial y dividir
$segments = array_values(array_filter(explode('/', trim($path, '/'))));

// El primer segmento es el endpoint
$endpoint = $segments[0] ?? '';
$id = null;
$subEndpoint = null;

// Detectar si el segundo segmento es un ID numérico
if (isset($segments[1]) && is_numeric($segments[1])) {
    $id = $segments[1];
    // Si hay un tercer segmento, es un sub-endpoint (ej: /productos/35/atributos)
    if (isset($segments[2])) {
        $subEndpoint = $segments[2];
    }
} elseif (isset($segments[1])) {
    // Si el segundo segmento no es numérico, podría ser un sub-endpoint sin ID
    $subEndpoint = $segments[1];
}

// Si hay un sub-endpoint para productos, redirigir al archivo correcto
if ($endpoint === 'productos' && $subEndpoint === 'atributos') {
    $endpoint = 'atributos';
} elseif ($endpoint === 'productos' && $subEndpoint === 'variantes') {
    $endpoint = 'variantes';
} elseif ($endpoint === 'productos' && $subEndpoint === 'especificaciones') {
    $endpoint = 'especificaciones';
}

// Debug (comentar en producción)
error_log("Endpoint: $endpoint, ID: " . ($id ?? 'null') . ", Sub: " . ($subEndpoint ?? 'null') . ", Method: $method");

// Enrutar a los archivos de API correspondientes
switch ($endpoint) {
    case 'productos':
        require_once __DIR__ . '/../api/productos.php';
        break;
    case 'categorias':
        require_once __DIR__ . '/../api/categorias.php';
        break;
    case 'marcas':
        require_once __DIR__ . '/../api/marcas.php';
        break;
    case 'descuentos':
        require_once __DIR__ . '/../api/descuentos.php';
        break;
    case 'servicios':
        require_once __DIR__ . '/../api/servicios.php';
        break;
    case 'usuarios':
        require_once __DIR__ . '/../api/usuarios.php';
        break;
    case 'clientes':
        require_once __DIR__ . '/../api/clientes.php';
        break;
    case 'pedidos':
        require_once __DIR__ . '/../api/pedidos.php';
        break;
    case 'atributos':
        require_once __DIR__ . '/../api/atributos.php';
        break;
    case 'catalogos':
        require_once __DIR__ . '/../api/catalogos.php';
        break;
    case 'variaciones':
        require_once __DIR__ . '/../api/variaciones.php';
        break;
    case 'variantes':
        require_once __DIR__ . '/../api/variantes.php';
        break;
    case 'especificaciones':
        require_once __DIR__ . '/../api/especificaciones.php';
        break;
    case 'auth':
        require_once __DIR__ . '/../api/auth.php';
        break;
    case 'carrito':
        require_once __DIR__ . '/../api/carrito.php';
        break;
    case 'debug':
        require_once __DIR__ . '/../api/debug.php';
        break;
    case 'verify-auth':
        require_once __DIR__ . '/../api/verify-auth.php';
        break;
    case 'reportes':
        require_once __DIR__ . '/../api/reportes.php';
        break;
    case 'upload':
    case 'upload.php':
        require_once __DIR__ . '/upload.php';
        break;
    case '':
        // Raíz - mostrar info del API
        echo json_encode([
            'message' => 'API Tienda-Tec',
            'version' => '1.0',
            'endpoints' => [
                'productos', 'categorias', 'marcas', 'descuentos', 'variaciones',
                'servicios', 'usuarios', 'clientes', 'pedidos',
                'auth', 'reportes', 'upload', 'especificaciones'
            ]
        ]);
        break;
    default:
        http_response_code(404);
        echo json_encode([
            'error' => 'Endpoint no encontrado',
            'endpoint' => $endpoint,
            'path' => $path
        ]);
        break;
}
