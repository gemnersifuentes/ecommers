<?php
require_once 'backend/config/conexion.php';
try {
    $database = new Database();
    $db = $database->getConnection();
    $stmt = $db->query("SHOW INDEX FROM productos");
    $indexes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach($indexes as $idx) {
        echo "IDX: " . $idx['Key_name'] . " ON " . $idx['Column_name'] . " (" . $idx['Index_type'] . ")\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
