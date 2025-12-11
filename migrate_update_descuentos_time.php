<?php
/**
 * Script para actualizar las fechas de fin de descuentos existentes
 * Agrega 23:59:59 a todas las fechas_fin que tienen 00:00:00
 */

require_once __DIR__ . '/backend/config/conexion.php';

try {
    // La clase Database ya está definida en conexion.php
    // $db ya puede estar instanciada ahí, pero podemos crear una nueva si queremos 
    // o usar la existente si el archivo la crea globalmente.
    // conexion.php crea $db al final, asi que podemos usarla o crear una nueva si preferimos limpieza.
    // Vamos a crear una nueva para estar seguros.
    
    $database = new Database();
    $db = $database->getConnection();
    
    echo "Actualizando fechas de fin de descuentos...\n\n";
    
    // Actualizar todas las fechas_fin para que terminen a las 23:59:59
    $sql = "UPDATE descuentos 
            SET fecha_fin = DATE_FORMAT(fecha_fin, '%Y-%m-%d 23:59:59')
            WHERE TIME(fecha_fin) = '00:00:00'";
    
    $stmt = $db->prepare($sql);
    $stmt->execute();
    
    $rowsAffected = $stmt->rowCount();
    
    echo "✓ Se actualizaron {$rowsAffected} descuentos\n";
    echo "✓ Ahora todos los descuentos terminan a las 23:59:59 del día seleccionado\n\n";
    
    // Mostrar descuentos actualizados
    $sql = "SELECT id, nombre, fecha_inicio, fecha_fin, activo 
            FROM descuentos 
            ORDER BY fecha_fin DESC 
            LIMIT 10";
    
    $stmt = $db->query($sql);
    $descuentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Descuentos actualizados (últimos 10):\n";
    echo str_repeat("-", 100) . "\n";
    printf("%-5s %-30s %-20s %-20s %-10s\n", "ID", "Nombre", "Fecha Inicio", "Fecha Fin", "Activo");
    echo str_repeat("-", 100) . "\n";
    
    foreach ($descuentos as $d) {
        printf("%-5s %-30s %-20s %-20s %-10s\n", 
            $d['id'], 
            substr($d['nombre'], 0, 30),
            $d['fecha_inicio'],
            $d['fecha_fin'],
            $d['activo'] ? 'Sí' : 'No'
        );
    }
    
    echo "\n✓ Migración completada exitosamente\n";
    
} catch (PDOException $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
