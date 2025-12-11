# 🚀 INSTRUCCIONES DE INSTALACIÓN PASO A PASO

## PASO 1: Instalar el Backend

### Opción A: Usando el script automático (Recomendado)
1. Haz doble clic en el archivo `instalar-backend.bat`
2. El script copiará automáticamente todos los archivos del backend a XAMPP

### Opción B: Manual
1. Copia la carpeta `backend` completa
2. Pégala en `C:\xampp\htdocs\`
3. Renombra la carpeta a `api-tienda-tec`

## PASO 2: Configurar la Base de Datos

1. **Inicia XAMPP Control Panel**
   - Abre XAMPP Control Panel
   - Haz clic en "Start" para Apache
   - Haz clic en "Start" para MySQL

2. **Importar la base de datos**
   - Abre tu navegador
   - Ve a: http://localhost/phpmyadmin
   - Haz clic en "Nuevo" en el menú lateral
   - Nombre de la base de datos: `db_tienda_tec`
   - Codificación: `utf8mb4_unicode_ci`
   - Haz clic en "Crear"
   - Selecciona la base de datos creada
   - Ve a la pestaña "Importar"
   - Haz clic en "Seleccionar archivo"
   - Selecciona el archivo `database.sql` de la carpeta del proyecto
   - Haz clic en "Continuar"
   - ¡Listo! La base de datos está creada con datos de ejemplo

## PASO 3: Verificar el Backend

1. Abre tu navegador
2. Ve a: http://localhost/api-tienda-tec/productos
3. Deberías ver un JSON con la lista de productos
4. Si ves los productos, el backend está funcionando correctamente

## PASO 4: Iniciar el Frontend

1. Abre una terminal/PowerShell
2. Navega a la carpeta del proyecto:
   ```bash
   cd C:\Users\ASUS\Documents\proyectos\tienda-tec
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre tu navegador en: http://localhost:5173

## PASO 5: Probar la Aplicación

### Probar la Tienda
1. Navega por el catálogo de productos
2. Haz clic en un producto para ver los detalles
3. Selecciona una variación (si el producto la tiene)
4. Agrega productos al carrito
5. Ve al carrito y completa un pedido

### Probar el Panel Admin
1. Haz clic en "Ingresar"
2. Usa las credenciales:
   - **Email:** admin@tiendatec.com
   - **Password:** admin123
3. Serás redirigido al Dashboard administrativo
4. Explora las diferentes secciones:
   - Dashboard con estadísticas
   - Gestión de productos
   - Gestión de pedidos
   - Y más...

## 🎉 ¡LISTO!

Tu tienda online está funcionando completamente. Ahora puedes:

- ✅ Ver productos y servicios
- ✅ Agregar productos al carrito
- ✅ Realizar pedidos
- ✅ Gestionar todo desde el panel admin
- ✅ Ver estadísticas y reportes

## 🐛 Problemas Comunes

### El backend no responde
- Verifica que Apache esté corriendo en XAMPP
- Verifica que MySQL esté corriendo en XAMPP
- Revisa la consola de errores de XAMPP

### Error de conexión a la base de datos
- Verifica que hayas importado el archivo `database.sql`
- Verifica que la base de datos se llame `db_tienda_tec`
- Revisa el archivo `backend/config/conexion.php`

### CORS errors en el navegador
- Verifica que el backend esté en `http://localhost/api-tienda-tec`
- Los headers CORS ya están configurados

### Las imágenes no se ven
- Las imágenes en la demostración son placeholders
- Puedes agregar URLs de imágenes reales al editar productos en el admin

## 📝 Notas Adicionales

- La contraseña por defecto para todos los usuarios de ejemplo es: `admin123`
- Puedes crear nuevos usuarios desde el panel admin
- Los pedidos se pueden gestionar desde "Gestión de Pedidos"
- Las estadísticas se actualizan en tiempo real en el Dashboard

## 🎨 Personalización

Para personalizar la tienda:
1. Colores y estilos: edita `src/index.css` y `src/App.css`
2. Nombre de la tienda: busca "TiendaTEC" en los archivos y reemplázalo
3. Logo: agrega tu logo en `src/assets/` y actualiza Header.jsx
4. Productos: agrega tus propios productos desde el panel admin

¡Disfruta tu nueva tienda online! 🛍️
