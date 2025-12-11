# 🛍️ TiendaTEC - Tienda Online Completa

Sistema completo de tienda online con panel administrativo, desarrollado con React + Vite (frontend) y PHP + MySQL (backend).

## 📋 Características Principales

### 🏪 Tienda Online
- Catálogo de productos con búsqueda y filtros
- Sistema de variaciones de productos (ej: 8GB, 16GB, 32GB)
- Carrito de compras funcional
- Sistema de pedidos completo
- Sección de servicios técnicos
- Diseño responsivo con Bootstrap 5

### 👨‍💼 Panel Administrativo
- Dashboard con estadísticas y gráficos (Chart.js)
- CRUD completo de productos, categorías y variaciones
- Gestión de pedidos con cambio de estados
- Gestión de servicios
- Gestión de usuarios y clientes
- Sistema de reportes

### 🔐 Sistema de Autenticación
- Login/Register con roles (admin/empleado/cliente)
- Protección de rutas
- Sesiones con tokens

## 🚀 Instalación

### Requisitos Previos
- Node.js 16+
- XAMPP (Apache + MySQL)
- npm o yarn

### 1. Configurar Base de Datos

1. Inicia XAMPP y activa Apache + MySQL
2. Accede a phpMyAdmin: http://localhost/phpmyadmin
3. Importa el archivo `database.sql` ubicado en la raíz del proyecto
4. La base de datos `db_tienda_tec` se creará automáticamente con datos de ejemplo

### 2. Configurar Backend (PHP)

1. Copia la carpeta `backend` a `C:\xampp\htdocs\api-tienda-tec\`
2. Verifica la configuración de conexión en `backend/config/conexion.php`:
   - Host: localhost
   - Database: db_tienda_tec
   - User: root
   - Password: (vacío por defecto)

### 3. Configurar Frontend (React)

```bash
# Ya instaladas las dependencias durante la creación del proyecto
# Si necesitas reinstalar:
cd tienda-tec
npm install
```

### 4. Iniciar la Aplicación

**Backend (XAMPP):**
- Asegúrate de que Apache y MySQL estén corriendo en XAMPP
- El backend estará disponible en: http://localhost/api-tienda-tec/

**Frontend:**
```bash
cd tienda-tec
npm run dev
```
- La aplicación estará disponible en: http://localhost:5173

## 👤 Credenciales de Prueba

### Administrador
- **Email:** admin@tiendatec.com
- **Password:** admin123

### Empleado
- **Email:** empleado@tiendatec.com
- **Password:** admin123

## 📁 Estructura del Proyecto

```
tienda-tec/
├── backend/                  # Backend PHP
│   ├── api/                  # Endpoints de la API
│   │   ├── auth.php
│   │   ├── productos.php
│   │   ├── categorias.php
│   │   ├── servicios.php
│   │   ├── variaciones.php
│   │   ├── pedidos.php
│   │   ├── usuarios.php
│   │   ├── clientes.php
│   │   └── reportes.php
│   ├── config/
│   │   └── conexion.php      # Configuración BD
│   └── public/
│       ├── index.php         # Router principal
│       └── .htaccess
├── src/
│   ├── components/           # Componentes React
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   ├── context/              # Context API
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── pages/                # Páginas
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Productos.jsx
│   │   ├── ProductoDetalle.jsx
│   │   ├── Servicios.jsx
│   │   ├── Carrito.jsx
│   │   └── admin/            # Panel Admin
│   │       ├── AdminLayout.jsx
│   │       ├── Dashboard.jsx
│   │       ├── AdminProductos.jsx
│   │       └── AdminPedidos.jsx
│   ├── services/             # Servicios API
│   │   ├── api.js
│   │   └── index.js
│   ├── App.jsx
│   └── main.jsx
└── database.sql              # Script de BD

```

## 🎨 Tecnologías Utilizadas

### Frontend
- React 18
- Vite
- React Router DOM
- Bootstrap 5
- Font Awesome
- SweetAlert2
- Axios
- Chart.js

### Backend
- PHP 8.x
- MySQL
- API RESTful

## 📊 Funcionalidades del Sistema

### Productos
- ✅ Crear, editar y eliminar productos
- ✅ Asignar categorías
- ✅ Gestionar variaciones (tamaños, capacidades, etc.)
- ✅ Control de stock
- ✅ Imágenes de productos

### Pedidos
- ✅ Crear pedidos desde el carrito
- ✅ Gestionar estados (Pendiente, En proceso, Completado, Cancelado)
- ✅ Ver detalles completos
- ✅ Registro de clientes automático

### Dashboard
- ✅ Estadísticas de ventas
- ✅ Gráficos de ventas mensuales
- ✅ Productos más vendidos
- ✅ Estado de pedidos
- ✅ Últimos pedidos

## 🔧 Configuración Adicional

### Cambiar URL del Backend

Si necesitas cambiar la URL del backend, edita `src/services/api.js`:

```javascript
const API_URL = 'http://localhost/api-tienda-tec';
```

### Habilitar Reescritura de URLs (Apache)

Asegúrate de que `mod_rewrite` esté habilitado en Apache (XAMPP lo tiene por defecto).

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verifica que MySQL esté corriendo en XAMPP
- Revisa las credenciales en `backend/config/conexion.php`

### CORS errors
- Verifica que el backend esté corriendo en el puerto correcto
- Los headers CORS ya están configurados en `conexion.php`

### Las rutas no funcionan (404)
- Asegúrate de que el archivo `.htaccess` esté en `backend/public/`
- Verifica que `mod_rewrite` esté habilitado

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Desarrollado con

- ❤️ Amor por la programación
- ☕ Mucho café
- 🎵 Buena música
