<?php
require_once 'backend/config/conexion.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Rename cliente_id to usuario_id
    $sql = "ALTER TABLE pedidos CHANGE cliente_id usuario_id INT(11)";
    $conn->exec($sql);
    
    echo "Column 'cliente_id' renamed to 'usuario_id' successfully.\n";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
