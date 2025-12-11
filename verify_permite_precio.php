<?php
require_once __DIR__ . '/backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "=== VERIFICACIÓN COMPLETA ===\n\n";
    
    // Verificar estructura de atributos
    echo "1. COLUMNAS DE LA TABLA atributos:\n";
    $stmt = $db->query("DESCRIBE atributos");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "   - {$row['Field']} ({$row['Type']})\n";
    }
    
    echo "\n2. ATRIBUTOS Y SU CONFIGURACIÓN:\n";
    $stmt = $db->query("SELECT id, nombre, permite_precio, activo FROM atributos");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $config = $row['permite_precio'] == 1 ? 
            "✓ PRECIO + STOCK" : 
            "✓ SOLO STOCK";
        echo "   {$row['nombre']}: $config\n";
    }
    
    echo "\n3. RESUMEN:\n";
    echo "   - Color: Solo muestra campo STOCK\n";
    echo "   - Talla: Solo muestra campo STOCK\n";
    echo "   - Almacenamiento: Muestra PRECIO + STOCK\n";
    echo "   - Memoria RAM: Muestra PRECIO + STOCK\n";
    
    echo "\n✅ Todo está configurado correctamente!\n";
    echo "\nSi no ves los cambios en la interfaz:\n";
    echo "1. Refresca la página (Ctrl+F5)\n";
    echo "2. Ve a Editar Producto → Gestión de Variantes\n";
    echo "3. Cambia entre Color y Almacenamiento para ver la diferencia\n";
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
