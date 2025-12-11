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

try {
    $response = [
        'atributos' => [],
        'marcas' => []
    ];

    // 1. Obtener Marcas (Filtradas por categoría si existe)
    $sqlMarcas = "SELECT DISTINCT m.id, m.nombre 
                  FROM marcas m
                  INNER JOIN productos p ON p.marca_id = m.id
                  WHERE m.activo = 1 AND p.activo = 1";
    
    $paramsMarcas = [];
    if ($categoriaId) {
        $sqlMarcas .= " AND p.categoria_id = ?";
        $paramsMarcas[] = $categoriaId;
    }
    $sqlMarcas .= " ORDER BY m.nombre";
    
    $stmtMarcas = $db->prepare($sqlMarcas);
    $stmtMarcas->execute($paramsMarcas);
    $response['marcas'] = $stmtMarcas->fetchAll(PDO::FETCH_ASSOC);

    // 2. Obtener Atributos y Valores (Filtrados por categoría)
    // 2. Obtener Atributos y Valores
    // Si hay categoría, filtrar por productos de esa categoría (Strict)
    // Si NO hay categoría (Todo), mostrar todos los atributos del sistema (Catalog) para asegurar que carguen
    
    $paramsAttrs = [];
    if ($categoriaId) {
        $sqlAttrs = "SELECT DISTINCT a.id as atributo_id, a.nombre as atributo_nombre, 
                            av.id as valor_id, av.valor, av.color_hex
                     FROM atributos a
                     INNER JOIN atributo_valores av ON av.atributo_id = a.id
                     INNER JOIN producto_variantes pv ON pv.atributo_valor_id = av.id
                     INNER JOIN productos p ON p.id = pv.producto_id
                     WHERE a.activo = 1 AND p.activo = 1 AND pv.activo = 1
                     AND p.categoria_id = ?
                     ORDER BY a.nombre, av.valor";
        $paramsAttrs[] = $categoriaId;
    } else {
        // Vista "Todo": Cargar catálogo completo de atributos activos
        $sqlAttrs = "SELECT DISTINCT a.id as atributo_id, a.nombre as atributo_nombre, 
                            av.id as valor_id, av.valor, av.color_hex
                     FROM atributos a
                     INNER JOIN atributo_valores av ON av.atributo_id = a.id
                     WHERE a.activo = 1
                     ORDER BY a.nombre, av.valor";
    }

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
