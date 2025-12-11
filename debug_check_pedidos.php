<?php
require_once 'backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "=== DESCRIBE pedidos ===\n";
    $stmt = $db->query("DESCRIBE pedidos");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $col) {
        echo $col['Field'] . " | " . $col['Type'] . " | " . $col['Null'] . " | " . $col['Default'] . "\n";
    }
    
    echo "\n=== TEST INSERT ===\n";
    try {
        $db->beginTransaction();
        $stmt = $db->prepare("
            INSERT INTO pedidos (usuario_id, total, estado, fecha, metodo_envio, datos_envio, dni) 
            VALUES (1, 100.00, 'Pendiente', NOW(), 'domicilio', '{}', '12345678')
        ");
        $stmt->execute();
        $id = $db->lastInsertId();
        echo "Insert successful! ID: $id\n";
        $db->rollBack(); // Don't actually save it
    } catch (PDOException $e) {
        echo "Insert FAILED: " . $e->getMessage() . "\n";
    }

} catch (Exception $e) {
    echo "General Error: " . $e->getMessage() . "\n";
}
?>
