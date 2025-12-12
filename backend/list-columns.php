<?php
header('Content-Type: text/plain');
header('Access-Control-Allow-Origin: *');

try {
    $db = new PDO(
        "mysql:host=localhost;dbname=db_tienda_redhard",
        "root",
        ""
    );
    
    $stmt = $db->query("SHOW COLUMNS FROM productos");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Columnas en tabla productos:\n";
    foreach ($columns as $col) {
        echo "- $col\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
