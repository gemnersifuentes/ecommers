<?php
// API dedicada para la tienda (Frontend)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/conexion.php';
// require_once __DIR__ . '/../../config/auth_middleware.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("No se pudo conectar a la base de datos");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]);
    exit();
}

// $user = authenticate(false);
$userId = 0; // $user ? $user['id'] : 0;

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

if ($method === 'GET') {
    if ($id) {
        getProductDetail($db, $id, $userId);
    } else {
        listProducts($db, $userId);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}

// function listProducts($db, $userId) { ... } restored to robust version

function listProducts($db, $userId) {
    try {
        $categoria = isset($_GET['categoria']) ? $_GET['categoria'] : null;
        $busqueda = isset($_GET['busqueda']) ? $_GET['busqueda'] : null;
        $marcas = isset($_GET['marcas']) ? $_GET['marcas'] : []; 
        $condicion = isset($_GET['condicion']) ? $_GET['condicion'] : null;
        $ordenar = isset($_GET['ordenar']) ? $_GET['ordenar'] : 'recomendados';
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 16;
        $offset = ($page - 1) * $limit;

        // --- QUERY BUILDER ---
        
        $whereClauses = ["p.activo = 1"];
        $params = [];

        // 1. Categoria
        if ($categoria) {
            // "slug" no existe en la tabla categorias según database.sql
            // Usamos nombre como fallback
            $whereClauses[] = "(c.id = ? OR c.nombre = ?)";
            $params[] = $categoria;
            $params[] = $categoria;
        }

        // 2. Busqueda
        if ($busqueda) {
            $whereClauses[] = "(p.nombre LIKE ? OR p.descripcion LIKE ?)";
            $params[] = "%$busqueda%";
            $params[] = "%$busqueda%";
        }

        // 3. Marcas
        if (!empty($marcas)) {
            $marcasArray = is_array($marcas) ? $marcas : explode(',', $marcas);
            $marcasArray = array_map('intval', $marcasArray); 
            if (count($marcasArray) > 0) {
                $placeholders = str_repeat('?,', count($marcasArray) - 1) . '?';
                $whereClauses[] = "p.marca_id IN ($placeholders)";
                $params = array_merge($params, $marcasArray);
            }
        }

        // 4. Condicion
        if (!empty($condicion)) {
            // La columna 'condicion' NO EXISTE en la tabla productos según database.sql
            // Deshabilitamos este filtro temporalmente para evitar error 500
            // $condicionArray = is_array($condicion) ? $condicion : explode(',', $condicion);
            // ...
        }

        // 5. Ofertas Flash
        $ofertasFlash = isset($_GET['ofertas_flash']) ? filter_var($_GET['ofertas_flash'], FILTER_VALIDATE_BOOLEAN) : false;
        if (!$ofertasFlash && isset($_GET['ofertas'])) {
             $ofertasFlash = filter_var($_GET['ofertas'], FILTER_VALIDATE_BOOLEAN);
        }
        if ($ofertasFlash) {
             $whereClauses[] = "EXISTS (
                SELECT 1 FROM descuentos d 
                WHERE d.activo = 1 
                AND (d.fecha_inicio IS NULL OR d.fecha_inicio <= NOW())
                AND (d.fecha_fin IS NULL OR d.fecha_fin >= NOW())
                AND (
                    (d.aplica_a = 'producto' AND d.producto_id = p.id) OR
                    (d.aplica_a = 'categoria' AND d.categoria_id = p.categoria_id) OR
                    (d.aplica_a = 'marca' AND d.marca_id = p.marca_id)
                )
             )";
        }

        // 6. Atributos Dinámicos (Variantes) - Lógica corregida para 'attr_' y tabla producto_variantes
        $filtrosAtributos = [];
        foreach ($_GET as $key => $value) {
            if (strpos($key, 'attr_') === 0 && !empty($value)) {
                $filtrosAtributos[] = $value;
            }
        }

        if (!empty($filtrosAtributos)) {
            // Recopilar todos los IDs de valores de todos los atributos seleccionados
            $todosLosValores = [];
            foreach ($filtrosAtributos as $valString) {
                $ids = explode(',', $valString);
                $ids = array_filter($ids, 'is_numeric'); // Seguridad
                if (!empty($ids)) {
                    $todosLosValores = array_merge($todosLosValores, $ids);
                }
            }
            
            if (!empty($todosLosValores)) {
                 $placeholders = implode(',', array_fill(0, count($todosLosValores), '?'));
                 // Usar la tabla CORRECTA: producto_variantes
                 $whereClauses[] = "EXISTS (
                    SELECT 1 FROM producto_variantes pv 
                    WHERE pv.producto_id = p.id 
                    AND pv.atributo_valor_id IN ($placeholders)
                    AND pv.activo = 1
                 )";
                 $params = array_merge($params, $todosLosValores);
            }
        }

        // Build WHERE SQL
        $whereSql = "WHERE " . implode(" AND ", $whereClauses);

        // --- COUNT QUERY ---
        $countSql = "SELECT COUNT(*) 
                     FROM productos p 
                     LEFT JOIN categorias c ON p.categoria_id = c.id 
                     $whereSql";
        
        $stmtCount = $db->prepare($countSql);
        $stmtCount->execute($params);
        $totalProductos = $stmtCount->fetchColumn();

        // --- ORDER BY ---
        $orderSql = "ORDER BY p.fecha_creacion DESC"; // Default
        switch ($ordenar) {
            case 'precio_asc': $orderSql = "ORDER BY p.precio_base ASC"; break;
            case 'precio_desc': $orderSql = "ORDER BY p.precio_base DESC"; break;
            case 'nombre_asc': $orderSql = "ORDER BY p.nombre ASC"; break;
            case 'nombre_desc': $orderSql = "ORDER BY p.nombre DESC"; break;
        }

        // --- MAIN SELECT ---
        $sql = "SELECT p.*, 
                       c.nombre as categoria_nombre, 
                       m.nombre as marca_nombre,
                       p.precio_base as precio_final,
                       p.envio_gratis,
                       0 as tiene_descuento, 
                       0 as es_favorito,
                       (SELECT COALESCE(SUM(cantidad), 0) FROM detalle_pedido WHERE producto_id = p.id) as vendidos,
                       (SELECT COUNT(*) FROM resenas WHERE producto_id = p.id) as total_resenas,
                       (SELECT COALESCE(AVG(calificacion), 0) FROM resenas WHERE producto_id = p.id) as promedio_calificacion
                FROM productos p 
                LEFT JOIN categorias c ON p.categoria_id = c.id 
                LEFT JOIN marcas m ON p.marca_id = m.id
                $whereSql
                $orderSql
                LIMIT " . intval($limit) . " OFFSET " . intval($offset);

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);


        // Formateo
        foreach ($productos as &$producto) {
            $producto['precio_base'] = floatval($producto['precio_base']);
            $producto['precio_final'] = floatval($producto['precio_final']); 
            $producto['stock'] = intval($producto['stock']);
            // Restaurar variaciones para activar el modal en frontend
            $producto['variaciones'] = getVariations($db, $producto['id']);
            
            // Calcular descuentos dinámicos
            calculateDiscount($db, $producto);
        }

        echo json_encode([
            'data' => $productos,
            'total' => $totalProductos,
            'page' => $page,
            'limit' => $limit
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        error_log("Error listProducts: " . $e->getMessage());
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// ... getProductDetail ...

function getVariations($db, $productoId) {
    try {
        // Usar la lógica correcta de 3 tablas (producto_variantes, atributo_valores, atributos)
        // Usamos LEFT JOIN para robustez (igual que en admin)
        $stmtVar = $db->prepare("
            SELECT v.id, v.precio, v.stock, v.sku, v.imagen,
                   av.id as valor_id,
                   COALESCE(av.valor, 'Estándar') as valor,
                   av.color_hex,
                   a.id as atributo_id,
                   COALESCE(a.nombre, 'Opción') as atributo_nombre,
                   a.permite_precio
            FROM producto_variantes v
            LEFT JOIN atributo_valores av ON v.atributo_valor_id = av.id
            LEFT JOIN atributos a ON av.atributo_id = a.id
            WHERE v.producto_id = ? AND v.activo = 1
            ORDER BY a.nombre, av.valor
        ");
        $stmtVar->execute([$productoId]);
        $rows = $stmtVar->fetchAll(PDO::FETCH_ASSOC);

        // Agrupar variantes con sus atributos (formato que espera el Frontend: variaciones -> [atributos])
        $variantesAgrupadas = [];
        
        foreach ($rows as $var) {
            $varianteId = $var['id'];
            if (!isset($variantesAgrupadas[$varianteId])) {
                $variantesAgrupadas[$varianteId] = [
                    'id' => $var['id'],
                    'precio' => floatval($var['precio']),
                    'stock' => intval($var['stock']),
                    'imagen' => $var['imagen'],
                    'sku' => $var['sku'],
                    'atributos' => []
                ];
            }
            
            // Si hay enlace válido con atributo
            if ($var['atributo_id']) {
                $variantesAgrupadas[$varianteId]['atributos'][] = [
                    'atributo_id' => $var['atributo_id'],
                    'atributo_nombre' => $var['atributo_nombre'],
                    'valor_id' => $var['valor_id'],
                    'valor' => $var['valor'],
                    'color_hex' => $var['color_hex']
                ];
            } else {
                // Fallback para variantes "huérfanas" (Sin atributo vinculado)
                // Agregamos un atributo dummy para que ProductCard.jsx detecte y muestre modal
                $variantesAgrupadas[$varianteId]['atributos'][] = [
                    'atributo_id' => 0,
                    'atributo_nombre' => 'Opción',
                    'valor_id' => 0,
                    'valor' => 'Única',
                    'color_hex' => null
                ];
            }
        }
        
        return array_values($variantesAgrupadas);
    } catch (Exception $e) {
        // En caso de error, devolver array vacío para no romper la respuesta completa
        error_log("Error getVariations TIENDA: " . $e->getMessage());
        return [];
    }
}

function getProductDetail($db, $id, $userId) {
    try {
        $sql = "SELECT p.*, 
                       c.nombre as categoria_nombre,
                       m.nombre as marca_nombre,
                       COALESCE(d.valor, 0) as descuento_valor,
                       d.tipo as descuento_tipo,
                       d.fecha_fin as fecha_fin,
                       (SELECT COALESCE(AVG(calificacion), 0) FROM resenas WHERE producto_id = p.id) as promedio_calificacion,
                       (SELECT COUNT(*) FROM resenas WHERE producto_id = p.id) as total_resenas,
                       (SELECT COUNT(*) FROM favoritos WHERE producto_id = p.id AND usuario_id = ?) as es_favorito,
                       CASE 
                           WHEN d.id IS NOT NULL AND d.activo = 1 
                               AND (d.fecha_inicio IS NULL OR d.fecha_inicio <= NOW())
                               AND (d.fecha_fin IS NULL OR d.fecha_fin >= NOW())
                           THEN 1 
                           ELSE 0 
                       END as tiene_descuento,
                       CASE 
                           WHEN d.id IS NOT NULL AND d.activo = 1 
                               AND (d.fecha_inicio IS NULL OR d.fecha_inicio <= NOW())
                               AND (d.fecha_fin IS NULL OR d.fecha_fin >= NOW())
                           THEN 
                               CASE 
                                   WHEN d.tipo = 'porcentaje' THEN p.precio_base * (1 - COALESCE(d.valor, 0) / 100)
                                   WHEN d.tipo = 'monto_fijo' THEN GREATEST(0, p.precio_base - COALESCE(d.valor, 0))
                                   ELSE p.precio_base
                               END
                           ELSE p.precio_base 
                       END as precio_final
                FROM productos p
                LEFT JOIN categorias c ON p.categoria_id = c.id
                LEFT JOIN marcas m ON p.marca_id = m.id
                LEFT JOIN descuentos d ON (
                    (d.producto_id = p.id OR d.categoria_id = p.categoria_id OR d.marca_id = p.marca_id)
                    AND d.activo = 1
                    AND (d.fecha_inicio IS NULL OR d.fecha_inicio <= NOW())
                    AND (d.fecha_fin IS NULL OR d.fecha_fin >= NOW())
                )
                WHERE p.id = ? AND p.activo = 1";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$userId, $id]);
        $producto = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($producto) {
            $producto['precio_base'] = floatval($producto['precio_base']);
            $producto['precio_final'] = floatval($producto['precio_final']);
            $producto['tiene_descuento'] = intval($producto['tiene_descuento']);
            $producto['es_favorito'] = (bool)$producto['es_favorito'];
            $producto['variaciones'] = getVariations($db, $id);
            calculateDiscount($db, $producto);
            
            $stmtSpec = $db->prepare("SELECT nombre, valor FROM especificaciones WHERE producto_id = ?");
            $stmtSpec->execute([$id]);
            $producto['especificaciones'] = $stmtSpec->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode($producto);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Producto no encontrado']);
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al obtener producto: ' . $e->getMessage()]);
    }
}




function calculateDiscount($db, &$producto) {
    // defaults
    $producto['tiene_descuento'] = 0;
    // $producto['precio_final'] ya viene seteado con precio_base, lo ajustamos abajo si hay descuento
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
        // Validar que keys existan, si no, usar null
        $pId = isset($producto['id']) ? $producto['id'] : null;
        $cId = isset($producto['categoria_id']) ? $producto['categoria_id'] : null;
        $mId = isset($producto['marca_id']) ? $producto['marca_id'] : null;
        
        $stmt->execute([$pId, $cId, $mId]);
        $descuento = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($descuento) {
            $producto['tiene_descuento'] = 1;
            $producto['descuento_id'] = intval($descuento['id']);
            $producto['descuento_fecha_fin'] = $descuento['fecha_fin'];
            
            if ($descuento['tipo'] === 'porcentaje') {
                $valor = floatval($descuento['valor']);
                $producto['precio_final'] = floatval($producto['precio_base']) * (1 - ($valor / 100));
                $producto['porcentaje_descuento'] = intval($valor);
                $producto['descuento_valor'] = intval($valor); // Para frontend compatibilidad
            } else {
                $valor = floatval($descuento['valor']);
                $producto['precio_final'] = max(0, floatval($producto['precio_base']) - $valor);
                $producto['porcentaje_descuento'] = 0; 
                // Calcular porcentaje equivalente para mostrar en badge si es fijo?
                // Mejor enviar null o calcularlo:
                if (floatval($producto['precio_base']) > 0) {
                     $producto['descuento_valor'] = round(($valor / floatval($producto['precio_base'])) * 100);
                } else {
                     $producto['descuento_valor'] = 0;
                }
            }
            // Asegurar 2 decimales
            $producto['precio_final'] = round($producto['precio_final'], 2);
        }
    } catch (Exception $e) { 
        // Silencio en cálculo auxiliar
    }
}
