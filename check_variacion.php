<?php
require_once 'backend/config/conexion.php';
$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->query("DESCRIBE detalle_pedido");
$columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

if (in_array('variacion_id', $columns)) {
    echo "Column 'variacion_id' exists.";
} else {
    echo "Column 'variacion_id' MISSING.";
}
?>
