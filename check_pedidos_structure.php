<?php
require_once 'backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "--- STRUCTURE OF PEDIDOS ---\n";
    $stmt = $db->query("DESCRIBE pedidos");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $col) {
        echo $col['Field'] . " (" . $col['Type'] . ")\n";
    }

    echo "\n--- STRUCTURE OF DETALLE_PEDIDO ---\n";
    $stmt = $db->query("DESCRIBE detalle_pedido");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $col) {
        echo $col['Field'] . " (" . $col['Type'] . ")\n";
    }
    
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
