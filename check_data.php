<?php
require_once 'backend/config/conexion.php';
$database = new Database();
$db = $database->getConnection();
$stmt = $db->query("SELECT metodo_pago, COUNT(*) as count FROM pedidos GROUP BY metodo_pago");
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($results);
?>
