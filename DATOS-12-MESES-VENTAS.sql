-- ============================================
-- DATOS DE VENTAS PARA 12 MESES
-- Genera ventas, pedidos, productos vendidos y clientes
-- Distribuidos uniformemente a lo largo de 12 meses
-- ============================================

-- Primero, agregar clientes para los 12 meses
INSERT INTO clientes (nombre, correo, telefono, direccion, fecha_registro) VALUES
-- MES 1 (hace 12 meses)
('Cliente A1', 'cliente.a1@test.com', '809-100-0001', 'Direccion A1', DATE_SUB(NOW(), INTERVAL 12 MONTH)),
('Cliente A2', 'cliente.a2@test.com', '809-100-0002', 'Direccion A2', DATE_SUB(NOW(), INTERVAL 12 MONTH)),
('Cliente A3', 'cliente.a3@test.com', '809-100-0003', 'Direccion A3', DATE_SUB(NOW(), INTERVAL 12 MONTH)),

-- MES 2 (hace 11 meses)
('Cliente B1', 'cliente.b1@test.com', '809-100-0011', 'Direccion B1', DATE_SUB(NOW(), INTERVAL 11 MONTH)),
('Cliente B2', 'cliente.b2@test.com', '809-100-0012', 'Direccion B2', DATE_SUB(NOW(), INTERVAL 11 MONTH)),

-- MES 3 (hace 10 meses)
('Cliente C1', 'cliente.c1@test.com', '809-100-0021', 'Direccion C1', DATE_SUB(NOW(), INTERVAL 10 MONTH)),
('Cliente C2', 'cliente.c2@test.com', '809-100-0022', 'Direccion C2', DATE_SUB(NOW(), INTERVAL 10 MONTH)),
('Cliente C3', 'cliente.c3@test.com', '809-100-0023', 'Direccion C3', DATE_SUB(NOW(), INTERVAL 10 MONTH)),

-- MES 4 (hace 9 meses)
('Cliente D1', 'cliente.d1@test.com', '809-100-0031', 'Direccion D1', DATE_SUB(NOW(), INTERVAL 9 MONTH)),
('Cliente D2', 'cliente.d2@test.com', '809-100-0032', 'Direccion D2', DATE_SUB(NOW(), INTERVAL 9 MONTH)),

-- MES 5 (hace 8 meses)
('Cliente E1', 'cliente.e1@test.com', '809-100-0041', 'Direccion E1', DATE_SUB(NOW(), INTERVAL 8 MONTH)),
('Cliente E2', 'cliente.e2@test.com', '809-100-0042', 'Direccion E2', DATE_SUB(NOW(), INTERVAL 8 MONTH)),
('Cliente E3', 'cliente.e3@test.com', '809-100-0043', 'Direccion E3', DATE_SUB(NOW(), INTERVAL 8 MONTH)),
('Cliente E4', 'cliente.e4@test.com', '809-100-0044', 'Direccion E4', DATE_SUB(NOW(), INTERVAL 8 MONTH)),

-- MES 6 (hace 7 meses)
('Cliente F1', 'cliente.f1@test.com', '809-100-0051', 'Direccion F1', DATE_SUB(NOW(), INTERVAL 7 MONTH)),
('Cliente F2', 'cliente.f2@test.com', '809-100-0052', 'Direccion F2', DATE_SUB(NOW(), INTERVAL 7 MONTH)),

-- MES 7 (hace 6 meses)
('Cliente G1', 'cliente.g1@test.com', '809-100-0061', 'Direccion G1', DATE_SUB(NOW(), INTERVAL 6 MONTH)),
('Cliente G2', 'cliente.g2@test.com', '809-100-0062', 'Direccion G2', DATE_SUB(NOW(), INTERVAL 6 MONTH)),
('Cliente G3', 'cliente.g3@test.com', '809-100-0063', 'Direccion G3', DATE_SUB(NOW(), INTERVAL 6 MONTH)),

-- MES 8 (hace 5 meses)
('Cliente H1', 'cliente.h1@test.com', '809-100-0071', 'Direccion H1', DATE_SUB(NOW(), INTERVAL 5 MONTH)),
('Cliente H2', 'cliente.h2@test.com', '809-100-0072', 'Direccion H2', DATE_SUB(NOW(), INTERVAL 5 MONTH)),
('Cliente H3', 'cliente.h3@test.com', '809-100-0073', 'Direccion H3', DATE_SUB(NOW(), INTERVAL 5 MONTH)),

