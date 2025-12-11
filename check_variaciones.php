<?php
require_once 'backend/config/conexion.php';
$db = new Database();
$conn = $db->getConnection();
$stmt = $conn->query("DESCRIBE variaciones");
echo "VARIACIONES columns:\n";
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $row['Field'] . "\n";
}
?>
