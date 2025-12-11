<?php
require_once 'backend/config/conexion.php';
$db = (new Database())->getConnection();
$stmt = $db->query("SELECT DISTINCT metodo_envio FROM pedidos");
$methods = $stmt->fetchAll(PDO::FETCH_COLUMN);
echo "METHODS_FOUND:\n";
foreach ($methods as $m) {
    echo "['" . $m . "']\n";
}
?>
