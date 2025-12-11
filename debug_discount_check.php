<?php
// debug_discount_check.php
// Script to check why discounts might not be showing up
// Mock SERVER for CLI
if (php_sapi_name() === 'cli') {
    $_SERVER['REQUEST_METHOD'] = 'GET';
}

require_once __DIR__ . '/backend/config/conexion.php';

header('Content-Type: text/plain');

$db = (new Database())->getConnection();

echo "Current Server Time (PHP): " . date('Y-m-d H:i:s') . "\n";
echo "Current DB Time (NOW()): ";
$stmt = $db->query("SELECT NOW() as t");
echo $stmt->fetchColumn() . "\n\n";

echo "Active Discounts Check:\n";
$sql = "SELECT id, aplica_a, producto_id, fecha_inicio, fecha_fin, valor, tipo 
        FROM descuentos 
        WHERE activo = 1";
$stmt = $db->query($sql);
$discounts = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($discounts)) {
    echo "No active discounts found.\n";
} else {
    foreach ($discounts as $d) {
        echo "Discount ID {$d['id']}:\n";
        echo "  Applies to: {$d['aplica_a']} (ID: {$d['producto_id']})\n";
        echo "  Start: {$d['fecha_inicio']}\n";
        echo "  End:   {$d['fecha_fin']}\n";
        
        $now = date('Y-m-d H:i:s');
        $validStart = empty($d['fecha_inicio']) || $d['fecha_inicio'] <= $now;
        $validEnd = empty($d['fecha_fin']) || $d['fecha_fin'] >= $now;
        
        echo "  Valid Start? " . ($validStart ? "YES" : "NO") . "\n";
        echo "  Valid End?   " . ($validEnd ? "YES" : "NO") . "\n";
        echo "--------------------------\n";
    }
}
