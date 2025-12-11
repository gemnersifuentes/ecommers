-- =====================================================
-- CREAR DESCUENTOS - EJEMPLOS PRÁCTICOS
-- =====================================================
-- Ejecuta estos ejemplos en phpMyAdmin para crear descuentos

USE db_tienda_redhard;

-- =====================================================
-- EJEMPLO 1: Descuento del 15% a UN PRODUCTO ESPECÍFICO
-- =====================================================
-- Primero, encuentra el ID del producto:
SELECT id, nombre FROM productos LIMIT 10;

-- Luego crea el descuento (cambia el producto_id por el ID real):
INSERT INTO descuentos (
    nombre, 
    descripcion, 
    tipo, 
    valor, 
    fecha_inicio, 
    fecha_fin, 
    activo, 
    aplica_a, 
    producto_id
) VALUES (
    'Oferta Especial - 15% OFF',           -- Nombre del descuento
    'Descuento especial por tiempo limitado', -- Descripción
    'porcentaje',                          -- Tipo: 'porcentaje' o 'monto_fijo'
    15.00,                                 -- Valor: 15%
    '2024-11-01',                          -- Fecha inicio
    '2024-12-31',                          -- Fecha fin
    1,                                     -- Activo: 1 = sí, 0 = no
    'producto',                            -- Aplica a: 'producto'
    1                                      -- ID del producto (CAMBIAR ESTE NÚMERO)
);

-- =====================================================
-- EJEMPLO 2: Descuento del 20% a TODA UNA CATEGORÍA
-- =====================================================
-- Primero, encuentra el ID de la categoría:
SELECT id, nombre FROM categorias;

-- Luego crea el descuento:
INSERT INTO descuentos (
    nombre, 
    tipo, 
    valor, 
    fecha_inicio, 
    fecha_fin, 
    activo, 
    aplica_a, 
    categoria_id
) VALUES (
    'Black Friday - Laptops',
    'porcentaje',
    20.00,
    '2024-11-24',
    '2024-11-30',
    1,
    'categoria',
    2                                      -- ID de la categoría (CAMBIAR)
);

-- =====================================================
-- EJEMPLO 3: Descuento del 10% a TODA UNA MARCA
-- =====================================================
-- Primero, encuentra el ID de la marca:
SELECT id, nombre FROM marcas;

-- Luego crea el descuento:
INSERT INTO descuentos (
    nombre, 
    tipo, 
    valor, 
    fecha_inicio, 
    fecha_fin, 
    activo, 
    aplica_a, 
    marca_id
) VALUES (
    'Promoción AMD',
    'porcentaje',
    10.00,
    '2024-11-01',
    '2024-12-31',
    1,
    'marca',
    3                                      -- ID de la marca (CAMBIAR)
);

-- =====================================================
-- EJEMPLO 4: Descuento de MONTO FIJO ($50 de descuento)
-- =====================================================
INSERT INTO descuentos (
    nombre, 
    tipo, 
    valor, 
    fecha_inicio, 
    fecha_fin, 
    activo, 
    aplica_a, 
    producto_id
) VALUES (
    'Descuento $50',
    'monto_fijo',                          -- MONTO FIJO
    50.00,                                 -- $50 de descuento
    '2024-11-01',
    '2024-12-31',
    1,
    'producto',
    1                                      -- ID del producto (CAMBIAR)
);

-- =====================================================
-- VERIFICAR DESCUENTOS CREADOS
-- =====================================================
SELECT * FROM descuentos ORDER BY fecha_creacion DESC;

-- =====================================================
-- VER PRODUCTOS CON DESCUENTOS APLICADOS
-- =====================================================
SELECT 
    id,
    nombre,
    precio_base,
    precio_final,
    descuento_aplicado,
    tiene_descuento,
    descuento_nombre
FROM vista_productos_con_descuento
WHERE tiene_descuento = 1;

-- =====================================================
-- ACTIVAR/DESACTIVAR UN DESCUENTO
-- =====================================================
-- Desactivar:
-- UPDATE descuentos SET activo = 0 WHERE id = 1;

-- Activar:
-- UPDATE descuentos SET activo = 1 WHERE id = 1;

-- =====================================================
-- ELIMINAR UN DESCUENTO
-- =====================================================
-- DELETE FROM descuentos WHERE id = 1;