-- MES 9 (hace 4 meses)
('Cliente I1', 'cliente.i1@test.com', '809-100-0081', 'Direccion I1', DATE_SUB(NOW(), INTERVAL 4 MONTH)),
('Cliente I2', 'cliente.i2@test.com', '809-100-0082', 'Direccion I2', DATE_SUB(NOW(), INTERVAL 4 MONTH)),

-- MES 10 (hace 3 meses)
('Cliente J1', 'cliente.j1@test.com', '809-100-0091', 'Direccion J1', DATE_SUB(NOW(), INTERVAL 3 MONTH)),
('Cliente J2', 'cliente.j2@test.com', '809-100-0092', 'Direccion J2', DATE_SUB(NOW(), INTERVAL 3 MONTH)),
('Cliente J3', 'cliente.j3@test.com', '809-100-0093', 'Direccion J3', DATE_SUB(NOW(), INTERVAL 3 MONTH)),

-- MES 11 (hace 2 meses)
('Cliente K1', 'cliente.k1@test.com', '809-100-0101', 'Direccion K1', DATE_SUB(NOW(), INTERVAL 2 MONTH)),
('Cliente K2', 'cliente.k2@test.com', '809-100-0102', 'Direccion K2', DATE_SUB(NOW(), INTERVAL 2 MONTH)),

-- MES 12 (hace 1 mes)
('Cliente L1', 'cliente.l1@test.com', '809-100-0111', 'Direccion L1', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
('Cliente L2', 'cliente.l2@test.com', '809-100-0112', 'Direccion L2', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
('Cliente L3', 'cliente.l3@test.com', '809-100-0113', 'Direccion L3', DATE_SUB(NOW(), INTERVAL 1 MONTH));

-- ============================================
-- PEDIDOS DISTRIBUIDOS POR MES
-- ============================================

-- MES 1: hace 12 meses (8 pedidos - $4,200)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'cliente.a1@test.com'), DATE_SUB(NOW(), INTERVAL 12 MONTH), 450.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.a2@test.com'), DATE_SUB(NOW(), INTERVAL 12 MONTH), 620.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.a3@test.com'), DATE_SUB(NOW(), INTERVAL 12 MONTH), 380.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.a1@test.com'), DATE_SUB(NOW(), INTERVAL 12 MONTH), 550.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.a2@test.com'), DATE_SUB(NOW(), INTERVAL 12 MONTH), 720.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.a3@test.com'), DATE_SUB(NOW(), INTERVAL 12 MONTH), 480.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.a1@test.com'), DATE_SUB(NOW(), INTERVAL 12 MONTH), 500.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.a2@test.com'), DATE_SUB(NOW(), INTERVAL 12 MONTH), 500.00, 'Completado');

-- MES 2: hace 11 meses (10 pedidos - $5,500)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'cliente.b1@test.com'), DATE_SUB(NOW(), INTERVAL 11 MONTH), 550.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.b2@test.com'), DATE_SUB(NOW(), INTERVAL 11 MONTH), 480.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.b1@test.com'), DATE_SUB(NOW(), INTERVAL 11 MONTH), 650.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.b2@test.com'), DATE_SUB(NOW(), INTERVAL 11 MONTH), 420.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.b1@test.com'), DATE_SUB(NOW(), INTERVAL 11 MONTH), 590.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.b2@test.com'), DATE_SUB(NOW(), INTERVAL 11 MONTH), 510.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.b1@test.com'), DATE_SUB(NOW(), INTERVAL 11 MONTH), 700.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.b2@test.com'), DATE_SUB(NOW(), INTERVAL 11 MONTH), 600.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.b1@test.com'), DATE_SUB(NOW(), INTERVAL 11 MONTH), 500.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.b2@test.com'), DATE_SUB(NOW(), INTERVAL 11 MONTH), 500.00, 'Completado');

-- MES 3: hace 10 meses (12 pedidos - $6,800)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'cliente.c1@test.com'), DATE_SUB(NOW(), INTERVAL 10 MONTH), 580.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.c2@test.com'), DATE_SUB(NOW(), INTERVAL 10 MONTH), 620.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.c3@test.com'), DATE_SUB(NOW(), INTERVAL 10 MONTH), 490.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.c1@test.com'), DATE_SUB(NOW(), INTERVAL 10 MONTH), 550.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.c2@test.com'), DATE_SUB(NOW(), INTERVAL 10 MONTH), 720.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.c3@test.com'), DATE_SUB(NOW(), INTERVAL 10 MONTH), 450.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.c1@test.com'), DATE_SUB(NOW(), INTERVAL 10 MONTH), 680.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.c2@test.com'), DATE_SUB(NOW(), INTERVAL 10 MONTH), 540.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.c3@test.com'), DATE_SUB(NOW(), INTERVAL 10 MONTH), 600.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.c1@test.com'), DATE_SUB(NOW(), INTERVAL 10 MONTH), 570.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.c2@test.com'), DATE_SUB(NOW(), INTERVAL 10 MONTH), 500.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.c3@test.com'), DATE_SUB(NOW(), INTERVAL 10 MONTH), 500.00, 'Completado');

