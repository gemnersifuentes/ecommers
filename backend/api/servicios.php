<?php
// API de servicios

$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        if ($id) {
            try {
                $stmt = $db->prepare("SELECT * FROM servicios WHERE id = ?");
                $stmt->execute([$id]);
                $servicio = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($servicio) {
                    echo json_encode($servicio);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Servicio no encontrado']);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener servicio: ' . $e->getMessage()]);
            }
        } else {
            try {
                $stmt = $db->prepare("SELECT * FROM servicios WHERE activo = 1 ORDER BY nombre");
                $stmt->execute();
                $servicios = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($servicios);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener servicios: ' . $e->getMessage()]);
            }
        }
        break;

    case 'POST':
        if (!isset($input['nombre']) || !isset($input['precio'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Nombre y precio son requeridos']);
            exit;
        }

        try {
            $stmt = $db->prepare("INSERT INTO servicios (nombre, descripcion, precio) VALUES (?, ?, ?)");
            
            if ($stmt->execute([$input['nombre'], $input['descripcion'] ?? null, $input['precio']])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Servicio creado exitosamente',
                    'id' => $db->lastInsertId()
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al crear servicio']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear servicio: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de servicio requerido']);
            exit;
        }

        try {
            $stmt = $db->prepare("UPDATE servicios SET nombre = ?, descripcion = ?, precio = ? WHERE id = ?");
            
            if ($stmt->execute([$input['nombre'], $input['descripcion'] ?? null, $input['precio'], $id])) {
                echo json_encode(['success' => true, 'message' => 'Servicio actualizado exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al actualizar servicio']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar servicio: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de servicio requerido']);
            exit;
        }

        try {
            $stmt = $db->prepare("UPDATE servicios SET activo = 0 WHERE id = ?");
            
            if ($stmt->execute([$id])) {
                echo json_encode(['success' => true, 'message' => 'Servicio eliminado exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al eliminar servicio']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar servicio: ' . $e->getMessage()]);
        }
        break;
}
?>
