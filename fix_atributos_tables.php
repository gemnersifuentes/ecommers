<?php
require_once __DIR__ . '/backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "=== REPARANDO TABLAS DE ATRIBUTOS ===\n\n";
    
    // Paso 1: Forzar DROP de tablas corruptas
    echo "Paso 1: Eliminando tablas corruptas...\n";
    $dropTables = [
        'variante_valores',
        'producto_variantes', 
        'atributo_valores',
        'atributos'
    ];
    
    foreach ($dropTables as $table) {
        try {
            // Intentar DROP normal
            $db->exec("DROP TABLE IF EXISTS `$table`");
            echo "  ✓ Eliminado: $table\n";
        } catch (Exception $e) {
            // Si falla, forzar con DROP TABLE sin IF EXISTS
            try {
                $db->exec("DROP TABLE `$table`");
                echo "  ✓ Eliminado forzado: $table\n";
            } catch (Exception $e2) {
                echo "  ⚠ No se pudo eliminar $table: " . $e2->getMessage() . "\n";
            }
        }
    }
    
    echo "\nPaso 2: Creando tablas nuevas...\n";
    
    // Crear tabla atributos
    $sql_atributos = "CREATE TABLE `atributos` (
        `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        `nombre` VARCHAR(50) NOT NULL,
        `activo` TINYINT(1) DEFAULT 1
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4";
    
    $db->exec($sql_atributos);
    echo "  ✓ Tabla atributos creada\n";
    
    // Crear tabla atributo_valores
    $sql_valores = "CREATE TABLE `atributo_valores` (
        `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        `atributo_id` INT NOT NULL,
        `valor` VARCHAR(50) NOT NULL,
        `color_hex` VARCHAR(20) DEFAULT NULL,
        `activo` TINYINT(1) DEFAULT 1,
        INDEX `idx_atributo` (`atributo_id`)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4";
    
    $db->exec($sql_valores);
    echo "  ✓ Tabla atributo_valores creada\n";
    
    // Crear tabla producto_variantes
    $sql_variantes = "CREATE TABLE `producto_variantes` (
        `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        `producto_id` INT NOT NULL,
        `precio` DECIMAL(10, 2) DEFAULT NULL,
        `stock` INT DEFAULT 0,
        `sku` VARCHAR(50) DEFAULT NULL,
        `activo` TINYINT(1) DEFAULT 1,
        INDEX `idx_producto` (`producto_id`)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4";
    
    $db->exec($sql_variantes);
    echo "  ✓ Tabla producto_variantes creada\n";
    
    // Crear tabla variante_valores
    $sql_variante_valores = "CREATE TABLE `variante_valores` (
        `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        `variante_id` INT NOT NULL,
        `atributo_valor_id` INT NOT NULL,
        INDEX `idx_variante` (`variante_id`),
        INDEX `idx_valor` (`atributo_valor_id`)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4";
    
    $db->exec($sql_variante_valores);
    echo "  ✓ Tabla variante_valores creada\n";
    
    echo "\nPaso 3: Insertando datos iniciales...\n";
    
    // Insertar atributos base
    $sql_insert = "INSERT INTO `atributos` (`nombre`, `activo`) VALUES 
        ('Color', 1),
        ('Almacenamiento', 1),
        ('Memoria RAM', 1),
        ('Talla', 1)";
    
    $db->exec($sql_insert);
    echo "  ✓ Atributos base insertados\n";
    
    // Insertar algunos valores de ejemplo para Color
    $sql_colores = "INSERT INTO `atributo_valores` (`atributo_id`, `valor`, `color_hex`, `activo`) VALUES 
        (1, 'Rojo', '#FF0000', 1),
        (1, 'Azul', '#0000FF', 1),
        (1, 'Negro', '#000000', 1),
        (1, 'Blanco', '#FFFFFF', 1),
        (1, 'Verde', '#00FF00', 1)";
    
    $db->exec($sql_colores);
    echo "  ✓ Valores de Color insertados\n";
    
    // Valores para Almacenamiento
    $sql_storage = "INSERT INTO `atributo_valores` (`atributo_id`, `valor`, `activo`) VALUES 
        (2, '64GB', 1),
        (2, '128GB', 1),
        (2, '256GB', 1),
        (2, '512GB', 1),
        (2, '1TB', 1)";
    
    $db->exec($sql_storage);
    echo "  ✓ Valores de Almacenamiento insertados\n";
    
    // Valores para Memoria RAM
    $sql_ram = "INSERT INTO `atributo_valores` (`atributo_id`, `valor`, `activo`) VALUES 
        (3, '4GB', 1),
        (3, '8GB', 1),
        (3, '16GB', 1),
        (3, '32GB', 1)";
    
    $db->exec($sql_ram);
    echo "  ✓ Valores de Memoria RAM insertados\n";
    
    echo "\n=== VERIFICACIÓN FINAL ===\n";
    $tables = ['atributos', 'atributo_valores', 'producto_variantes', 'variante_valores'];
    foreach ($tables as $table) {
        $count = $db->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
        echo "✓ $table: $count registros\n";
    }
    
    echo "\n✅ ¡REPARACIÓN COMPLETADA EXITOSAMENTE!\n";
    echo "\nAhora puedes:\n";
    echo "1. Refrescar phpMyAdmin\n";
    echo "2. Intentar editar un producto nuevamente\n";
    
} catch (Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
