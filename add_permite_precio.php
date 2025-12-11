<?php
require_once __DIR__ . '/backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "=== AGREGANDO CAMPO permite_precio ===\n\n";
    
    // 1. Agregar columna permite_precio
    $db->exec("ALTER TABLE atributos ADD COLUMN permite_precio TINYINT(1) DEFAULT 0 AFTER nombre");
    echo "✓ Columna permite_precio agregada\n";
    
    // 2. Marcar los atributos que permiten precio
    // Almacenamiento y Memoria RAM SÍ permiten precio
    // Color y Talla NO permiten precio
    $db->exec("UPDATE atributos SET permite_precio = 1 WHERE nombre IN ('Almacenamiento', 'Memoria RAM')");
    echo "✓ Almacenamiento y Memoria RAM marcados con permite_precio=1\n";
    
    $db->exec("UPDATE atributos SET permite_precio = 0 WHERE nombre IN ('Color', 'Talla')");
    echo "✓ Color y Talla marcados con permite_precio=0\n";
    
    // 3. Verificar
    echo "\n=== VERIFICACIÓN ===\n";
    $stmt = $db->query("SELECT id, nombre, permite_precio FROM atributos");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $permiso = $row['permite_precio'] == 1 ? 'SÍ permite precio' : 'NO permite precio (solo stock)';
        echo "{$row['nombre']}: $permiso\n";
    }
    
    echo "\n✅ Configuración completada!\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
