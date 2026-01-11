<?php
// API para gestionar reservaciones de servicios
require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../config/auth_helper.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

// Manejar JSON
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        // Si el cliente quiere rastrear su ticket
        if (isset($_GET['action']) && $_GET['action'] === 'track' && $id) {
            try {
                $stmt = $db->prepare("SELECT r.id, r.estado, r.costo_sugerido, r.costo_final, r.fecha_registro, r.fecha_actualizacion, s.nombre as servicio_nombre 
                                    FROM reservaciones_servicios r 
                                    JOIN servicios s ON r.servicio_id = s.id 
                                    WHERE r.id = ?");
                $stmt->execute([$id]);
                $reservacion = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($reservacion) {
                    echo json_encode(['success' => true, 'data' => $reservacion]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Ticket no encontrado']);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
            exit;
        }

        // Solo administradores pueden ver todas las reservaciones o detalles completos
        verificarAdmin();
        
        try {
            if ($id) {
                $stmt = $db->prepare("SELECT r.*, s.nombre as servicio_nombre FROM reservaciones_servicios r JOIN servicios s ON r.servicio_id = s.id WHERE r.id = ?");
                $stmt->execute([$id]);
                $reservacion = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($reservacion) {
                    echo json_encode($reservacion);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Reservación no encontrada']);
                }
            } else {
                $usuario_id = isset($_GET['usuario_id']) ? $_GET['usuario_id'] : null;
                if ($usuario_id) {
                    $stmt = $db->prepare("SELECT r.*, s.nombre as servicio_nombre FROM reservaciones_servicios r JOIN servicios s ON r.servicio_id = s.id WHERE r.usuario_id = ? ORDER BY r.fecha_registro DESC");
                    $stmt->execute([$usuario_id]);
                } else {
                    $stmt = $db->prepare("SELECT r.*, s.nombre as servicio_nombre FROM reservaciones_servicios r JOIN servicios s ON r.servicio_id = s.id ORDER BY r.fecha_registro DESC");
                    $stmt->execute();
                }
                $reservaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($reservaciones);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener reservaciones: ' . $e->getMessage()]);
        }
        break;

    case 'POST':
        // Cualquiera puede crear una reservación (aunque puede estar logueado)
        $token = getTokenFromRequest();
        $usuario_id = null;
        if ($token) {
            $usuario_id = getUserIdFromToken($db, $token);
        }

        if (!isset($input['servicio_id']) || !isset($input['nombre_cliente']) || !isset($input['whatsapp_cliente'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Datos incompletos']);
            exit;
        }

        try {
            // Obtener costo sugerido del servicio
            $stmtSvc = $db->prepare("SELECT precio FROM servicios WHERE id = ?");
            $stmtSvc->execute([$input['servicio_id']]);
            $servicio = $stmtSvc->fetch(PDO::FETCH_ASSOC);

            if (!$servicio) {
                http_response_code(404);
                echo json_encode(['message' => 'Servicio no encontrado']);
                exit;
            }

            $stmt = $db->prepare("INSERT INTO reservaciones_servicios (servicio_id, usuario_id, nombre_cliente, whatsapp_cliente, detalle_tecnico, costo_sugerido, estado) VALUES (?, ?, ?, ?, ?, ?, 'Pendiente')");
            
            if ($stmt->execute([
                $input['servicio_id'],
                $usuario_id,
                $input['nombre_cliente'],
                $input['whatsapp_cliente'],
                $input['detalle_tecnico'] ?? null,
                $servicio['precio']
            ])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Reservación creada exitosamente',
                    'id' => $db->lastInsertId()
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al crear reservación']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Solo administradores pueden actualizar estados
        verificarAdmin();

        if (!$id || !isset($input['estado'])) {
            http_response_code(400);
            echo json_encode(['message' => 'ID y estado son requeridos']);
            exit;
        }

        try {
            $sql = "UPDATE reservaciones_servicios SET estado = ?";
            $params = [$input['estado']];

            if (isset($input['costo_final'])) {
                $sql .= ", costo_final = ?";
                $params[] = $input['costo_final'];
            }
            if (isset($input['costo_insumos'])) {
                $sql .= ", costo_insumos = ?";
                $params[] = $input['costo_insumos'];
            }

            $sql .= " WHERE id = ?";
            $params[] = $id;

            $stmt = $db->prepare($sql);
            $success = $stmt->execute($params);

            if ($success) {
                echo json_encode(['success' => true, 'message' => 'Actualización exitosa']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al actualizar']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        verificarAdmin();
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID requerido']);
            exit;
        }

        try {
            $stmt = $db->prepare("DELETE FROM reservaciones_servicios WHERE id = ?");
            if ($stmt->execute([$id])) {
                echo json_encode(['success' => true, 'message' => 'Reservación eliminada']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al eliminar reservación']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
        }
        break;
}
?>
