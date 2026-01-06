-- Tabla para la recuperación de contraseñas
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expira DATETIME NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_correo (correo),
    INDEX idx_token (token)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
