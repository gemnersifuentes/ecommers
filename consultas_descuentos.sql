-- =====================================================
-- CONSULTAS PARA APLICAR DESCUENTOS
-- =====================================================
-- Este archivo contiene todas las consultas necesarias
-- para trabajar con descuentos en tu tienda

USE db_tienda_redhard;

-- =====================================================
-- 1. VISTA: Productos con descuento aplicado
-- =====================================================
-- Esta vista calcula automáticamente el precio con descuento
CREATE OR REPLACE VIEW vista_productos_con_descuento AS
SELECT 
    p.id,
    p.nombre,
    p.descripcion,
    p.imagen,
    p.precio_base,
    p.stock,
    p.activo,
    c.nombre AS categoria,
    c.id AS categoria_id,
    m.nombre AS marca,
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
        -- Si tiene descuento activo
        WHEN d.id IS NOT NULL AND d.activo = 1 
             AND CURDATE() BETWEEN d.fecha_inicio AND d.fecha_fin THEN
            CASE 
                -- Si es porcentaje
                WHEN d.tipo = 'porcentaje' THEN 
                    p.precio_base * (d.valor / 100)
                -- Si es monto fijo
                WHEN d.tipo = 'monto_fijo' THEN 
                    d.valor
                ELSE 0
            END
        ELSE 0
    END AS descuento_aplicado,
    
    -- Precio final con descuento
    CASE 
        -- Si tiene descuento activo
        WHEN d.id IS NOT NULL AND d.activo = 1 
             AND CURDATE() BETWEEN d.fecha_inicio AND d.fecha_fin THEN
            CASE 
                -- Si es porcentaje
                WHEN d.tipo = 'porcentaje' THEN 
                    p.precio_base - (p.precio_base * (d.valor / 100))
                -- Si es monto fijo
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
-- Unir con descuentos (por producto, categoría o marca)
LEFT JOIN descuentos d ON (
    (d.aplica_a = 'producto' AND d.producto_id = p.id) OR
    (d.aplica_a = 'categoria' AND d.categoria_id = p.categoria_id) OR
    (d.aplica_a = 'marca' AND d.marca_id = p.marca_id)
)
WHERE p.activo = 1;

-- =====================================================
-- 2. CONSULTA: Obtener todos los productos con descuento
-- =====================================================
-- Usa esta consulta en tu API para listar productos
SELECT * FROM vista_productos_con_descuento
ORDER BY tiene_descuento DESC, nombre ASC;

-- =====================================================
-- 3. CONSULTA: Solo productos CON descuento activo
-- =====================================================
SELECT * FROM vista_productos_con_descuento
WHERE tiene_descuento = 1
ORDER BY descuento_aplicado DESC;

-- =====================================================
-- 4. CONSULTA: Productos sin descuento
-- =====================================================
SELECT * FROM vista_productos_con_descuento
WHERE tiene_descuento = 0
ORDER BY nombre ASC;

-- =====================================================
-- 5. CONSULTA: Descuentos activos HOY
-- =====================================================
SELECT 
    d.id,
    d.nombre,
    d.descripcion,
    d.tipo,
    d.valor,
    d.aplica_a,
    d.fecha_inicio,
    d.fecha_fin,
    
    -- Información de lo que afecta
    CASE 
        WHEN d.aplica_a = 'producto' THEN p.nombre
        WHEN d.aplica_a = 'categoria' THEN c.nombre
        WHEN d.aplica_a = 'marca' THEN m.nombre
    END AS afecta_a,
    
    -- Días restantes
    DATEDIFF(d.fecha_fin, CURDATE()) AS dias_restantes
    
FROM descuentos d
LEFT JOIN productos p ON d.producto_id = p.id
LEFT JOIN categorias c ON d.categoria_id = c.id
LEFT JOIN marcas m ON d.marca_id = m.id
WHERE d.activo = 1
  AND CURDATE() BETWEEN d.fecha_inicio AND d.fecha_fin
ORDER BY dias_restantes ASC;

-- =====================================================
-- 6. CONSULTA: Obtener descuento de un producto específico
-- =====================================================
-- Reemplaza 10 con el ID del producto que quieres consultar
SELECT * FROM vista_productos_con_descuento
WHERE id = 10;

-- =====================================================
-- 7. CONSULTA: Productos de una categoría con descuento
-- =====================================================
-- Ejemplo: Categoría 1 (Memorias RAM)
SELECT * FROM vista_productos_con_descuento
WHERE categoria_id = 1
ORDER BY tiene_descuento DESC, precio_final ASC;

