-- ============================================
-- DATOS DE PRUEBA PARA DASHBOARD
-- Últimos 6 días incluyendo hoy
-- ============================================

-- Primero, agregar nuevos clientes en los últimos 6 días
INSERT INTO clientes (nombre, correo, telefono, direccion, fecha_registro) VALUES
-- Hace 6 días
('Roberto García', 'roberto.garcia@test.com', '809-555-1001', 'Calle Test 1', DATE_SUB(NOW(), INTERVAL 6 DAY)),
('Laura Jiménez', 'laura.jimenez@test.com', '809-555-1002', 'Calle Test 2', DATE_SUB(NOW(), INTERVAL 6 DAY)),
-- Hace 5 días
('Miguel Torres', 'miguel.torres@test.com', '809-555-1003', 'Calle Test 3', DATE_SUB(NOW(), INTERVAL 5 DAY)),
-- Hace 4 días
('Carmen Díaz', 'carmen.diaz@test.com', '809-555-1004', 'Calle Test 4', DATE_SUB(NOW(), INTERVAL 4 DAY)),
('José Morales', 'jose.morales@test.com', '809-555-1005', 'Calle Test 5', DATE_SUB(NOW(), INTERVAL 4 DAY)),
-- Hace 3 días
('Patricia Vega', 'patricia.vega@test.com', '809-555-1006', 'Calle Test 6', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('Ricardo López', 'ricardo.lopez@test.com', '809-555-1007', 'Calle Test 7', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('Sandra Ruiz', 'sandra.ruiz@test.com', '809-555-1008', 'Calle Test 8', DATE_SUB(NOW(), INTERVAL 3 DAY)),
-- Hace 2 días
('Fernando Cruz', 'fernando.cruz@test.com', '809-555-1009', 'Calle Test 9', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Isabel Ramos', 'isabel.ramos@test.com', '809-555-1010', 'Calle Test 10', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Alberto Silva', 'alberto.silva@test.com', '809-555-1011', 'Calle Test 11', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Monica Castillo', 'monica.castillo@test.com', '809-555-1012', 'Calle Test 12', DATE_SUB(NOW(), INTERVAL 2 DAY)),
-- Hace 1 día (ayer)
('Javier Ortiz', 'javier.ortiz@test.com', '809-555-1013', 'Calle Test 13', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('Diana Vargas', 'diana.vargas@test.com', '809-555-1014', 'Calle Test 14', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('Raúl Méndez', 'raul.mendez@test.com', '809-555-1015', 'Calle Test 15', DATE_SUB(NOW(), INTERVAL 1 DAY)),
-- Hoy
('Gabriela Santos', 'gabriela.santos@test.com', '809-555-1016', 'Calle Test 16', NOW()),
('Andrés Guzmán', 'andres.guzman@test.com', '809-555-1017', 'Calle Test 17', NOW()),
('Valentina Peña', 'valentina.pena@test.com', '809-555-1018', 'Calle Test 18', NOW());

-- Ahora insertar pedidos para los últimos 6 días
-- HACE 6 DÍAS (3 pedidos - $1,450 en ventas)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'roberto.garcia@test.com'), DATE_SUB(NOW(), INTERVAL 6 DAY), 599.99, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'laura.jimenez@test.com'), DATE_SUB(NOW(), INTERVAL 6 DAY), 450.50, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'carlos@ejemplo.com'), DATE_SUB(NOW(), INTERVAL 6 DAY), 399.99, 'Completado');

-- HACE 5 DÍAS (2 pedidos - $980 en ventas)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'miguel.torres@test.com'), DATE_SUB(NOW(), INTERVAL 5 DAY), 680.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'ana@ejemplo.com'), DATE_SUB(NOW(), INTERVAL 5 DAY), 300.00, 'Completado');

-- HACE 4 DÍAS (4 pedidos - $1,820 en ventas)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'carmen.diaz@test.com'), DATE_SUB(NOW(), INTERVAL 4 DAY), 750.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'jose.morales@test.com'), DATE_SUB(NOW(), INTERVAL 4 DAY), 420.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'luis@ejemplo.com'), DATE_SUB(NOW(), INTERVAL 4 DAY), 350.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'sofia@ejemplo.com'), DATE_SUB(NOW(), INTERVAL 4 DAY), 300.00, 'Completado');

-- HACE 3 DÍAS (5 pedidos - $2,340 en ventas)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'patricia.vega@test.com'), DATE_SUB(NOW(), INTERVAL 3 DAY), 850.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'ricardo.lopez@test.com'), DATE_SUB(NOW(), INTERVAL 3 DAY), 560.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'sandra.ruiz@test.com'), DATE_SUB(NOW(), INTERVAL 3 DAY), 430.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'pedro@ejemplo.com'), DATE_SUB(NOW(), INTERVAL 3 DAY), 320.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'carlos@ejemplo.com'), DATE_SUB(NOW(), INTERVAL 3 DAY), 180.00, 'Completado');

-- HACE 2 DÍAS (6 pedidos - $2,750 en ventas)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'fernando.cruz@test.com'), DATE_SUB(NOW(), INTERVAL 2 DAY), 920.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'isabel.ramos@test.com'), DATE_SUB(NOW(), INTERVAL 2 DAY), 650.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'alberto.silva@test.com'), DATE_SUB(NOW(), INTERVAL 2 DAY), 480.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'monica.castillo@test.com'), DATE_SUB(NOW(), INTERVAL 2 DAY), 390.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'ana@ejemplo.com'), DATE_SUB(NOW(), INTERVAL 2 DAY), 210.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'luis@ejemplo.com'), DATE_SUB(NOW(), INTERVAL 2 DAY), 100.00, 'Completado');

