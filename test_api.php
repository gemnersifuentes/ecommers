<?php
require_once 'backend/config/conexion.php';
$db = (new Database())->getConnection();

// Get ID
$stmt = $db->query("SELECT id FROM pedidos WHERE metodo_envio = 'tienda' ORDER BY id DESC LIMIT 1");
$id = $stmt->fetchColumn();

if (!$id) {
    die("No store pickup orders found.");
}

echo "Testing Order ID: $id\n";

// Simulate the query from api/pedidos.php (GET)
$stmt = $db->prepare("
    SELECT p.*, u.nombre as cliente_nombre, u.correo, u.telefono, u.direccion 
    FROM pedidos p 
    LEFT JOIN usuarios u ON p.usuario_id = u.id 
    WHERE p.id = ?
");
$stmt->execute([$id]);
$pedido = $stmt->fetch(PDO::FETCH_ASSOC);

print_r($pedido);
?>
