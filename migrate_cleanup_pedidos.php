<?php
require_once 'backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "Conectado a la base de datos para limpieza.\n";
    
    // 1. Eliminar columnas obsoletas
    // Lista basada en la imagen del usuario y lo que ahora va en datos_envio (JSON)
    $columnsToDrop = [
        'nombre_contacto',
        'direccion_envio', 
        'ciudad',
        'cp',
        'telefono',
        'departamento',
        'provincia',
        'distrito',
        'direccion_id'
    ];
    
    foreach ($columnsToDrop as $col) {
        try {
            // Verificar si existe antes de intentar borrar (MySQL no tiene IF EXISTS para DROP COLUMN directo en todas versiones, pero try-catch maneja el error)
            $sql = "ALTER TABLE pedidos DROP COLUMN $col";
            $db->exec($sql);
            echo "Columna eliminada: $col\n";
        } catch (PDOException $e) {
            echo "Nota sobre $col: " . $e->getMessage() . "\n";
        }
    }
    
    // 2. Agregar columna DNI
    try {
        $sql = "ALTER TABLE pedidos ADD COLUMN dni VARCHAR(20) AFTER usuario_id";
        $db->exec($sql);
        echo "Columna agregada: dni\n";
    } catch (PDOException $e) {
         if (strpos($e->getMessage(), '42S21') !== false || strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "Columna dni ya existe.\n";
        } else {
            echo "Error agregando dni: " . $e->getMessage() . "\n";
        }
    }
    
    echo "Limpieza y actualización completada.\n";
    
} catch (Exception $e) {
    echo "Error General: " . $e->getMessage() . "\n";
}
?>
