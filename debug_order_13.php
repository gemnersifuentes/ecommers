<?php
require_once 'backend/config/conexion.php';
$db = (new Database())->getConnection();

echo "--- ORDER 13 DATA ---\n";
$stmt = $db->query("SELECT id, metodo_envio, estado, total FROM pedidos WHERE id = 13");
$o = $stmt->fetch(PDO::FETCH_ASSOC);
print_r($o);

echo "\n--- LAST 5 ORDERS ---\n";
$stmt = $db->query("SELECT id, metodo_envio FROM pedidos ORDER BY id DESC LIMIT 5");
$list = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach($list as $item) {
    echo "ID: " . $item['id'] . " | Method: " . $item['metodo_envio'] . "\n";
}
?>
