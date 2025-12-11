-- =====================================================
-- CORREGIR VISTA DE DESCUENTOS
-- =====================================================
-- Ejecutar este script para actualizar la vista con los nombres correctos

USE db_tienda_redhard;

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
    
    -- Categoría (con ambos nombres para compatibilidad)
    c.nombre AS categoria,
    c.nombre AS categoria_nombre,
    c.id AS categoria_id,
    
    -- Marca (con ambos nombres para compatibilidad)
    m.nombre AS marca,
    m.nombre AS marca_nombre,
    m.id AS marca_id,
    m.logo AS marca_logo,
    
    -- Información del descuento (si existe)
    d.id AS descuento_id,
    d.nombre AS descuento_nombre,
    d.tipo AS descuento_tipo,
    d.valor AS descuento_valor,
    d.aplica_a AS descuento_aplica_a,
    d.fecha_inicio AS descuento_fecha_inicio,
    d.fecha_fin AS descuento_fecha_fin,
    
    -- Cálculo del descuento
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
                    p.precio_base - d.valor
                ELSE p.precio_base
            END
        ELSE p.precio_base
    END AS precio_final,
    
    -- Indicador si tiene descuento activo
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

-- Verificar que funcione
SELECT * FROM vista_productos_con_descuento LIMIT 5;
