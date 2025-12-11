<?php
/**
 * insert-colores-manual.php
 * Inserta manualmente los colores de las tintas
 */

require_once __DIR__ . '/../config/conexion.php';

$db = (new Database())->getConnection();

echo "Insertando colores manualmente...\n\n";

// Obtener IDs
$ids = $db->query("
    SELECT id, nombre FROM productos  
    WHERE nombre IN ('Tinta Epson T544','Tinta Canon GI-190','Tinta HP GT53')
")->fetchAll(PDO::FETCH_KEY_PAIR);

if (empty($ids)) {
    die("No se encontraron productos de tinta\n");
}

print_r($ids);

// Colores a insertar
$colores = [
    ['id' => $ids['Tinta Epson T544'], 'color' => 'Negro', 'stock' => 50],
    ['id' => $ids['Tinta Epson T544'], 'color' => 'Cian', 'stock' => 45],
    ['id' => $ids['Tinta Epson T544'], 'color' => 'Magenta', 'stock' => 48],
    ['id' => $ids['Tinta Epson T544'], 'color' => 'Amarillo', 'stock' => 52],
    
    ['id' => $ids['Tinta Canon GI-190'], 'color' => 'Negro', 'stock' => 40],
    ['id' => $ids['Tinta Canon GI-190'], 'color' => 'Cian', 'stock' => 38],
    ['id' => $ids['Tinta Canon GI-190'], 'color' => 'Magenta', 'stock' => 42],
    ['id' => $ids['Tinta Canon GI-190'], 'color' => 'Amarillo', 'stock' => 35],
    
    ['id' => $ids['Tinta HP GT53'], 'color' => 'Negro', 'stock' => 55],
    ['id' => $ids['Tinta HP GT53'], 'color' => 'Cian', 'stock' => 50],
    ['id' => $ids['Tinta HP GT53'], 'color' => 'Magenta', 'stock' => 48],
    ['id' => $ids['Tinta HP GT53'], 'color' => 'Amarillo', 'stock' => 52],
];

$insertados = 0;
foreach ($colores as $c) {
    try {
        $stmt = $db->prepare("
            INSERT INTO producto_atributos (producto_id, tipo, valor, stock)
            VALUES (?, 'color', ?, ?)
        ");
        $stmt->execute([$c['id'], $c['color'], $c['stock']]);
        $insertados++;
        echo ".";
    } catch (Exception $e) {
        echo "\nError ({$c['color']}): " . $e->getMessage() . "\n";
    }
}

echo "\n\n✅ Insertados: $insertados colores\n";

// Verificar
$stmt = $db->query("
    SELECT p.nombre, pa.valor, pa.stock
    FROM producto_atributos pa
    JOIN productos p ON p.id = pa.producto_id
    ORDER BY p.nombre, pa.valor
");

echo "\nVerificación:\n";
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    echo "  {$row['nombre']} - {$row['valor']}: {$row['stock']}\n";
}
?>
