<?php
require_once __DIR__ . '/config/conexion.php';

try {
    echo "Actualizando estructura de la tabla pedidos...\n";
    
    // Update ENUM definition to include new statuses and keep legacy ones
    $sql = "ALTER TABLE pedidos MODIFY COLUMN estado ENUM('Pendiente', 'Pagado', 'En Preparación', 'Enviado', 'Entregado', 'Cancelado', 'Devuelto', 'En proceso', 'Completado') DEFAULT 'Pendiente'";
    $db->exec($sql);
    
    echo "¡Éxito! La columna 'estado' ha sido actualizada con los nuevos valores.\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
