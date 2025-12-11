<?php
// Migración: Agregar direccion_id a tabla pedidos

$host = 'localhost';
$db_name = 'db_tienda_redhard';
$username = 'root';
$password = '';

try {
    $db = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Verificar si la columna ya existe
    $checkColumn = $db->query("SHOW COLUMNS FROM pedidos LIKE 'direccion_id'");
    if ($checkColumn->rowCount() > 0) {
        echo "La columna 'direccion_id' ya existe en la tabla pedidos.\n";
        exit;
    }
    
    // Agregar columna direccion_id a pedidos
    $sql = "ALTER TABLE pedidos 
            ADD COLUMN direccion_id INT NULL AFTER usuario_id,
            ADD FOREIGN KEY (direccion_id) REFERENCES direcciones(id) ON DELETE SET NULL";
    
    $db->exec($sql);
    echo "✓ Columna 'direccion_id' agregada exitosamente a 'pedidos'.\n\n";
    
    // Verificar estructura actualizada
    $result = $db->query("SHOW COLUMNS FROM pedidos WHERE Field IN ('usuario_id', 'direccion_id')");
    echo "Columnas relacionadas en 'pedidos':\n";
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        echo "  - {$row['Field']} ({$row['Type']}) - Null: {$row['Null']}\n";
    }
    
    echo "\n✓ Migración completada exitosamente.\n";
    echo "NOTA: Los campos existentes de dirección (direccion_envio, departamento, etc.) se mantienen para historial.\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
