<?php
// Test script for categories API
require_once 'backend/config/conexion.php';

echo "Testing Database Connection...\n";
try {
    $db = $database->getConnection();
    echo "Connection successful.\n";
    
    echo "Querying categories...\n";
    $sql = "SELECT id, nombre, descripcion, imagen FROM categorias WHERE activo = 1 ORDER BY nombre ASC";
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($categorias) . " active categories.\n";
    print_r($categorias);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
