<?php
// Script para ver las tablas existentes
require_once __DIR__ . '/../config/conexion.php';

try {
    $pdo = $database->getConnection();
    
    echo "→ Tablas existentes en la base de datos:\n\n";
    
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($tables as $table) {
        echo "  - $table\n";
    }
    
    echo "\n→ Buscando tabla relacionada a 'variaciones' o 'variantes'...\n\n";
    
    foreach ($tables as $table) {
        if (stripos($table, 'vari') !== false) {
            echo "✓ Encontrada: $table\n";
            
            // Mostrar estructura
            $stmt = $pdo->query("DESCRIBE `$table`");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo "  Estructura:\n";
            foreach ($columns as $col) {
                echo "    - {$col['Field']} ({$col['Type']})\n";
            }
            echo "\n";
        }
    }
    
} catch (PDOException $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
?>
