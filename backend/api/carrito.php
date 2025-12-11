<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../config/auth_helper.php';

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Obtener la conexión PDO
$pdo = $database->getConnection();

// Obtener y validar token
$token = getTokenFromRequest();
$usuario_id = getUserIdFromToken($pdo, $token);

if (!$usuario_id) {
    http_response_code(401);
    error_log("CARRITO 401: Usuario no autenticado");
    error_log("  Token recibido: " . ($token ? "SÍ" : "NO"));
    error_log("  Token valor: " . ($token ? substr($token, 0, 20) . "..." : ""));
    error_log("  Método: " . $_SERVER['REQUEST_METHOD']);
    error_log("  Path: " . $_SERVER['REQUEST_URI']);
    
    echo json_encode([
        'error' => 'No autenticado',
        'token_presente' => !!$token,
        'message' => 'Debes iniciar sesión para acceder al carrito',
        'debug' => [
            'token_recibido' => $token ? substr($token, 0, 20) . "..." : "NO",
            'metodo' => $_SERVER['REQUEST_METHOD'],
            'ruta' => $_SERVER['REQUEST_URI']
        ]
    ]);
    exit();
}

// Agregar depuración adicional para el token
error_log("CARRITO: Token recibido: " . ($token ? $token : "NO TOKEN"));
error_log("CARRITO: Usuario ID obtenido: " . ($usuario_id ? $usuario_id : "NO USUARIO"));

$method = $_SERVER['REQUEST_METHOD'];

// El router ya parseó el path y nos pasa las variables
// Para /api/carrito/36-3 → $param1 = "36-3"
$itemId = isset($param1) ? $param1 : null;

error_log("CARRITO: method=$method, itemId=" . ($itemId ?? 'NULL'));
error_log("CARRITO: URI=" . $_SERVER['REQUEST_URI']);

