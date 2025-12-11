<?php
require_once __DIR__ . '/../config/conexion.php';

$db = (new Database())->getConnection();

echo "🔍 Diagnóstico de inserción de colores\n\n";

// 1. Verificar que existan los productos
echo "1️⃣ Productos de tinta en la BD:\n";
$stmt = $db->query("SELECT id, nombre FROM productos WHERE nombre LIKE '%Tinta%'");
$productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($productos)) {
    die("❌ No hay productos de tinta\n");
}

foreach ($productos as $p) {
    echo "   ID: {$p['id']} - {$p['nombre']}\n";
}

// 2. Intentar insertar UN color manualmente
echo "\n2️⃣ Insertando color de prueba...\n";
$primerProducto = $productos[0]['id'];

try {
    $stmt = $db->prepare("
        INSERT INTO producto_atributos (producto_id, tipo, valor, stock)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([$primerProducto, 'color', 'Negro Test', 99]);
    echo "   ✅ Color insertado exitosamente\n";
    
    // Verificar
    $check = $db->prepare("SELECT * FROM producto_atributos WHERE producto_id = ?");
    $check->execute([$primerProducto]);
    $result = $check->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        echo "   ✅ Color verificado en BD:\n";
        print_r($result);
    } else {
        echo "   ❌ No se encontró el color insertado\n";
    }
    
} catch (Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n";
}

// 3. Verificar estructura de la tabla
echo "\n3️⃣ Estructura de la tabla producto_atributos:\n";
$stmt = $db->query("DESCRIBE producto_atributos");
$estructura = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($estructura as $campo) {
    echo "   - {$campo['Field']}: {$campo['Type']} ({$campo['Null']}, {$campo['Key']})\n";
}

?>
