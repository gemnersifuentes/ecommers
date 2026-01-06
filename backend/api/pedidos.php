<?php
// API de pedidos

$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        if ($id) {
            // Obtener pedido con detalles
            $stmt = $db->prepare("
                SELECT p.*, u.nombre as cliente_nombre, u.correo, u.telefono, u.direccion 
                FROM pedidos p 
                LEFT JOIN usuarios u ON p.usuario_id = u.id 
                WHERE p.id = ?
            ");
            $stmt->execute([$id]);
            $pedido = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($pedido) {
                // Obtener detalles del pedido (Corregido para consistencia con frontend)
                $stmtDetalle = $db->prepare("
                    SELECT 
                        dp.*, 
                        p.nombre as nombre, 
                        p.imagen as imagen,
                        v.atributo as variacion_nombre,
                        (dp.subtotal / dp.cantidad) as precio_unitario
                    FROM detalle_pedido dp 
                    LEFT JOIN productos p ON dp.producto_id = p.id 
                    LEFT JOIN variaciones v ON dp.variacion_id = v.id 
                    WHERE dp.pedido_id = ?
                ");
                $stmtDetalle->execute([$id]);
                $pedido['items'] = $stmtDetalle->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode($pedido);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Pedido no encontrado']);
            }
        } else {
            // Obtener todos los pedidos
            $estado = isset($_GET['estado']) ? $_GET['estado'] : null;
            
            $sql = "SELECT p.*, u.nombre as cliente_nombre, u.correo
                    FROM pedidos p 
                    LEFT JOIN usuarios u ON p.usuario_id = u.id";
            
            $params = [];
            
            if ($estado) {
                $sql .= " WHERE p.estado = ?";
                $params[] = $estado;
            }
            
            $sql .= " ORDER BY p.id DESC";
            
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($pedidos);
        }
        break;

    case 'POST':
        if (!isset($input['cliente']) || !isset($input['items']) || empty($input['items'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Datos de cliente y productos son requeridos']);
            exit;
        }

        try {
            $db->beginTransaction();
            
            // Crear o buscar cliente (ahora en tabla usuarios)
            $cliente = $input['cliente'];
            $stmtCliente = $db->prepare("SELECT id FROM usuarios WHERE correo = ?");
            $stmtCliente->execute([$cliente['correo']]);
            $usuarioExistente = $stmtCliente->fetch(PDO::FETCH_ASSOC);
            
            if ($usuarioExistente) {
                $cliente_id = $usuarioExistente['id'];
                // Opcional: Actualizar datos del usuario si vienen nuevos
            } else {
                // Crear nuevo usuario con rol cliente
                // Generar clave aleatoria si no se provee (flujo de pedido invitado)
                $clave = bin2hex(random_bytes(8));
                $claveHash = password_hash($clave, PASSWORD_BCRYPT);
                
                $stmtInsertCliente = $db->prepare("
                    INSERT INTO usuarios (nombre, correo, clave, rol, telefono, direccion) 
                    VALUES (?, ?, ?, 'cliente', ?, ?)
                ");
                $stmtInsertCliente->execute([
                    $cliente['nombre'],
                    $cliente['correo'],
                    $claveHash,
                    $cliente['telefono'] ?? null,
                    $cliente['direccion'] ?? null
                ]);
                $cliente_id = $db->lastInsertId();
            }
            
            // Calcular total
            $total = 0;
            foreach ($input['items'] as $item) {
                $total += $item['subtotal'];
            }
            
            // Crear pedido
            $stmtPedido = $db->prepare("
                INSERT INTO pedidos (usuario_id, total, estado, fecha, metodo_envio, datos_envio, dni) 
                VALUES (?, ?, 'pendiente', NOW(), ?, ?, ?)
            ");
            
            // Datos de envío como JSON
            $datosEnvio = isset($input['shipping']) ? json_encode($input['shipping']) : null;
            $metodoEnvio = isset($input['metodo_envio']) ? $input['metodo_envio'] : 'domicilio';
            // Extract DNI strictly from shipping info (as user requested explicit DNI storage)
            $dni = isset($input['shipping']['dni']) ? $input['shipping']['dni'] : null;
            
            $stmtPedido->execute([$cliente_id, $total, $metodoEnvio, $datosEnvio, $dni]);
            $pedido_id = $db->lastInsertId();

            // Asegurar número de pedido secuencial (ORD-XXXXXX) corrección solicitada
            $numero_pedido = 'ORD-' . str_pad($pedido_id, 6, '0', STR_PAD_LEFT);
            $stmtUpdateNum = $db->prepare("UPDATE pedidos SET numero_pedido = ? WHERE id = ?");
            $stmtUpdateNum->execute([$numero_pedido, $pedido_id]);
            
            // Crear detalles del pedido
            $stmtDetalle = $db->prepare("
                INSERT INTO detalle_pedido (pedido_id, producto_id, variacion_id, cantidad, subtotal) 
                VALUES (?, ?, ?, ?, ?)
            ");
            
            foreach ($input['items'] as $item) {
                $stmtDetalle->execute([
                    $pedido_id,
                    $item['producto_id'],
                    $item['variacion_id'] ?? null,
                    $item['cantidad'],
                    $item['subtotal']
                ]);
                
                // Actualizar stock
                if (isset($item['variacion_id'])) {
                    $stmtStock = $db->prepare("UPDATE variaciones SET stock = stock - ? WHERE id = ?");
                    $stmtStock->execute([$item['cantidad'], $item['variacion_id']]);
                } else {
                    $stmtStock = $db->prepare("UPDATE productos SET stock = stock - ? WHERE id = ?");
                    $stmtStock->execute([$item['cantidad'], $item['producto_id']]);
                }
            }

            // Guardar nueva dirección si se solicita
            if (isset($input['guardar_direccion']) && $input['guardar_direccion'] === true && $metodoEnvio === 'domicilio' && isset($input['shipping'])) {
                $shipping = $input['shipping'];
                $stmtDir = $db->prepare("
                    INSERT INTO direcciones (usuario_id, nombre_contacto, telefono, direccion, departamento, provincia, distrito, cod_postal, referencia, es_principal) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                ");
                $stmtDir->execute([
                    $cliente_id,
                    $shipping['nombre'],
                    $shipping['telefono'],
                    $shipping['direccion'],
                    $shipping['departamento'],
                    $shipping['provincia'],
                    $shipping['distrito'],
                    $shipping['cp'],
                    $shipping['referencia'] ?? ''
                ]);
            }
            
            $db->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Pedido creado exitosamente',
                'pedido_id' => $pedido_id
            ]);
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(['message' => 'Error al crear pedido: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        require_once __DIR__ . '/../helpers/MailHelper.php';

        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de pedido requerido']);
            exit;
        }

        if (isset($input['estado'])) {
            // Obtener información del pedido y cliente
            $stmtInfo = $db->prepare("
                SELECT p.numero_pedido, p.total, p.datos_envio, u.correo, u.nombre 
                FROM pedidos p 
                LEFT JOIN usuarios u ON p.usuario_id = u.id 
                WHERE p.id = ?
            ");
            $stmtInfo->execute([$id]);
            $info = $stmtInfo->fetch(PDO::FETCH_ASSOC);

            $stmt = $db->prepare("UPDATE pedidos SET estado = ? WHERE id = ?");
            
            if ($stmt->execute([$input['estado'], $id])) {
                // Enviar correo si tenemos la información del cliente
                if ($info) {
                    error_log("Info encontrada para correo: " . json_encode($info));
                    if (!empty($info['correo'])) {
                        // Obtener items del pedido para el correo
                        $stmtItems = $db->prepare("
                            SELECT 
                                dp.cantidad,
                                dp.subtotal,
                                dp.precio_regular,
                                p.nombre,
                                (dp.subtotal / dp.cantidad) as precio,
                                v.atributo as variacion_nombre
                            FROM detalle_pedido dp
                            JOIN productos p ON dp.producto_id = p.id
                            LEFT JOIN variaciones v ON dp.variacion_id = v.id
                            WHERE dp.pedido_id = ?
                        ");
                        $stmtItems->execute([$id]);
                        $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

                        $shipping = !empty($info['datos_envio']) ? json_decode($info['datos_envio'], true) : null;

                        error_log("Iniciando envío de correo para pedido ID: $id (Estado: " . $input['estado'] . ")");
                        $mailResult = MailHelper::sendStatusUpdateEmail(
                            $info['correo'], 
                            $info['nombre'] ?? 'Cliente', 
                            $info['numero_pedido'], 
                            $input['estado'],
                            $info['total'] ?? 0,
                            $items,
                            $shipping
                        );
                        $email_sent = $mailResult['success'];
                        $email_error = !$email_sent ? $mailResult['message'] : null;
                        error_log("Resultado de MailHelper: " . ($email_sent ? 'EXITO' : 'FALLO - ' . $email_error));
                    } else {
                        $email_sent = false;
                        $email_error = "El cliente no tiene un correo asociado.";
                        error_log("No se pudo enviar correo: El pedido ID: $id no tiene un correo asociado");
                    }
                } else {
                    $email_sent = false;
                    $email_error = "No se encontró información del pedido.";
                    error_log("No se pudo enviar correo: No se encontró el pedido con ID: $id");
                }
                echo json_encode([
                    'success' => true, 
                    'message' => 'Estado del pedido actualizado',
                    'email_sent' => $email_sent,
                    'email_error' => $email_error
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al actualizar pedido']);
            }
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de pedido requerido']);
            exit;
        }

        $stmt = $db->prepare("UPDATE pedidos SET estado = 'cancelado' WHERE id = ?");
        
        if ($stmt->execute([$id])) {
            echo json_encode(['success' => true, 'message' => 'Pedido cancelado exitosamente']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Error al cancelar pedido']);
        }
        break;
}
?>
