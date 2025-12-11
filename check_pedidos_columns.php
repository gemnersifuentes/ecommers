<?php
require_once 'backend/config/conexion.php';

$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->query("DESCRIBE pedidos");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Columns in pedidos table:\n\n";
foreach ($columns as $col) {
    echo $col['Field'] . " (" . $col['Type'] . ")\n";
}
?>
