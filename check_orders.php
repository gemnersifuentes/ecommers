<?php
require_once 'backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "--- RECENT ORDERS ---\n";
    $stmt = $db->query("SELECT id, metodo_envio, estado FROM pedidos ORDER BY id DESC LIMIT 5");
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($orders as $o) {
        echo "ID: " . $o['id'] . " | Metodo: [" . $o['metodo_envio'] . "] | Estado: " . $o['estado'] . "\n";
    }
    
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
