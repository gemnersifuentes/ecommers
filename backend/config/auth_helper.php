<?php
// Función auxiliar para obtener el token del request
function getTokenFromRequest() {
    $logFile = __DIR__ . '/../auth_debug.log';
    $debug = [];
    
    // 1. Intentar getallheaders()
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        $debug['getallheaders'] = $headers;
        if (isset($headers['Authorization'])) {
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Token encontrado en getallheaders\n", FILE_APPEND);
            return str_replace('Bearer ', '', $headers['Authorization']);
        }
    }
    
    // 2. Intentar $_SERVER['HTTP_AUTHORIZATION']
    $debug['SERVER_HTTP_AUTH'] = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : 'Not Set';
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Token encontrado en HTTP_AUTHORIZATION\n", FILE_APPEND);
        return str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
    }
    
    // 3. Intentar $_SERVER['Authorization'] (A veces pasa así)
    $debug['SERVER_AUTH'] = isset($_SERVER['Authorization']) ? $_SERVER['Authorization'] : 'Not Set';
    if (isset($_SERVER['Authorization'])) {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Token encontrado en Authorization\n", FILE_APPEND);
        return str_replace('Bearer ', '', $_SERVER['Authorization']);
    }

    // 4. Búsqueda exhaustiva en $_SERVER
    foreach ($_SERVER as $key => $value) {
        if (strpos(strtolower($key), 'authorization') !== false) {
            $debug['SERVER_SEARCH_' . $key] = $value;
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Token encontrado en búsqueda: $key\n", FILE_APPEND);
            return str_replace('Bearer ', '', $value);
        }
    }
    
    // Guardar debug si falla
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - FALLO: No se encontró token. Headers: " . print_r($debug, true) . "\n", FILE_APPEND);
    
    return null;
}

// Función para validar token y obtener usuario_id
function getUserIdFromToken($pdo, $token) {
    $logFile = __DIR__ . '/../auth_debug.log';
    
    if (!$token) {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - getUserIdFromToken: No hay token\n", FILE_APPEND);
        return null;
    }
    
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - getUserIdFromToken: Buscando token en DB: " . substr($token, 0, 20) . "...\n", FILE_APPEND);
    
    try {
        $stmt = $pdo->prepare("SELECT usuario_id, expira FROM tokens WHERE token = ? AND expira > NOW()");
        $stmt->execute([$token]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - getUserIdFromToken: Token no encontrado o expirado en DB\n", FILE_APPEND);
            
            // Debug: verificar si existe sin filtro de fecha
            $stmt2 = $pdo->prepare("SELECT usuario_id, expira FROM tokens WHERE token = ?");
            $stmt2->execute([$token]);
            $result2 = $stmt2->fetch(PDO::FETCH_ASSOC);
            
            if ($result2) {
                file_put_contents($logFile, date('Y-m-d H:i:s') . " - getUserIdFromToken: Token existe pero está EXPIRADO (expira: " . $result2['expira'] . ")\n", FILE_APPEND);
            } else {
                file_put_contents($logFile, date('Y-m-d H:i:s') . " - getUserIdFromToken: Token NO EXISTE en la base de datos\n", FILE_APPEND);
            }
            
            return null;
        }
        
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - getUserIdFromToken: Token válido para usuario: " . $result['usuario_id'] . "\n", FILE_APPEND);
        return $result['usuario_id'];
    } catch (Exception $e) {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - getUserIdFromToken ERROR: " . $e->getMessage() . "\n", FILE_APPEND);
        return null;
    }
}

function verificarAutenticacion() {
    global $database;
    $pdo = $database->getConnection();
    $token = getTokenFromRequest();
    $usuario_id = getUserIdFromToken($pdo, $token);
    
    if (!$usuario_id) {
        http_response_code(401);
        echo json_encode(['error' => 'No autorizado']);
        exit();
    }
    
    return $usuario_id;
}

function verificarAdmin() {
    global $database;
    $pdo = $database->getConnection();
    $token = getTokenFromRequest();
    $usuario_id = getUserIdFromToken($pdo, $token);
    
    if (!$usuario_id) {
        http_response_code(401);
        echo json_encode(['error' => 'No autorizado']);
        exit();
    }
    
    try {
        $stmt = $pdo->prepare("SELECT rol FROM usuarios WHERE id = ?");
        $stmt->execute([$usuario_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || $user['rol'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Acceso denegado: Se requieren permisos de administrador']);
            exit();
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error verificando permisos']);
        exit();
    }
}
?>
