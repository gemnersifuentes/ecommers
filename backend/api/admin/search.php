<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../config/auth_helper.php';

// Verificar que sea admin
verificarAdmin();

try {
    // El objeto $db ya está disponible globalmente gracias a conexion.php
    if (!isset($db) || !$db) {
        throw new Exception("No se pudo establecer conexión con la base de datos.");
    }
    
    $query = isset($_GET['q']) ? trim($_GET['q']) : '';

    if (strlen($query) < 2) {
        echo json_encode(['productos' => [], 'pedidos' => [], 'clientes' => [], 'mensajes' => []]);
        exit;
    }

    $results = [
        'productos' => [],
        'pedidos' => [],
        'clientes' => [],
        'mensajes' => []
    ];

    $term = "%$query%";

    // 1. Buscar Productos
    try {
        $stmt = $db->prepare("SELECT id, nombre as title, sku as subtitle, imagen as image, 'productos' as type FROM productos WHERE nombre LIKE ? OR sku LIKE ? OR modelo LIKE ? LIMIT 5");
        $stmt->execute([$term, $term, $term]);
        $results['productos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Search Error (Productos): " . $e->getMessage());
    }

    // 2. Buscar Pedidos
    try {
        $stmt = $db->prepare("
            SELECT p.id, p.numero_pedido as title, u.nombre as subtitle, 'pedidos' as type 
            FROM pedidos p 
            LEFT JOIN usuarios u ON p.usuario_id = u.id 
            WHERE p.numero_pedido LIKE ? OR u.nombre LIKE ? OR p.id LIKE ? 
            LIMIT 5
        ");
        $stmt->execute([$term, $term, $term]);
        $results['pedidos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Search Error (Pedidos): " . $e->getMessage());
    }

    // 3. Buscar Clientes
    try {
        $stmt = $db->prepare("SELECT id, nombre as title, correo as subtitle, 'clientes' as type FROM usuarios WHERE (nombre LIKE ? OR correo LIKE ?) AND rol = 'cliente' LIMIT 5");
        $stmt->execute([$term, $term]);
        $results['clientes'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Search Error (Clientes): " . $e->getMessage());
    }

    // 4. Buscar Mensajes
    try {
        $stmt = $db->prepare("SELECT id, asunto as title, nombre as subtitle, 'mensajes' as type FROM mensajes_contacto WHERE asunto LIKE ? OR nombre LIKE ? OR mensaje LIKE ? LIMIT 5");
        $stmt->execute([$term, $term, $term]);
        $results['mensajes'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Search Error (Mensajes): " . $e->getMessage());
    }

    error_log("Search Success for query: " . $query);
    echo json_encode($results);

} catch (Exception $e) {
    error_log("Global Search Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
