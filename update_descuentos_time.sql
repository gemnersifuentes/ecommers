-- Script SQL para actualizar las fechas de fin de descuentos
-- Ejecuta este script en phpMyAdmin

-- Actualizar todas las fechas_fin para que terminen a las 23:59:59
UPDATE descuentos 
SET fecha_fin = DATE_FORMAT(fecha_fin, '%Y-%m-%d 23:59:59')
WHERE TIME(fecha_fin) = '00:00:00';

-- Actualizar todas las fechas_inicio para que comiencen a las 00:00:00
UPDATE descuentos 
SET fecha_inicio = DATE_FORMAT(fecha_inicio, '%Y-%m-%d 00:00:00')
WHERE TIME(fecha_inicio) != '00:00:00';

-- Ver los descuentos actualizados
SELECT id, nombre, fecha_inicio, fecha_fin, activo 
FROM descuentos 
ORDER BY fecha_fin DESC;
