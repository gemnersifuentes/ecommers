<?php
function authenticate($required = true) {
    global $db;
    
    $headers = getallheaders();
    $token = null;
    
    // Buscar token en headers (Authorization: Bearer <token>)
    if (isset($headers['Authorization'])) {
        $token = str_replace('Bearer ', '', $headers['Authorization']);
    } elseif (isset($headers['authorization'])) {
        // A veces viene en minúsculas
        $token = str_replace('Bearer ', '', $headers['authorization']);
    }

    if (!$token) {
        if ($required) {
            http_response_code(401);
            echo json_encode(['error' => 'Token no proporcionado']);
            exit();
        }
        return null;
    }

    try {
        // Verificar token en base de datos
        // Asumimos que existe una tabla 'tokens' o 'usuarios' con token
        // Según carrito.php: SELECT usuario_id FROM tokens WHERE token = ? AND expira > NOW()
        
        $stmt = $db->prepare("SELECT usuario_id FROM tokens WHERE token = ? AND expira > NOW()");
        $stmt->execute([$token]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            // Obtener datos del usuario
            $stmtUser = $db->prepare("SELECT * FROM usuarios WHERE id = ?");
            $stmtUser->execute([$result['usuario_id']]);
            $user = $stmtUser->fetch(PDO::FETCH_ASSOC);
            return $user;
        }
    } catch (Exception $e) {
        // Error silencioso o log
    }

    if ($required) {
        http_response_code(401);
        echo json_encode(['error' => 'Token inválido o expirado']);
        exit();
    }
    
    return null;
}
