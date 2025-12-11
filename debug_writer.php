<?php
require_once 'backend/config/conexion.php';
$db = (new Database())->getConnection();

$fp = fopen('debug_output.txt', 'w');

$stmt = $db->query("SELECT id, metodo_envio, estado FROM pedidos WHERE id = 13");
$order = $stmt->fetch(PDO::FETCH_ASSOC);

fwrite($fp, "Order 13 Method: [" . $order['metodo_envio'] . "]\n");
fwrite($fp, "Order 13 Status: [" . $order['estado'] . "]\n");

$stmt2 = $db->query("SELECT id, metodo_envio FROM pedidos WHERE metodo_envio = 'tienda' ORDER BY id DESC LIMIT 5");
fwrite($fp, "\nRecent STORE Orders:\n");
while($row = $stmt2->fetch(PDO::FETCH_ASSOC)) {
    fwrite($fp, "ID: " . $row['id'] . "\n");
}

fclose($fp);
?>
