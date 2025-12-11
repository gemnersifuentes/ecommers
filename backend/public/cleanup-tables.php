<?php
// Mock REQUEST_METHOD for CLI
$_SERVER['REQUEST_METHOD'] = 'GET';

require_once __DIR__ . '/../config/conexion.php';

$db = (new Database())->getConnection();

echo "=== LIMPIEZA Y REFINAMIENTO DE ATRIBUTOS ===\n\n";

try {
    // 1. Eliminar tablas antiguas (Desactivando FK checks temporalmente)
    echo "1. Eliminando tablas obsoletas...\n";
    $db->exec("SET FOREIGN_KEY_CHECKS = 0");
    $db->exec("DROP TABLE IF EXISTS producto_atributos");
    $db->exec("DROP TABLE IF EXISTS variaciones");
    $db->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "   ✅ Tablas 'producto_atributos' y 'variaciones' eliminadas\n";

    // 2. Agregar columna permite_precio a atributos
    echo "\n2. Actualizando tabla 'atributos'...\n";
    
    // Verificar si la columna ya existe
    $stmt = $db->query("SHOW COLUMNS FROM atributos LIKE 'permite_precio'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE atributos ADD COLUMN permite_precio BOOLEAN DEFAULT 0 AFTER nombre");
        echo "   ✅ Columna 'permite_precio' agregada\n";
    } else {
        echo "   ℹ️ Columna 'permite_precio' ya existe\n";
    }

    // 3. Configurar valores por defecto
    // Almacenamiento = permite precio
    $db->exec("UPDATE atributos SET permite_precio = 1 WHERE nombre LIKE '%Almacenamiento%' OR nombre LIKE '%Capacidad%'");
    // Color = no permite precio (default 0)
    $db->exec("UPDATE atributos SET permite_precio = 0 WHERE nombre LIKE '%Color%'");
    
    echo "   ✅ Configuración de precios actualizada (Almacenamiento=SI, Color=NO)\n";

    echo "\n🎉 LIMPIEZA COMPLETADA\n";

} catch (Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>
