<?php
require_once __DIR__ . '/config/conexion.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Tabla de Reseñas
    $sqlResenas = "CREATE TABLE IF NOT EXISTS resenas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        usuario_id INT NOT NULL,
        calificacion INT NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
        comentario TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )";
    $db->exec($sqlResenas);
    echo "Tabla 'resenas' creada o verificada correctamente.\n";

    // Tabla de Favoritos
    $sqlFavoritos = "CREATE TABLE IF NOT EXISTS favoritos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        usuario_id INT NOT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        UNIQUE KEY unique_favorito (producto_id, usuario_id)
    )";
    $db->exec($sqlFavoritos);
    echo "Tabla 'favoritos' creada o verificada correctamente.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
