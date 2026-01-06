<?php
require_once __DIR__ . '/backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();

function printTableSchema($db, $tableName) {
    echo "\n--- Schema for $tableName ---\n";
    $stmt = $db->query("DESCRIBE $tableName");
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        print_r($row);
    }
}

printTableSchema($db, 'pedidos');
printTableSchema($db, 'detalle_pedido');
