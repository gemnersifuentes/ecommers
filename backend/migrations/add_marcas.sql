-- Migración: Agregar tabla de marcas y campo marca_id a productos
-- Ejecutar este archivo si ya tienes una base de datos existente

USE db_tienda_tec;

-- Crear tabla de marcas si no existe
CREATE TABLE IF NOT EXISTS marcas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    logo VARCHAR(255),
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar campo marca_id a la tabla productos si no existe
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS marca_id INT AFTER categoria_id,
ADD CONSTRAINT fk_producto_marca 
FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE SET NULL;

-- Insertar marcas de ejemplo si la tabla está vacía
INSERT INTO marcas (nombre, descripcion) 
SELECT * FROM (
    SELECT 'Kingston' as nombre, 'Fabricante líder de memorias y almacenamiento' as descripcion
    UNION SELECT 'Corsair', 'Componentes de alto rendimiento para gaming'
    UNION SELECT 'Samsung', 'Tecnología electrónica de consumo'
    UNION SELECT 'Western Digital', 'Soluciones de almacenamiento de datos'
    UNION SELECT 'NVIDIA', 'Procesadores gráficos y tecnología visual'
    UNION SELECT 'AMD', 'Procesadores y tarjetas gráficas'
    UNION SELECT 'Intel', 'Procesadores y tecnología de computación'
    UNION SELECT 'ASUS', 'Hardware y electrónica de consumo'
    UNION SELECT 'Logitech', 'Periféricos y accesorios para PC'
    UNION SELECT 'Razer', 'Accesorios gaming de alta gama'
) tmp
WHERE NOT EXISTS (SELECT 1 FROM marcas LIMIT 1);
