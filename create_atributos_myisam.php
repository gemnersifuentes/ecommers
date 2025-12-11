<?php
require_once __DIR__ . '/backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "=== CREANDO TABLAS DE ATRIBUTOS (MyISAM) ===\n\n";
    
    // Usar MyISAM para evitar problemas con InnoDB
    $queries = [
        "DROP TABLE IF EXISTS variante_valores",
        "DROP TABLE IF EXISTS producto_variantes",
        "DROP TABLE IF EXISTS atributo_valores",
        "DROP TABLE IF EXISTS atributos",
        
        "CREATE TABLE atributos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(50) NOT NULL,
            activo TINYINT(1) DEFAULT 1
        ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4",
        
        "CREATE TABLE atributo_valores (
            id INT AUTO_INCREMENT PRIMARY KEY,
            atributo_id INT NOT NULL,
            valor VARCHAR(50) NOT NULL,
            color_hex VARCHAR(20) DEFAULT NULL,
            activo TINYINT(1) DEFAULT 1,
            INDEX (atributo_id)
        ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4",
       
        "CREATE TABLE producto_variantes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            producto_id INT NOT NULL,
            precio DECIMAL(10, 2) DEFAULT NULL,
            stock INT DEFAULT 0,
            sku VARCHAR(50) DEFAULT NULL,
            activo TINYINT(1) DEFAULT 1,
            INDEX (producto_id)
        ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4",
        
        "CREATE TABLE variante_valores (
            id INT AUTO_INCREMENT PRIMARY KEY,
            variante_id INT NOT NULL,
            atributo_valor_id INT NOT NULL,
            INDEX (variante_id),
            INDEX (atributo_valor_id)
        ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4",
        
        "INSERT INTO atributos (nombre) VALUES ('Color'), ('Almacenamiento'), ('Talla'), ('Memoria RAM')"
    ];
    
    foreach ($queries as $i => $query) {
        try {
            $db->exec($query);
            $preview = substr($query, 0, 50);
            echo "✓ [" . ($i+1) . "] $preview...\n";
        } catch (Exception $e) {
            echo "✗ [" . ($i+1) . "] ERROR: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n=== VERIFICACIÓN ===\n";
    $tables = ['atributos', 'atributo_valores', 'producto_variantes', 'variante_valores'];
    foreach ($tables as $table) {
        try {
            $count = $db->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
            echo "✓ $table: $count registros\n";
        } catch (Exception $e) {
            echo "✗ $table: NO EXISTE\n";
        }
    }
    
    echo "\n✅ ¡Migración completada!\n";
    
} catch (Exception $e) {
    echo "\n❌ ERROR FATAL: " . $e->getMessage() . "\n";
}
