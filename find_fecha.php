<?php
require_once 'backend/config/conexion.php';
$db = new Database();
$conn = $db->getConnection();
$stmt = $conn->query("SHOW COLUMNS FROM pedidos");
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    if (strpos($row['Field'], 'fecha') !== false || strpos($row['Field'], 'created') !== false) {
        echo $row['Field'] . "\n";
    }
}
?>
