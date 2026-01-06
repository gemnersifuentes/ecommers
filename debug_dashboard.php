<?php
require_once __DIR__ . '/backend/config/conexion.php';

try {
    $pdo = $database->getConnection();
    if (!$pdo) {
        die("Connection failed");
    }

    // Check tables
    $tables = ['pedidos', 'productos', 'detalle_pedido', 'usuarios'];
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
        echo "Table $table: " . $stmt->fetchColumn() . " rows\n";
    }

    // Check total sales
    $stmtVentas = $pdo->prepare("SELECT SUM(total) as total_ventas FROM pedidos WHERE estado NOT IN ('Cancelado')");
    $stmtVentas->execute();
    $totalVentas = $stmtVentas->fetch(PDO::FETCH_ASSOC)['total_ventas'] ?? 0;
    echo "Total Sales: $totalVentas\n";

    // Check dashboard response
    $path = '/api/reportes/dashboard';
    $method = 'GET';
    
    // Simulate reportes.php
    ob_start();
    include __DIR__ . '/backend/api/reportes.php';
    $output = ob_get_clean();
    
    echo "\nDashboard API Output Size: " . strlen($output) . " bytes\n";
    $decoded = json_decode($output, true);
    if ($decoded) {
        echo "Decoded Success! Total Sales in Stats: " . ($decoded['estadisticas']['totalVentas'] ?? 'N/A') . "\n";
        echo "Total Clients in Stats: " . ($decoded['estadisticas']['totalClientes'] ?? 'N/A') . "\n";
    } else {
        echo "Decode FAILED. Output:\n";
        echo $output;
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
