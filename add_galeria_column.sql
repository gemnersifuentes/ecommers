-- Agregar columna galeria_imagenes a la tabla productos
USE db_tienda_tec;

ALTER TABLE productos ADD COLUMN galeria_imagenes TEXT AFTER imagen;
