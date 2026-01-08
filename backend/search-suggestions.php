<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$query = isset($_GET['q']) ? trim($_GET['q']) : '';

if (empty($query)) {
    echo json_encode([
        'products' => [],
        'brands' => [],
        'categories' => []
    ]);
    exit;
}

try {
    // Conexión directa
    $db = new PDO(
        "mysql:host=localhost;dbname=db_tienda_redhard",
        "root",
        ""
    );
    $db->exec("set names utf8mb4");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $searchTerm = "%$query%";
    $tokens = explode(' ', $query);
    $searchORs = ["MATCH(p.nombre, p.descripcion, p.modelo, p.sku, p.etiquetas) AGAINST(? IN NATURAL LANGUAGE MODE)"];
    $allParams = [$query];
    
    foreach($tokens as $token) {
        if (strlen($token) > 2) {
            $stem = str_ends_with($token, 's') ? rtrim($token, 's') : $token;
            $searchORs[] = "(p.nombre LIKE ? OR p.descripcion LIKE ? OR p.modelo LIKE ? OR p.sku LIKE ? OR c.nombre LIKE ?)";
            $term = "%$stem%";
            for($i=0;$i<5;$i++) $allParams[] = $term; // Matches 5 placeholders
        }
    }
    $whereSql = "(" . implode(" OR ", $searchORs) . ")";

    // Productos que coinciden
    $stmt = $db->prepare("
        SELECT DISTINCT p.id, p.nombre, p.imagen, p.precio_base,
               (MATCH(p.nombre, p.descripcion, p.modelo, p.sku, p.etiquetas) AGAINST(? IN NATURAL LANGUAGE MODE)) as relevance
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE $whereSql AND p.activo = 1
        ORDER BY relevance DESC, p.nombre ASC
        LIMIT 10
    ");
    
    $executionParams = array_merge([$query], $allParams);
    $stmt->execute($executionParams);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Marcas relacionadas
    $stmt = $db->prepare("
        SELECT DISTINCT m.id, m.nombre
        FROM marcas m
        INNER JOIN productos p ON p.marca_id = m.id
        WHERE (p.nombre LIKE ? OR m.nombre LIKE ?)
            AND p.activo = 1
            AND m.activo = 1
        ORDER BY m.nombre ASC
        LIMIT 10
    ");
    $stmt->execute([$searchTerm, $searchTerm]);
    $brands = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Categorías relacionadas
    $stmt = $db->prepare("
        SELECT DISTINCT c.id, c.nombre
        FROM categorias c
        INNER JOIN productos p ON p.categoria_id = c.id
        WHERE (p.nombre LIKE ? OR c.nombre LIKE ?)
            AND p.activo = 1
            AND c.activo = 1
        ORDER BY c.nombre ASC
        LIMIT 10
    ");
    $stmt->execute([$searchTerm, $searchTerm]);
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatear productos
    $formattedProducts = array_map(function($product) {
        return [
            'id' => (int)$product['id'],
            'nombre' => $product['nombre'],
            'imagen' => $product['imagen'],
            'precio' => (float)$product['precio_base']
        ];
    }, $products);
    
    echo json_encode([
        'products' => $formattedProducts,
        'brands' => $brands,
        'categories' => $categories
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al buscar: ' . $e->getMessage()]);
}
