<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        if ($id) {
            // Obtener compra con detalles
            $stmt = $db->prepare("SELECT c.*, p.nombre as proveedor_nombre 
                                 FROM compras c 
                                 JOIN proveedores p ON c.proveedor_id = p.id 
                                 WHERE c.id = ?");
            $stmt->execute([$id]);
            $compra = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($compra) {
                $stmtDetalle = $db->prepare("SELECT d.*, p.nombre as producto_nombre, p.imagen as producto_imagen,
                                                   v.imagen as variacion_imagen,
                                                   CONCAT(a.nombre, ': ', av.valor) as variacion_nombre
                                            FROM detalle_compras d 
                                            JOIN productos p ON d.producto_id = p.id 
                                            LEFT JOIN producto_variantes v ON d.variacion_id = v.id
                                            LEFT JOIN atributo_valores av ON v.atributo_valor_id = av.id
                                            LEFT JOIN atributos a ON av.atributo_id = a.id
                                            WHERE d.compra_id = ?");
                $stmtDetalle->execute([$id]);
                $compra['detalles'] = $stmtDetalle->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($compra);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Compra no encontrada']);
            }
        } else {
            $stmt = $db->prepare("SELECT c.*, p.nombre as proveedor_nombre 
                                 FROM compras c 
                                 LEFT JOIN proveedores p ON c.proveedor_id = p.id 
                                 ORDER BY c.fecha_compra DESC, c.id DESC");
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        // Registrar nueva compra
        if (!isset($input['proveedor_id']) || !isset($input['fecha_compra']) || !isset($input['detalles'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Faltan campos requeridos']);
            exit;
        }

        try {
            $db->beginTransaction();

            $sql = "INSERT INTO compras (proveedor_id, numero_comprobante, tipo_comprobante, fecha_compra, total, estado, notas) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $db->prepare($sql);
            $stmt->execute([
                $input['proveedor_id'],
                $input['numero_comprobante'] ?? null,
                $input['tipo_comprobante'] ?? 'Factura',
                $input['fecha_compra'],
                $input['total'] ?? 0,
                $input['estado'] ?? 'Pendiente',
                $input['notas'] ?? null
            ]);
            $compra_id = $db->lastInsertId();

            // Insertar detalles
            $sqlDetalle = "INSERT INTO detalle_compras (compra_id, producto_id, variacion_id, precio_unidad, cantidad, subtotal) 
                           VALUES (?, ?, ?, ?, ?, ?)";
            $stmtDetalle = $db->prepare($sqlDetalle);

            foreach ($input['detalles'] as $detalle) {
                $stmtDetalle->execute([
                    $compra_id,
                    $detalle['producto_id'],
                    $detalle['variacion_id'] ?? null,
                    $detalle['precio_unidad'],
                    $detalle['cantidad'],
                    $detalle['subtotal']
                ]);

                // Si la compra se marca como COMPLETADO en el POST (raro pero posible), actualizar stock
                if (isset($input['estado']) && $input['estado'] === 'Completado') {
                    actualizarStock($db, $detalle['producto_id'], $detalle['variacion_id'] ?? null, $detalle['cantidad'], $detalle['precio_unidad']);
                }
            }

            $db->commit();
            echo json_encode(['success' => true, 'id' => $compra_id]);
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(['message' => 'Error al registrar compra: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID requerido']);
            exit;
        }

        try {
            $db->beginTransaction();

            // Obtener estado anterior
            $stmtOld = $db->prepare("SELECT estado FROM compras WHERE id = ?");
            $stmtOld->execute([$id]);
            $estadoAnterior = $stmtOld->fetchColumn();

            // Actualizar cabecera
            $sql = "UPDATE compras SET proveedor_id = ?, numero_comprobante = ?, tipo_comprobante = ?, 
                           fecha_compra = ?, total = ?, estado = ?, notas = ? WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute([
                $input['proveedor_id'],
                $input['numero_comprobante'] ?? null,
                $input['tipo_comprobante'] ?? 'Factura',
                $input['fecha_compra'],
                $input['total'] ?? 0,
                $input['estado'] ?? 'Pendiente',
                $input['notas'] ?? null,
                $id
            ]);

            // Actualizar detalles (Borrar e insertar de nuevo)
            if (isset($input['detalles'])) {
                $db->prepare("DELETE FROM detalle_compras WHERE compra_id = ?")->execute([$id]);
                
                $sqlDetalle = "INSERT INTO detalle_compras (compra_id, producto_id, variacion_id, precio_unidad, cantidad, subtotal) 
                               VALUES (?, ?, ?, ?, ?, ?)";
                $stmtDetalle = $db->prepare($sqlDetalle);

                foreach ($input['detalles'] as $detalle) {
                    $stmtDetalle->execute([
                        $id,
                        $detalle['producto_id'],
                        $detalle['variacion_id'] ?? null,
                        $detalle['precio_unidad'],
                        $detalle['cantidad'],
                        $detalle['subtotal']
                    ]);
                }
            }

            // Si pasa de algo a COMPLETADO, actualizar stock
            if ($estadoAnterior !== 'Completado' && $input['estado'] === 'Completado') {
                $stmtDet = $db->prepare("SELECT * FROM detalle_compras WHERE compra_id = ?");
                $stmtDet->execute([$id]);
                $detalles = $stmtDet->fetchAll(PDO::FETCH_ASSOC);

                foreach ($detalles as $det) {
                    actualizarStock($db, $det['producto_id'], $det['variacion_id'], $det['cantidad'], $det['precio_unidad']);
                }
            }

            $db->commit();
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(['message' => 'Error al actualizar compra: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID requerido']);
            exit;
        }

        try {
            // Verificar si ya está completada (opcional: podrías permitir borrar pero con advertencia)
            $stmt = $db->prepare("SELECT estado FROM compras WHERE id = ?");
            $stmt->execute([$id]);
            if ($stmt->fetchColumn() === 'Completado') {
                http_response_code(400);
                echo json_encode(['message' => 'No se puede eliminar una compra ya completada.']);
                exit;
            }

            $stmt = $db->prepare("DELETE FROM compras WHERE id = ?");
            if ($stmt->execute([$id])) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al eliminar compra']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Error: ' . $e->getMessage()]);
        }
        break;
}

/**
 * Función auxiliar para actualizar stock y precio de compra
 */
function actualizarStock($db, $producto_id, $variacion_id, $cantidad, $nuevoCosto) {
    if ($variacion_id) {
        // Actualizar variante
        $stmt = $db->prepare("UPDATE producto_variantes SET stock = stock + ?, precio_compra = ? WHERE id = ?");
        $stmt->execute([$cantidad, $nuevoCosto, $variacion_id]);
    } else {
        // Actualizar producto base
        $stmt = $db->prepare("UPDATE productos SET stock = stock + ?, precio_compra = ? WHERE id = ?");
        $stmt->execute([$cantidad, $nuevoCosto, $producto_id]);
    }
}
?>
