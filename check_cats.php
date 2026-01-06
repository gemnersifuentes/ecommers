<?php
require_once 'backend/config/conexion.php';
try {
    $database = new Database();
    $db = $database->getConnection();
    $stmt = $db->query("SELECT id, nombre FROM categorias");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    
    $stmt = $db->query("SELECT p.id, p.nombre, c.nombre as cat_nombre FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id LIMIT 20");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
