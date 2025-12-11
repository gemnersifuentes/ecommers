-- =====================================================
-- CONFIGURACIÓN COMPLETA DEL SISTEMA DE DESCUENTOS
-- =====================================================
-- Ejecutar este script COMPLETO en phpMyAdmin:
-- 1. Abre phpMyAdmin (http://localhost/phpmyadmin)
-- 2. Selecciona la base de datos "db_tienda_redhard"
-- 3. Ve a la pestaña "SQL"
-- 4. Copia y pega TODO este archivo
-- 5. Haz clic en "Continuar"

USE db_tienda_redhard;

-- =====================================================
-- PASO 1: CREAR TABLA DE DESCUENTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS descuentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL COMMENT 'Nombre del descuento',
    descripcion TEXT COMMENT 'Descripción detallada',
    tipo ENUM('porcentaje', 'monto_fijo') DEFAULT 'porcentaje',
    valor DECIMAL(10, 2) NOT NULL COMMENT 'Valor del descuento',
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    aplica_a ENUM('producto', 'categoria', 'marca') NOT NULL,
    producto_id INT DEFAULT NULL,
    categoria_id INT DEFAULT NULL,
    marca_id INT DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
    FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE CASCADE,
    
    INDEX idx_fecha_inicio (fecha_inicio),
    INDEX idx_fecha_fin (fecha_fin),
    INDEX idx_producto (producto_id),
    INDEX idx_categoria (categoria_id),
    INDEX idx_marca (marca_id),
    INDEX idx_activo (activo)
);

-- =====================================================
-- PASO 2: CREAR VISTA DE PRODUCTOS CON DESCUENTOS
-- =====================================================

DROP VIEW IF EXISTS vista_productos_con_descuento;

CREATE VIEW vista_productos_con_descuento AS
SELECT 
    p.id,
    p.nombre,
    p.descripcion,
    p.imagen,
    p.galeria_imagenes,
    p.precio_base,
    p.stock,
    p.activo,
    p.fecha_creacion,
    
    -- Categoría
    c.nombre AS categoria,
    c.nombre AS categoria_nombre,
    c.id AS categoria_id,
    
    -- Marca
    m.nombre AS marca,
    m.nombre AS marca_nombre,
    m.id AS marca_id,
    m.logo AS marca_logo,
    
    -- Información del descuento
    d.id AS descuento_id,
    d.nombre AS descuento_nombre,
    d.tipo AS descuento_tipo,
    d.valor AS descuento_valor,
    d.aplica_a AS descuento_aplica_a,
    d.fecha_inicio AS descuento_fecha_inicio,
    d.fecha_fin AS descuento_fecha_fin,
    
    -- Cálculo del descuento aplicado
    CASE 
        WHEN d.id IS NOT NULL AND d.activo = 1 
             AND CURDATE() BETWEEN d.fecha_inicio AND d.fecha_fin THEN
            CASE 
                WHEN d.tipo = 'porcentaje' THEN 
                    p.precio_base * (d.valor / 100)
                WHEN d.tipo = 'monto_fijo' THEN 
                    d.valor
                ELSE 0
            END
        ELSE 0
    END AS descuento_aplicado,
    
    -- Precio final con descuento
    CASE 
        WHEN d.id IS NOT NULL AND d.activo = 1 
             AND CURDATE() BETWEEN d.fecha_inicio AND d.fecha_fin THEN
            CASE 
                WHEN d.tipo = 'porcentaje' THEN 
                    p.precio_base - (p.precio_base * (d.valor / 100))
                WHEN d.tipo = 'monto_fijo' THEN 
                    GREATEST(p.precio_base - d.valor, 0)
                ELSE p.precio_base
            END
        ELSE p.precio_base
    END AS precio_final,
    
    -- Indicador de descuento activo
    CASE 
        WHEN d.id IS NOT NULL AND d.activo = 1 
             AND CURDATE() BETWEEN d.fecha_inicio AND d.fecha_fin 
        THEN 1 
        ELSE 0 
    END AS tiene_descuento
    
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN marcas m ON p.marca_id = m.id
LEFT JOIN descuentos d ON (
    (d.aplica_a = 'producto' AND d.producto_id = p.id) OR
    (d.aplica_a = 'categoria' AND d.categoria_id = p.categoria_id) OR
    (d.aplica_a = 'marca' AND d.marca_id = p.marca_id)
)
WHERE p.activo = 1;

-- =====================================================
-- PASO 3: DESCUENTOS DE EJEMPLO (OPCIONAL)
-- =====================================================

-- NOTA: Ajusta los IDs según tus productos/categorías/marcas reales
-- Puedes comentar esto si no quieres datos de ejemplo

-- INSERT INTO descuentos (nombre, descripcion, tipo, valor, fecha_inicio, fecha_fin, activo, aplica_a, producto_id) 
-- VALUES ('Descuento Ejemplo', 'Ejemplo de descuento', 'porcentaje', 15.00, '2024-11-01', '2024-12-31', 1, 'producto', 1);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT 'Tabla de descuentos creada!' as Paso_1;
SELECT 'Vista de productos con descuentos creada!' as Paso_2;
SELECT COUNT(*) as Total_Productos FROM vista_productos_con_descuento;
SELECT COUNT(*) as Total_Descuentos FROM descuentos;

-- =====================================================
-- LISTO! Ahora recarga la página de productos
-- =====================================================
