<?php
require_once __DIR__ . '/config/conexion.php';

try {
    $db->exec("SET FOREIGN_KEY_CHECKS=0");
    
    // Agregar columnas una por una para mejor control de errores
    $columns = [
        "ADD COLUMN meta_titulo VARCHAR(255) NULL" => "meta_titulo",
        "ADD COLUMN meta_descripcion TEXT NULL" => "meta_descripcion",
        "ADD COLUMN palabras_clave TEXT NULL" => "palabras_clave",
        "ADD COLUMN slug VARCHAR(255) NULL" => "slug",
        "ADD COLUMN destacado TINYINT(1) DEFAULT 0" => "destacado",
        "ADD COLUMN nuevo TINYINT(1) DEFAULT 0" => "nuevo",
        "ADD COLUMN etiquetas TEXT NULL" => "etiquetas",
        "ADD COLUMN sku VARCHAR(100) NULL" => "sku",
        "ADD COLUMN peso DECIMAL(10,2) NULL" => "peso",
        "ADD COLUMN largo DECIMAL(10,2) NULL" => "largo",
        "ADD COLUMN ancho DECIMAL(10,2) NULL" => "ancho",
        "ADD COLUMN alto DECIMAL(10,2) NULL" => "alto",
        "ADD COLUMN envio_gratis TINYINT(1) DEFAULT 0" => "envio_gratis",
        "ADD COLUMN stock_minimo INT(11) DEFAULT 5" => "stock_minimo",
        "ADD COLUMN condicion ENUM('nuevo', 'usado', 'reacondicionado') DEFAULT 'nuevo'" => "condicion",
        "ADD COLUMN garantia_meses INT(11) DEFAULT 12" => "garantia_meses",
        "ADD COLUMN marca_fabricante VARCHAR(200) NULL" => "marca_fabricante",
        "ADD COLUMN modelo VARCHAR(200) NULL" => "modelo",
        "ADD COLUMN video_url VARCHAR(500) NULL" => "video_url",
        "ADD COLUMN politica_devolucion_dias INT(11) DEFAULT 30" => "politica_devolucion_dias"
    ];
    
    foreach ($columns as $sql => $colName) {
        try {
            $db->exec("ALTER TABLE productos $sql");
            echo "✓ Agregada columna: $colName\n";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
                echo "- La columna $colName ya existe\n";
            } else {
                echo "✗ Error en $colName: " . $e->getMessage() . "\n";
            }
        }
    }
    
    $db->exec("SET FOREIGN_KEY_CHECKS=1");
    
    echo "\n✅ Proceso completado.\n";
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
