<?php
/**
 * Script para insertar más valores de colores y almacenamiento
 */

require_once __DIR__ . '/../config/conexion.php';

try {
    echo "Insertando valores adicionales...\n\n";
    
    // Insertar colores
    $colores = [
        ['Rojo', '#FF0000'],
        ['Blanco', '#FFFFFF'],
        ['Verde', '#00FF00'],
        ['Amarillo', '#FFFF00'],
        ['Rosa', '#FFC0CB'],
        ['Morado', '#800080'],
        ['Gris', '#808080'],
        ['Naranja', '#FFA500'],
        ['Dorado', '#FFD700'],
        ['Plata', '#C0C0C0']
    ];
    
    $colorAtributoId = 1; // ID del atributo Color
    
    echo "Insertando colores...\n";
    $stmt = $db->prepare("INSERT INTO atributo_valores (atributo_id, valor, color_hex, activo) VALUES (?, ?, ?, 1)");
    
    foreach ($colores as $color) {
        try {
            $stmt->execute([$colorAtributoId, $color[0], $color[1]]);
            echo "  ✓ {$color[0]} ({$color[1]})\n";
        } catch (PDOException $e) {
            // Si ya existe, ignorar
            if ($e->getCode() != 23000) { // 23000 = duplicate entry
                throw $e;
            }
            echo "  - {$color[0]} (ya existe)\n";
        }
    }
    
    // Insertar almacenamientos
    $almacenamientos = ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'];
    $storageAtributoId = 2; // ID del atributo Almacenamiento
    
    echo "\nInsertando opciones de almacenamiento...\n";
    $stmt = $db->prepare("INSERT INTO atributo_valores (atributo_id, valor, color_hex, activo) VALUES (?, ?, NULL, 1)");
    
    foreach ($almacenamientos as $storage) {
        try {
            $stmt->execute([$storageAtributoId, $storage]);
            echo "  ✓ {$storage}\n";
        } catch (PDOException $e) {
            if ($e->getCode() != 23000) {
                throw $e;
            }
            echo "  - {$storage} (ya existe)\n";
        }
    }
    
    // Mostrar resumen
    echo "\n" . str_repeat("=", 50) . "\n";
    echo "RESUMEN DE VALORES ACTUALES:\n";
    echo str_repeat("=", 50) . "\n\n";
    
    $stmt = $db->query("
        SELECT a.nombre AS atributo, COUNT(*) as total
        FROM atributo_valores av
        JOIN atributos a ON av.atributo_id = a.id
        WHERE av.activo = 1
        GROUP BY a.nombre
    ");
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "{$row['atributo']}: {$row['total']} valores\n";
    }
    
    echo "\n✓ Script completado exitosamente!\n";
    
} catch (Exception $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
