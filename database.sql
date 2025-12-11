-- Base de datos para Tienda TEC
CREATE DATABASE IF NOT EXISTS db_tienda_redhard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_tienda_redhard;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    clave VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'empleado', 'cliente') DEFAULT 'cliente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo TINYINT(1) DEFAULT 1,
    INDEX idx_correo (correo),
    INDEX idx_rol (rol)
);

-- Tabla de categorías
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo TINYINT(1) DEFAULT 1,
    INDEX idx_nombre (nombre)
);

-- Tabla de marcas
CREATE TABLE marcas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    logo VARCHAR(255),
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre)
);

-- Tabla de productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(255),
    galeria_imagenes TEXT,
    categoria_id INT,
    marca_id INT,
    precio_base DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE SET NULL,
    INDEX idx_nombre (nombre),
    INDEX idx_categoria (categoria_id),
    INDEX idx_marca (marca_id),
    INDEX idx_precio (precio_base)
);

-- Tabla de variaciones de productos
CREATE TABLE variaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    atributo VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    activo TINYINT(1) DEFAULT 1,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    INDEX idx_producto (producto_id)
);

-- Tabla de clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_correo (correo),
    INDEX idx_nombre (nombre)
);

-- Tabla de pedidos
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL,
    estado ENUM('Pendiente', 'En proceso', 'Completado', 'Cancelado') DEFAULT 'Pendiente',
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_cliente (cliente_id),
    INDEX idx_fecha (fecha),
    INDEX idx_estado (estado)
);

-- Tabla de detalle de pedidos
CREATE TABLE detalle_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    variacion_id INT,
    cantidad INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (variacion_id) REFERENCES variaciones(id) ON DELETE SET NULL,
    INDEX idx_pedido (pedido_id),
    INDEX idx_producto (producto_id)
);

-- Tabla de servicios
CREATE TABLE servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre)
);

-- Tabla de reportes
CREATE TABLE reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contenido TEXT,
    INDEX idx_tipo (tipo),
    INDEX idx_fecha (fecha)
);

-- ============================================
-- INSERCIÓN DE DATOS DE EJEMPLO
-- ============================================

