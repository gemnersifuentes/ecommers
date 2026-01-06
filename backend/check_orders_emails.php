<?php
require_once 'config/conexion.php';
try {
    $stmt = $db->query("SELECT p.id, p.numero_pedido, p.usuario_id, u.correo, p.estado 
                        FROM pedidos p 
                        LEFT JOIN usuarios u ON p.usuario_id = u.id 
                        ORDER BY p.id DESC LIMIT 10");
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($orders, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo $e->getMessage();
}
