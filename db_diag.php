<?php
require_once 'backend/config/conexion.php';
try {
    $database = new Database();
    $db = $database->getConnection();
    $stmt = $db->query("DESCRIBE productos");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "COLUMNS IN productos:\n";
    print_r($columns);
    
    $stmt = $db->query("SHOW INDEX FROM productos");
    $indexes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "\nINDEXES IN productos:\n";
    print_r($indexes);

    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "\nTABLES IN DATABASE:\n";
    print_r($tables);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
