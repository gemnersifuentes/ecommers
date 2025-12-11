<?php
require_once __DIR__ . '/backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "=== TABLAS EN LA BASE DE DATOS ===\n";
    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($tables as $table) {
        echo "- $table\n";
    }
    
    echo "\n=== BUSCANDO TABLAS RELACIONADAS CON ATRIBUTOS ===\n";
    foreach ($tables as $table) {
        if (stripos($table, 'atribut') !== false || stripos($table, 'variant') !== false || stripos($table, 'variacion') !== false) {
            echo "\nTabla: $table\n";
            $stmt = $db->query("DESCRIBE `$table`");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($columns as $col) {
                echo "  - {$col['Field']} ({$col['Type']})\n";
            }
        }
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
