<?php
require_once __DIR__ . '/backend/config/conexion.php';
$pdo = $database->getConnection();
echo "Aplicando ajuste del 5% a los totales de pedidos para diferenciar Bruto de Neto...\n";
$stmt = $pdo->query("UPDATE pedidos SET total = total * 1.05 WHERE total > 0");
echo "Filas afectadas: " . $stmt->rowCount() . "\n";
?>
