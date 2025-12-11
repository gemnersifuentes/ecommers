<?php
// Script para crear la tabla de banners
require_once __DIR__ . '/config/conexion.php';

try {
    $pdo = $database->getConnection();
    
    // Crear tabla de banners
    $sql = "CREATE TABLE IF NOT EXISTS banners (
        id INT PRIMARY KEY AUTO_INCREMENT,
        tipo ENUM('carousel', 'lateral') NOT NULL,
        titulo VARCHAR(100) NOT NULL,
        subtitulo VARCHAR(100),
        descripcion TEXT,
        texto_boton VARCHAR(50),
        link VARCHAR(255),
        imagen VARCHAR(255) NOT NULL,
        gradiente VARCHAR(100),
        orden INT DEFAULT 0,
        activo BOOLEAN DEFAULT 1,
        fecha_inicio DATETIME,
        fecha_fin DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    $pdo->exec($sql);
    echo "✅ Tabla 'banners' creada exitosamente\n\n";
    
    // Insertar banners de ejemplo
    $sql = "INSERT INTO banners (tipo, titulo, subtitulo, descripcion, texto_boton, link, imagen, gradiente, orden, activo) VALUES
    ('carousel', 'SUMMER', 'NEW ARRIVALS', 'Fashion Trends 2024', 'Explore Now', '/productos', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80', 'from-purple-400/90 via-pink-500/90 to-rose-500/90', 1, 1),
    ('carousel', 'WINTER', 'COLLECTION', 'Fashion Trends 2024', 'Explore Now', '/productos', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80', 'from-blue-500/90 via-indigo-500/90 to-purple-600/90', 2, 1),
    ('carousel', 'SPRING', 'NEW ARRIVALS', 'Fashion Trends 2024', 'Explore Now', '/productos', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80', 'from-green-400/90 via-emerald-500/90 to-teal-600/90', 3, 1),
    ('lateral', 'CRAZY DROPS', 'FLASH SALE', 'Prices starting at \$0.99', 'View All', '/productos', '', 'from-orange-500 to-orange-600', 1, 1),
    ('lateral', 'Men''s Collection', 'NEW SEASON', 'Up to 50% Off', 'Shop Now', '/productos', 'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=400&q=80', 'from-gray-900 via-gray-800 to-gray-900', 2, 1)";
    
    $pdo->exec($sql);
    echo "✅ Banners de ejemplo insertados\n\n";
    
    echo "=== Estructura completada ===\n";
    echo "Puedes gestionar los banners desde:\n";
    echo "http://localhost:3000/admin/banners\n";
    
} catch(PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
