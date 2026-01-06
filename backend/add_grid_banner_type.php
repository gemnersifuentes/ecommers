<?php
require_once __DIR__ . '/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // 1. Modify Column to include 'grid'
    // Note: In MySQL, modifying an ENUM requires restating all values
    $sql = "ALTER TABLE banners MODIFY COLUMN tipo ENUM('carousel', 'lateral', 'grid') DEFAULT 'carousel'";
    $db->exec($sql);
    echo "Column 'tipo' updated to include 'grid'.\n";

    // 2. Check if grid banners exist
    $stmt = $db->query("SELECT COUNT(*) FROM banners WHERE tipo = 'grid'");
    $count = $stmt->fetchColumn();

    if ($count == 0) {
        // 3. Seed Grid Banners (Gamer & Pro) to match the current look
        $banners = [
            [
                'titulo' => 'MUNDO GAMER',
                'subtitulo' => 'HIGH PERFORMANCE',
                'descripcion' => 'Potencia tu juego con lo último en GPUs y periféricos.',
                'imagen' => '', // Using default or blank
                'link' => '/productos?categoria=1',
                'texto_boton' => 'Ver colección',
                'orden' => 1,
                'tipo' => 'grid',
                'gradiente' => 'bg-gradient-to-br from-purple-900 to-indigo-900'
            ],
            [
                'titulo' => 'ESPACIO PROFESIONAL',
                'subtitulo' => 'PRODUCTIVIDAD',
                'descripcion' => 'Equipos de alto rendimiento para creadores y oficina.',
                'imagen' => '',
                'link' => '/productos?categoria=2',
                'texto_boton' => 'Explorar',
                'orden' => 2,
                'tipo' => 'grid',
                'gradiente' => 'bg-gradient-to-br from-slate-800 to-gray-900'
            ]
        ];

        $insert = "INSERT INTO banners (titulo, subtitulo, descripcion, imagen, link, texto_boton, orden, tipo, gradiente, activo) VALUES (:titulo, :subtitulo, :descripcion, :imagen, :link, :texto_boton, :orden, :tipo, :gradiente, 1)";
        $stmt = $db->prepare($insert);

        foreach ($banners as $banner) {
            $stmt->execute($banner);
        }
        echo "Seeded 2 'grid' banners.\n";

    } else {
        echo "'Grid' banners already exist.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
