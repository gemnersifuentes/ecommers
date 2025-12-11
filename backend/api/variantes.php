<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/conexion.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : (isset($_GET['producto_id']) ? $_GET['producto_id'] : null);

$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        // GET /variantes?producto_id={id}
        $productoId = $id ?? ($_GET['producto_id'] ?? null);

        if ($productoId) {
            try {
                // Consulta optimizada para esquema de 3 tablas
                // producto_variantes tiene atributo_valor_id directo
                $stmt = $db->prepare("
                    SELECT v.id, v.precio, v.stock, v.sku, v.imagen, v.activo,
                           av.id as valor_id,
                           av.valor,
                           av.color_hex,
                           a.id as atributo_id,
                           a.nombre as atributo_nombre
                    FROM producto_variantes v
                    LEFT JOIN atributo_valores av ON v.atributo_valor_id = av.id
                    LEFT JOIN atributos a ON av.atributo_id = a.id
                    WHERE v.producto_id = ? AND v.activo = 1
                ");
                $stmt->execute([$productoId]);
                $rawVariantes = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $variantesResultado = [];

                foreach ($rawVariantes as $row) {
                    // Formato compatible con frontend
                    $variante = [
                        'id' => $row['id'],
                        'precio' => $row['precio'],
                        'stock' => $row['stock'],
                        'sku' => $row['sku'],
                        'imagen' => $row['imagen'],
                        'activo' => $row['activo'],
                        'valores' => [] 
                    ];

                    if ($row['valor_id']) { 
                        $variante['valores'][] = [
                            'id' => $row['valor_id'],
                            'valor' => $row['valor'],
                            'color_hex' => $row['color_hex'],
                            'atributo_id' => $row['atributo_id'],
                            'atributo_nombre' => $row['atributo_nombre']
                        ];
                    }
                    $variantesResultado[] = $variante;
                }

                echo json_encode($variantesResultado);

            } catch (Exception $e) {
                error_log("Error getting variants: " . $e->getMessage());
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener variantes: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'ID de producto requerido']);
        }
        break;

    case 'POST':
        // POST /productos/{id}/variantes
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de producto requerido']);
            exit;
        }

        try {
            // Extraer el atributo_valor_id del array de valores (asumimos 1 por variante en este esquema simple)
            $atributoValorId = null;
            if (isset($input['valores']) && is_array($input['valores']) && count($input['valores']) > 0) {
                $atributoValorId = $input['valores'][0];
            }

            // Generar SKU profesional si no se proporciona
            $sku = $input['sku'] ?? null;
            if (empty($sku)) {
                // Obtener nombre del producto y valor del atributo para SKU legible
                try {
                    $stmtProd = $db->prepare("SELECT nombre FROM productos WHERE id = ?");
                    $stmtProd->execute([$id]);
                    $producto = $stmtProd->fetch(PDO::FETCH_ASSOC);
                    
                    $stmtVal = $db->prepare("SELECT valor FROM atributo_valores WHERE id = ?");
                    $stmtVal->execute([$atributoValorId]);
                    $valor = $stmtVal->fetch(PDO::FETCH_ASSOC);
                    
                    if ($producto && $valor) {
                        // Crear abreviación del producto (primeras 3 letras)
                        $prodAbrev = strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $producto['nombre']), 0, 3));
                        // Limpiar valor del atributo
                        $valorLimpio = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $valor['valor']));
                        $sku = $prodAbrev . '-' . $valorLimpio;
                    } else {
                        $sku = 'VAR-' . $id . '-' . substr(uniqid(), -6);
                    }
                } catch (Exception $e) {
                    $sku = 'VAR-' . $id . '-' . substr(uniqid(), -6);
                }
            }
            
            $stmt = $db->prepare("
                INSERT INTO producto_variantes (producto_id, atributo_valor_id, precio, stock, sku, imagen, activo)
                VALUES (?, ?, ?, ?, ?, ?, 1)
            ");
            
            $stmt->execute([
                $id,
                $atributoValorId,
                $input['precio'] ?? null,
                $input['stock'] ?? 0,
                $sku,
                $input['imagen'] ?? null
            ]);
            
            $varianteId = $db->lastInsertId();

            echo json_encode(['success' => true, 'id' => $varianteId, 'message' => 'Variante creada']);

        } catch (Exception $e) {
            error_log("Error creating variant: " . $e->getMessage() . " - Input: " . json_encode($input));
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear variante: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        // PUT /variantes/{id}
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de variante requerido']);
            exit;
        }

        try {
            $db->beginTransaction();

            // 1. Actualizar datos básicos
            $fields = [];
            $params = [];
            
            if (isset($input['precio'])) { $fields[] = "precio = ?"; $params[] = $input['precio']; }
            if (isset($input['stock'])) { $fields[] = "stock = ?"; $params[] = $input['stock']; }
            if (isset($input['sku'])) { $fields[] = "sku = ?"; $params[] = $input['sku']; }
            if (isset($input['imagen'])) { $fields[] = "imagen = ?"; $params[] = $input['imagen']; }
            
            if (!empty($fields)) {
                $params[] = $id;
                $sql = "UPDATE producto_variantes SET " . implode(', ', $fields) . " WHERE id = ?";
                $stmt = $db->prepare($sql);
                $stmt->execute($params);
            }

            // 2. Actualizar valores (si se envían)
            // Estrategia: Borrar y reinsertar si se envían nuevos valores
            if (isset($input['valores']) && is_array($input['valores'])) {
                $db->prepare("DELETE FROM variante_valores WHERE variante_id = ?")->execute([$id]);
                
                $stmtVal = $db->prepare("INSERT INTO variante_valores (variante_id, atributo_valor_id) VALUES (?, ?)");
                foreach ($input['valores'] as $valId) {
                    $stmtVal->execute([$id, $valId]);
                }
            }

            $db->commit();
            echo json_encode(['success' => true, 'message' => 'Variante actualizada']);

        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar variante: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // DELETE /variantes/{id}
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de variante requerido']);
            exit;
        }

        try {
            // Soft delete
            $stmt = $db->prepare("UPDATE producto_variantes SET activo = 0 WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Variante eliminada']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar variante: ' . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}
?>
