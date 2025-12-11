-- EJECUTAR EN phpMyAdmin o MySQL Workbench
-- Copiar y pegar todo este código

USE db_tienda_tec;

-- 1. Crear tabla de marcas
CREATE TABLE IF NOT EXISTS marcas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    logo VARCHAR(255),
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Agregar columna marca_id a productos (solo si no existe)
SET @dbname = DATABASE();
SET @tablename = 'productos';
SET @columnname = 'marca_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT AFTER categoria_id')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 3. Insertar marcas de ejemplo
INSERT IGNORE INTO marcas (id, nombre, descripcion) VALUES 
(1, 'Kingston', 'Fabricante líder de memorias y almacenamiento'),
(2, 'Corsair', 'Componentes de alto rendimiento para gaming'),
(3, 'Samsung', 'Tecnología electrónica de consumo'),
(4, 'Western Digital', 'Soluciones de almacenamiento de datos'),
(5, 'NVIDIA', 'Procesadores gráficos y tecnología visual'),
(6, 'AMD', 'Procesadores y tarjetas gráficas'),
(7, 'Intel', 'Procesadores y tecnología de computación'),
(8, 'ASUS', 'Hardware y electrónica de consumo'),
(9, 'Logitech', 'Periféricos y accesorios para PC'),
(10, 'Razer', 'Accesorios gaming de alta gama');

-- 4. Mensaje de éxito
SELECT 'Tabla de marcas creada exitosamente!' as Resultado;