-- MES 4: hace 9 meses (9 pedidos - $5,100)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'cliente.d1@test.com'), DATE_SUB(NOW(), INTERVAL 9 MONTH), 520.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.d2@test.com'), DATE_SUB(NOW(), INTERVAL 9 MONTH), 680.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.d1@test.com'), DATE_SUB(NOW(), INTERVAL 9 MONTH), 450.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.d2@test.com'), DATE_SUB(NOW(), INTERVAL 9 MONTH), 590.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.d1@test.com'), DATE_SUB(NOW(), INTERVAL 9 MONTH), 620.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.d2@test.com'), DATE_SUB(NOW(), INTERVAL 9 MONTH), 480.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.d1@test.com'), DATE_SUB(NOW(), INTERVAL 9 MONTH), 650.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.d2@test.com'), DATE_SUB(NOW(), INTERVAL 9 MONTH), 560.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.d1@test.com'), DATE_SUB(NOW(), INTERVAL 9 MONTH), 550.00, 'Completado');

-- MES 5: hace 8 meses (15 pedidos - $8,200)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'cliente.e1@test.com'), DATE_SUB(NOW(), INTERVAL 8 MONTH), 540.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.e2@test.com'), DATE_SUB(NOW(), INTERVAL 8 MONTH), 620.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.e3@test.com'), DATE_SUB(NOW(), INTERVAL 8 MONTH), 480.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.e4@test.com'), DATE_SUB(NOW(), INTERVAL 8 MONTH), 570.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.e1@test.com'), DATE_SUB(NOW(), INTERVAL 8 MONTH), 650.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.e2@test.com'), DATE_SUB(NOW(), INTERVAL 8 MONTH), 490.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.e3@test.com'), DATE_SUB(NOW(), INTERVAL 8 MONTH), 720.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.e4@test.com'), DATE_SUB(NOW(), INTERVAL 8 MONTH), 530.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.e1@test.com'), DATE_SUB(NOW(), INTERVAL 8 MONTH), 610.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.e2@test.com'), DATE_SUB(NOW(), INTERVAL 8 MONTH), 450.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.e3@test.com'), DATE_SUB(NOW(), INTERVAL 8 MONTH), 680.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.e4@test.com'), DATE_SUB(NOW(), INTERVAL 8 MONTH), 520.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.e1@test.com'), DATE_SUB(NOW(), INTERVAL 8 MONTH), 590.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.e2@test.com'), DATE_SUB(NOW(), INTERVAL 8 MONTH), 550.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.e3@test.com'), DATE_SUB(NOW(), INTERVAL 8 MONTH), 540.00, 'Completado');

-- MES 6: hace 7 meses (11 pedidos - $6,400)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'cliente.f1@test.com'), DATE_SUB(NOW(), INTERVAL 7 MONTH), 580.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.f2@test.com'), DATE_SUB(NOW(), INTERVAL 7 MONTH), 640.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.f1@test.com'), DATE_SUB(NOW(), INTERVAL 7 MONTH), 490.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.f2@test.com'), DATE_SUB(NOW(), INTERVAL 7 MONTH), 710.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.f1@test.com'), DATE_SUB(NOW(), INTERVAL 7 MONTH), 530.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.f2@test.com'), DATE_SUB(NOW(), INTERVAL 7 MONTH), 620.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.f1@test.com'), DATE_SUB(NOW(), INTERVAL 7 MONTH), 560.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.f2@test.com'), DATE_SUB(NOW(), INTERVAL 7 MONTH), 680.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.f1@test.com'), DATE_SUB(NOW(), INTERVAL 7 MONTH), 590.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.f2@test.com'), DATE_SUB(NOW(), INTERVAL 7 MONTH), 500.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.f1@test.com'), DATE_SUB(NOW(), INTERVAL 7 MONTH), 500.00, 'Completado');

