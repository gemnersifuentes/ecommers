<?php
require_once __DIR__ . '/backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Describe table
    $stmt = $db->query("DESCRIBE banners");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Table 'banners' structure:\n";
    foreach ($columns as $col) {
        echo "- " . $col['Field'] . " (" . $col['Type'] . ")\n";
    }

    // Check first few rows to see data format
    $stmt = $db->query("SELECT * FROM banners LIMIT 3");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "\nSample Data:\n";
    print_r($rows);

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
