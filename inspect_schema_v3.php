<?php
require_once 'backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();

function describe($db, $table) {
    echo "\n--- Table: $table ---\n";
    try {
        $stmt = $db->query("DESCRIBE $table");
        print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}

describe($db, 'detalle_pedido');
describe($db, 'pedidos');
?>
