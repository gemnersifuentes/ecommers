<?php
require_once __DIR__ . '/backend/config/conexion.php';
$db = (new Database())->getConnection();

try {
    // Agregar columna atributo_valor_id si no existe
    $db->exec("ALTER TABLE producto_variantes ADD COLUMN atributo_valor_id INT NULL AFTER producto_id");
    echo "Columna atributo_valor_id agregada con éxito.\n";
} catch (Exception $e) {
    echo "Error (puede que ya exista): " . $e->getMessage() . "\n";
}
?>
