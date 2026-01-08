<?php
// Script para asegurar que existe la columna logo en la tabla marcas y crear el directorio de subida
require_once 'config/conexion.php';

$database = new Database();
$db = $database->getConnection();

try {
    // 1. Verificar si la columna ya existe
    $stmt = $db->query("SHOW COLUMNS FROM marcas LIKE 'logo'");
    $exists = $stmt->fetch();
    
    if (!$exists) {
        echo "Agregando columna 'logo' a la tabla marcas...\n";
        $db->exec("ALTER TABLE marcas ADD COLUMN logo VARCHAR(255) NULL AFTER descripcion");
        echo "✓ Columna 'logo' agregada exitosamente.\n";
    } else {
        echo "✓ La columna 'logo' ya existe en la tabla marcas.\n";
    }
    
    // 2. Crear el directorio de subidas si no existe
    $uploadDir = __DIR__ . '/uploads/marcas/';
    if (!file_exists($uploadDir)) {
        if (mkdir($uploadDir, 0777, true)) {
            echo "✓ Directorio 'uploads/marcas/' creado exitosamente.\n";
        } else {
            echo "✗ Error al crear el directorio 'uploads/marcas/'.\n";
        }
    } else {
        echo "✓ El directorio 'uploads/marcas/' ya existe.\n";
    }
    
    // 3. Mostrar estructura actual
    echo "\nEstructura actual de la tabla marcas:\n";
    $stmt = $db->query("DESCRIBE marcas");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "  - {$row['Field']} ({$row['Type']})\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
