-- =====================================================
-- CORREGIR CONTRASEÑA DEL ADMINISTRADOR
-- =====================================================
-- El hash actual en la BD no corresponde a "admin123"
-- Este script actualiza el hash correcto

USE db_tienda_redhard;

-- Actualizar con el hash correcto para "admin123"
UPDATE usuarios 
SET clave = '$2y$10$0I2I7mNc6TGPMhOzGKhHgOKx6MFo74BjSbkf7s.9ud005FDjzXXIK' 
WHERE correo = 'admin@tiendatec.com';

-- Verificar que se actualizó
SELECT id, nombre, correo, rol, activo FROM usuarios WHERE correo = 'admin@tiendatec.com';

-- =====================================================
-- CREDENCIALES CORRECTAS
-- =====================================================
-- Correo: admin@tiendatec.com
-- Contraseña: admin123
-- =====================================================