-- =====================================================
-- 8. CONSULTA: Productos de una marca con descuento
-- =====================================================
-- Ejemplo: Marca 6 (AMD)
SELECT * FROM vista_productos_con_descuento
WHERE marca_id = 6
ORDER BY tiene_descuento DESC, precio_final ASC;

-- =====================================================
-- 9. CONSULTA: Top 10 mejores descuentos
-- =====================================================
SELECT 
    nombre,
    marca,
    categoria,
    precio_base,
    descuento_aplicado,
    precio_final,
    descuento_nombre,
    descuento_valor,
    descuento_tipo,
    -- Porcentaje de ahorro
    ROUND((descuento_aplicado / precio_base) * 100, 2) AS porcentaje_ahorro
FROM vista_productos_con_descuento
WHERE tiene_descuento = 1
ORDER BY descuento_aplicado DESC
LIMIT 10;

-- =====================================================
-- 10. CONSULTA: Resumen de descuentos activos
-- =====================================================
SELECT 
    d.nombre AS descuento,
    d.tipo,
    d.valor,
    d.aplica_a,
    COUNT(DISTINCT p.id) AS productos_afectados,
    
    -- Total de ahorro potencial
    SUM(
        CASE 
            WHEN d.tipo = 'porcentaje' THEN 
                p.precio_base * (d.valor / 100)
            WHEN d.tipo = 'monto_fijo' THEN 
                d.valor
            ELSE 0
        END
    ) AS ahorro_total_potencial,
    
    d.fecha_inicio,
    d.fecha_fin
    
FROM descuentos d
LEFT JOIN productos p ON (
    (d.aplica_a = 'producto' AND d.producto_id = p.id) OR
    (d.aplica_a = 'categoria' AND d.categoria_id = p.categoria_id) OR
    (d.aplica_a = 'marca' AND d.marca_id = p.marca_id)
)
WHERE d.activo = 1
  AND CURDATE() BETWEEN d.fecha_inicio AND d.fecha_fin
GROUP BY d.id
ORDER BY productos_afectados DESC;

-- =====================================================
-- 11. FUNCIÓN: Calcular precio con descuento
-- =====================================================
-- Esta función puede ser usada en cualquier consulta
DELIMITER $$

CREATE FUNCTION IF NOT EXISTS calcular_precio_descuento(
    producto_id_param INT
) 
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE precio_final DECIMAL(10,2);
    
    SELECT 
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
        END INTO precio_final
    FROM productos p
    LEFT JOIN descuentos d ON (
        (d.aplica_a = 'producto' AND d.producto_id = p.id) OR
        (d.aplica_a = 'categoria' AND d.categoria_id = p.categoria_id) OR
        (d.aplica_a = 'marca' AND d.marca_id = p.marca_id)
    )
    WHERE p.id = producto_id_param
    LIMIT 1;
    
    RETURN IFNULL(precio_final, 0);
END$$

DELIMITER ;

-- Ejemplo de uso de la función:
-- SELECT nombre, precio_base, calcular_precio_descuento(id) AS precio_final FROM productos;

-- =====================================================
-- 12. CONSULTA: Reportes - Ventas con descuento aplicado
-- =====================================================
-- Para modificar la tabla detalle_pedido y agregar el descuento aplicado
-- Primero agrega estas columnas (ejecutar una sola vez):
-- ALTER TABLE detalle_pedido ADD COLUMN descuento_aplicado DECIMAL(10,2) DEFAULT 0 AFTER cantidad;
-- ALTER TABLE detalle_pedido ADD COLUMN precio_unitario DECIMAL(10,2) AFTER producto_id;

-- =====================================================
-- EJEMPLOS DE USO EN PHP (para tu API)
-- =====================================================
/*

// 1. Obtener todos los productos con descuento
$sql = "SELECT * FROM vista_productos_con_descuento ORDER BY tiene_descuento DESC";

// 2. Obtener un producto específico con su descuento
$sql = "SELECT * FROM vista_productos_con_descuento WHERE id = ?";

// 3. Filtrar productos con descuento activo
$sql = "SELECT * FROM vista_productos_con_descuento WHERE tiene_descuento = 1";

// 4. Calcular precio en PHP (alternativa)
function calcularPrecioConDescuento($producto) {
    if ($producto['tiene_descuento'] == 1) {
        return $producto['precio_final'];
    }
    return $producto['precio_base'];
}

// 5. Mostrar badge de descuento
function obtenerBadgeDescuento($producto) {
    if ($producto['tiene_descuento'] == 1) {
        if ($producto['descuento_tipo'] == 'porcentaje') {
            return "-" . $producto['descuento_valor'] . "%";
        } else {
            return "-$" . $producto['descuento_valor'];
        }
    }
    return null;
}

*/
