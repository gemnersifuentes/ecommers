<?php
require_once 'backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "--- LATEST 5 ORDERS ---\n";
    $stmt = $db->query("SELECT id, metodo_envio, estado FROM pedidos ORDER BY id DESC LIMIT 5");
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($orders as $o) {
        echo "ID: " . $o['id'] . " | Metodo: '" . $o['metodo_envio'] . "' | Estado: " . $o['estado'] . "\n";
    }

    echo "\n--- ESTADO COLUMN DEFINITION ---\n";
    $stmt = $db->query("SHOW COLUMNS FROM pedidos LIKE 'estado'");
    $col = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Type: " . $col['Type'] . "\n";
    
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
