<?php
/**
 * API para gestionar atributos de productos (colores, tamaños, etc.)
 */

$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        if ($id) {
            // GET /productos/{id}/atributos - Obtener todos los atributos de un producto
            try {
                $stmt = $db->prepare("
                    SELECT * FROM producto_atributos 
                    WHERE producto_id = ?
                    ORDER BY tipo, valor
                ");
                $stmt->execute([$id]);
                $atributos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode($atributos);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener atributos: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'ID de producto requerido']);
        }
        break;

    case 'POST':
        // POST /productos/{id}/atributos - Crear un nuevo atributo
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de producto requerido']);
            exit;
        }
        
        if (!isset($input['tipo']) || !isset($input['valor'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Tipo y valor son requeridos']);
            exit;
        }
        
        try {
            $stmt = $db->prepare("
                INSERT INTO producto_atributos (producto_id, tipo, valor, stock)
                VALUES (?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $id,
                $input['tipo'],
                $input['valor'],
                $input['stock'] ?? 0
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Atributo creado exitosamente',
                'id' => $db->lastInsertId()
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear atributo: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        // PUT /atributos/{id} - Actualizar un atributo existente
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de atributo requerido']);
            exit;
        }
        
        try {
            $fields = [];
            $params = [];
            
            if (isset($input['valor'])) {
                $fields[] = "valor = ?";
                $params[] = $input['valor'];
            }
            
            if (isset($input['stock'])) {
                $fields[] = "stock = ?";
                $params[] = $input['stock'];
            }
            
            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No hay campos para actualizar']);
                exit;
            }
            
            $params[] = $id;
            $sql = "UPDATE producto_atributos SET " . implode(', ', $fields) . " WHERE id = ?";
            
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode(['success' => true, 'message' => 'Atributo actualizado exitosamente']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar atributo: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // DELETE /atributos/{id} - Eliminar un atributo
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de atributo requerido']);
            exit;
        }
        
        try {
            $stmt = $db->prepare("DELETE FROM producto_atributos WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true, 'message' => 'Atributo eliminado exitosamente']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar atributo: ' . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}
?>
