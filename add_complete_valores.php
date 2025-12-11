<?php
require_once __DIR__ . '/backend/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "=== AGREGANDO VALORES COMPLETOS ===\n\n";
    
    // Limpiar valores existentes
    echo "Limpiando valores anteriores...\n";
    $db->exec("DELETE FROM atributo_valores");
    
    // ===== COLORES COMPLETOS =====
    echo "\nInsertando COLORES...\n";
    $colores = [
        // Colores básicos
        ['Rojo', '#FF0000'],
        ['Azul', '#0000FF'],
        ['Azul Marino', '#000080'],
        ['Azul Cielo', '#87CEEB'],
        ['Azul Turquesa', '#40E0D0'],
        ['Verde', '#00FF00'],
        ['Verde Oscuro', '#006400'],
        ['Verde Lima', '#32CD32'],
        ['Verde Menta', '#98FF98'],
        ['Amarillo', '#FFFF00'],
        ['Naranja', '#FFA500'],
        ['Morado', '#800080'],
        ['Violeta', '#EE82EE'],
        ['Rosa', '#FFC0CB'],
        ['Rosa Fuerte', '#FF1493'],
        ['Negro', '#000000'],
        ['Blanco', '#FFFFFF'],
        ['Gris', '#808080'],
        ['Gris Oscuro', '#404040'],
        ['Gris Claro', '#D3D3D3'],
        ['Plateado', '#C0C0C0'],
        ['Dorado', '#FFD700'],
        ['Bronce', '#CD7F32'],
        ['Beige', '#F5F5DC'],
        ['Café', '#8B4513'],
        ['Marrón', '#A52A2A'],
        ['Crema', '#FFFDD0'],
        ['Coral', '#FF7F50'],
        ['Lavanda', '#E6E6FA'],
        ['Celeste', '#B0E0E6'],
        ['Cian', '#00FFFF'],
        ['Magenta', '#FF00FF'],
        ['Índigo', '#4B0082'],
        ['Borgoña', '#800020'],
        ['Granate', '#800000'],
        ['Oliva', '#808000'],
        ['Aqua', '#00FFFF'],
        ['Salmón', '#FA8072'],
        ['Durazno', '#FFDAB9'],
        ['Menta', '#3EB489'],
        ['Lila', '#C8A2C8'],
        ['Champagne', '#F7E7CE'],
        ['Oro Rosa', '#B76E79'],
        ['Azul Eléctrico', '#7DF9FF'],
        ['Verde Neón', '#39FF14'],
        ['Púrpura', '#9370DB']
    ];
    
    $stmt = $db->prepare("INSERT INTO atributo_valores (atributo_id, valor, color_hex, activo) VALUES (1, ?, ?, 1)");
    foreach ($colores as $color) {
        $stmt->execute([$color[0], $color[1]]);
    }
    echo "  ✓ " . count($colores) . " colores insertados\n";
    
    // ===== ALMACENAMIENTOS COMPLETOS =====
    echo "\nInsertando ALMACENAMIENTOS...\n";
    $almacenamientos = [
        // Almacenamientos pequeños (USB, microSD, etc)
        '8GB',
        '16GB',
        '32GB',
        '64GB',
        
        // Almacenamientos medios (smartphones, tablets)
        '128GB',
        '256GB',
        '512GB',
        
        // Almacenamientos grandes (laptops, PCs)
        '1TB',
        '2TB',
        '3TB',
        '4TB',
        '5TB',
        '6TB',
        '8TB',
        '10TB',
        '12TB',
        '16TB',
        '18TB',
        '20TB',
        
        // SSDs específicos
        '120GB',
        '240GB',
        '480GB',
        '960GB',
        '500GB',
        '750GB',
        '1.5TB',
        
        // Para servidores/enterprise
        '24TB',
        '32TB',
        '64TB'
    ];
    
    $stmt = $db->prepare("INSERT INTO atributo_valores (atributo_id, valor, activo) VALUES (2, ?, 1)");
    foreach ($almacenamientos as $storage) {
        $stmt->execute([$storage]);
    }
    echo "  ✓ " . count($almacenamientos) . " almacenamientos insertados\n";
    
    // ===== MEMORIAS RAM COMPLETAS =====
    echo "\nActualizando MEMORIAS RAM...\n";
    $rams = [
        '2GB',
        '4GB',
        '6GB',
        '8GB',
        '12GB',
        '16GB',
        '24GB',
        '32GB',
        '48GB',
        '64GB',
        '128GB',
        '256GB'
    ];
    
    $stmt = $db->prepare("INSERT INTO atributo_valores (atributo_id, valor, activo) VALUES (3, ?, 1)");
    foreach ($rams as $ram) {
        $stmt->execute([$ram]);
    }
    echo "  ✓ " . count($rams) . " memorias RAM insertadas\n";
    
    // ===== TALLAS =====
    echo "\nInsertando TALLAS...\n";
    $tallas = [
        'XS',
        'S',
        'M',
        'L',
        'XL',
        'XXL',
        'XXXL',
        'One Size',
        'Unitalla'
    ];
    
    $stmt = $db->prepare("INSERT INTO atributo_valores (atributo_id, valor, activo) VALUES (4, ?, 1)");
    foreach ($tallas as $talla) {
        $stmt->execute([$talla]);
    }
    echo "  ✓ " . count($tallas) . " tallas insertadas\n";
    
    // VERIFICACIÓN
    echo "\n=== RESUMEN FINAL ===\n";
    $result = $db->query("
        SELECT a.nombre, COUNT(av.id) as total
        FROM atributos a
        LEFT JOIN atributo_valores av ON a.id = av.atributo_id
        GROUP BY a.id, a.nombre
    ");
    
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        echo "✓ {$row['nombre']}: {$row['total']} valores\n";
    }
    
    $total = $db->query("SELECT COUNT(*) FROM atributo_valores")->fetchColumn();
    echo "\n✅ TOTAL: $total valores insertados exitosamente!\n";
    
} catch (Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
}
