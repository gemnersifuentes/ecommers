<?php
require_once __DIR__ . '/backend/config/conexion.php';
$pdo = $database->getConnection();

// Manually calculate expected values
$currentMonth = date('m');
$currentYear = date('Y');

$stmtMonth = $pdo->prepare("SELECT SUM(total) as t FROM pedidos WHERE estado != 'Cancelado' AND MONTH(fecha) = ? AND YEAR(fecha) = ?");
$stmtMonth->execute([$currentMonth, $currentYear]);
$ventasMes = $stmtMonth->fetch(PDO::FETCH_ASSOC)['t'] ?? 0;

$stmtHist = $pdo->prepare("SELECT SUM(total) as t FROM pedidos WHERE estado != 'Cancelado'");
$stmtHist->execute();
$ventasHist = $stmtHist->fetch(PDO::FETCH_ASSOC)['t'] ?? 0;

echo "--- Verificación de Datos ---\n";
echo "Ventas Mes Actual ($currentMonth/$currentYear): S/ " . number_format($ventasMes, 2) . "\n";
echo "Ventas Históricas Totales: S/ " . number_format($ventasHist, 2) . "\n";

// Check API response
$path = '/api/reportes/dashboard';
$method = 'GET';
ob_start();
include __DIR__ . '/backend/api/reportes.php';
$output = ob_get_clean();
$data = json_decode($output, true);

if ($data) {
    echo "\n--- API Response Statistics ---\n";
    echo "totalVentas (Card): " . $data['estadisticas']['totalVentas'] . "\n";
    echo "totalVentasHistorico (Chart): " . $data['estadisticas']['totalVentasHistorico'] . "\n";
    
    if ($data['estadisticas']['totalVentas'] != $data['estadisticas']['totalVentasHistorico']) {
        echo "\nSUCCESS: Monthly and Historical data are DIFFERENT.\n";
    } else {
        echo "\nWARNING: Data is still identical ($" . $data['estadisticas']['totalVentas'] . ")\n";
    }
}
