<?php
require_once 'backend/config/conexion.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Drop the foreign key constraint
    $sql = "ALTER TABLE detalle_pedido DROP FOREIGN KEY detalle_pedido_ibfk_3";
    $conn->exec($sql);
    
    echo "Foreign key constraint on variacion_id dropped successfully.\n";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
