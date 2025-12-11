-- 1. Crear tablas de catálogo global
CREATE TABLE IF NOT EXISTS atributos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL, -- Ej: "Color", "Almacenamiento"
    activo BOOLEAN DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS atributo_valores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    atributo_id INT NOT NULL,
    valor VARCHAR(50) NOT NULL, -- Ej: "Rojo", "128GB"
    color_hex VARCHAR(20) DEFAULT NULL, -- Ej: "#FF0000"
    activo BOOLEAN DEFAULT 1,
    FOREIGN KEY (atributo_id) REFERENCES atributos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Crear tablas de variantes de producto
CREATE TABLE IF NOT EXISTS producto_variantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    precio DECIMAL(10, 2) DEFAULT NULL, -- Precio específico de la variante (NULL = usar precio base)
    stock INT DEFAULT 0,
    sku VARCHAR(50) DEFAULT NULL,
    activo BOOLEAN DEFAULT 1,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS variante_valores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    variante_id INT NOT NULL,
    atributo_valor_id INT NOT NULL,
    FOREIGN KEY (variante_id) REFERENCES producto_variantes(id) ON DELETE CASCADE,
    FOREIGN KEY (atributo_valor_id) REFERENCES atributo_valores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Insertar atributos base
INSERT INTO atributos (nombre) VALUES ('Color'), ('Almacenamiento'), ('Talla');

-- 4. Migración de datos (Lógica compleja, se hará mejor vía PHP para procesar lógica)
-- Este archivo solo crea la estructura.
