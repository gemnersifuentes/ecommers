<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $db = new PDO(
        "mysql:host=localhost;dbname=db_tienda_redhard",
        "root",
        ""
    );
    $db->exec("set names utf8mb4");
    
    // Verificar estructura de la tabla productos
    $stmt = $db->query("DESCRIBE productos");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Obtener un producto de ejemplo
    $stmt = $db->query("SELECT * FROM productos LIMIT 1");
    $sample = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'columns' => $columns,
        'sample_product' => $sample
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
