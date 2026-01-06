<?php
require_once 'backend/config/conexion.php';
try {
    $database = new Database();
    $db = $database->getConnection();
    
    $busqueda = 'mandoss';
    $searchLower = mb_strtolower(trim($busqueda));
    $searchTokens = preg_split('/\s+/', $searchLower, -1, PREG_SPLIT_NO_EMPTY);
    
    $whereClauses = ["p.activo = 1"];
    $params = [];
    
    $searchORs = [];
    $searchORs[] = "MATCH(p.nombre, p.descripcion, p.modelo, p.sku, p.etiquetas) AGAINST(? IN NATURAL LANGUAGE MODE)";
    $params[] = $busqueda;
    
    foreach($searchTokens as $token) {
        if (strlen($token) > 2) {
            $tokenQuery = "(p.nombre LIKE ? OR p.descripcion LIKE ? OR p.modelo LIKE ? OR p.sku LIKE ? OR p.etiquetas LIKE ? OR c.nombre LIKE ? OR m.nombre LIKE ?)";
            $searchORs[] = $tokenQuery;
            
            $stem = $token;
            if (str_ends_with($token, 's')) {
                 $stem = rtrim($token, 's');
            }
            
            $term = "%$stem%";
            $params[] = $term; $params[] = $term; $params[] = $term; $params[] = $term; $params[] = $term; $params[] = $term; $params[] = $term;
        }
    }
    
    $whereSql = "WHERE " . implode(" AND ", $whereClauses) . " AND (" . implode(" OR ", $searchORs) . ")";
    
    $sql = "SELECT p.nombre, p.id, c.nombre as cat_nombre FROM productos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id 
            LEFT JOIN marcas m ON p.marca_id = m.id
            $whereSql";
    
    echo "SQL: $sql\n";
    echo "PARAMS: " . json_encode($params) . "\n\n";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "RESULT COUNT: " . count($results) . "\n";
    foreach($results as $r) {
        echo "- " . $r['nombre'] . " (" . $r['cat_nombre'] . ")\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