-- MES 7: hace 6 meses (13 pedidos - $7,600)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'cliente.g1@test.com'), DATE_SUB(NOW(), INTERVAL 6 MONTH), 600.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.g2@test.com'), DATE_SUB(NOW(), INTERVAL 6 MONTH), 550.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.g3@test.com'), DATE_SUB(NOW(), INTERVAL 6 MONTH), 720.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.g1@test.com'), DATE_SUB(NOW(), INTERVAL 6 MONTH), 480.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.g2@test.com'), DATE_SUB(NOW(), INTERVAL 6 MONTH), 650.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.g3@test.com'), DATE_SUB(NOW(), INTERVAL 6 MONTH), 540.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.g1@test.com'), DATE_SUB(NOW(), INTERVAL 6 MONTH), 690.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.g2@test.com'), DATE_SUB(NOW(), INTERVAL 6 MONTH), 510.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.g3@test.com'), DATE_SUB(NOW(), INTERVAL 6 MONTH), 620.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.g1@test.com'), DATE_SUB(NOW(), INTERVAL 6 MONTH), 580.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.g2@test.com'), DATE_SUB(NOW(), INTERVAL 6 MONTH), 700.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.g3@test.com'), DATE_SUB(NOW(), INTERVAL 6 MONTH), 560.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.g1@test.com'), DATE_SUB(NOW(), INTERVAL 6 MONTH), 600.00, 'Completado');

-- MES 8: hace 5 meses (14 pedidos - $8,800)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'cliente.h1@test.com'), DATE_SUB(NOW(), INTERVAL 5 MONTH), 650.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.h2@test.com'), DATE_SUB(NOW(), INTERVAL 5 MONTH), 720.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.h3@test.com'), DATE_SUB(NOW(), INTERVAL 5 MONTH), 580.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.h1@test.com'), DATE_SUB(NOW(), INTERVAL 5 MONTH), 610.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.h2@test.com'), DATE_SUB(NOW(), INTERVAL 5 MONTH), 690.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.h3@test.com'), DATE_SUB(NOW(), INTERVAL 5 MONTH), 540.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.h1@test.com'), DATE_SUB(NOW(), INTERVAL 5 MONTH), 750.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.h2@test.com'), DATE_SUB(NOW(), INTERVAL 5 MONTH), 600.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.h3@test.com'), DATE_SUB(NOW(), INTERVAL 5 MONTH), 670.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.h1@test.com'), DATE_SUB(NOW(), INTERVAL 5 MONTH), 520.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.h2@test.com'), DATE_SUB(NOW(), INTERVAL 5 MONTH), 710.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.h3@test.com'), DATE_SUB(NOW(), INTERVAL 5 MONTH), 630.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.h1@test.com'), DATE_SUB(NOW(), INTERVAL 5 MONTH), 580.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.h2@test.com'), DATE_SUB(NOW(), INTERVAL 5 MONTH), 550.00, 'Completado');

-- MES 9: hace 4 meses (12 pedidos - $7,400)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'cliente.i1@test.com'), DATE_SUB(NOW(), INTERVAL 4 MONTH), 620.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.i2@test.com'), DATE_SUB(NOW(), INTERVAL 4 MONTH), 680.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.i1@test.com'), DATE_SUB(NOW(), INTERVAL 4 MONTH), 550.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.i2@test.com'), DATE_SUB(NOW(), INTERVAL 4 MONTH), 710.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.i1@test.com'), DATE_SUB(NOW(), INTERVAL 4 MONTH), 590.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.i2@test.com'), DATE_SUB(NOW(), INTERVAL 4 MONTH), 640.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.i1@test.com'), DATE_SUB(NOW(), INTERVAL 4 MONTH), 700.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.i2@test.com'), DATE_SUB(NOW(), INTERVAL 4 MONTH), 580.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.i1@test.com'), DATE_SUB(NOW(), INTERVAL 4 MONTH), 660.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.i2@test.com'), DATE_SUB(NOW(), INTERVAL 4 MONTH), 530.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.i1@test.com'), DATE_SUB(NOW(), INTERVAL 4 MONTH), 620.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.i2@test.com'), DATE_SUB(NOW(), INTERVAL 4 MONTH), 520.00, 'Completado');

-- MES 10: hace 3 meses (16 pedidos - $10,200)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'cliente.j1@test.com'), DATE_SUB(NOW(), INTERVAL 3 MONTH), 680.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.j2@test.com'), DATE_SUB(NOW(), INTERVAL 3 MONTH), 720.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.j3@test.com'), DATE_SUB(NOW(), INTERVAL 3 MONTH), 590.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.j1@test.com'), DATE_SUB(NOW(), INTERVAL 3 MONTH), 650.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.j2@test.com'), DATE_SUB(NOW(), INTERVAL 3 MONTH), 740.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.j3@test.com'), DATE_SUB(NOW(), INTERVAL 3 MONTH), 610.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.j1@test.com'), DATE_SUB(NOW(), INTERVAL 3 MONTH), 690.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.j2@test.com'), DATE_SUB(NOW(), INTERVAL 3 MONTH), 570.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.j3@test.com'), DATE_SUB(NOW(), INTERVAL 3 MONTH), 710.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.j1@test.com'), DATE_SUB(NOW(), INTERVAL 3 MONTH), 630.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.j2@test.com'), DATE_SUB(NOW(), INTERVAL 3 MONTH), 660.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.j3@test.com'), DATE_SUB(NOW(), INTERVAL 3 MONTH), 580.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.j1@test.com'), DATE_SUB(NOW(), INTERVAL 3 MONTH), 700.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.j2@test.com'), DATE_SUB(NOW(), INTERVAL 3 MONTH), 620.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.j3@test.com'), DATE_SUB(NOW(), INTERVAL 3 MONTH), 560.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.j1@test.com'), DATE_SUB(NOW(), INTERVAL 3 MONTH), 690.00, 'Completado');

