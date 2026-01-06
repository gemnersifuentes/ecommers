<?php
// API de descuentos
require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../helpers/MailHelper.php';

// Obtener el método y el ID si existe
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$uri_parts = explode('/', $uri);
$id = null;
if (isset($uri_parts[count($uri_parts) - 1]) && is_numeric($uri_parts[count($uri_parts) - 1])) {
    $id = intval($uri_parts[count($uri_parts) - 1]);
}

$input = json_decode(file_get_contents('php://input'), true);

function notificarBajaDePrecioCarrito($db, $descuentoId) {
    try {
        // 1. Obtener detalles del descuento
        $stmtDes = $db->prepare("SELECT * FROM descuentos WHERE id = ?");
        $stmtDes->execute([$descuentoId]);
        $descuento = $stmtDes->fetch(PDO::FETCH_ASSOC);
        
        if (!$descuento || $descuento['activo'] == 0) return;

        // 2. Obtener productos afectados por este descuento
        $sqlProd = "
            SELECT p.id, p.nombre, p.precio_base, p.imagen,
                   ? as descuento_valor, ? as descuento_tipo,
                   CASE 
                       WHEN ? = 'porcentaje' THEN p.precio_base * (1 - ? / 100)
                       ELSE p.precio_base - ?
                   END as precio_final
            FROM productos p
            WHERE 1=1
        ";
        $paramsProd = [$descuento['valor'], $descuento['tipo'], $descuento['tipo'], $descuento['valor'], $descuento['valor']];

        if ($descuento['aplica_a'] == 'producto') {
            $sqlProd .= " AND p.id = ?";
            $paramsProd[] = $descuento['producto_id'];
        } elseif ($descuento['aplica_a'] == 'categoria') {
            $sqlProd .= " AND p.categoria_id = ?";
            $paramsProd[] = $descuento['categoria_id'];
        } elseif ($descuento['aplica_a'] == 'marca') {
            $sqlProd .= " AND p.marca_id = ?";
            $paramsProd[] = $descuento['marca_id'];
        }

        $stmtProd = $db->prepare($sqlProd);
        $stmtProd->execute($paramsProd);
        $productosAfectados = $stmtProd->fetchAll(PDO::FETCH_ASSOC);

        if (empty($productosAfectados)) return;

        // Crear un mapa de productos para fácil acceso
        $productosMap = [];
        foreach ($productosAfectados as $p) {
            $productosMap[$p['id']] = $p;
        }
        $idsAfectados = array_keys($productosMap);

        // 3. Buscar usuarios que tienen estos productos en su carrito
        $placeholders = implode(',', array_fill(0, count($idsAfectados), '?'));
        $sqlUsers = "
            SELECT DISTINCT u.id, u.nombre, u.correo
            FROM usuarios u
            INNER JOIN carrito c ON u.id = c.usuario_id
            WHERE c.producto_id IN ($placeholders)
            AND u.activo = 1 AND u.rol = 'cliente'
        ";
        $stmtUsers = $db->prepare($sqlUsers);
        $stmtUsers->execute($idsAfectados);
        $usuariosANotificar = $stmtUsers->fetchAll(PDO::FETCH_ASSOC);

        if (empty($usuariosANotificar)) return;

        // 4. Encolar correos para estos usuarios
        $stmtQueue = $db->prepare("
            INSERT INTO cola_correos (destinatario, nombre_destinatario, asunto, cuerpo, estado) 
            VALUES (?, ?, ?, ?, 'pendiente')
        ");

        foreach ($usuariosANotificar as $user) {
            // Obtener qué productos específicos del carrito de este usuario bajaron de precio
            $stmtUserCart = $db->prepare("SELECT producto_id FROM carrito WHERE usuario_id = ? AND producto_id IN ($placeholders)");
            $stmtUserCart->execute(array_merge([$user['id']], $idsAfectados));
            $userProdIds = $stmtUserCart->fetchAll(PDO::FETCH_COLUMN);

            $userProds = [];
            foreach ($userProdIds as $pid) {
                if (isset($productosMap[$pid])) {
                    $userProds[] = $productosMap[$pid];
                }
            }

            if (!empty($userProds)) {
                $asunto = "📉 ¡Baja de precio en tu carrito! - TiendaTEC";
                $cuerpo = MailHelper::getPriceDropCartHtml($user['nombre'], $userProds);
                $stmtQueue->execute([$user['correo'], $user['nombre'], $asunto, $cuerpo]);
            }
        }
    } catch (Exception $e) {
        error_log("Error en notificarBajaDePrecioCarrito: " . $e->getMessage());
    }
}

function notificarOferta($db, $descuentoId) {
    try {
        // Encolar notificaciones de carrito primero (más específicas)
        notificarBajaDePrecioCarrito($db, $descuentoId);

        // 1. Obtener detalles del descuento
        $stmtDes = $db->prepare("SELECT * FROM descuentos WHERE id = ?");
        $stmtDes->execute([$descuentoId]);
        $descuento = $stmtDes->fetch(PDO::FETCH_ASSOC);
        
        if (!$descuento || $descuento['activo'] == 0) {
            error_log("notificarOferta: Descuento no encontrado o inactivo (ID: $descuentoId)");
            return;
        }

        // 2. Obtener productos afectados
        $sqlProd = "
            SELECT p.id, p.nombre, p.precio_base, p.imagen,
                   ? as descuento_valor, ? as descuento_tipo,
                   CASE 
                       WHEN ? = 'porcentaje' THEN p.precio_base * (1 - ? / 100)
                       ELSE p.precio_base - ?
                   END as precio_final
            FROM productos p
            WHERE 1=1
        ";
        $paramsProd = [$descuento['valor'], $descuento['tipo'], $descuento['tipo'], $descuento['valor'], $descuento['valor']];

        if ($descuento['aplica_a'] == 'producto') {
            $sqlProd .= " AND p.id = ?";
            $paramsProd[] = $descuento['producto_id'];
        } elseif ($descuento['aplica_a'] == 'categoria') {
            $sqlProd .= " AND p.categoria_id = ?";
            $paramsProd[] = $descuento['categoria_id'];
        } elseif ($descuento['aplica_a'] == 'marca') {
            $sqlProd .= " AND p.marca_id = ?";
            $paramsProd[] = $descuento['marca_id'];
        }

        $sqlProd .= " LIMIT 4"; // Mostrar máximo 4 productos en el correo
        $stmtProd = $db->prepare($sqlProd);
        $stmtProd->execute($paramsProd);
        $productos = $stmtProd->fetchAll(PDO::FETCH_ASSOC);

        if (empty($productos)) {
            error_log("notificarOferta: No se encontraron productos para el descuento (ID: $descuentoId)");
            return;
        }

        // 3. Obtener clientes a notificar
        $stmtUser = $db->prepare("SELECT nombre, correo FROM usuarios WHERE rol = 'cliente' AND activo = 1");
        $stmtUser->execute();
        $usuarios = $stmtUser->fetchAll(PDO::FETCH_ASSOC);

        error_log("notificarOferta: Iniciando envío para " . count($usuarios) . " usuarios. Descuento: " . $descuento['nombre']);

        // 4. Enqueue emails
        $enqueued = 0;
        $stmtQueue = $db->prepare("
            INSERT INTO cola_correos (destinatario, nombre_destinatario, asunto, cuerpo, estado) 
            VALUES (?, ?, ?, ?, 'pendiente')
        ");

        foreach ($usuarios as $user) {
            $asunto = "🔥 ¡Nuevas Ofertas Disponibles! - " . $descuento['nombre'];
            $cuerpo = MailHelper::getPromotionHtml($user['nombre'], $descuento['nombre'], $productos);
            
            if ($stmtQueue->execute([$user['correo'], $user['nombre'], $asunto, $cuerpo])) {
                $enqueued++;
            }
        }
        error_log("notificarOferta: Proceso de encolado finalizado. Encolados: $enqueued/" . count($usuarios));
    } catch (Exception $e) {
        error_log("Error crítico en notificarOferta: " . $e->getMessage());
    }
}

switch ($method) {
    case 'GET':
        if ($id) {
            // Obtener un descuento específico
            try {
                $stmt = $db->prepare("
                    SELECT d.*,
                        CASE 
                            WHEN d.aplica_a = 'producto' THEN p.nombre
                            WHEN d.aplica_a = 'categoria' THEN c.nombre
                            WHEN d.aplica_a = 'marca' THEN m.nombre
                        END AS afecta_nombre,
                        DATEDIFF(d.fecha_fin, CURDATE()) AS dias_restantes
                    FROM descuentos d
                    LEFT JOIN productos p ON d.producto_id = p.id
                    LEFT JOIN categorias c ON d.categoria_id = c.id
                    LEFT JOIN marcas m ON d.marca_id = m.id
                    WHERE d.id = ?
                ");
                $stmt->execute([$id]);
                $descuento = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($descuento) {
                    echo json_encode($descuento);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Descuento no encontrado']);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener descuento: ' . $e->getMessage()]);
            }
        } else {
            // Obtener todos los descuentos o solo activos
            $soloActivos = isset($_GET['activos']) ? $_GET['activos'] : null;
            
            try {
                $sql = "
                    SELECT DISTINCT d.*,
                        CASE 
                            WHEN d.aplica_a = 'producto' THEN p.nombre
                            WHEN d.aplica_a = 'categoria' THEN c.nombre
                            WHEN d.aplica_a = 'marca' THEN m.nombre
                        END AS afecta_nombre,
                        DATEDIFF(d.fecha_fin, CURDATE()) AS dias_restantes
                    FROM descuentos d
                    LEFT JOIN productos p ON d.producto_id = p.id
                    LEFT JOIN categorias c ON d.categoria_id = c.id
                    LEFT JOIN marcas m ON d.marca_id = m.id
                    WHERE 1=1
                ";
                
                $params = [];
                
                // Filtrar solo descuentos activos vigentes
                if ($soloActivos === '1' || $soloActivos === 'true') {
                    $sql .= " AND d.activo = 1 AND NOW() BETWEEN d.fecha_inicio AND d.fecha_fin";
                }
                
                $sql .= " ORDER BY d.activo DESC, d.fecha_fin DESC";
                
                $stmt = $db->prepare($sql);
                $stmt->execute($params);
                $descuentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode($descuentos);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener descuentos: ' . $e->getMessage()]);
            }
        }
        break;

    case 'POST':
        // Validar campos requeridos
        if (!isset($input['nombre']) || !isset($input['tipo']) || !isset($input['valor']) || 
            !isset($input['fecha_inicio']) || !isset($input['fecha_fin']) || !isset($input['aplica_a'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Faltan campos requeridos']);
            exit;
        }

        // Validar que se especifique el ID correcto según aplica_a
        if ($input['aplica_a'] === 'producto' && empty($input['producto_id'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Debe especificar producto_id']);
            exit;
        }
        if ($input['aplica_a'] === 'categoria' && empty($input['categoria_id'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Debe especificar categoria_id']);
            exit;
        }
        if ($input['aplica_a'] === 'marca' && empty($input['marca_id'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Debe especificar marca_id']);
            exit;
        }

        try {
            $stmt = $db->prepare("
                INSERT INTO descuentos 
                (nombre, descripcion, tipo, valor, fecha_inicio, fecha_fin, activo, aplica_a, producto_id, categoria_id, marca_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            if ($stmt->execute([
                $input['nombre'],
                $input['descripcion'] ?? null,
                $input['tipo'],
                $input['valor'],
                $input['fecha_inicio'],
                $input['fecha_fin'],
                $input['activo'] ?? 1,
                $input['aplica_a'],
                $input['producto_id'] ?? null,
                $input['categoria_id'] ?? null,
                $input['marca_id'] ?? null
            ])) {
                $newId = $db->lastInsertId();
                
                // Obtener conteo de usuarios para el mensaje
                $stmtCount = $db->query("SELECT COUNT(*) FROM usuarios WHERE rol = 'cliente' AND activo = 1");
                $totalUsuarios = $stmtCount->fetchColumn();

                // Notificar si está activo (Respuesta rápida)
                if (($input['activo'] ?? 1) == 1) {
                    $resData = [
                        'success' => true, 
                        'message' => 'Descuento creado exitosamente', 
                        'id' => $newId,
                        'total_usuarios' => $totalUsuarios
                    ];
                    if (function_exists('fastcgi_finish_request')) {
                        echo json_encode($resData);
                        if (function_exists('session_write_close')) session_write_close();
                        fastcgi_finish_request();
                        pclose(popen("start /B php " . __DIR__ . "/../../worker_correos.php > nul 2>&1", "r"));
                        notificarOferta($db, $newId);
                        exit;
                    } else {
                        ob_start();
                        echo json_encode($resData);
                        header('Connection: close');
                        header('Content-Length: ' . ob_get_length());
                        ob_end_flush();
                        flush();
                        if (function_exists('session_write_close')) session_write_close();
                        pclose(popen("start /B php " . __DIR__ . "/../../worker_correos.php > nul 2>&1", "r"));
                        notificarOferta($db, $newId);
                        exit;
                    }
                }

                echo json_encode([
                    'success' => true,
                    'message' => 'Descuento creado exitosamente',
                    'id' => $newId
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al crear descuento']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear descuento: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de descuento requerido']);
            exit;
        }

        try {
            $stmt = $db->prepare("
                UPDATE descuentos 
                SET nombre = ?, descripcion = ?, tipo = ?, valor = ?, fecha_inicio = ?, fecha_fin = ?, 
                    activo = ?, aplica_a = ?, producto_id = ?, categoria_id = ?, marca_id = ?
                WHERE id = ?
            ");
            
            if ($stmt->execute([
                $input['nombre'],
                $input['descripcion'] ?? null,
                $input['tipo'],
                $input['valor'],
                $input['fecha_inicio'],
                $input['fecha_fin'],
                $input['activo'] ?? 1,
                $input['aplica_a'],
                $input['producto_id'] ?? null,
                $input['categoria_id'] ?? null,
                $input['marca_id'] ?? null,
                $id
            ])) {
                // Obtener conteo de usuarios para el mensaje
                $stmtCount = $db->query("SELECT COUNT(*) FROM usuarios WHERE rol = 'cliente' AND activo = 1");
                $totalUsuarios = $stmtCount->fetchColumn();

                // Notificar si activo (Respuesta rápida)
                if (($input['activo'] ?? 1) == 1) {
                    $resData = [
                        'success' => true, 
                        'message' => 'Descuento actualizado exitosamente',
                        'total_usuarios' => $totalUsuarios
                    ];
                    if (function_exists('fastcgi_finish_request')) {
                        echo json_encode($resData);
                        if (function_exists('session_write_close')) session_write_close();
                        fastcgi_finish_request();
                        pclose(popen("start /B php " . __DIR__ . "/../../worker_correos.php > nul 2>&1", "r"));
                        notificarOferta($db, $id);
                        exit;
                    } else {
                        ob_start();
                        echo json_encode($resData);
                        header('Connection: close');
                        header('Content-Length: ' . ob_get_length());
                        ob_end_flush();
                        flush();
                        if (function_exists('session_write_close')) session_write_close();
                        pclose(popen("start /B php " . __DIR__ . "/../../worker_correos.php > nul 2>&1", "r"));
                        notificarOferta($db, $id);
                        exit;
                    }
                }
                
                echo json_encode(['success' => true, 'message' => 'Descuento actualizado exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al actualizar descuento']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar descuento: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de descuento requerido']);
            exit;
        }

        try {
            // Desactivar en lugar de eliminar
            $stmt = $db->prepare("UPDATE descuentos SET activo = 0 WHERE id = ?");
            
            if ($stmt->execute([$id])) {
                echo json_encode(['success' => true, 'message' => 'Descuento desactivado exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al desactivar descuento']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al desactivar descuento: ' . $e->getMessage()]);
        }
        break;
}
?>
