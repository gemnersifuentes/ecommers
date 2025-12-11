<?php
// Migración: Agregar campo imagen a producto_variantes
require_once 'backend/config/conexion.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Verificar si la columna ya existe
    $stmt = $db->query("SHOW COLUMNS FROM producto_variantes LIKE 'imagen'");
    $exists = $stmt->fetch();
    
    if ($exists) {
        echo "La columna 'imagen' ya existe en producto_variantes.\n";
    } else {
        // Agregar la columna
        $sql = "ALTER TABLE producto_variantes ADD COLUMN imagen VARCHAR(255) NULL AFTER sku";
        $db->exec($sql);
        echo "✓ Columna 'imagen' agregada exitosamente a producto_variantes.\n";
    }
    
    // Verificar la estructura actualizada
    echo "\nEstructura actualizada de producto_variantes:\n";
    $stmt = $db->query('DESCRIBE producto_variantes');
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "  - {$row['Field']} ({$row['Type']})\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
