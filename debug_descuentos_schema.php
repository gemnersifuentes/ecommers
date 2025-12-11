<?php
// Desactivar salida de errores HTML
ini_set('display_errors', 0);
header('Content-Type: text/plain');

require_once 'backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Obtener estructura exacta
    $stmt = $db->query("SHOW COLUMNS FROM descuentos");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "SCHEMA:\n";
    foreach ($columns as $col) {
        if ($col['Field'] == 'fecha_inicio' || $col['Field'] == 'fecha_fin') {
            echo $col['Field'] . ": " . $col['Type'] . "\n";
        }
    }
    
    echo "\nDATA SAMPLE:\n";
    $stmt = $db->query("SELECT id, fecha_inicio, fecha_fin FROM descuentos ORDER BY id DESC LIMIT 5");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($rows as $row) {
        echo "ID: " . $row['id'] . " | Inicio: " . $row['fecha_inicio'] . " | Fin: " . $row['fecha_fin'] . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
