<?php
require_once 'backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "--- VARIACIONES TABLE STRUCTURE ---\n";
    $stmt = $db->query("DESCRIBE variaciones");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $col) {
        echo $col['Field'] . " | " . $col['Type'] . "\n";
    }
    
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