-- HACE 1 DÍA (5 pedidos - $3,120 en ventas)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'javier.ortiz@test.com'), DATE_SUB(NOW(), INTERVAL 1 DAY), 1150.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'diana.vargas@test.com'), DATE_SUB(NOW(), INTERVAL 1 DAY), 780.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'raul.mendez@test.com'), DATE_SUB(NOW(), INTERVAL 1 DAY), 690.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'sofia@ejemplo.com'), DATE_SUB(NOW(), INTERVAL 1 DAY), 320.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'pedro@ejemplo.com'), DATE_SUB(NOW(), INTERVAL 1 DAY), 180.00, 'Completado');

-- HOY (7 pedidos - $3,890 en ventas)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'gabriela.santos@test.com'), NOW(), 1250.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'andres.guzman@test.com'), NOW(), 890.00, 'En proceso'),
((SELECT id FROM clientes WHERE correo = 'valentina.pena@test.com'), NOW(), 750.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'carlos@ejemplo.com'), NOW(), 520.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'ana@ejemplo.com'), NOW(), 340.00, 'Pendiente'),
((SELECT id FROM clientes WHERE correo = 'luis@ejemplo.com'), NOW(), 90.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'sofia@ejemplo.com'), NOW(), 50.00, 'Completado');

-- Ahora agregar los detalles de pedido (esto incrementará productos vendidos)
-- Vamos a usar los últimos IDs insertados

-- Detalles para pedidos de hace 6 días
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 13, 1, 599.99 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'roberto.garcia@test.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 6 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 6, 2, 299.98 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'laura.jimenez@test.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 6 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 28, 4, 199.96 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'carlos@ejemplo.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 6 DAY));

-- Detalles para pedidos de hace 5 días
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 15, 2, 659.98 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'miguel.torres@test.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 5 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 2, 3, 269.97 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'ana@ejemplo.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Detalles para pedidos de hace 4 días
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 10, 1, 299.99 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'carmen.diaz@test.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 4 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 14, 1, 199.99 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'jose.morales@test.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 4 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 19, 2, 319.98 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'luis@ejemplo.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 4 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 28, 6, 299.94 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'sofia@ejemplo.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 4 DAY));

-- Detalles para pedidos de hace 3 días
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 13, 1, 599.99 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'patricia.vega@test.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 3 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 6, 2, 299.98 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'ricardo.lopez@test.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 3 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 2, 4, 359.96 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'sandra.ruiz@test.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 3 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 28, 6, 299.94 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'pedro@ejemplo.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 3 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 1, 4, 183.96 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'carlos@ejemplo.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 3 DAY));

-- Detalles para pedidos de hace 2 días
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 15, 2, 659.98 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'fernando.cruz@test.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 2 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 10, 2, 599.98 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'isabel.ramos@test.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 2 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 6, 3, 449.97 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'alberto.silva@test.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 2 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 19, 2, 319.98 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'monica.castillo@test.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 2 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 28, 4, 199.96 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'ana@ejemplo.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 2 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 1, 2, 91.98 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'luis@ejemplo.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Detalles para pedidos de hace 1 día
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 16, 2, 659.98 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'javier.ortiz@test.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 1 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 13, 1, 599.99 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'diana.vargas@test.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 1 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 10, 2, 599.98 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'raul.mendez@test.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 1 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 19, 2, 319.98 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'sofia@ejemplo.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 1 DAY));

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 1, 4, 183.96 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'pedro@ejemplo.com' AND DATE(p.fecha) = DATE(DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Detalles para pedidos de HOY
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 17, 2, 839.98 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'gabriela.santos@test.com' AND DATE(p.fecha) = DATE(NOW());

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 15, 2, 659.98 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'andres.guzman@test.com' AND DATE(p.fecha) = DATE(NOW());

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 10, 2, 599.98 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'valentina.pena@test.com' AND DATE(p.fecha) = DATE(NOW());

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 6, 3, 449.97 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'carlos@ejemplo.com' AND DATE(p.fecha) = DATE(NOW());

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 19, 2, 319.98 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'ana@ejemplo.com' AND DATE(p.fecha) = DATE(NOW());

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 1, 2, 91.98 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'luis@ejemplo.com' AND DATE(p.fecha) = DATE(NOW());

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) 
SELECT p.id, 28, 1, 49.99 FROM pedidos p 
INNER JOIN clientes c ON p.cliente_id = c.id 
WHERE c.correo = 'sofia@ejemplo.com' AND DATE(p.fecha) = DATE(NOW());

-- ============================================
-- RESUMEN DE DATOS INSERTADOS:
-- ============================================
-- FECHA            | PEDIDOS | PRODUCTOS | CLIENTES | VENTAS
-- Hace 6 días      |    3    |     7     |     2    | $1,450
-- Hace 5 días      |    2    |     5     |     1    | $980
-- Hace 4 días      |    4    |    13     |     2    | $1,820
-- Hace 3 días      |    5    |    19     |     3    | $2,340
-- Hace 2 días      |    6    |    17     |     4    | $2,750
-- Hace 1 día       |    5    |    16     |     3    | $3,120
-- Hoy              |    7    |    15     |     3    | $3,890
-- ============================================
-- TOTAL: 32 pedidos, 92 productos vendidos, 18 nuevos clientes, $16,350 en ventas
