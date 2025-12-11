<?php
require_once __DIR__ . '/../config/conexion.php';
$db = (new Database())->getConnection();

echo "=== BUSCANDO TODAS LAS REFERENCIAS ===\n";

$tables = ['producto_atributos', 'variaciones'];

foreach ($tables as $table) {
    echo "\nReferencias a '$table':\n";
    $stmt = $db->prepare("
        SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = 'db_tienda_redhard' 
        AND REFERENCED_TABLE_NAME = ?
    ");
    $stmt->execute([$table]);
    $refs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($refs) > 0) {
        foreach ($refs as $ref) {
            echo " - Tabla: {$ref['TABLE_NAME']} | Columna: {$ref['COLUMN_NAME']} | Constraint: {$ref['CONSTRAINT_NAME']}\n";
        }
    } else {
        echo " - Ninguna encontrada.\n";
    }
}
?>
