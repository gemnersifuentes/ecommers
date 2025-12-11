<?php
// Migración: Crear tabla direcciones para gestión de direcciones de usuario

// Configuración de base de datos directa
$host = 'localhost';
$db_name = 'db_tienda_redhard';
$username = 'root';
$password = '';

try {
    $db = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Verificar si la tabla ya existe
    $checkTable = $db->query("SHOW TABLES LIKE 'direcciones'");
    if ($checkTable->rowCount() > 0) {
        echo "La tabla 'direcciones' ya existe.\n";
        exit;
    }
    
    // Crear tabla direcciones
    $sql = "CREATE TABLE direcciones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id INT NOT NULL,
        nombre_destinatario VARCHAR(255) NOT NULL,
        telefono VARCHAR(20) NOT NULL,
        direccion TEXT NOT NULL,
        departamento VARCHAR(100) NOT NULL,
        provincia VARCHAR(100) NOT NULL,
        distrito VARCHAR(100) NOT NULL,
        codigo_postal VARCHAR(20),
        referencia VARCHAR(255),
        es_predeterminada TINYINT(1) DEFAULT 0,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_usuario (usuario_id),
        INDEX idx_predeterminada (es_predeterminada)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $db->exec($sql);
    echo "✓ Tabla 'direcciones' creada exitosamente.\n\n";
    
    // Verificar estructura
    $result = $db->query("DESCRIBE direcciones");
    echo "Estructura de la tabla 'direcciones':\n";
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        echo "  - {$row['Field']} ({$row['Type']})\n";
    }
    
    echo "\n✓ Migración completada exitosamente.\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