-- MES 11: hace 2 meses (18 pedidos - $11,800)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'cliente.k1@test.com'), DATE_SUB(NOW(), INTERVAL 2 MONTH), 720.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.k2@test.com'), DATE_SUB(NOW(), INTERVAL 2 MONTH), 680.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.k1@test.com'), DATE_SUB(NOW(), INTERVAL 2 MONTH), 610.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.k2@test.com'), DATE_SUB(NOW(), INTERVAL 2 MONTH), 750.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.k1@test.com'), DATE_SUB(NOW(), INTERVAL 2 MONTH), 640.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.k2@test.com'), DATE_SUB(NOW(), INTERVAL 2 MONTH), 690.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.k1@test.com'), DATE_SUB(NOW(), INTERVAL 2 MONTH), 720.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.k2@test.com'), DATE_SUB(NOW(), INTERVAL 2 MONTH), 580.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.k1@test.com'), DATE_SUB(NOW(), INTERVAL 2 MONTH), 710.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.k2@test.com'), DATE_SUB(NOW(), INTERVAL 2 MONTH), 630.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.k1@test.com'), DATE_SUB(NOW(), INTERVAL 2 MONTH), 670.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.k2@test.com'), DATE_SUB(NOW(), INTERVAL 2 MONTH), 600.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.k1@test.com'), DATE_SUB(NOW(), INTERVAL 2 MONTH), 690.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.k2@test.com'), DATE_SUB(NOW(), INTERVAL 2 MONTH), 650.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.k1@test.com'), DATE_SUB(NOW(), INTERVAL 2 MONTH), 590.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.k2@test.com'), DATE_SUB(NOW(), INTERVAL 2 MONTH), 720.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.k1@test.com'), DATE_SUB(NOW(), INTERVAL 2 MONTH), 660.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.k2@test.com'), DATE_SUB(NOW(), INTERVAL 2 MONTH), 700.00, 'Completado');

-- MES 12: hace 1 mes (20 pedidos - $14,000)
INSERT INTO pedidos (cliente_id, fecha, total, estado) VALUES
((SELECT id FROM clientes WHERE correo = 'cliente.l1@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 750.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l2@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 720.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l3@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 680.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l1@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 710.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l2@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 690.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l3@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 730.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l1@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 660.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l2@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 750.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l3@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 700.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l1@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 680.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l2@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 720.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l3@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 650.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l1@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 740.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l2@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 690.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l3@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 710.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l1@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 670.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l2@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 700.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l3@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 730.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l1@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 690.00, 'Completado'),
((SELECT id FROM clientes WHERE correo = 'cliente.l2@test.com'), DATE_SUB(NOW(), INTERVAL 1 MONTH), 720.00, 'Completado');

-- ============================================
-- RESUMEN POR MES
-- ============================================
-- MES 1 (hace 12 meses):   8 pedidos  - $4,200
-- MES 2 (hace 11 meses):  10 pedidos  - $5,500
-- MES 3 (hace 10 meses):  12 pedidos  - $6,800
-- MES 4 (hace 9 meses):    9 pedidos  - $5,100
-- MES 5 (hace 8 meses):   15 pedidos  - $8,200
-- MES 6 (hace 7 meses):   11 pedidos  - $6,400
-- MES 7 (hace 6 meses):   13 pedidos  - $7,600
-- MES 8 (hace 5 meses):   14 pedidos  - $8,800
-- MES 9 (hace 4 meses):   12 pedidos  - $7,400
-- MES 10 (hace 3 meses):  16 pedidos  - $10,200
-- MES 11 (hace 2 meses):  18 pedidos  - $11,800
-- MES 12 (hace 1 mes):    20 pedidos  - $14,000
-- ============================================
-- TOTAL: 158 pedidos - $96,000 en ventas
-- Tendencia: Crecimiento constante
