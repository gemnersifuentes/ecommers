<?php
// Test rápido del endpoint de atributos
require_once __DIR__ . '/../config/conexion.php';

$db = (new Database())->getConnection();

echo "=== TEST ENDPOINT ATRIBUTOS ===\n\n";

// Simular GET request
echo "1. Testing GET /productos/35/atributos\n";
$_SERVER['REQUEST_METHOD'] = 'GET';
$method = 'GET';
$id = 35; // ID de un producto

try {
    $stmt = $db->prepare("
        SELECT * FROM producto_atributos 
        WHERE producto_id = ?
        ORDER BY tipo, valor
    ");
    $stmt->execute([$id]);
    $atributos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "   ✅ Query ejecutada correctamente\n";
    echo "   Resultados: " . count($atributos) . " atributos\n";
    
    if (count($atributos) > 0) {
        foreach ($atributos as $attr) {
            echo "   - {$attr['tipo']}: {$attr['valor']} (stock: {$attr['stock']})\n";
        }
    }
} catch (Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n";
}

// Test POST
echo "\n2. Testing POST /productos/35/atributos\n";
try {
    $stmt = $db->prepare("
        INSERT INTO producto_atributos (producto_id, tipo, valor, stock)
        VALUES (?, 'color', 'Test Color', 10)
    ");
    $stmt->execute([35]);
    echo "   ✅ INSERT ejecutado correctamente\n";
    echo "   ID insertado: " . $db->lastInsertId() . "\n";
    
    // Limpiar test
    $db->exec("DELETE FROM producto_atributos WHERE valor = 'Test Color'");
    echo "   ✅ Test limpiado\n";
} catch (Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== FIN TEST ===\n";
?>
