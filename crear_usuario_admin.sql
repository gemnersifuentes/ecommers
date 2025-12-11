-- =====================================================
-- CREAR USUARIO ADMINISTRADOR
-- =====================================================
-- Ejecutar este script en phpMyAdmin para crear un usuario admin

USE db_tienda_redhard;

-- Verificar si ya existe el usuario
SELECT * FROM usuarios WHERE correo = 'admin@tiendatec.com';

-- Si no existe, insertar usuario administrador
-- Usuario: admin@tiendatec.com
-- Contraseña: admin123
-- El hash se genera con: password_hash('admin123', PASSWORD_BCRYPT)

INSERT INTO usuarios (nombre, correo, clave, rol, activo, fecha_registro)
VALUES (
    'Administrador',
    'admin@tiendatec.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'admin',
    1,
    NOW()
) ON DUPLICATE KEY UPDATE nombre = nombre;

-- Verificar que se creó
SELECT id, nombre, correo, rol, activo FROM usuarios WHERE correo = 'admin@tiendatec.com';

-- =====================================================
-- CREDENCIALES DE PRUEBA
-- =====================================================
-- Correo: admin@tiendatec.com
-- Contraseña: admin123
-- Rol: admin
