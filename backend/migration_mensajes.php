<?php
require_once 'config/conexion.php';

try {
    // Crear tabla mensajes_contacto
    $sql = "CREATE TABLE IF NOT EXISTS mensajes_contacto (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        telefono VARCHAR(20),
        asunto VARCHAR(150),
        mensaje TEXT NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        estado ENUM('PENDIENTE', 'RESPONDIDO', 'LEIDO') DEFAULT 'PENDIENTE',
        respuesta TEXT,
        fecha_respuesta DATETIME,
        usuario_respuesta_id INT,
        FOREIGN KEY (usuario_respuesta_id) REFERENCES usuarios(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $db->exec($sql);
    echo "Tabla 'mensajes_contacto' creada o ya existe.\n";

} catch (PDOException $e) {
    echo "Error al crear la tabla: " . $e->getMessage() . "\n";
}
?>
