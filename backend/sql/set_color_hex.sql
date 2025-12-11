-- Script para actualizar color_hex de valores de color comunes
-- Ejecutar este script una vez para establecer los colores hexadecimales

UPDATE atributo_valores 
SET color_hex = CASE 
    WHEN LOWER(valor) LIKE '%negro%' OR LOWER(valor) LIKE '%black%' THEN '#000000'
    WHEN LOWER(valor) LIKE '%blanco%' OR LOWER(valor) LIKE '%white%' THEN '#FFFFFF'
    WHEN LOWER(valor) LIKE '%rojo%' OR LOWER(valor) LIKE '%red%' THEN '#FF0000'
    WHEN LOWER(valor) LIKE '%azul%' OR LOWER(valor) LIKE '%blue%' THEN '#0000FF'
    WHEN LOWER(valor) LIKE '%verde%' OR LOWER(valor) LIKE '%green%' THEN '#00FF00'
    WHEN LOWER(valor) LIKE '%amarillo%' OR LOWER(valor) LIKE '%yellow%' THEN '#FFFF00'
    WHEN LOWER(valor) LIKE '%naranja%' OR LOWER(valor) LIKE '%orange%' THEN '#FFA500'
    WHEN LOWER(valor) LIKE '%rosa%' OR LOWER(valor) LIKE '%pink%' THEN '#FFC0CB'
    WHEN LOWER(valor) LIKE '%morado%' OR LOWER(valor) LIKE '%purple%' THEN '#800080'
    WHEN LOWER(valor) LIKE '%gris%' OR LOWER(valor) LIKE '%gray%' OR LOWER(valor) LIKE '%grey%' THEN '#808080'
    WHEN LOWER(valor) LIKE '%dorado%' OR LOWER(valor) LIKE '%gold%' THEN '#FFD700'
    WHEN LOWER(valor) LIKE '%plata%' OR LOWER(valor) LIKE '%silver%' THEN '#C0C0C0'
    WHEN LOWER(valor) LIKE '%marron%' OR LOWER(valor) LIKE '%brown%' THEN '#964B00'
    WHEN LOWER(valor) LIKE '%turquesa%' OR LOWER(valor) LIKE '%turquoise%' THEN '#40E0D0'
    ELSE color_hex  -- Mantener el valor actual si no coincide
END
WHERE atributo_id IN (
    SELECT id FROM atributos WHERE LOWER(nombre) = 'color'
);

-- Verificar los cambios
SELECT av.valor, av.color_hex, a.nombre as atributo
FROM atributo_valores av
JOIN atributos a ON av.atributo_id = a.id
WHERE a.nombre = 'Color';
