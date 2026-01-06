<?php
require_once __DIR__ . '/backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();

try {
    $db->exec("ALTER TABLE detalle_pedido ADD COLUMN precio_regular DECIMAL(10, 2) AFTER variacion_id");
    echo "¡Éxito! Columna 'precio_regular' añadida a 'detalle_pedido'.\n";
    
    // Opcionalmente, inicializar con el subtotal/cantidad actual para pedidos existentes
    $db->exec("UPDATE detalle_pedido SET precio_regular = (subtotal / cantidad) WHERE precio_regular IS NULL OR precio_regular = 0");
    echo "Inicializados precios regulares para pedidos existentes.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
