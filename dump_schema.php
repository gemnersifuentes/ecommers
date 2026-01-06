<?php
require_once __DIR__ . '/backend/config/conexion.php';
$pdo = $database->getConnection();

function dumpTable($pdo, $name) {
    echo "\nStructure of $name:\n";
    try {
        $stmt = $pdo->query("DESCRIBE $name");
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "  " . $row['Field'] . " " . $row['Type'] . "\n";
        }
    } catch (Exception $e) {
        echo "  Error: " . $e->getMessage() . "\n";
    }
}

dumpTable($pdo, 'pedidos');
dumpTable($pdo, 'usuarios');
dumpTable($pdo, 'detalle_pedido');
dumpTable($pdo, 'reportes');
