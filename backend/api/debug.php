<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../config/auth_helper.php';

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$database = new Database();
$pdo = $database->getConnection();

// Obtener el token
$token = getTokenFromRequest();

$debug = [
    'token_recibido' => $token ? substr($token, 0, 20) . '...' : 'NO',
    'método' => $_SERVER['REQUEST_METHOD']
];

if ($token) {
    // Buscar en BD
    $stmt = $pdo->prepare("SELECT id, usuario_id, token, expira, DATE_FORMAT(expira, '%Y-%m-%d %H:%i:%s') as expira_format FROM tokens WHERE token = ?");
    $stmt->execute([$token]);
    $tokenDb = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $debug['token_en_bd'] = $tokenDb ? 'SÍ ENCONTRADO' : 'NO ENCONTRADO';
    if ($tokenDb) {
        $debug['token_info'] = [
            'usuario_id' => $tokenDb['usuario_id'],
            'expira' => $tokenDb['expira_format'],
            'es_valido' => strtotime($tokenDb['expira']) > time() ? 'SÍ' : 'NO'
        ];
    }
    
    // Listar últimos tokens
    $stmt = $pdo->query("SELECT usuario_id, DATE_FORMAT(fecha_creacion, '%Y-%m-%d %H:%i:%s') as creado, DATE_FORMAT(expira, '%Y-%m-%d %H:%i:%s') as expira FROM tokens ORDER BY fecha_creacion DESC LIMIT 5");
    $tokens = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $debug['ultimos_tokens'] = $tokens;
}

echo json_encode($debug, JSON_PRETTY_PRINT);
?>
