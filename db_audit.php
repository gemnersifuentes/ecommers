<?php
require_once 'backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();

echo "RECUPERANDO ÚLTIMOS PEDIDOS:\n";
$stmt = $db->query("SELECT id, metodo_pago, estado, HEX(estado) as hex_estado FROM pedidos ORDER BY id DESC LIMIT 5");
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $len = strlen($row['estado']);
    echo "ID: {$row['id']} | Pago: {$row['metodo_pago']} | Estado: [{$row['estado']}] | Hex: {$row['hex_estado']} | Len: {$len}\n";
}
