<?php
require_once __DIR__ . '/config/conexion.php';

function describeTable($db, $tableName) {
    echo "Estructura de $tableName:\n";
    try {
        $columns = $db->query("DESCRIBE $tableName")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($columns as $col) {
            echo " - {$col['Field']} ({$col['Type']})\n";
        }
    } catch (Exception $e) {
        echo "Error al describir $tableName: " . $e->getMessage() . "\n";
    }
    echo "\n";
}

describeTable($db, 'usuarios');
describeTable($db, 'pedidos');
?>
