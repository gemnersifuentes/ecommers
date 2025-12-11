<?php
// API de productos
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("No se pudo conectar a la base de datos");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];
// Extraer ID de los parámetros GET (establecido por router.php o query param)
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

// Fallback: intentar extraer de URI si no está en GET (legacy direct call)
if (!$id && isset($_SERVER['REQUEST_URI'])) {
    $uri_parts = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
    if (isset($uri_parts[count($uri_parts) - 1]) && is_numeric($uri_parts[count($uri_parts) - 1])) {
        $id = intval($uri_parts[count($uri_parts) - 1]);
    }
}

$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        if ($id) {
            // Obtener un producto específico
            try {
                // Consulta directa con cálculo de descuentos
                $stmt = $db->prepare("
                    SELECT p.*, 
                           c.nombre as categoria_nombre,
                           m.nombre as marca_nombre,
                           COALESCE(d.valor, 0) as descuento_valor,
                           d.tipo as descuento_tipo,
                           CASE 
                               WHEN d.id IS NOT NULL AND d.activo = 1 
                                   AND (d.fecha_inicio IS NULL OR d.fecha_inicio <= CURDATE())
                                   AND (d.fecha_fin IS NULL OR d.fecha_fin >= CURDATE())
                               THEN 1 
                               ELSE 0 
                           END as tiene_descuento,
                           CASE 
                               WHEN d.id IS NOT NULL AND d.activo = 1 
                                   AND (d.fecha_inicio IS NULL OR d.fecha_inicio <= CURDATE())
                                   AND (d.fecha_fin IS NULL OR d.fecha_fin >= CURDATE())
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
                        AND (d.fecha_inicio IS NULL OR d.fecha_inicio <= CURDATE())
                        AND (d.fecha_fin IS NULL OR d.fecha_fin >= CURDATE())
                    )
                    WHERE p.id = ?
                ");
                $stmt->execute([$id]);
                $producto = $stmt->fetch(PDO::FETCH_ASSOC);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener producto: ' . $e->getMessage()]);
                exit;
            }
            
            if ($producto) {
                // Convertir campos numéricos
                $producto['precio_base'] = floatval($producto['precio_base']);
                $producto['stock'] = intval($producto['stock']);
                $producto['precio_final'] = floatval($producto['precio_final']);
                $producto['tiene_descuento'] = intval($producto['tiene_descuento']);
                $producto['descuento_valor'] = floatval($producto['descuento_valor'] ?? 0);
                
                // Calcular descuento_aplicado como la diferencia entre precio_base y precio_final
                $producto['descuento_aplicado'] = $producto['precio_base'] - $producto['precio_final'];
                
                // Obtener variantes del producto con atributos completos (ESQUEMA 3 TABLAS)
                try {
                    $stmtVar = $db->prepare("
                        SELECT v.id, v.precio, v.stock, v.sku,
                               av.id as valor_id,
                               av.valor,
                               av.color_hex,
                               a.id as atributo_id,
                               a.nombre as atributo_nombre,
                               a.permite_precio
                        FROM producto_variantes v
                        JOIN atributo_valores av ON v.atributo_valor_id = av.id
                        JOIN atributos a ON av.atributo_id = a.id
                        WHERE v.producto_id = ? AND v.activo = 1
                        ORDER BY a.nombre, av.valor
                    ");
                    $stmtVar->execute([$id]);
                    $variantes = $stmtVar->fetchAll(PDO::FETCH_ASSOC);
                    
                    // Agrupar variantes con sus atributos
                    $variantesAgrupadas = [];
                    foreach ($variantes as $var) {
                        $varianteId = $var['id'];
                        if (!isset($variantesAgrupadas[$varianteId])) {
                            // Calcular precio con descuento para la variación
                            $precioBaseVar = floatval($var['precio']);
                            $precioFinalVar = $precioBaseVar;
                            
                            if (isset($producto['tiene_descuento']) && $producto['tiene_descuento'] == 1) {
                                if (isset($producto['descuento_tipo']) && $producto['descuento_tipo'] === 'porcentaje') {
                                    $precioFinalVar = $precioBaseVar * (1 - ($producto['descuento_valor'] ?? 0) / 100);
                                } elseif (isset($producto['descuento_tipo']) && $producto['descuento_tipo'] === 'monto_fijo') {
                                    $precioFinalVar = max(0, $precioBaseVar - ($producto['descuento_valor'] ?? 0));
                                }
                            }

                            $variantesAgrupadas[$varianteId] = [
                                'id' => $var['id'],
                                'precio' => $precioBaseVar,
                                'precio_final' => round($precioFinalVar, 2),
                                'stock' => $var['stock'],
                                'sku' => $var['sku'],
                                'atributos' => []
                            ];
                        }
                        
                        // En esquema 3 tablas, la variante TIENE el valor.
                        $variantesAgrupadas[$varianteId]['atributos'][] = [
                            'atributo_id' => $var['atributo_id'],
                            'atributo_nombre' => $var['atributo_nombre'],
                            'permite_precio' => $var['permite_precio'],
                            'valor_id' => $var['valor_id'],
                            'valor' => $var['valor'],
                            'color_hex' => $var['color_hex']
                        ];
                    }
                    
                    $producto['variaciones'] = array_values($variantesAgrupadas);
                } catch (Exception $e) {
                    error_log("Error al cargar variantes: " . $e->getMessage());
                    $producto['variaciones'] = [];
                }
                
                // Obtener especificaciones del producto
                try {
                    $stmtEspec = $db->prepare("
                        SELECT nombre, valor 
                        FROM especificaciones 
                        WHERE producto_id = ?
                        ORDER BY nombre
                    ");
                    $stmtEspec->execute([$id]);
                    $especificaciones = $stmtEspec->fetchAll(PDO::FETCH_ASSOC);
                    $producto['especificaciones'] = $especificaciones;
                } catch (Exception $e) {
                    error_log("Error al cargar especificaciones: " . $e->getMessage());
                    $producto['especificaciones'] = [];
                }
                
                echo json_encode($producto);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Producto no encontrado']);
            }
        } else {
            // Obtener todos los productos
            $categoria = isset($_GET['categoria']) ? $_GET['categoria'] : null;
            $busqueda = isset($_GET['busqueda']) ? $_GET['busqueda'] : null;
            
            try {
                // Consulta directa a tablas
                $sql = "SELECT p.*, 
                               c.nombre as categoria_nombre,
                               m.nombre as marca_nombre,
                               COALESCE(d.valor, 0) as descuento_valor,
                               d.tipo as descuento_tipo,
                               CASE 
                                   WHEN d.id IS NOT NULL AND d.activo = 1 
                                       AND (d.fecha_inicio IS NULL OR d.fecha_inicio <= CURDATE())
                                       AND (d.fecha_fin IS NULL OR d.fecha_fin >= CURDATE())
                                   THEN 1 
                                   ELSE 0 
                               END as tiene_descuento,
                               CASE 
                                   WHEN d.id IS NOT NULL AND d.activo = 1 
                                       AND (d.fecha_inicio IS NULL OR d.fecha_inicio <= CURDATE())
                                       AND (d.fecha_fin IS NULL OR d.fecha_fin >= CURDATE())
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
                            AND (d.fecha_inicio IS NULL OR d.fecha_inicio <= CURDATE())
                            AND (d.fecha_fin IS NULL OR d.fecha_fin >= CURDATE())
                        )
                        WHERE (p.activo = 1 OR " . ((isset($_GET['admin_mode']) && $_GET['admin_mode'] === 'true') ? '1=1' : '0=1') . ")";
                
                $params = [];
                
                if ($categoria) {
                    $sql .= " AND p.categoria_id = ?";
                    $params[] = $categoria;
                }
                
                if ($busqueda) {
                    $sql .= " AND (p.nombre LIKE ? OR p.descripcion LIKE ?)";
                    $params[] = "%$busqueda%";
                    $params[] = "%$busqueda%";
                }

                // Filtro por marcas
                if (isset($_GET['marcas']) && !empty($_GET['marcas'])) {
                    $marcasIds = explode(',', $_GET['marcas']);
                    $marcasIds = array_filter($marcasIds, 'is_numeric');
                    if (!empty($marcasIds)) {
                        $placeholders = implode(',', array_fill(0, count($marcasIds), '?'));
                        $sql .= " AND p.marca_id IN ($placeholders)";
                        $params = array_merge($params, $marcasIds);
                    }
                }

                // Filtro por precio
                if (isset($_GET['precio_min']) && is_numeric($_GET['precio_min'])) {
                    $sql .= " AND p.precio_base >= ?";
                    $params[] = $_GET['precio_min'];
                }
                if (isset($_GET['precio_max']) && is_numeric($_GET['precio_max'])) {
                    $sql .= " AND p.precio_base <= ?";
                    $params[] = $_GET['precio_max'];
                }

                // Filtros por atributos dinámicos (attr_*)
                foreach ($_GET as $key => $value) {
                    if (strpos($key, 'attr_') === 0 && !empty($value)) {
                        $valoresIds = explode(',', $value);
                        $valoresIds = array_filter($valoresIds, 'is_numeric');
                        if (empty($valoresIds)) continue;
                        
                        $placeholders = implode(',', array_fill(0, count($valoresIds), '?'));
                        
                        $sql .= " AND EXISTS (
                            SELECT 1 
                            FROM producto_variantes pv 
                            WHERE pv.producto_id = p.id 
                            AND pv.atributo_valor_id IN ($placeholders)
                            AND pv.activo = 1
                        )";
                        
                        $params = array_merge($params, $valoresIds);
                    }
                }
                
                // Ordenamiento
                $orden = isset($_GET['orden']) ? $_GET['orden'] : 'recomendados';
                switch ($orden) {
                    case 'precio_asc':
                        $sql .= " ORDER BY p.precio_base ASC";
                        break;
                    case 'precio_desc':
                        $sql .= " ORDER BY p.precio_base DESC";
                        break;
                    default:
                        $sql .= " ORDER BY p.fecha_creacion DESC";
                }
                
                // Primero obtener el total de productos (sin LIMIT)
                $countStmt = $db->prepare($sql);
                $countStmt->execute($params);
                $totalProductos = $countStmt->rowCount();
                
                // Ahora agregar paginación con LIMIT y OFFSET (como integers directos)
                $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
                $limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 16;
                $offset = ($page - 1) * $limit;
                
                // Agregar LIMIT y OFFSET directamente (no como parámetros)
                $sql .= " LIMIT " . intval($limit) . " OFFSET " . intval($offset);
                
                $stmt = $db->prepare($sql);
                $stmt->execute($params);
                $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Agregar variaciones y convertir tipos
                foreach ($productos as &$producto) {
                    $producto['precio_base'] = floatval($producto['precio_base']);
                    $producto['precio_final'] = floatval($producto['precio_final']);
                    $producto['descuento_valor'] = floatval($producto['descuento_valor'] ?? 0);
                    $producto['descuento_tipo'] = $producto['descuento_tipo'] ?? null;
                    // Mantener compatibilidad con frontend que busca descuento_aplicado
                    $producto['descuento_aplicado'] = $producto['descuento_valor'];
                    $producto['tiene_descuento'] = intval($producto['tiene_descuento']);
                    $producto['stock'] = intval($producto['stock']);
                    
                    try {
                        // Usar LEFT JOIN para asegurar que carguen las variantes aunque tengan datos incompletos
                        $stmtVar = $db->prepare("
                            SELECT v.id, v.precio, v.stock, v.sku,
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
                        $stmtVar->execute([$producto['id']]);
                        $variantes = $stmtVar->fetchAll(PDO::FETCH_ASSOC);
                        
                        // Agrupar variantes con sus atributos
                        $variantesAgrupadas = [];
                        foreach ($variantes as $var) {
                            $varianteId = $var['id'];
                            if (!isset($variantesAgrupadas[$varianteId])) {
                                $variantesAgrupadas[$varianteId] = [
                                    'id' => $var['id'],
                                    // Si el precio de variable es 0 o nulo, usar el del producto base
                                    'precio' => floatval($var['precio'] > 0 ? $var['precio'] : $producto['precio_final']),
                                    'stock' => intval($var['stock']),
                                    'sku' => $var['sku'],
                                    'atributos' => []
                                ];
                            }
                            
                            // Solo agregar atributos si tienen ID válido (para evitar 'Opción: Estándar' vacíos si no hay enlace)
                            if ($var['atributo_id']) {
                                $variantesAgrupadas[$varianteId]['atributos'][] = [
                                    'atributo_id' => $var['atributo_id'],
                                    'atributo_nombre' => $var['atributo_nombre'],
                                    'valor_id' => $var['valor_id'],
                                    'valor' => $var['valor'],
                                    'color_hex' => $var['color_hex']
                                ];
                            } else {
                                // Si hay variante pero no atributos (caso legacy raro), crear uno dummy para que el frontend no falle
                                // O mejor, no agregamos atributos y dejamos que el frontend maneje variante sin atributos si es necesario
                                // Pero el modal depende de atributos. Agregamos uno genérico.
                                $variantesAgrupadas[$varianteId]['atributos'][] = [
                                    'atributo_id' => 0,
                                    'atributo_nombre' => 'Opción',
                                    'valor_id' => 0,
                                    'valor' => 'Única',
                                    'color_hex' => null
                                ];
                            }
                        }
                        
                        $producto['variaciones'] = array_values($variantesAgrupadas);
                    } catch (Exception $e) {
                        $producto['variaciones'] = [];
                    }
                }
                
                echo json_encode([
                    'data' => $productos,
                    'total' => $totalProductos
                ]);

            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Error al obtener productos: ' . $e->getMessage()]);
            }
        }
        break;

    case 'POST':
        if (!isset($input['nombre']) || !isset($input['precio_base'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Faltan campos requeridos']);
            exit;
        }

        try {
            $db->beginTransaction();


            // Sanitizar datos para evitar errores de tipo (string vacío vs null)
            $marcaId = !empty($input['marca_id']) ? $input['marca_id'] : null;
            $categoriaId = !empty($input['categoria_id']) ? $input['categoria_id'] : null;
            $imagen = !empty($input['imagen']) ? $input['imagen'] : null;
            $galeria = !empty($input['galeria_imagenes']) ? $input['galeria_imagenes'] : null;
            $descripcion = !empty($input['descripcion']) ? $input['descripcion'] : null;

            // Campos adicionales - Sanitización
            $metaTitulo = !empty($input['meta_titulo']) ? $input['meta_titulo'] : null;
            $metaDescripcion = !empty($input['meta_descripcion']) ? $input['meta_descripcion'] : null;
            $palabrasClave = !empty($input['palabras_clave']) ? $input['palabras_clave'] : null;
            $etiquetas = !empty($input['etiquetas']) ? $input['etiquetas'] : null;
            
            // Generar Slug si no existe
            $slug = !empty($input['slug']) ? $input['slug'] : strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $input['nombre'])));
            
            // Generar SKU si no existe
            $sku = !empty($input['sku']) ? $input['sku'] : 'TEMP-' . time();

            $stmt = $db->prepare("
                INSERT INTO productos (
                    nombre, descripcion, marca_id, imagen, galeria_imagenes, categoria_id, precio_base, stock,
                    meta_titulo, meta_descripcion, palabras_clave, slug, destacado, nuevo, etiquetas,
                    sku, peso, largo, ancho, alto, envio_gratis, stock_minimo,
                    condicion, garantia_meses, marca_fabricante, modelo, video_url, politica_devolucion_dias, activo
                ) 
                VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?
                )
            ");
            
            if ($stmt->execute([
                $input['nombre'],
                $descripcion,
                $marcaId,
                $imagen,
                $galeria,
                $categoriaId,
                $input['precio_base'],
                $input['stock'] ?? 0,
                // SEO
                $metaTitulo,
                $metaDescripcion,
                $palabrasClave,
                $slug,
                isset($input['destacado']) ? ($input['destacado'] ? 1 : 0) : 0,
                isset($input['nuevo']) ? ($input['nuevo'] ? 1 : 0) : 0,
                $etiquetas,
                // Logística
                $sku,
                !empty($input['peso']) ? $input['peso'] : null,
                !empty($input['largo']) ? $input['largo'] : null,
                !empty($input['ancho']) ? $input['ancho'] : null,
                !empty($input['alto']) ? $input['alto'] : null,
                isset($input['envio_gratis']) ? ($input['envio_gratis'] ? 1 : 0) : 0,
                !empty($input['stock_minimo']) ? $input['stock_minimo'] : 5,
                // Info
                !empty($input['condicion']) ? $input['condicion'] : 'nuevo',
                !empty($input['garantia_meses']) ? $input['garantia_meses'] : 12,
                !empty($input['marca_fabricante']) ? $input['marca_fabricante'] : null,
                !empty($input['modelo']) ? $input['modelo'] : null,
                !empty($input['video_url']) ? $input['video_url'] : null,
                !empty($input['politica_devolucion_dias']) ? $input['politica_devolucion_dias'] : 30,
                isset($input['activo']) ? ($input['activo'] ? 1 : 0) : 1
            ])) {
                $lastId = $db->lastInsertId();
                
                // Actualizar SKU si era temporal
                if (strpos($sku, 'TEMP-') === 0) {
                    $newSku = 'PROD-' . str_pad($lastId, 6, '0', STR_PAD_LEFT);
                    $db->query("UPDATE productos SET sku = '$newSku' WHERE id = $lastId");
                }

                // --- INSERTAR VARIANTES ---
                if (!empty($input['variantes']) && is_array($input['variantes'])) {
                    $stmtVar = $db->prepare("INSERT INTO producto_variantes (producto_id, precio, stock, sku, activo) VALUES (?, ?, ?, ?, 1)");
                    $stmtVal = $db->prepare("INSERT INTO variante_valores (variante_id, atributo_valor_id) VALUES (?, ?)");

                    foreach ($input['variantes'] as $var) {
                        // Validar datos mínimos
                        if (empty($var['stock']) || empty($var['valores'])) continue;
                        
                        $precioVar = !empty($var['precio']) ? $var['precio'] : null;
                        // Usar SKU del producto para generar SKU de variante
                        $productoSku = !empty($sku) && strpos($sku, 'TEMP-') === false ? $sku : 'PROD-' . str_pad($lastId, 6, '0', STR_PAD_LEFT);
                        $skuVar = !empty($var['sku']) ? $var['sku'] : $productoSku . '-' . uniqid();

                        $stmtVar->execute([$lastId, $precioVar, $var['stock'], $skuVar]);
                        $varianteId = $db->lastInsertId();

                        foreach ($var['valores'] as $val) {
                             // Si viene como objeto {id: 1, ...} o solo ID
                             $valId = is_array($val) ? $val['id'] : $val;
                             $stmtVal->execute([$varianteId, $valId]);
                        }
                    }
                }

                // --- INSERTAR ESPECIFICACIONES ---
                if (!empty($input['especificaciones']) && is_array($input['especificaciones'])) {
                    $stmtSpec = $db->prepare("INSERT INTO especificaciones (producto_id, nombre, valor, orden) VALUES (?, ?, ?, ?)");
                    foreach ($input['especificaciones'] as $index => $spec) {
                        if (empty($spec['nombre']) || empty($spec['valor'])) continue;
                        $stmtSpec->execute([$lastId, $spec['nombre'], $spec['valor'], $index]);
                    }
                }

                $db->commit();

                echo json_encode([
                    'success' => true,
                    'message' => 'Producto creado exitosamente',
                    'id' => $lastId
                ]);
            } else {
                $db->rollBack();
                http_response_code(500);
                echo json_encode(['message' => 'Error al crear producto', 'errorInfo' => $stmt->errorInfo()]);
            }
        } catch (Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear producto: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de producto requerido']);
            exit;
        }
        
        
        //DEBUG: Ver qué datos se están recibiendo
        error_log("PUT /productos/$id - Input recibido: " . json_encode($input));
        error_log("PUT /productos/$id - Campos: nombre=" . ($input['nombre'] ?? 'NULL') . ", precio=" . ($input['precio_base'] ?? 'NULL'));
        
        // Validar que se recibieron datos
        if (empty($input)) {
            http_response_code(400);
            echo json_encode(['error' => 'No se recibieron datos para actualizar']);
            exit;
        }
        
        // Validar campos requeridos
        if (!isset($input['nombre']) || empty($input['nombre'])) {
            http_response_code(400);
            echo json_encode(['error' => 'El nombre del producto es requerido']);
            exit;
        }
        
        if (!isset($input['precio_base']) || $input['precio_base'] === '') {
            http_response_code(400);
            echo json_encode(['error' => 'El precio del producto es requerido']);
            exit;
        }

        try {
            // Sanitizar datos para evitar errores de tipo (string vacío vs null)
            $marcaId = !empty($input['marca_id']) ? $input['marca_id'] : null;
            $categoriaId = !empty($input['categoria_id']) ? $input['categoria_id'] : null;
            $imagen = !empty($input['imagen']) ? $input['imagen'] : null;
            $galeria = !empty($input['galeria_imagenes']) ? $input['galeria_imagenes'] : null;
            $descripcion = !empty($input['descripcion']) ? $input['descripcion'] : null;

           // Campos adicionales - Sanitización
            $metaTitulo = !empty($input['meta_titulo']) ? $input['meta_titulo'] : null;
            $metaDescripcion = !empty($input['meta_descripcion']) ? $input['meta_descripcion'] : null;
            $palabrasClave = !empty($input['palabras_clave']) ? $input['palabras_clave'] : null;
            $etiquetas = !empty($input['etiquetas']) ? $input['etiquetas'] : null;
            $slug = !empty($input['slug']) ? $input['slug'] : strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $input['nombre'])));
            $sku = !empty($input['sku']) ? $input['sku'] : 'PROD-' . $id;

            // Actualizar TODOS los campos
            $stmt = $db->prepare("
                UPDATE productos 
                SET nombre = ?, 
                    descripcion = ?, 
                    marca_id = ?, 
                    imagen = ?, 
                    galeria_imagenes = ?, 
                    categoria_id = ?, 
                    precio_base = ?, 
                    stock = ?,
                    meta_titulo = ?,
                    meta_descripcion = ?,
                    palabras_clave = ?,
                    slug = ?,
                    destacado = ?,
                    nuevo = ?,
                    etiquetas = ?,
                    sku = ?,
                    peso = ?,
                    largo = ?,
                    ancho = ?,
                    alto = ?,
                    envio_gratis = ?,
                    stock_minimo = ?,
                    condicion = ?,
                    garantia_meses = ?,
                    marca_fabricante = ?,
                    modelo = ?,
                    video_url = ?,
                    politica_devolucion_dias = ?,
                    activo = ?
                WHERE id = ?
            ");
            
            if ($stmt->execute([
                $input['nombre'],
                $descripcion,
                $marcaId,
                $imagen,
                $galeria,
                $categoriaId,
                $input['precio_base'],
                $input['stock'] ?? 0,
                // SEO
                $metaTitulo,
                $metaDescripcion,
                $palabrasClave,
                $slug,
                isset($input['destacado']) ? ($input['destacado'] ? 1 : 0) : 0,
                isset($input['nuevo']) ? ($input['nuevo'] ? 1 : 0) : 0,
                $etiquetas,
                // Logística
                $sku,
                !empty($input['peso']) ? $input['peso'] : null,
                !empty($input['largo']) ? $input['largo'] : null,
                !empty($input['ancho']) ? $input['ancho'] : null,
                !empty($input['alto']) ? $input['alto'] : null,
                isset($input['envio_gratis']) ? ($input['envio_gratis'] ? 1 : 0) : 0,
                !empty($input['stock_minimo']) ? $input['stock_minimo'] : 5,
                // Info
                !empty($input['condicion']) ? $input['condicion'] : 'nuevo',
                !empty($input['garantia_meses']) ? $input['garantia_meses'] : 12,
                !empty($input['marca_fabricante']) ? $input['marca_fabricante'] : null,
                !empty($input['modelo']) ? $input['modelo'] : null,
                !empty($input['video_url']) ? $input['video_url'] : null,
                !empty($input['politica_devolucion_dias']) ? $input['politica_devolucion_dias'] : 30,
                isset($input['activo']) ? ($input['activo'] ? 1 : 0) : 1,
                $id
            ])) {
                // --- ACTUALIZAR ESPECIFICACIONES ---
                if (isset($input['especificaciones']) && is_array($input['especificaciones'])) {
                    // 1. Eliminar existentes
                    $db->prepare("DELETE FROM especificaciones WHERE producto_id = ?")->execute([$id]);
                    
                    // 2. Insertar nuevas
                    $stmtSpec = $db->prepare("INSERT INTO especificaciones (producto_id, nombre, valor, orden) VALUES (?, ?, ?, ?)");
                    foreach ($input['especificaciones'] as $index => $spec) {
                        if (empty($spec['nombre']) || empty($spec['valor'])) continue;
                        $stmtSpec->execute([$id, $spec['nombre'], $spec['valor'], $index]);
                    }
                }

                echo json_encode(['success' => true, 'message' => 'Producto actualizado exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode([
                    'error' => 'Error al ejecutar la actualización',
                    'errorInfo' => $stmt->errorInfo()
                ]);
            }
        } catch (Exception $e) {
            error_log("PUT /productos/$id - Exception: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar producto: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID de producto requerido']);
            exit;
        }

        try {
            $stmt = $db->prepare("UPDATE productos SET activo = 0 WHERE id = ?");
            
            if ($stmt->execute([$id])) {
                echo json_encode(['success' => true, 'message' => 'Producto eliminado exitosamente']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Error al eliminar producto']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar producto: ' . $e->getMessage()]);
        }
        break;

}
?>
