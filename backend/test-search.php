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
    
    $query = isset($_GET['q']) ? trim($_GET['q']) : 'mouse';
    $searchTerm = "%{$query}%";
    
    $stmt = $db->prepare("SELECT id, nombre FROM productos WHERE nombre LIKE ? LIMIT 5");
    $stmt->execute([$searchTerm]);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'query' => $query,
        'products' => $products
    ]);
    
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
