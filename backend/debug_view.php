<?php
require_once __DIR__ . '/config/conexion.php';

$catId = 9;
echo "Checking products for category $catId...\n";

// Check raw table
echo "\n--- Raw Table (productos) ---\n";
try {
    $stmt = $db->prepare("SELECT id, nombre, categoria_id, activo FROM productos WHERE categoria_id = ?");
    $stmt->execute([$catId]);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($products) . " products:\n";
    foreach ($products as $p) {
        echo "- [{$p['id']}] {$p['nombre']} (Activo: {$p['activo']})\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

// Check View
echo "\n--- View (vista_productos_con_descuento) ---\n";
try {
    // Check if view exists
    $stmt = $db->query("SHOW FULL TABLES WHERE Table_Type = 'VIEW' AND Tables_in_tiendatec = 'vista_productos_con_descuento'");
    if ($stmt->rowCount() == 0) {
        echo "View 'vista_productos_con_descuento' DOES NOT EXIST.\n";
    } else {
        $stmt = $db->prepare("SELECT id, nombre, categoria_id, activo FROM vista_productos_con_descuento WHERE categoria_id = ?");
        $stmt->execute([$catId]);
        $viewProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "Found " . count($viewProducts) . " products in view:\n";
        foreach ($viewProducts as $p) {
            echo "- [{$p['id']}] {$p['nombre']} (Activo: {$p['activo']})\n";
        }
    }
} catch (Exception $e) {
    echo "Error querying view: " . $e->getMessage() . "\n";
}
