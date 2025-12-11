-- VERSIÓN CORREGIDA - EJECUTAR EN phpMyAdmin

-- 1. Desactivar verificación de foreign keys
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Eliminar tabla si existe
DROP TABLE IF EXISTS carrito;

-- 3. Crear tabla carrito SIN foreign keys a variantes (por ahora)
CREATE TABLE carrito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,
    variante_id INT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_usuario (usuario_id),
    INDEX idx_producto (producto_id),
    INDEX idx_variante (variante_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Agregar solo las foreign keys que SÍ existen
ALTER TABLE carrito 
ADD CONSTRAINT fk_carrito_usuario 
FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;

ALTER TABLE carrito 
ADD CONSTRAINT fk_carrito_producto 
FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE;

-- NO agregamos FK para variante_id porque la tabla puede no existir o tener otro nombre

-- 5. Reactivar verificación de foreign keys
SET FOREIGN_KEY_CHECKS = 1;

-- 6. Verificar que se creó correctamente
DESCRIBE carrito;
SELECT 'Tabla carrito creada exitosamente' AS resultado;
