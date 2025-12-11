<?php
// API de marcas
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        if ($id) {
            try {
                $stmt = $db->prepare("SELECT * FROM marcas WHERE id = ?");
                $stmt->execute([$id]);
                $marca = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($marca) {
                    echo json_encode($marca);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Marca no encontrada']);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener marca: ' . $e->getMessage()]);
            }
        } else {
            try {
                $stmt = $db->prepare("SELECT * FROM marcas WHERE activo = 1 ORDER BY nombre");
                $stmt->execute();
                $marcas = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($marcas);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener marcas: ' . $e->getMessage()]);
            }
        }
        break;

    case 'POST':
        if (!isset($input['nombre'])) {
            http_response_code(400);
            echo json_encode(['message' => 'El nombre es requerido']);
            exit;
        }

        try {
            $stmt = $db->prepare("INSERT INTO marcas (nombre, descripcion) VALUES (?, ?)");
            
            if ($stmt->execute([$input['nombre'], $input['descripcion'] ?? null])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Marca creada exitosamente',
                    'id' => $db->lastInsertId()
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al crear marca']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear marca: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de marca requerido']);
            exit;
        }

        try {
            $stmt = $db->prepare("UPDATE marcas SET nombre = ?, descripcion = ? WHERE id = ?");
            
            if ($stmt->execute([$input['nombre'], $input['descripcion'] ?? null, $id])) {
                echo json_encode(['success' => true, 'message' => 'Marca actualizada exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al actualizar marca']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar marca: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de marca requerido']);
            exit;
        }

        try {
            $stmt = $db->prepare("UPDATE marcas SET activo = 0 WHERE id = ?");
            
            if ($stmt->execute([$id])) {
                echo json_encode(['success' => true, 'message' => 'Marca eliminada exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al eliminar marca']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar marca: ' . $e->getMessage()]);
        }
        break;
}
?>