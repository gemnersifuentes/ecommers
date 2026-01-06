<?php
require_once 'backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();

$query = "SELECT p.id, p.numero_pedido, p.fecha, u.correo as usuario_correo, p.total, p.estado 
          FROM pedidos p 
          LEFT JOIN usuarios u ON p.usuario_id = u.id 
          ORDER BY p.id DESC LIMIT 5";
$stmt = $db->query($query);
$pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Recent Pedidos:\n";
print_r($pedidos);

$queryItems = "SELECT * FROM detalle_pedido ORDER BY id DESC LIMIT 5";
$stmtItems = $db->query($queryItems);
echo "\nRecent Order Details:\n";
print_r($stmtItems->fetchAll(PDO::FETCH_ASSOC));
?>
