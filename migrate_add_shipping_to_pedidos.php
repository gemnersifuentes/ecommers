<?php
require_once 'backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "Conectado a la base de datos.\n";
    
    // Agregar columnas a tabla pedidos
    $columns = [
        "ADD COLUMN metodo_envio VARCHAR(50) DEFAULT 'domicilio' AFTER estado",
        "ADD COLUMN datos_envio TEXT AFTER metodo_envio"
    ];
    
    foreach ($columns as $col) {
        try {
            $sql = "ALTER TABLE pedidos $col";
            $db->exec($sql);
            echo "Columna agregada: $col\n";
        } catch (PDOException $e) {
            // Ignorar si ya existe (código 42S21 duplicate column)
            if (strpos($e->getMessage(), '42S21') !== false || strpos($e->getMessage(), 'Duplicate column') !== false) {
                echo "Columna ya existe, saltando.\n";
            } else {
                echo "Nota: " . $e->getMessage() . "\n";
            }
        }
    }
    
    echo "Migración completada.\n";
    
} catch (Exception $e) {
    echo "Error General: " . $e->getMessage() . "\n";
}
?>
