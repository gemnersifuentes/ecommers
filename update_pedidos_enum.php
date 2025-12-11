<?php
require_once 'backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "Updating 'estado' ENUM in 'pedidos' table...\n";
    
    // Add 'Listo para recoger' to the enum list
    $query = "ALTER TABLE pedidos MODIFY COLUMN estado ENUM('Pendiente','Pagado','En Preparación','Enviado','Entregado','Cancelado','Devuelto','En proceso','Completado','Listo para recoger')";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    echo "Successfully updated 'estado' column.\n";
    
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
