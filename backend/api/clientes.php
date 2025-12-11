<?php
// API de clientes (ahora gestiona usuarios con rol 'cliente')

$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        if ($id) {
            try {
                $stmt = $db->prepare("SELECT id, nombre, correo, telefono, direccion, fecha_registro, activo FROM usuarios WHERE id = ? AND rol = 'cliente'");
                $stmt->execute([$id]);
                $cliente = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($cliente) {
                    echo json_encode($cliente);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Cliente no encontrado']);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener cliente: ' . $e->getMessage()]);
            }
        } else {
            try {
                $stmt = $db->prepare("SELECT id, nombre, correo, telefono, direccion, fecha_registro, activo FROM usuarios WHERE rol = 'cliente' ORDER BY fecha_registro DESC");
                $stmt->execute();
                $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($clientes);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener clientes: ' . $e->getMessage()]);
            }
        }
        break;

    case 'POST':
        if (!isset($input['nombre']) || !isset($input['correo'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Nombre y correo son requeridos']);
            exit;
        }

        try {
            // Verificar si el correo ya existe
            $stmtCheck = $db->prepare("SELECT id FROM usuarios WHERE correo = ?");
            $stmtCheck->execute([$input['correo']]);
            if ($stmtCheck->fetch()) {
                http_response_code(400);
                echo json_encode(['message' => 'El correo ya está registrado']);
                exit;
            }

            // Crear usuario con rol cliente y clave por defecto (o generada)
            // En un flujo real de admin creando cliente, quizás no se setea clave, o se manda email.
            // Aquí pondremos una clave dummy si no viene.
            $clave = isset($input['clave']) ? $input['clave'] : 'cliente123';
            $claveHash = password_hash($clave, PASSWORD_BCRYPT);

            $stmt = $db->prepare("INSERT INTO usuarios (nombre, correo, clave, rol, telefono, direccion) VALUES (?, ?, ?, 'cliente', ?, ?)");
            
            if ($stmt->execute([
                $input['nombre'],
                $input['correo'],
                $claveHash,
                $input['telefono'] ?? null,
                $input['direccion'] ?? null
            ])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Cliente creado exitosamente',
                    'id' => $db->lastInsertId()
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al crear cliente']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear cliente: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de cliente requerido']);
            exit;
        }

        try {
            $stmt = $db->prepare("UPDATE usuarios SET nombre = ?, correo = ?, telefono = ?, direccion = ? WHERE id = ? AND rol = 'cliente'");
            
            if ($stmt->execute([
                $input['nombre'],
                $input['correo'],
                $input['telefono'] ?? null,
                $input['direccion'] ?? null,
                $id
            ])) {
                echo json_encode(['success' => true, 'message' => 'Cliente actualizado exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al actualizar cliente']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar cliente: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de cliente requerido']);
            exit;
        }

        try {
            // Soft delete o hard delete? El usuario pidió eliminar tabla clientes, así que aquí borramos usuario.
            // Ojo con pedidos asociados. Si hay FK cascade, se borran. Si no, error.
            // La migración puso ON DELETE CASCADE.
            
            $stmt = $db->prepare("DELETE FROM usuarios WHERE id = ? AND rol = 'cliente'");
            
            if ($stmt->execute([$id])) {
                echo json_encode(['success' => true, 'message' => 'Cliente eliminado exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al eliminar cliente']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar cliente: ' . $e->getMessage()]);
        }
        break;
}
?>
