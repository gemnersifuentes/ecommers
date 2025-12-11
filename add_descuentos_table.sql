-- =====================================================
-- AGREGAR TABLA DE DESCUENTOS
-- =====================================================
-- Ejecutar este script en phpMyAdmin
-- Copiar y pegar todo el contenido

USE db_tienda_redhard;

-- Crear tabla de descuentos
CREATE TABLE IF NOT EXISTS descuentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL COMMENT 'Nombre del descuento (ej: Black Friday 2024)',
    descripcion TEXT COMMENT 'Descripción detallada del descuento',
    tipo ENUM('porcentaje', 'monto_fijo') DEFAULT 'porcentaje' COMMENT 'Tipo de descuento',
    valor DECIMAL(10, 2) NOT NULL COMMENT 'Valor del descuento (% o monto)',
    fecha_inicio DATE NOT NULL COMMENT 'Fecha de inicio del descuento',
    fecha_fin DATE NOT NULL COMMENT 'Fecha de fin del descuento',
    activo TINYINT(1) DEFAULT 1 COMMENT 'Si el descuento está activo',
    aplica_a ENUM('producto', 'categoria', 'marca') NOT NULL COMMENT 'A qué se aplica el descuento',
    producto_id INT DEFAULT NULL COMMENT 'ID del producto (si aplica_a = producto)',
    categoria_id INT DEFAULT NULL COMMENT 'ID de la categoría (si aplica_a = categoria)',
    marca_id INT DEFAULT NULL COMMENT 'ID de la marca (si aplica_a = marca)',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Relaciones con otras tablas
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
    FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE CASCADE,
    
    -- Índices para mejorar el rendimiento
    INDEX idx_fecha_inicio (fecha_inicio),
    INDEX idx_fecha_fin (fecha_fin),
    INDEX idx_producto (producto_id),
    INDEX idx_categoria (categoria_id),
    INDEX idx_marca (marca_id),
    INDEX idx_activo (activo),
    INDEX idx_aplica_a (aplica_a)
);

-- Insertar descuentos de ejemplo
INSERT INTO descuentos (nombre, descripcion, tipo, valor, fecha_inicio, fecha_fin, activo, aplica_a, producto_id, categoria_id, marca_id) VALUES 
-- Descuento por producto específico
('Descuento RTX 4060', '15% de descuento en NVIDIA RTX 4060', 'porcentaje', 15.00, '2024-11-01', '2024-12-31', 1, 'producto', 10, NULL, NULL),

-- Descuento por categoría completa
('Black Friday - Memorias RAM', '20% de descuento en todas las memorias RAM', 'porcentaje', 20.00, '2024-11-24', '2024-11-30', 1, 'categoria', NULL, 1, NULL),

-- Descuento por marca
('Descuento Especial AMD', '10% en todos los productos AMD', 'porcentaje', 10.00, '2024-11-15', '2024-12-15', 1, 'marca', NULL, NULL, 6),

-- Descuento en monto fijo
('Descuento Monitor Samsung', '$50 de descuento en monitores Samsung', 'monto_fijo', 50.00, '2024-11-01', '2024-12-31', 1, 'producto', 30, NULL, NULL),

-- Cyber Monday - Procesadores
('Cyber Monday - Procesadores', '25% en procesadores Intel y AMD', 'porcentaje', 25.00, '2024-12-01', '2024-12-05', 1, 'categoria', NULL, 4, NULL);

-- Mensaje de éxito
SELECT 'Tabla de descuentos creada exitosamente!' as Resultado;
SELECT COUNT(*) as 'Total de descuentos de ejemplo' FROM descuentos;
