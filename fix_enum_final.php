<?php
require_once 'backend/config/conexion.php';

try {
    $db = (new Database())->getConnection();
    
    // Add 'Listo para recoger' to valid ENUM values
    $sql = "ALTER TABLE pedidos MODIFY COLUMN estado ENUM('Pendiente', 'Pagado', 'En proceso', 'En Preparación', 'Enviado', 'Entregado', 'Completado', 'Cancelado', 'Devuelto', 'Listo para recoger') NOT NULL DEFAULT 'Pendiente'";
    
    $db->exec($sql);
    echo "ENUM Updated Successfully. 'Listo para recoger' is now valid.\n";
    
} catch(PDOException $e) {
    echo "Error updating ENUM: " . $e->getMessage();
}
?>
