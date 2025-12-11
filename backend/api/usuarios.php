<?php
// API de usuarios

$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        if ($id) {
            try {
                $stmt = $db->prepare("SELECT id, nombre, correo, rol, fecha_registro FROM usuarios WHERE id = ?");
                $stmt->execute([$id]);
                $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($usuario) {
                    echo json_encode($usuario);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Usuario no encontrado']);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener usuario: ' . $e->getMessage()]);
            }
        } else {
            try {
                $stmt = $db->prepare("SELECT id, nombre, correo, rol, fecha_registro FROM usuarios WHERE activo = 1");
                $stmt->execute();
                $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($usuarios);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener usuarios: ' . $e->getMessage()]);
            }
        }
        break;

    case 'POST':
        if (!isset($input['nombre']) || !isset($input['correo']) || !isset($input['clave'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Todos los campos son requeridos']);
            exit;
        }

        try {
            $claveHash = password_hash($input['clave'], PASSWORD_BCRYPT);
            $rol = isset($input['rol']) ? $input['rol'] : 'cliente';

            $stmt = $db->prepare("INSERT INTO usuarios (nombre, correo, clave, rol) VALUES (?, ?, ?, ?)");
            
            if ($stmt->execute([$input['nombre'], $input['correo'], $claveHash, $rol])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Usuario creado exitosamente',
                    'id' => $db->lastInsertId()
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al crear usuario']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear usuario: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de usuario requerido']);
            exit;
        }

        try {
            if (isset($input['clave']) && !empty($input['clave'])) {
                $claveHash = password_hash($input['clave'], PASSWORD_BCRYPT);
                $stmt = $db->prepare("UPDATE usuarios SET nombre = ?, correo = ?, clave = ?, rol = ? WHERE id = ?");
                $params = [$input['nombre'], $input['correo'], $claveHash, $input['rol'], $id];
            } else {
                $stmt = $db->prepare("UPDATE usuarios SET nombre = ?, correo = ?, rol = ? WHERE id = ?");
                $params = [$input['nombre'], $input['correo'], $input['rol'], $id];
            }
            
            if ($stmt->execute($params)) {
                echo json_encode(['success' => true, 'message' => 'Usuario actualizado exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al actualizar usuario']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar usuario: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de usuario requerido']);
            exit;
        }

        try {
            $stmt = $db->prepare("UPDATE usuarios SET activo = 0 WHERE id = ?");
            
            if ($stmt->execute([$id])) {
                echo json_encode(['success' => true, 'message' => 'Usuario eliminado exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al eliminar usuario']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar usuario: ' . $e->getMessage()]);
        }
        break;
}
?>
