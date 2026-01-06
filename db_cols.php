<?php
require_once 'backend/config/conexion.php';
try {
    $database = new Database();
    $db = $database->getConnection();
    $stmt = $db->query("DESCRIBE productos");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach($columns as $col) {
        echo "COL: " . $col['Field'] . " (" . $col['Type'] . ")\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
