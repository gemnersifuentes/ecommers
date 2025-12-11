<?php
require_once __DIR__ . '/config/conexion.php';

$pdo = $database->getConnection();

echo "=== ESTRUCTURA DE LA TABLA BANNERS ===\n\n";
$stmt = $pdo->query('DESCRIBE banners');
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($columns as $col) {
    echo sprintf("%-20s %-30s %-10s %-10s %s\n", 
        $col['Field'], 
        $col['Type'], 
        $col['Null'], 
        $col['Key'], 
        $col['Default'] ?? 'NULL'
    );
}

echo "\n=== ESTRUCTURA DE LA TABLA PRODUCTOS (para comparar) ===\n\n";
$stmt = $pdo->query('DESCRIBE productos');
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($columns as $col) {
    echo sprintf("%-20s %-30s %-10s %-10s %s\n", 
        $col['Field'], 
        $col['Type'], 
        $col['Null'], 
        $col['Key'], 
        $col['Default'] ?? 'NULL'
    );
}

echo "\n=== VERIFICANDO DIRECTORIO DE UPLOADS ===\n\n";
$bannersDir = __DIR__ . '/../public/uploads/banners/';
$productosDir = __DIR__ . '/../public/uploads/productos/';

echo "Directorio banners: " . $bannersDir . "\n";
echo "Existe: " . (file_exists($bannersDir) ? "SI" : "NO") . "\n";
echo "Es escribible: " . (is_writable($bannersDir) ? "SI" : "NO") . "\n";

if (file_exists($bannersDir)) {
    $files = scandir($bannersDir);
    echo "Archivos: " . count($files) . "\n";
    foreach ($files as $file) {
        if ($file != '.' && $file != '..') {
            echo "  - $file\n";
        }
    }
}

echo "\nDirectorio productos: " . $productosDir . "\n";
echo "Existe: " . (file_exists($productosDir) ? "SI" : "NO") . "\n";
echo "Es escribible: " . (is_writable($productosDir) ? "SI" : "NO") . "\n";
?>
