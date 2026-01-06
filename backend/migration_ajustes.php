<?php
require_once __DIR__ . '/config/conexion.php';

try {
    $db->exec("
        CREATE TABLE IF NOT EXISTS ajustes (
            id INT PRIMARY KEY AUTO_INCREMENT,
            nombre_empresa VARCHAR(255) NOT NULL,
            ruc VARCHAR(20),
            telefono VARCHAR(50),
            correo_contacto VARCHAR(255),
            direccion TEXT,
            mision TEXT,
            vision TEXT,
            smtp_host VARCHAR(255),
            smtp_user VARCHAR(255),
            smtp_pass VARCHAR(255),
            smtp_port INT,
            redes_sociales JSON,
            logo_url VARCHAR(255),
            favicon_url VARCHAR(255),
            color_primario VARCHAR(7) DEFAULT '#f97316',
            color_secundario VARCHAR(7) DEFAULT '#1e293b'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // Insertar datos iniciales si la tabla está vacía
    $stmtCount = $db->query("SELECT COUNT(*) FROM ajustes");
    if ($stmtCount->fetchColumn() == 0) {
        $stmt = $db->prepare("
            INSERT INTO ajustes (
                nombre_empresa, telefono, correo_contacto, 
                smtp_host, smtp_user, smtp_pass, smtp_port,
                redes_sociales
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $redes = json_encode([
            'facebook' => '',
            'instagram' => '',
            'whatsapp' => ''
        ]);

        $stmt->execute([
            'TiendaTEC',
            '914746440',
            'sifuentesgemner@gmail.com',
            'smtp.gmail.com',
            'sifuentesgemner@gmail.com',
            'fice eccn nmaj mebx',
            587,
            $redes
        ]);
        echo "Tabla ajustes creada e inicializada correctamente.";
    } else {
        echo "La tabla ajustes ya existe.";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
