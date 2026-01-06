<?php
require_once 'backend/config/conexion.php';
try {
    $database = new Database();
    $db = $database->getConnection();
    $busqueda = 'laptop';
    $tokens = explode(' ', $busqueda);
    
    echo "SEARCHING FOR: $busqueda\n\n";
    
    $sql = "SELECT p.nombre, p.descripcion, p.modelo, p.sku, p.etiquetas,
            MATCH(p.nombre, p.descripcion, p.modelo, p.sku, p.etiquetas) AGAINST(? IN NATURAL LANGUAGE MODE) as score
            FROM productos p
            WHERE MATCH(p.nombre, p.descripcion, p.modelo, p.sku, p.etiquetas) AGAINST(? IN NATURAL LANGUAGE MODE)
            OR p.nombre LIKE ?
            LIMIT 10";
            
    $stmt = $db->prepare($sql);
    $stmt->execute([$busqueda, $busqueda, "%$busqueda%"]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach($results as $r) {
        echo "NAME: " . $r['nombre'] . "\n";
        echo "SCORE: " . $r['score'] . "\n";
        echo "DESC: " . substr($r['descripcion'], 0, 100) . "...\n";
        echo "MODELO: " . $r['modelo'] . "\n";
        echo "SKU: " . $r['sku'] . "\n";
        echo "ETIQUETAS: " . $r['etiquetas'] . "\n";
        echo "---------------------------------\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
