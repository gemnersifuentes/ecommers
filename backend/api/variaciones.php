<?php
// API de variaciones

$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        if ($id) {
            try {
                $stmt = $db->prepare("SELECT * FROM variaciones WHERE id = ?");
                $stmt->execute([$id]);
                $variacion = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($variacion) {
                    echo json_encode($variacion);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Variación no encontrada']);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener variación: ' . $e->getMessage()]);
            }
        } else {
            try {
                $producto_id = isset($_GET['producto_id']) ? $_GET['producto_id'] : null;
                
                if ($producto_id) {
                    $stmt = $db->prepare("SELECT * FROM variaciones WHERE producto_id = ? AND activo = 1");
                    $stmt->execute([$producto_id]);
                } else {
                    $stmt = $db->prepare("SELECT v.*, p.nombre as producto_nombre FROM variaciones v 
                                         LEFT JOIN productos p ON v.producto_id = p.id 
                                         WHERE v.activo = 1");
                    $stmt->execute();
                }
                
                $variaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($variaciones);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener variaciones: ' . $e->getMessage()]);
            }
        }
        break;

    case 'POST':
        if (!isset($input['producto_id']) || !isset($input['atributo']) || !isset($input['precio'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Faltan campos requeridos']);
            exit;
        }

        try {
            $stmt = $db->prepare("INSERT INTO variaciones (producto_id, atributo, precio, stock) VALUES (?, ?, ?, ?)");
            
            if ($stmt->execute([
                $input['producto_id'],
                $input['atributo'],
                $input['precio'],
                $input['stock'] ?? 0
            ])) {
                // Get the product_id for the response
                try {
                    $variacion_id = $db->lastInsertId();
                    $stmtProducto = $db->prepare("SELECT producto_id FROM variaciones WHERE id = ?");
                    $stmtProducto->execute([$variacion_id]);
                    $variacion = $stmtProducto->fetch(PDO::FETCH_ASSOC);
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Variación creada exitosamente',
                        'id' => $variacion_id,
                        'producto_id' => $variacion['producto_id']
                    ]);
                } catch (Exception $e) {
                    // If we can't get the product_id, still return success but without it
                    echo json_encode([
                        'success' => true,
                        'message' => 'Variación creada exitosamente',
                        'id' => $variacion_id
                    ]);
                }
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al crear variación']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear variación: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de variación requerido']);
            exit;
        }

        try {
            $stmt = $db->prepare("UPDATE variaciones SET atributo = ?, precio = ?, stock = ? WHERE id = ?");
            
            if ($stmt->execute([$input['atributo'], $input['precio'], $input['stock'] ?? 0, $id])) {
                // Get the product_id for the response
                $stmtProducto = $db->prepare("SELECT producto_id FROM variaciones WHERE id = ?");
                $stmtProducto->execute([$id]);
                $variacion = $stmtProducto->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Variación actualizada exitosamente',
                    'producto_id' => $variacion['producto_id']
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al actualizar variación']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar variación: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de variación requerido']);
            exit;
        }

        try {
            $stmt = $db->prepare("UPDATE variaciones SET activo = 0 WHERE id = ?");
            
            if ($stmt->execute([$id])) {
                // Get the product_id for the response
                $stmtProducto = $db->prepare("SELECT producto_id FROM variaciones WHERE id = ?");
                $stmtProducto->execute([$id]);
                $variacion = $stmtProducto->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Variación eliminada exitosamente',
                    'producto_id' => $variacion['producto_id']
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al eliminar variación']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar variación: ' . $e->getMessage()]);
        }
        break;
}
?>
