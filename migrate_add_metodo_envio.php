<?php
// Migración: Agregar columna metodo_envio a tabla pedidos

$host = 'localhost';
$db_name = 'db_tienda_redhard';
$username = 'root';
$password = '';

try {
    $db = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Verificar si la columna ya existe
    $checkColumn = $db->query("SHOW COLUMNS FROM pedidos LIKE 'metodo_envio'");
    if ($checkColumn->rowCount() > 0) {
        echo "La columna 'metodo_envio' ya existe en la tabla pedidos.\n";
        exit;
    }
    
    // Agregar columna metodo_envio
    $sql = "ALTER TABLE pedidos 
            ADD COLUMN metodo_envio ENUM('domicilio', 'tienda') DEFAULT 'domicilio' 
            AFTER direccion_id";
    
    $db->exec($sql);
    echo "✓ Columna 'metodo_envio' agregada exitosamente a 'pedidos'.\n\n";
    
    // Verificar estructura actualizada
    $result = $db->query("SHOW COLUMNS FROM pedidos WHERE Field IN ('direccion_id', 'metodo_envio')");
    echo "Columnas relacionadas en 'pedidos':\n";
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        $type = $row['Type'];
        $null = $row['Null'];
        $default = $row['Default'] ?? 'NULL';
        echo "  - {$row['Field']} ({$type}) - Null: {$null} - Default: {$default}\n";
    }
    
    echo "\n✓ Migración completada exitosamente.\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
