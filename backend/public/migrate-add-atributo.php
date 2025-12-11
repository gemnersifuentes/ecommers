<?php
require_once __DIR__ . '/../config/conexion.php';

$db = (new Database())->getConnection();

echo "Ejecutando migración: agregar atributo_id a detalle_pedido\n";
echo "============================================================\n\n";

try {
    // Verificar si la columna ya existe
    $stmt = $db->query("SHOW COLUMNS FROM detalle_pedido LIKE 'atributo_id'");
    if ($stmt->rowCount() > 0) {
        echo "⚠️  La columna 'atributo_id' ya existe.\n";
        exit(0);
    }
    
    // Agregar columna
    $db->exec("
        ALTER TABLE detalle_pedido 
        ADD COLUMN atributo_id INT NULL AFTER variacion_id
    ");
    echo "✅ Columna 'atributo_id' agregada\n";
    
    // Agregar foreign key
    $db->exec("
        ALTER TABLE detalle_pedido
        ADD CONSTRAINT fk_detalle_atributo 
            FOREIGN KEY (atributo_id) 
            REFERENCES producto_atributos(id) 
            ON DELETE SET NULL
    ");
    echo "✅ Foreign key agregada\n";
    
    // Agregar índice
    $db->exec("
        CREATE INDEX idx_detalle_atributo ON detalle_pedido(atributo_id)
    ");
    echo "✅ Índice creado\n";
    
    echo "\n🎉 Migración completada exitosamente\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
