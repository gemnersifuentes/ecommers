<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../config/auth_helper.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$pdo = $database->getConnection();
$token = getTokenFromRequest();
$usuario_id = getUserIdFromToken($pdo, $token);

echo json_encode([
    'autenticado' => !!$usuario_id,
    'usuario_id' => $usuario_id,
    'token_presente' => !!$token
]);
?>
