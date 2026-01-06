<?php
require_once 'backend/config/conexion.php';
try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "PRODUCTS LIKE %mando%:\n";
    $stmt = $db->query("SELECT id, nombre, categoria_id FROM productos WHERE nombre LIKE '%mando%'");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

    echo "\nCATEGORIES LIKE %mando%:\n";
    $stmt = $db->query("SELECT id, nombre FROM categorias WHERE nombre LIKE '%mando%'");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
