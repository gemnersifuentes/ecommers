<?php
require_once __DIR__ . '/backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "Iniciando migración de esquema...\n";
    
    // 1. Cambiar columnas a DATETIME
    echo "1. Modificando columnas a DATETIME...\n";
    $sql_alter = "ALTER TABLE descuentos 
                  MODIFY fecha_inicio DATETIME, 
                  MODIFY fecha_fin DATETIME";
    $db->exec($sql_alter);
    echo "Columnas modificadas correctamente.\n";
    
    // 2. Actualizar datos existentes
    echo "2. Actualizando datos existentes...\n";
    
    // Actualizar fecha_fin a las 23:59:59
    $sql_update_fin = "UPDATE descuentos 
                       SET fecha_fin = CONCAT(DATE_FORMAT(fecha_fin, '%Y-%m-%d'), ' 23:59:59')";
    $db->exec($sql_update_fin);
    
    // Actualizar fecha_inicio a las 00:00:00
    $sql_update_inicio = "UPDATE descuentos 
                          SET fecha_inicio = CONCAT(DATE_FORMAT(fecha_inicio, '%Y-%m-%d'), ' 00:00:00')";
    $db->exec($sql_update_inicio);
    
    echo "Datos actualizados correctamente.\n";
    
    // 3. Verificar cambio
    echo "3. Verificando estructura...\n";
    $stmt = $db->query("SHOW COLUMNS FROM descuentos");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $col) {
        if ($col['Field'] == 'fecha_inicio' || $col['Field'] == 'fecha_fin') {
            echo $col['Field'] . ": " . $col['Type'] . "\n";
        }
    }
    
    echo "\nMIGRACIÓN COMPLETADA CON ÉXITO.\n";

} catch (Exception $e) {
    echo "ERROR CRÍTICO: " . $e->getMessage() . "\n";
}
?>
