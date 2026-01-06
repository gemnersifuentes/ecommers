<?php
require_once 'backend/config/conexion.php';
try {
    $database = new Database();
    $db = $database->getConnection();
    $busqueda = 'laptop';
    $tokens = explode(' ', $busqueda);
    $booleanTerms = [];
    foreach($tokens as $token) {
        $booleanTerms[] = '+' . $token . '*';
    }
    $booleanQuery = implode(' ', $booleanTerms);
    
    echo "SEARCHING FOR: $busqueda\n";
    echo "BOOLEAN QUERY: $booleanQuery\n\n";
    
    $sql = "SELECT p.nombre, p.descripcion, c.nombre as cat_nombre,
            (MATCH(p.nombre, p.descripcion, p.modelo, p.sku, p.etiquetas) AGAINST(? IN NATURAL LANGUAGE MODE) * 20) as score
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE (
                MATCH(p.nombre, p.descripcion, p.modelo, p.sku, p.etiquetas) AGAINST(? IN BOOLEAN MODE)
                OR p.nombre LIKE ?
                OR p.sku LIKE ?
                OR p.modelo LIKE ?
                OR (c.nombre LIKE ? AND p.nombre LIKE ?)
            )
            LIMIT 20";
            
    $stmt = $db->prepare($sql);
    $stmt->execute([$busqueda, $booleanQuery, "%$busqueda%", "%$busqueda%", "%$busqueda%", "%$busqueda%", "%" . $tokens[0] . "%"]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "COUNT: " . count($results) . "\n\n";
    foreach($results as $r) {
        echo "NAME: " . $r['nombre'] . " (CAT: " . $r['cat_nombre'] . ")\n";
        echo "SCORE: " . $r['score'] . "\n";
        echo "---------------------------------\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