try {
    switch ($method) {
        case 'GET':
                // Obtener carrito del usuario
            $stmt = $pdo->prepare("
                SELECT 
                    c.id as cart_id,
                    c.producto_id,
                    c.variante_id,
                    c.cantidad,
                    p.nombre as producto_nombre,
                    p.imagen as producto_imagen,
                    p.precio_base,
                    p.marca_id,
                    p.categoria_id,
                    pv.precio as variante_precio,
                    COALESCE(pv.precio, p.precio_base) as precio,
                    a.nombre as atributo_nombre,
                    av.valor as atributo_valor
                FROM carrito c
                INNER JOIN productos p ON c.producto_id = p.id
                LEFT JOIN producto_variantes pv ON c.variante_id = pv.id
                LEFT JOIN atributo_valores av ON pv.atributo_valor_id = av.id
                LEFT JOIN atributos a ON av.atributo_id = a.id
                WHERE c.usuario_id = ?
            ");
            $stmt->execute([$usuario_id]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("GET CARRITO: Total items = " . count($items));
            
            // Formatear items para que coincidan con la estructura del contexto
            $formattedItems = array_map(function($item) use ($pdo) {
                $itemId = $item['variante_id'] 
                    ? $item['producto_id'] . '-' . $item['variante_id']
                    : (string)$item['producto_id'];
                
                // Preparar datos para cálculo de descuento
                $productoData = [
                    'id' => $item['producto_id'],
                    'categoria_id' => $item['categoria_id'],
                    'marca_id' => $item['marca_id'],
                    'precio_base' => floatval($item['precio_base'])
                ];

                $precioRegular = floatval($item['precio']);
                $productoData['precio_base'] = $precioRegular; // Usar precio actual para calcular descuento

                // Calcular descuento
                calculateDiscount($pdo, $productoData);

                $precioFinal = floatval($productoData['precio_final']);
                
                if (empty($productoData['tiene_descuento'])) {
                    $precioFinal = $precioRegular;
                }

                $cantidad = intval($item['cantidad']);
                
                $resultado = [
                    'id' => $itemId,
                    'producto' => [
                        'id' => $item['producto_id'],
                        'nombre' => $item['producto_nombre'],
                        'imagen' => $item['producto_imagen'],
                        'precio_base' => floatval($item['precio_base']),
                        'marca_id' => $item['marca_id'],
                        'categoria_id' => $item['categoria_id']
                    ],
                    'variacion' => null,
                    'cantidad' => $cantidad,
                    'precio' => $precioFinal,
                    'precio_regular' => $precioRegular,
                    'subtotal' => $precioFinal * $cantidad,
                    'descuento' => $productoData['tiene_descuento'] ? [
                        'tipo' => isset($productoData['descuento_tipo']) ? $productoData['descuento_tipo'] : 'monto',
                        'valor' => $productoData['descuento_valor'],
                        'ahorro' => ($precioRegular - $precioFinal) * $cantidad
                    ] : null
                ];
                
                // Si tiene variante, estructurarla correctamente
                if ($item['variante_id']) {
                    $resultado['variacion'] = [
                        'id' => $item['variante_id'],
                        'precio' => floatval($item['variante_precio']),
                        'sku' => '', 
                        'atributos' => [
                            [
                                'valor_id' => $item['variante_id'], 
                                'valor' => $item['atributo_valor'] ?: 'Estándar', 
                                'color_hex' => null,
                                'atributo_nombre' => $item['atributo_nombre'] ?: 'Opción'
                            ]
                        ]
                    ];
                }
                
                return $resultado;
            }, $items);
            
            echo json_encode($formattedItems);
            break;
            
        case 'POST':
            // Agregar item al carrito
            $data = json_decode(file_get_contents('php://input'), true);
            
            error_log("POST CARRITO: Datos recibidos: " . json_encode($data));
            error_log("POST CARRITO: Usuario ID: " . $usuario_id);
            
            $producto_id = $data['producto_id'];
            $variante_id = $data['variacion_id'] ?? null;
            $cantidad = $data['cantidad'] ?? 1;
            
            error_log("POST CARRITO: producto_id=$producto_id, variante_id=" . ($variante_id ?? 'NULL') . ", cantidad=$cantidad");
            
            // Validar que el producto existe
            $stmtProducto = $pdo->prepare("SELECT id, nombre FROM productos WHERE id = ?");
            $stmtProducto->execute([$producto_id]);
            $producto = $stmtProducto->fetch(PDO::FETCH_ASSOC);
            
            if (!$producto) {
                error_log("POST CARRITO ERROR: Producto $producto_id no encontrado");
                http_response_code(400);
                echo json_encode(['error' => 'Producto no encontrado']);
                exit();
            }
            
            error_log("POST CARRITO: Producto encontrado: " . $producto['nombre']);
            
            // Verificar si ya existe
            if ($variante_id) {
                $stmt = $pdo->prepare("
                    SELECT id, cantidad 
                    FROM carrito 
                    WHERE usuario_id = ? 
                    AND producto_id = ? 
                    AND variante_id = ?
                ");
                $stmt->execute([$usuario_id, $producto_id, $variante_id]);
            } else {
                $stmt = $pdo->prepare("
                    SELECT id, cantidad 
                    FROM carrito 
                    WHERE usuario_id = ? 
                    AND producto_id = ? 
                    AND variante_id IS NULL
                ");
                $stmt->execute([$usuario_id, $producto_id]);
            }
            $existing = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($existing) {
                // Actualizar cantidad
                $newCantidad = $existing['cantidad'] + $cantidad;
                error_log("POST CARRITO: Item existe, actualizando cantidad de {$existing['cantidad']} a $newCantidad");
                
                $stmt = $pdo->prepare("UPDATE carrito SET cantidad = ? WHERE id = ?");
                $stmt->execute([$newCantidad, $existing['id']]);
                $id = $existing['id'];
                
                error_log("POST CARRITO: Cantidad actualizada exitosamente");
            } else {
                // Insertar nuevo
                error_log("POST CARRITO: Item nuevo, insertando en BD");
                
                try {
                    $stmt = $pdo->prepare("
                        INSERT INTO carrito (usuario_id, producto_id, variante_id, cantidad)
                        VALUES (?, ?, ?, ?)
                    ");
                    $stmt->execute([$usuario_id, $producto_id, $variante_id, $cantidad]);
                    $id = $pdo->lastInsertId();
                    
                    error_log("POST CARRITO: Item insertado con ID: $id");
                } catch (PDOException $e) {
                    error_log("POST CARRITO ERROR al insertar: " . $e->getMessage());
                    http_response_code(500);
                    echo json_encode(['error' => 'Error al guardar en base de datos: ' . $e->getMessage()]);
                    exit();
                }
            }
            
            // ASEGURAR que se guarda en la BD
            try {
                // Verificar que se insertó correctamente
                $verifyStmt = $pdo->prepare("SELECT COUNT(*) FROM carrito WHERE id = ?");
                $verifyStmt->execute([$id]);
                $count = $verifyStmt->fetchColumn();
                
                if ($count == 0) {
                    error_log("POST CARRITO ERROR CRÍTICO: Item con ID $id NO se encuentra en BD después de insertar!");
                    http_response_code(500);
                    echo json_encode(['error' => 'Error al persistir datos en base de datos']);
                    exit();
                }
                
                error_log("POST CARRITO: Verificado - Item con ID $id existe en BD");
            } catch (Exception $e) {
                error_log("POST CARRITO ERROR al verificar: " . $e->getMessage());
            }
            
            error_log("POST CARRITO: Operación exitosa, id=$id");
            echo json_encode(['success' => true, 'id' => $id, 'message' => 'Item agregado al carrito']);
            break;
            
        case 'PUT':
            // Actualizar cantidad
            error_log("PUT RAW: path=$path, itemId='$itemId'");
            error_log("PUT REQUEST_URI: " . $_SERVER['REQUEST_URI']);
            
            if (!$itemId) {
                http_response_code(400);
                echo json_encode(['error' => 'ID requerido']);
                exit();
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            $cantidad = $data['cantidad'];
            
            error_log("PUT: itemId='$itemId', cantidad=$cantidad");
            
            // Parsear itemId
            $parts = explode('-', $itemId);
            $producto_id = intval($parts[0]);
            $variante_id = isset($parts[1]) ? intval($parts[1]) : null;
            
            error_log("PUT Parseado: producto_id=$producto_id, variante_id=" . ($variante_id ?? 'NULL'));
            
            if ($cantidad <= 0) {
                // Eliminar
                if ($variante_id) {
                    $stmt = $pdo->prepare("DELETE FROM carrito WHERE usuario_id = ? AND producto_id = ? AND variante_id = ?");
                    $stmt->execute([$usuario_id, $producto_id, $variante_id]);
                } else {
                    $stmt = $pdo->prepare("DELETE FROM carrito WHERE usuario_id = ? AND producto_id = ? AND variante_id IS NULL");
                    $stmt->execute([$usuario_id, $producto_id]);
                }
            } else {
                // Actualizar cantidad
                if ($variante_id) {
                    $stmt = $pdo->prepare("UPDATE carrito SET cantidad = ? WHERE usuario_id = ? AND producto_id = ? AND variante_id = ?");
                    $stmt->execute([$cantidad, $usuario_id, $producto_id, $variante_id]);
                } else {
                    $stmt = $pdo->prepare("UPDATE carrito SET cantidad = ? WHERE usuario_id = ? AND producto_id = ? AND variante_id IS NULL");
                    $stmt->execute([$cantidad, $usuario_id, $producto_id]);
                }
            }
            
            echo json_encode(['success' => true]);
            break;
            
        case 'DELETE':
            error_log("DELETE: Recibido itemId = " . ($itemId ?? 'NULL'));
            error_log("DELETE: Path completo = " . $path);
            error_log("DELETE: Usuario ID = " . $usuario_id);
            
            // VALIDACIÓN
            if (!$itemId || trim($itemId) === '') {
                error_log("DELETE: Limpiando TODO el carrito");
                $stmt = $pdo->prepare("DELETE FROM carrito WHERE usuario_id = ?");
                $stmt->execute([$usuario_id]);
                echo json_encode(['success' => true, 'message' => 'Carrito vaciado completamente']);
                break;
            }
            
            if (!preg_match('/^\d+(-\d+)?$/', $itemId)) {
                error_log("DELETE ERROR: itemId inválido: '$itemId'");
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID de item inválido']);
                break;
            }
            
            // Eliminar un item específico
            $parts = explode('-', $itemId);
            $producto_id = intval($parts[0]);
            $variante_id = isset($parts[1]) ? intval($parts[1]) : null;
            
            if ($producto_id <= 0) {
                error_log("DELETE ERROR: producto_id inválido: $producto_id");
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID de producto inválido']);
                break;
            }
            
            if ($variante_id) {
                $stmt = $pdo->prepare("DELETE FROM carrito WHERE usuario_id = ? AND producto_id = ? AND variante_id = ?");
                $stmt->execute([$usuario_id, $producto_id, $variante_id]);
            } else {
                $stmt = $pdo->prepare("DELETE FROM carrito WHERE usuario_id = ? AND producto_id = ? AND variante_id IS NULL");
                $stmt->execute([$usuario_id, $producto_id]);
            }
            
            $rowsAffected = $stmt->rowCount();
            
            echo json_encode([
                'success' => true,
                'rows_deleted' => $rowsAffected,
                'itemId' => $itemId
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function calculateDiscount($db, &$producto) {
    // defaults
    $producto['tiene_descuento'] = 0;
    $producto['porcentaje_descuento'] = 0;
    $producto['descuento_valor'] = 0;
    $producto['descuento_id'] = 0;
    $producto['descuento_fecha_fin'] = null;
    
    // Check DB
    try {
        $sql = "SELECT id, tipo, valor, fecha_fin FROM descuentos d 
                WHERE d.activo = 1 
                AND (d.fecha_inicio IS NULL OR d.fecha_inicio <= NOW())
                AND (d.fecha_fin IS NULL OR d.fecha_fin >= NOW())
                AND (
                    (d.aplica_a = 'producto' AND d.producto_id = ?) OR
                    (d.aplica_a = 'categoria' AND d.categoria_id = ?) OR
                    (d.aplica_a = 'marca' AND d.marca_id = ?)
                )
                ORDER BY d.valor DESC LIMIT 1";
        
        $stmt = $db->prepare($sql);
        $pId = isset($producto['id']) ? $producto['id'] : null;
        $cId = isset($producto['categoria_id']) ? $producto['categoria_id'] : null;
        $mId = isset($producto['marca_id']) ? $producto['marca_id'] : null;
        
        $stmt->execute([$pId, $cId, $mId]);
        $descuento = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($descuento) {
            $producto['tiene_descuento'] = 1;
            $producto['descuento_id'] = intval($descuento['id']);
            $producto['descuento_fecha_fin'] = $descuento['fecha_fin'];
            $producto['descuento_tipo'] = $descuento['tipo']; 
            
            if ($descuento['tipo'] === 'porcentaje') {
                $valor = floatval($descuento['valor']);
                $producto['precio_final'] = floatval($producto['precio_base']) * (1 - ($valor / 100));
                $producto['porcentaje_descuento'] = intval($valor);
                $producto['descuento_valor'] = intval($valor);
            } else {
                $valor = floatval($descuento['valor']);
                $producto['precio_final'] = max(0, floatval($producto['precio_base']) - $valor);
                $producto['porcentaje_descuento'] = 0; 
                
                if (floatval($producto['precio_base']) > 0) {
                     $producto['descuento_valor'] = round(($valor / floatval($producto['precio_base'])) * 100);
                } else {
                     $producto['descuento_valor'] = 0;
                }
            }
            $producto['precio_final'] = round($producto['precio_final'], 2);
        } else {
            $producto['precio_final'] = $producto['precio_base'];
        }
    } catch (Exception $e) { 
        $producto['precio_final'] = $producto['precio_base'];
    }
}
?>
