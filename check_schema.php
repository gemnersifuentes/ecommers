<?php
require_once 'backend/config/conexion.php';
$db = (new Database())->getConnection();

$tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
echo "Tables:\n";
foreach($tables as $t) echo "- $t\n";

echo "\n--- COLUMNS IN detalle_pedido ---\n";
$cols = $db->query("DESCRIBE detalle_pedido")->fetchAll(PDO::FETCH_ASSOC);
foreach($cols as $c) echo $c['Field'] . "\n";
?>
