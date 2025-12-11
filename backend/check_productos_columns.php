<?php
require_once __DIR__ . '/config/conexion.php';

try {
    $stmt = $db->query("DESCRIBE productos");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Columnas en la tabla productos:\n\n";
    foreach ($columns as $col) {
        echo "- {$col['Field']} ({$col['Type']})\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