-- Usuarios (contraseña para todos: admin123)
INSERT INTO usuarios (nombre, correo, clave, rol) VALUES 
('Administrador', 'admin@tiendatec.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Empleado 1', 'empleado@tiendatec.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'empleado'),
('Juan Pérez', 'juan@ejemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente'),
('María González', 'maria@ejemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente');

-- Categorías
INSERT INTO categorias (nombre, descripcion) VALUES 
('Memorias RAM', 'Memorias RAM de alta velocidad para mejorar el rendimiento'),
('Discos Duros', 'Discos duros HDD y SSD para almacenamiento'),
('Tarjetas Gráficas', 'Tarjetas gráficas y GPUs para gaming y diseño'),
('Procesadores', 'Procesadores Intel y AMD de última generación'),
('Motherboards', 'Placas base para diferentes tipos de procesadores'),
('Fuentes de Poder', 'Fuentes de alimentación certificadas'),
('Gabinetes', 'Cases y gabinetes para PC'),
('Refrigeración', 'Sistemas de refrigeración líquida y aire'),
('Accesorios', 'Periféricos y accesorios para PC'),
('Monitores', 'Monitores gaming y profesionales');

-- Marcas
INSERT INTO marcas (nombre, descripcion) VALUES 
('Kingston', 'Fabricante líder de memorias y almacenamiento'),
('Corsair', 'Componentes de alto rendimiento para gaming'),
('Samsung', 'Tecnología electrónica de consumo'),
('Western Digital', 'Soluciones de almacenamiento de datos'),
('NVIDIA', 'Procesadores gráficos y tecnología visual'),
('AMD', 'Procesadores y tarjetas gráficas'),
('Intel', 'Procesadores y tecnología de computación'),
('ASUS', 'Hardware y electrónica de consumo'),
('Logitech', 'Periféricos y accesorios para PC'),
('Razer', 'Accesorios gaming de alta gama'),
('MSI', 'Componentes gaming y hardware'),
('Gigabyte', 'Placas base y tarjetas gráficas'),
('Cooler Master', 'Refrigeración y gabinetes'),
('EVGA', 'Tarjetas gráficas y fuentes de poder'),
('Seagate', 'Almacenamiento y discos duros');

-- Productos
INSERT INTO productos (nombre, descripcion, categoria_id, marca_id, precio_base, stock, imagen) VALUES 
-- Memorias RAM
('Kingston Fury Beast 8GB DDR4', 'Memoria RAM DDR4 3200MHz 8GB - Ideal para gaming', 1, 1, 45.99, 80, 'kingston_fury_8gb.jpg'),
('Kingston Fury Beast 16GB DDR4', 'Memoria RAM DDR4 3200MHz 16GB - Alto rendimiento', 1, 1, 89.99, 50, 'kingston_fury_16gb.jpg'),
('Corsair Vengeance 16GB DDR5', 'Memoria RAM DDR5 5600MHz 16GB - Nueva generación', 1, 2, 129.99, 40, 'corsair_vengeance_16gb.jpg'),
('Corsair Vengeance 32GB DDR5', 'Memoria RAM DDR5 5600MHz 32GB - Máximo rendimiento', 1, 2, 249.99, 30, 'corsair_vengeance_32gb.jpg'),

-- Discos Duros y SSD
('Samsung 980 PRO 500GB', 'SSD NVMe M.2 500GB - Velocidad extrema', 2, 3, 89.99, 60, 'samsung_980_500gb.jpg'),
('Samsung 980 PRO 1TB', 'SSD NVMe M.2 1TB - Alto rendimiento', 2, 3, 149.99, 40, 'samsung_980_1tb.jpg'),
('WD Black 1TB HDD', 'Disco Duro 7200RPM 1TB - Confiable', 2, 4, 54.99, 35, 'wd_black_1tb.jpg'),
('WD Black 2TB HDD', 'Disco Duro 7200RPM 2TB - Gran capacidad', 2, 4, 89.99, 25, 'wd_black_2tb.jpg'),
('Kingston NV2 1TB', 'SSD NVMe M.2 1TB - Excelente relación precio/rendimiento', 2, 1, 79.99, 50, 'kingston_nv2_1tb.jpg'),

-- Tarjetas Gráficas
('NVIDIA RTX 4060 8GB', 'Tarjeta Gráfica 8GB GDDR6 - Gaming 1080p', 3, 5, 299.99, 15, 'rtx_4060.jpg'),
('NVIDIA RTX 4060 Ti 16GB', 'Tarjeta Gráfica 16GB GDDR6 - Gaming avanzado', 3, 5, 499.99, 10, 'rtx_4060ti.jpg'),
('AMD Radeon RX 7600', 'Tarjeta Gráfica 8GB GDDR6 - Excelente precio', 3, 6, 269.99, 12, 'rx_7600.jpg'),
('NVIDIA RTX 4070 12GB', 'Tarjeta Gráfica 12GB GDDR6X - Gaming 1440p', 3, 5, 599.99, 8, 'rtx_4070.jpg'),

-- Procesadores
('AMD Ryzen 5 5600X', 'Procesador 6 núcleos 3.7GHz - Gaming económico', 4, 6, 199.99, 25, 'ryzen_5600x.jpg'),
('AMD Ryzen 7 5800X', 'Procesador 8 núcleos 3.8GHz - Alto rendimiento', 4, 6, 329.99, 20, 'ryzen_5800x.jpg'),
('Intel Core i5-13600K', 'Procesador 14 núcleos 3.5GHz - Gaming y multitarea', 4, 7, 289.99, 22, 'i5_13600k.jpg'),
('Intel Core i7-13700K', 'Procesador 16 núcleos 3.4GHz - Rendimiento extremo', 4, 7, 419.99, 18, 'i7_13700k.jpg'),
('AMD Ryzen 9 5900X', 'Procesador 12 núcleos 3.7GHz - Workstation', 4, 6, 449.99, 15, 'ryzen_5900x.jpg'),

-- Motherboards
('ASUS TUF B550-PLUS', 'Motherboard AM4 ATX - Gaming sólido', 5, 8, 159.99, 20, 'asus_b550.jpg'),
('MSI MAG B660 TOMAHAWK', 'Motherboard LGA1700 ATX - Intel 12/13 gen', 5, 11, 189.99, 18, 'msi_b660.jpg'),
('Gigabyte X570 AORUS', 'Motherboard AM4 ATX - Premium AMD', 5, 12, 249.99, 12, 'gigabyte_x570.jpg'),

-- Fuentes de Poder
('Corsair RM750x', 'Fuente 750W 80+ Gold Modular', 6, 2, 119.99, 30, 'corsair_rm750x.jpg'),
('EVGA SuperNOVA 850W', 'Fuente 850W 80+ Gold Modular', 6, 14, 139.99, 25, 'evga_850w.jpg'),

-- Gabinetes
('Corsair 4000D Airflow', 'Gabinete ATX Mid Tower - Excelente flujo de aire', 7, 2, 104.99, 22, 'corsair_4000d.jpg'),
('NZXT H510 Elite', 'Gabinete ATX Mid Tower - Diseño elegante', 7, 11, 149.99, 18, 'nzxt_h510.jpg'),

-- Refrigeración
('Cooler Master Hyper 212', 'Cooler CPU Torre - Económico y efectivo', 8, 13, 39.99, 40, 'cm_hyper212.jpg'),
('Corsair iCUE H100i', 'Refrigeración líquida AIO 240mm', 8, 2, 129.99, 20, 'corsair_h100i.jpg'),

-- Accesorios
('Logitech G502 HERO', 'Mouse Gaming RGB 25,600 DPI', 9, 9, 49.99, 100, 'logitech_g502.jpg'),
('Razer BlackWidow V3', 'Teclado Mecánico RGB - Switches Green', 9, 10, 139.99, 45, 'razer_blackwidow.jpg'),
('Logitech G733', 'Auriculares Inalámbricos RGB', 9, 9, 129.99, 35, 'logitech_g733.jpg'),
('Razer DeathAdder V3', 'Mouse Gaming Ligero 30,000 DPI', 9, 10, 69.99, 60, 'razer_deathadder.jpg'),

-- Monitores
('ASUS TUF Gaming 24"', 'Monitor 1080p 165Hz IPS - Gaming competitivo', 10, 8, 199.99, 25, 'asus_tuf_24.jpg'),
('Samsung Odyssey G5 27"', 'Monitor 1440p 144Hz Curvo', 10, 3, 299.99, 18, 'samsung_g5.jpg'),
('LG UltraGear 27"', 'Monitor 1440p 180Hz IPS - Color preciso', 10, 3, 349.99, 15, 'lg_ultragear.jpg');

-- Variaciones de productos
INSERT INTO variaciones (producto_id, atributo, precio, stock) VALUES 
-- Variaciones de memorias RAM
(1, '8GB Single', 45.99, 80),
(2, '16GB Single', 89.99, 50),
(2, '16GB Kit (2x8GB)', 94.99, 45),
(3, '16GB Single', 129.99, 40),
(4, '32GB Kit (2x16GB)', 249.99, 30),
(4, '32GB Single', 259.99, 15),

-- Variaciones de SSD
(5, '500GB', 89.99, 60),
(6, '1TB', 149.99, 40),
(6, '2TB', 279.99, 20),

-- Variaciones de tarjetas gráficas por fabricante
(10, 'ASUS Dual', 299.99, 7),
(10, 'MSI Ventus', 309.99, 8),
(13, 'Gigabyte Gaming OC', 619.99, 5);

-- Clientes de ejemplo
INSERT INTO clientes (nombre, correo, telefono, direccion) VALUES 
('Carlos Ramírez', 'carlos@ejemplo.com', '809-555-0101', 'Calle Principal #123, Santo Domingo'),
('Ana Martínez', 'ana@ejemplo.com', '809-555-0102', 'Av. Independencia #456, Santiago'),
('Luis Fernández', 'luis@ejemplo.com', '809-555-0103', 'Calle Duarte #789, La Vega'),
('Sofia Rodríguez', 'sofia@ejemplo.com', '809-555-0104', 'Av. Kennedy #321, Santo Domingo'),
('Pedro Sánchez', 'pedro@ejemplo.com', '809-555-0105', 'Calle El Sol #654, Puerto Plata');

-- Pedidos de ejemplo
INSERT INTO pedidos (cliente_id, total, estado) VALUES 
(1, 689.97, 'Completado'),
(2, 199.99, 'En proceso'),
(3, 449.98, 'Completado'),
(4, 899.96, 'Pendiente'),
(5, 279.98, 'Completado');

-- Detalle de pedidos
INSERT INTO detalle_pedido (pedido_id, producto_id, variacion_id, cantidad, subtotal) VALUES 
-- Pedido 1
(1, 2, NULL, 1, 89.99),
(1, 6, NULL, 1, 149.99),
(1, 14, NULL, 1, 199.99),
(1, 28, NULL, 1, 49.99),
(1, 22, NULL, 1, 199.99),

-- Pedido 2
(2, 14, NULL, 1, 199.99),

-- Pedido 3
(3, 15, NULL, 1, 329.99),
(3, 25, NULL, 1, 119.99),

-- Pedido 4
(4, 10, NULL, 1, 299.99),
(4, 6, NULL, 1, 149.99),
(4, 19, NULL, 1, 159.99),
(4, 28, NULL, 2, 99.98),
(4, 29, NULL, 1, 139.99),
(4, 33, NULL, 1, 199.99),

-- Pedido 5
(5, 29, NULL, 1, 139.99),
(5, 30, NULL, 1, 129.99);

-- Servicios
INSERT INTO servicios (nombre, descripcion, precio) VALUES 
('Mantenimiento Preventivo PC', 'Limpieza completa, cambio de pasta térmica y optimización', 35.00),
('Instalación de Windows', 'Instalación limpia de Windows 10/11 con drivers', 25.00),
('Instalación de Linux', 'Instalación de distribución Linux a elección', 20.00),
('Reparación de Hardware', 'Diagnóstico y reparación de componentes defectuosos', 50.00),
('Ensamblaje de PC Gamer', 'Ensamblaje completo de PC con pruebas de estrés', 80.00),
('Ensamblaje PC Oficina', 'Ensamblaje de PC para uso profesional', 60.00),
('Actualización de Componentes', 'Instalación y configuración de nuevos componentes', 30.00),
('Recuperación de Datos', 'Recuperación de información de discos dañados', 100.00),
('Optimización de Rendimiento', 'Mejora de velocidad y limpieza de software', 40.00),
('Configuración de Red', 'Instalación y configuración de red doméstica/oficina', 45.00);

-- Reportes de ejemplo
INSERT INTO reportes (tipo, contenido) VALUES 
('Ventas Mensuales', 'Reporte de ventas del mes de Octubre 2024: Total $15,234.50'),
('Inventario Bajo', 'Productos con stock menor a 10 unidades detectados'),
('Productos Más Vendidos', 'Top 5: RTX 4060, Ryzen 7 5800X, Kingston Fury 16GB, Samsung 980 PRO, Logitech G502');

-- Vista para consulta rápida de productos con toda su información
CREATE OR REPLACE VIEW vista_productos_completa AS
SELECT 
    p.id,
    p.nombre,
    p.descripcion,
    p.imagen,
    p.precio_base,
    p.stock,
    p.activo,
    c.nombre AS categoria,
    m.nombre AS marca,
    m.logo AS marca_logo
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN marcas m ON p.marca_id = m.id;

-- Vista para pedidos con información de clientes
CREATE OR REPLACE VIEW vista_pedidos_completa AS
SELECT 
    p.id AS pedido_id,
    p.fecha,
    p.total,
    p.estado,
    c.nombre AS cliente_nombre,
    c.correo AS cliente_correo,
    c.telefono AS cliente_telefono
FROM pedidos p
INNER JOIN clientes c ON p.cliente_id = c.id;

-- Consulta útil: Productos más vendidos
-- SELECT p.nombre, SUM(dp.cantidad) as total_vendido 
-- FROM detalle_pedido dp 
-- JOIN productos p ON dp.producto_id = p.id 
-- GROUP BY p.id 
-- ORDER BY total_vendido DESC 
-- LIMIT 10;