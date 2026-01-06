<?php
require_once 'backend/config/conexion.php';
global $db;

$numeroPedido = 'ORD-260105-933';

echo "--- Pedido $numeroPedido ---\n";
$s = $db->prepare('SELECT * FROM pedidos WHERE numero_pedido = ?');
$s->execute([$numeroPedido]);
$pedido = $s->fetch(PDO::FETCH_ASSOC);
print_r($pedido);

echo "\n--- Detalle del Pedido ---\n";
$s = $db->prepare('SELECT dp.*, p.nombre FROM detalle_pedido dp JOIN productos p ON dp.producto_id = p.id WHERE dp.pedido_id = ?');
$s->execute([$pedido['id']]);
$detalles = $s->fetchAll(PDO::FETCH_ASSOC);
print_r($detalles);
?>
