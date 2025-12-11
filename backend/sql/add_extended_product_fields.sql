-- Agregar columnas faltantes a la tabla productos

ALTER TABLE productos
ADD COLUMN IF NOT EXISTS meta_titulo VARCHAR(255) NULL AFTER descripcion,
ADD COLUMN IF NOT EXISTS meta_descripcion TEXT NULL AFTER meta_titulo,
ADD COLUMN IF NOT EXISTS palabras_clave TEXT NULL AFTER meta_descripcion,
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) NULL AFTER palabras_clave,
ADD COLUMN IF NOT EXISTS destacado TINYINT(1) DEFAULT 0 AFTER slug,
ADD COLUMN IF NOT EXISTS nuevo TINYINT(1) DEFAULT 0 AFTER destacado,
ADD COLUMN IF NOT EXISTS etiquetas TEXT NULL AFTER nuevo,
ADD COLUMN IF NOT EXISTS sku VARCHAR(100) NULL AFTER etiquetas,
ADD COLUMN IF NOT EXISTS peso DECIMAL(10,2) NULL AFTER sku,
ADD COLUMN IF NOT EXISTS largo DECIMAL(10,2) NULL AFTER peso,
ADD COLUMN IF NOT EXISTS ancho DECIMAL(10,2) NULL AFTER largo,
ADD COLUMN IF NOT EXISTS alto DECIMAL(10,2) NULL AFTER ancho,
ADD COLUMN IF NOT EXISTS envio_gratis TINYINT(1) DEFAULT 0 AFTER alto,
ADD COLUMN IF NOT EXISTS stock_minimo INT(11) DEFAULT 5 AFTER envio_gratis,
ADD COLUMN IF NOT EXISTS condicion ENUM('nuevo', 'usado', 'reacondicionado') DEFAULT 'nuevo' AFTER stock_minimo,
ADD COLUMN IF NOT EXISTS garantia_meses INT(11) DEFAULT 12 AFTER condicion,
ADD COLUMN IF NOT EXISTS marca_fabricante VARCHAR(200) NULL AFTER garantia_meses,
ADD COLUMN IF NOT EXISTS modelo VARCHAR(200) NULL AFTER marca_fabricante,
ADD COLUMN IF NOT EXISTS video_url VARCHAR(500) NULL AFTER modelo,
ADD COLUMN IF NOT EXISTS politica_devolucion_dias INT(11) DEFAULT 30 AFTER video_url;

-- Crear índice único para slug
CREATE UNIQUE INDEX idx_productos_slug ON productos(slug);

-- Crear índice para SKU
CREATE INDEX idx_productos_sku ON productos(sku);
