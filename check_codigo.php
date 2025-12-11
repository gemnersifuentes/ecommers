<?php
require_once 'backend/config/conexion.php';
$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->query("DESCRIBE pedidos");
$columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

if (in_array('codigo', $columns)) {
    echo "Column 'codigo' exists.";
} else {
    echo "Column 'codigo' MISSING.";
}
?>
