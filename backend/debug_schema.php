<?php
require_once __DIR__ . '/config/conexion.php';

$tables = ['producto_variantes', 'variante_atributo_valor', 'atributo_valores', 'atributos'];

foreach ($tables as $table) {
    echo "Table: $table\n";
    try {
        $stmt = $db->query("DESCRIBE $table");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($columns as $col) {
            echo " - " . $col['Field'] . " (" . $col['Type'] . ")\n";
        }
    } catch (Exception $e) {
        echo " - Error: " . $e->getMessage() . "\n";
    }
    echo "\n";
}
