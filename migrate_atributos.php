<?php
require_once __DIR__ . '/backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "Ejecutando migración de atributos...\n\n";
    
    $sql = file_get_contents(__DIR__ . '/backend/sql/migracion_atributos_v2.sql');
    
    // Ejecutar cada statement
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    foreach ($statements as $stmt) {
        if (empty($stmt) || str_starts_with($stmt, '--')) continue;
        
        try {
            $db->exec($stmt);
            echo "✓ Ejecutado: " . substr($stmt, 0, 60) . "...\n";
        } catch (Exception $e) {
            echo "✗ Error: " . $e->getMessage() . "\n";
            echo "  SQL: " . substr($stmt, 0, 100) . "...\n";
        }
    }
    
    echo "\n=== VERIFICANDO TABLAS CREADAS ===\n";
    $tables = ['atributos', 'atributo_valores', 'producto_variantes', 'variante_valores'];
    foreach ($tables as $table) {
        $stmt = $db->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "✓ Tabla $table existe\n";
            $count = $db->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
            echo "  Registros: $count\n";
        } else {
            echo "✗ Tabla $table NO existe\n";
        }
    }
    
    echo "\nMigración completada!\n";
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
