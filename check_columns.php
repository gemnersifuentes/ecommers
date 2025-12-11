<?php
require_once __DIR__ . '/backend/config/conexion.php';

try {
    $db = (new Database())->getConnection();
    
    echo "=== COLUMNAS TABLA PRODUCTOS ===\n";
    $stm = $db->query("DESCRIBE productos");
    $cols = $stm->fetchAll(PDO::FETCH_COLUMN);
    print_r($cols);

    echo "\n=== TABLAS DISPONIBLES ===\n";
    $stm = $db->query("SHOW TABLES");
    $tables = $stm->fetchAll(PDO::FETCH_COLUMN);
    print_r($tables);

    if (in_array('detalle_pedido', $tables)) {
         echo "\n=== COLUMNAS DETALLE_PEDIDO ===\n";
         $stm = $db->query("DESCRIBE detalle_pedido");
         print_r($stm->fetchAll(PDO::FETCH_COLUMN));
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
