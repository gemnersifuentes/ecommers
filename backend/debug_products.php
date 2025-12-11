<?php
require_once __DIR__ . '/config/conexion.php';

$catId = 9;
echo "Checking products for category $catId...\n";

try {
    $stmt = $db->prepare("SELECT id, nombre, categoria_id FROM productos WHERE categoria_id = ?");
    $stmt->execute([$catId]);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($products) . " products:\n";
    foreach ($products as $p) {
        echo "- [{$p['id']}] {$p['nombre']}\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
