<?php
// Test directo del endpoint de catalogos
header('Content-Type: application/json');

require_once __DIR__ . '/backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "Conexión OK\n";
    
    // Test query
    $stmt = $db->query("SELECT id, nombre, activo FROM atributos WHERE activo = 1");
    $atributos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Atributos encontrados: " . count($atributos) . "\n";
    print_r($atributos);
    
    // Test valores
    foreach ($atributos as &$attr) {
        $stmt = $db->prepare("SELECT * FROM atributo_valores WHERE atributo_id = ? AND activo = 1 ORDER BY valor");
        $stmt->execute([$attr['id']]);
        $attr['valores'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "Valores para {$attr['nombre']}: " . count($attr['valores']) . "\n";
    }
    
    echo "\nResultado final:\n";
    echo json_encode($atributos, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString();
}
