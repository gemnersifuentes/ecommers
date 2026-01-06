<?php
require_once __DIR__ . '/backend/config/conexion.php';
$pdo = $database->getConnection();
echo "--- Resumen de Datos Generados ---\n";
echo "Total Pedidos en BD: " . $pdo->query("SELECT COUNT(*) FROM pedidos")->fetchColumn() . "\n";
echo "Pedidos por Año:\n";
$stmt = $pdo->query("SELECT YEAR(fecha) as anio, COUNT(*) as cant, SUM(total) as total_ventas FROM pedidos GROUP BY anio ORDER BY anio ASC");
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "  " . $row['anio'] . ": " . $row['cant'] . " pedidos | Total: S/ " . number_format($row['total_ventas'], 2) . "\n";
}
echo "----------------------------------\n";
