<?php
try {
    $pdo = new PDO("mysql:host=localhost", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Listar todas las bases de datos
    echo "=== Bases de datos disponibles ===\n";
    $stmt = $pdo->query("SHOW DATABASES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        echo "- " . $row[0] . "\n";
    }
    
    // Intentar usar db_tienda_redhard
    echo "\n=== Usando db_tienda_redhard ===\n";
    $pdo->exec("USE db_tienda_redhard");
    
    // Listar tablas
    echo "\n=== Tablas en db_tienda_redhard ===\n";
    $stmt = $pdo->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        echo "- " . $row[0] . "\n";
    }
    
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
