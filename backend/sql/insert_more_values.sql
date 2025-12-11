-- Insertar más colores en atributo_valores
-- atributo_id 1 = Color

INSERT INTO atributo_valores (atributo_id, valor, color_hex, activo) VALUES
(1, 'Rojo', '#FF0000', 1),
(1, 'Blanco', '#FFFFFF', 1),
(1, 'Verde', '#00FF00', 1),
(1, 'Amarillo', '#FFFF00', 1),
(1, 'Rosa', '#FFC0CB', 1),
(1, 'Morado', '#800080', 1),
(1, 'Gris', '#808080', 1),
(1, 'Naranja', '#FFA500', 1),
(1, 'Dorado', '#FFD700', 1),
(1, 'Plata', '#C0C0C0', 1);

-- Insertar más opciones de almacenamiento
-- atributo_id 2 = Almacenamiento

INSERT INTO atributo_valores (atributo_id, valor, color_hex, activo) VALUES
(2, '64 GB', NULL, 1),
(2, '128 GB', NULL, 1),
(2, '256 GB', NULL, 1),
(2, '512 GB', NULL, 1),
(2, '1 TB', NULL, 1);

-- Verificar los valores insertados
SELECT av.id, av.atributo_id, a.nombre AS atributo, av.valor, av.color_hex
FROM atributo_valores av
JOIN atributos a ON av.atributo_id = a.id
ORDER BY av.atributo_id, av.valor;
