<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/conexion.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

    $categoriaId = isset($_GET['categoria_id']) ? $_GET['categoria_id'] : null;
    $busqueda = isset($_GET['busqueda']) ? $_GET['busqueda'] : null;

    // --- SMART CATEGORY DETECTION (SQL Version) ---
    if ($busqueda && !$categoriaId) {
        $searchLower = mb_strtolower(trim($busqueda));
        $terminosSmart = preg_split('/\s+/', $searchLower, -1, PREG_SPLIT_NO_EMPTY);
        
        if (!empty($terminosSmart)) {
            $firstTerm = $terminosSmart[0];
            $firstTermClean = rtrim($firstTerm, 's'); 
            
            if (strlen($firstTermClean) > 2) {
                // Check DB directly
                $stmtCatCheck = $db->prepare("SELECT id FROM categorias WHERE nombre LIKE ? AND activo = 1 LIMIT 1");
                $stmtCatCheck->execute(["$firstTermClean%"]);
                $catMatch = $stmtCatCheck->fetch(PDO::FETCH_ASSOC);
                
                if ($catMatch) {
                    $categoriaId = $catMatch['id'];
                }
            }
        }
    }

    try {
        $response = [
            'atributos' => [],
            'marcas' => []
        ];

        // Helper para cláusulas de búsqueda (Reutilizando lógica Broad OR)
        $searchWhere = "";
        $searchParams = [];
        if ($busqueda) {
            $terminos = preg_split('/\s+/', trim($busqueda), -1, PREG_SPLIT_NO_EMPTY);
            if (empty($terminos)) $terminos = [$busqueda];
            
            $orClauses = [];
            foreach ($terminos as $term) {
                // Buscamos coincidencia en nombre, descripcion, marca o categoria
                // Nota: En filtros.php generalmente joineamos productos p
                $orClauses[] = "(p.nombre LIKE ? OR p.descripcion LIKE ? OR m.nombre LIKE ?)"; // Simplificado para filtros
                $searchParams[] = "%$term%";
                $searchParams[] = "%$term%";
                $searchParams[] = "%$term%";
            }
            if (!empty($orClauses)) {
                $searchWhere = " AND (" . implode(" OR ", $orClauses) . ")";
            }
        }

        // 1. Obtener Marcas (Filtradas por categoría y/o búsqueda)
        $sqlMarcas = "SELECT DISTINCT m.id, m.nombre 
                      FROM marcas m
                      INNER JOIN productos p ON p.marca_id = m.id
                      WHERE m.activo = 1 AND p.activo = 1";
        
        $paramsMarcas = [];
        if ($categoriaId) {
            $sqlMarcas .= " AND p.categoria_id = ?";
            $paramsMarcas[] = $categoriaId;
        }
        if ($busqueda) {
            $sqlMarcas .= $searchWhere;
            $paramsMarcas = array_merge($paramsMarcas, $searchParams);
        }
        $sqlMarcas .= " ORDER BY m.nombre";
        
        $stmtMarcas = $db->prepare($sqlMarcas);
        $stmtMarcas->execute($paramsMarcas);
        $response['marcas'] = $stmtMarcas->fetchAll(PDO::FETCH_ASSOC);

        // 2. Obtener Condiciones (Filtradas)
        $sqlCondiciones = "SELECT DISTINCT p.condicion 
                           FROM productos p 
                           LEFT JOIN marcas m ON p.marca_id = m.id 
                           WHERE p.activo = 1 AND p.condicion IS NOT NULL AND p.condicion != ''";
        $paramsCondiciones = [];
        if ($categoriaId) {
            $sqlCondiciones .= " AND p.categoria_id = ?";
            $paramsCondiciones[] = $categoriaId;
        }
        if ($busqueda) {
            $sqlCondiciones .= $searchWhere;
            $paramsCondiciones = array_merge($paramsCondiciones, $searchParams);
        }
        $sqlCondiciones .= " ORDER BY p.condicion";
        $stmtCondiciones = $db->prepare($sqlCondiciones);
        $stmtCondiciones->execute($paramsCondiciones);
        $response['condiciones'] = $stmtCondiciones->fetchAll(PDO::FETCH_COLUMN);

        // 3. Obtener Atributos y Valores (Filtrados)
        // Lógica unificada: Siempre filtrar por productos activos que coincidan con los filtros actuales (cat/search)
        
        $sqlAttrs = "SELECT DISTINCT a.id as atributo_id, a.nombre as atributo_nombre, 
                            av.id as valor_id, av.valor, av.color_hex
                     FROM atributos a
                     INNER JOIN atributo_valores av ON av.atributo_id = a.id
                     INNER JOIN producto_variantes pv ON pv.atributo_valor_id = av.id
                     INNER JOIN productos p ON p.id = pv.producto_id
                     LEFT JOIN marcas m ON p.marca_id = m.id
                     WHERE a.activo = 1 AND p.activo = 1 AND pv.activo = 1";
                     
        $paramsAttrs = [];
        
        if ($categoriaId) {
            $sqlAttrs .= " AND p.categoria_id = ?";
            $paramsAttrs[] = $categoriaId;
        }
        
        if ($busqueda) {
            $sqlAttrs .= $searchWhere;
            $paramsAttrs = array_merge($paramsAttrs, $searchParams);
        }
        
        $sqlAttrs .= " ORDER BY a.nombre, av.valor";

        $stmtAttrs = $db->prepare($sqlAttrs);
        $stmtAttrs->execute($paramsAttrs);
        $rawAttrs = $stmtAttrs->fetchAll(PDO::FETCH_ASSOC);

    // Agrupar atributos
    $groupedAttrs = [];
    foreach ($rawAttrs as $row) {
        $name = $row['atributo_nombre'];
        if (!isset($groupedAttrs[$name])) {
            $groupedAttrs[$name] = [
                'nombre' => $name,
                'valores' => []
            ];
        }
        
        // Evitar duplicados de valores
        $exists = false;
        foreach ($groupedAttrs[$name]['valores'] as $val) {
            if ($val['id'] === $row['valor_id']) {
                $exists = true;
                break;
            }
        }

        if (!$exists) {
            $groupedAttrs[$name]['valores'][] = [
                'id' => $row['valor_id'],
                'valor' => $row['valor'],
                'color_hex' => $row['color_hex']
            ];
        }
    }

    $response['atributos'] = array_values($groupedAttrs);

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener filtros: ' . $e->getMessage()]);
}
?>
