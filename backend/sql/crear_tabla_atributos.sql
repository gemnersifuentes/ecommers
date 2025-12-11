-- Tabla recursiva para atributos de productos (colores, tamaños, etc.)
-- que NO afectan el precio, solo el stock

CREATE TABLE IF NOT EXISTS producto_atributos (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    producto_id  INT NOT NULL,
    tipo         ENUM('color','tamaño','empaque') NOT NULL,
    valor        VARCHAR(50) NOT NULL,
    stock        INT DEFAULT 0,
    padre_id     INT DEFAULT NULL,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (padre_id)   REFERENCES producto_atributos(id) ON DELETE SET NULL,
    UNIQUE KEY uq_prod_tipo_valor (producto_id, tipo, valor),
    INDEX idx_producto_tipo (producto_id, tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
