<?php
require_once __DIR__ . '/../config/conexion.php';

$db = (new Database())->getConnection();

// Verificar colores insertados
$stmt = $db->query("
    SELECT pa.*, p.nombre AS producto_nombre
    FROM producto_atributos pa
    JOIN productos p ON p.id = pa.producto_id
    ORDER BY p.nombre, pa.valor
");

$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Total de atributos: " . count($rows) . "\n\n";

if (empty($rows)) {
    echo "No hay atributos en la tabla.\n";
} else {
    foreach ($rows as $row) {
        echo "{$row['producto_nombre']} - {$row['tipo']}: {$row['valor']} (stock: {$row['stock']})\n";
    }
}
?>
