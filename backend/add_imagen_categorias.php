<?php
// Script para agregar columna imagen a la tabla categorias
require_once 'config/conexion.php';

try {
    $db = $database->getConnection();
    
    // Verificar si la columna ya existe
    $stmt = $db->query("SHOW COLUMNS FROM categorias LIKE 'imagen'");
    $exists = $stmt->fetch();
    
    if (!$exists) {
        echo "Agregando columna 'imagen' a la tabla categorias...\n";
        $db->exec("ALTER TABLE categorias ADD COLUMN imagen VARCHAR(500) NULL AFTER descripcion");
        echo "✓ Columna 'imagen' agregada exitosamente.\n";
    } else {
        echo "✓ La columna 'imagen' ya existe en la tabla categorias.\n";
    }
    
    // Mostrar estructura actual
    echo "\nEstructura actual de la tabla categorias:\n";
    $stmt = $db->query("DESCRIBE categorias");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "  - {$row['Field']} ({$row['Type']})\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
