<?php
require_once __DIR__ . '/config/conexion.php';

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    echo "=== Estructura de la tabla carrito ===\n";
    $stmt = $pdo->query("DESCRIBE carrito");
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo sprintf("%-20s %-20s %-10s %-10s\n", 
            $row['Field'], 
            $row['Type'], 
            $row['Null'], 
            $row['Key']
        );
    }
    
    echo "\n=== Contenido actual del carrito ===\n";
    $stmt = $pdo->query("SELECT * FROM carrito LIMIT 5");
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($items);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
