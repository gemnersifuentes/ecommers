<?php
require_once 'backend/config/conexion.php';
try {
    $database = new Database();
    $db = $database->getConnection();
    echo "Adding FULLTEXT index to productos table...\n";
    $sql = "ALTER TABLE productos ADD FULLTEXT INDEX idx_search (nombre, descripcion, modelo, sku, etiquetas)";
    $db->exec($sql);
    echo "FULLTEXT index added successfully!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trying specific columns if some are missing...\n";
}
