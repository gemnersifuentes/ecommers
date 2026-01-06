<?php
require_once 'backend/config/conexion.php';
try {
    $database = new Database();
    $db = $database->getConnection();
    
    $busqueda = 'mandoss';
    $searchLower = mb_strtolower(trim($busqueda));
    $searchTokens = preg_split('/\s+/', $searchLower, -1, PREG_SPLIT_NO_EMPTY);
    
    $whereParams = [];
    $searchORs = ["MATCH(p.nombre, p.descripcion, p.modelo, p.sku, p.etiquetas) AGAINST(? IN NATURAL LANGUAGE MODE)"];
    $whereParams[] = $busqueda;
    foreach($searchTokens as $token) {
        if (strlen($token) > 2) {
            $stem = str_ends_with($token, 's') ? rtrim($token, 's') : $token;
            $searchORs[] = "(p.nombre LIKE ? OR p.descripcion LIKE ? OR p.modelo LIKE ? OR p.sku LIKE ? OR p.etiquetas LIKE ? OR c.nombre LIKE ? OR m.nombre LIKE ?)";
            $term = "%$stem%";
            for($i=0;$i<7;$i++) $whereParams[] = $term;
        }
    }
    $whereSql = "WHERE p.activo = 1 AND (" . implode(" OR ", $searchORs) . ")";
    
    // SCORE
    $orderParams = [];
    $scoreSql = "(MATCH(p.nombre, p.descripcion, p.modelo, p.sku, p.etiquetas) AGAINST(? IN NATURAL LANGUAGE MODE) * 20)";
    $orderParams[] = $busqueda;
    
    $scoreSql .= " + (CASE WHEN p.nombre LIKE ? THEN 10000 ELSE 0 END)";
    $orderParams[] = "%$busqueda%";
    
    $scoreSql .= " + (CASE WHEN p.nombre LIKE ? THEN 5000 ELSE 0 END)";
    $orderParams[] = "$busqueda%";

    foreach ($searchTokens as $termToken) {
        if (strlen($termToken) > 2) {
            $stemToken = str_ends_with($termToken, 's') ? rtrim($termToken, 's') : $termToken;
            $scoreSql .= " + (CASE WHEN p.nombre LIKE ? THEN 600 ELSE 0 END)";
            $orderParams[] = "%$stemToken%";
            $scoreSql .= " + (CASE WHEN p.sku LIKE ? OR p.modelo LIKE ? THEN 800 ELSE 0 END)";
            $orderParams[] = "%$stemToken%"; $orderParams[] = "%$stemToken%";
            $scoreSql .= " + (CASE WHEN c.nombre LIKE ? THEN 300 ELSE 0 END)";
            $orderParams[] = "%$stemToken%";
            $scoreSql .= " + (CASE WHEN m.nombre LIKE ? THEN 300 ELSE 0 END)";
            $orderParams[] = "%$stemToken%";
        }
    }

    $mainTerm = $searchTokens[0];
    $mainStem = str_ends_with($mainTerm, 's') ? rtrim($mainTerm, 's') : $mainTerm;
    $scoreSql .= " - (CASE WHEN p.nombre NOT LIKE ? AND p.descripcion NOT LIKE ? AND c.nombre LIKE ? AND c.nombre NOT LIKE ? THEN 2500 ELSE 0 END)";
    $orderParams[] = "%$mainStem%";
    $orderParams[] = "%$mainStem%";
    $orderParams[] = "%$mainStem%";
    $orderParams[] = "%$mainStem%";

    $allParams = array_merge($whereParams, $orderParams);
    
    $sql = "SELECT p.nombre, ($scoreSql) as total_score, c.nombre as cat_nombre
            FROM productos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id 
            LEFT JOIN marcas m ON p.marca_id = m.id
            $whereSql
            ORDER BY total_score DESC";
            
    $stmt = $db->prepare($sql);
    $stmt->execute($allParams);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach($results as $r) {
        echo "SCORE: " . str_pad($r['total_score'], 8) . " | NAME: " . $r['nombre'] . " (CAT: " . $r['cat_nombre'] . ")\n";
    }

} catch (Exception $e) { echo "Error: " . $e->getMessage(); }
