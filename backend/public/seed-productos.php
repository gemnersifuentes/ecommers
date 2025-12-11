<?php
/**
 * seed-productos.php
 * 
 * Script para poblar productos y sus atributos (colores)
 * Ejecutar: php public/seed-productos.php
 */

require_once __DIR__ . '/../config/conexion.php';

$db = (new Database())->getConnection();

echo "🔵 Iniciando seed de productos...\n\n";

// 1. Verificar/crear tabla producto_atributos
echo "1️⃣  Verificando tabla producto_atributos...\n";
$sqlFile = __DIR__ . '/../sql/crear_tabla_atributos.sql';
if (file_exists($sqlFile)) {
    $sql = file_get_contents($sqlFile);
    $db->exec($sql);
    echo "   ✅ Tabla producto_atributos verificada\n\n";
} else {
    die("❌ Error: No se encuentra el archivo SQL\n");
}

// 2. Insertar productos de tinta (si no existen)
echo "2️⃣  Insertando productos de tinta...\n";

$productos = [
    [
        'nombre'      => 'Tinta Epson T544',
        'descripcion' => 'Botella de tinta original Epson T544 para impresoras EcoTank',
        'categoria'   => 'Impresión',
        'marca'       => 'Epson',
        'precio'      => 45.00,
        'stock'       => 200,
        'imagen'      => 'epson_t544.jpg'
    ],
    [
        'nombre'      => 'Tinta Canon GI-190',
        'descripcion' => 'Botella de tinta original Canon GI-190 para impresoras PIXMA',
        'categoria'   => 'Impresión',
        'marca'       => 'Canon',
        'precio'      => 42.00,
        'stock'       => 150,
        'imagen'      => 'canon_gi190.jpg'
    ],
    [
        'nombre'      => 'Tinta HP GT53',
        'descripcion' => 'Botella de tinta original HP GT53 para impresoras Smart Tank',
        'categoria'   => 'Impresión',
        'marca'       => 'HP',
        'precio'      => 38.00,
        'stock'       => 180,
        'imagen'      => 'hp_gt53.jpg'
    ]
];

foreach ($productos as $p) {
    // Verificar si ya existe
    $check = $db->prepare("SELECT id FROM productos WHERE nombre = ?");
    $check->execute([$p['nombre']]);
    if ($check->fetch()) {
        echo "   ⚠️  '{$p['nombre']}' ya existe, omitiendo...\n";
        continue;
    }

    $stmt = $db->prepare("
        INSERT INTO productos
            (nombre, descripcion, categoria_id, marca_id, precio_base, stock, imagen)
        VALUES (
            :nombre,
            :descripcion,
            (SELECT id FROM categorias WHERE nombre = :cat LIMIT 1),
            (SELECT id FROM marcas WHERE nombre = :marca LIMIT 1),
            :precio,
            :stock,
            :imagen
        )
    ");
    
    try {
        $stmt->execute([
            ':nombre'      => $p['nombre'],
            ':descripcion' => $p['descripcion'],
            ':cat'         => $p['categoria'],
            ':marca'       => $p['marca'],
            ':precio'      => $p['precio'],
            ':stock'       => $p['stock'],
            ':imagen'      => $p['imagen']
        ]);
        echo "   ✅ {$p['nombre']} insertado\n";
    } catch (Exception $e) {
        echo "   ❌ Error insertando {$p['nombre']}: " . $e->getMessage() . "\n";
    }
}

echo "\n3️⃣  Asociando colores a las tintas...\n";

// Obtener IDs de productos
$ids = $db->query("
    SELECT id, nombre FROM productos
    WHERE nombre IN ('Tinta Epson T544','Tinta Canon GI-190','Tinta HP GT53')
")->fetchAll(PDO::FETCH_KEY_PAIR);

if (empty($ids)) {
    die("❌ Error: No se encontraron productos de tinta\n");
}

$colores = [
    // Epson T544
    ['producto' => $ids['Tinta Epson T544'] ?? null, 'tipo' => 'color', 'valor' => 'Negro',    'stock' => 50],
    ['producto' => $ids['Tinta Epson T544'] ?? null, 'tipo' => 'color', 'valor' => 'Cian',     'stock' => 45],
    ['producto' => $ids['Tinta Epson T544'] ?? null, 'tipo' => 'color', 'valor' => 'Magenta',  'stock' => 48],
    ['producto' => $ids['Tinta Epson T544'] ?? null, 'tipo' => 'color', 'valor' => 'Amarillo', 'stock' => 52],

    // Canon GI-190
    ['producto' => $ids['Tinta Canon GI-190'] ?? null, 'tipo' => 'color', 'valor' => 'Negro',    'stock' => 40],
    ['producto' => $ids['Tinta Canon GI-190'] ?? null, 'tipo' => 'color', 'valor' => 'Cian',     'stock' => 38],
    ['producto' => $ids['Tinta Canon GI-190'] ?? null, 'tipo' => 'color', 'valor' => 'Magenta',  'stock' => 42],
    ['producto' => $ids['Tinta Canon GI-190'] ?? null, 'tipo' => 'color', 'valor' => 'Amarillo', 'stock' => 35],

    // HP GT53
    ['producto' => $ids['Tinta HP GT53'] ?? null, 'tipo' => 'color', 'valor' => 'Negro',    'stock' => 55],
    ['producto' => $ids['Tinta HP GT53'] ?? null, 'tipo' => 'color', 'valor' => 'Cian',     'stock' => 50],
    ['producto' => $ids['Tinta HP GT53'] ?? null, 'tipo' => 'color', 'valor' => 'Magenta',  'stock' => 48],
    ['producto' => $ids['Tinta HP GT53'] ?? null, 'tipo' => 'color', 'valor' => 'Amarillo', 'stock' => 52],
];

$stmt = $db->prepare("
    INSERT IGNORE INTO producto_atributos (producto_id, tipo, valor, stock)
    VALUES (:producto, :tipo, :valor, :stock)
");

$insertados = 0;
foreach ($colores as $c) {
    if ($c['producto'] === null) continue;
    
    try {
        $stmt->execute([
            ':producto' => $c['producto'],
            ':tipo'     => $c['tipo'],
            ':valor'    => $c['valor'],
            ':stock'    => $c['stock']
        ]);
        if ($stmt->rowCount() > 0) {
            $insertados++;
        }
    } catch (Exception $e) {
        echo "    ⚠️  Error: " . $e->getMessage() . "\n";
    }
}

echo "   ✅ {$insertados} colores insertados\n\n";
echo "🎉 Seed completado exitosamente!\n";
echo "\nProductos con colores:\n";

// Mostrar resumen
foreach ($ids as $nombre => $id) {
    $stmt = $db->prepare("
        SELECT valor, stock FROM producto_atributos 
        WHERE producto_id = ? AND tipo = 'color'
    ");
    $stmt->execute([$id]);
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "  • {$nombre}:\n";
    foreach ($cols as $col) {
        echo "    - {$col['valor']}: {$col['stock']} unidades\n";
    }
}
?>
