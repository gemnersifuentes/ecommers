<?php
require_once 'backend/config/conexion.php';
$db = new Database();
$conn = $db->getConnection();

echo "=== PEDIDOS TABLE ===\n";
$stmt = $conn->query("SHOW COLUMNS FROM pedidos");
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $row['Field'] . " (" . $row['Type'] . ")\n";
}

echo "\n=== DETALLE_PEDIDO TABLE ===\n";
$stmt = $conn->query("SHOW COLUMNS FROM detalle_pedido");
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $row['Field'] . " (" . $row['Type'] . ")\n";
}

echo "\n=== PRODUCTOS TABLE ===\n";
$stmt = $conn->query("SHOW COLUMNS FROM productos");
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $row['Field'] . " (" . $row['Type'] . ")\n";
}

echo "\n=== VARIACIONES TABLE ===\n";
$stmt = $conn->query("SHOW COLUMNS FROM variaciones");
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $row['Field'] . " (" . $row['Type'] . ")\n";
}
?>
