<?php
require_once __DIR__ . '/config/conexion.php';

try {
    $sql = file_get_contents(__DIR__ . '/sql/add_extended_product_fields.sql');
    
    // Execute multi-query
    $db->exec($sql);
    
    echo "✅ Migration executed successfully!\n";
    echo "Added 26 new fields to productos table.\n";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
