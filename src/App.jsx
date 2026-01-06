import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'

import Register from './pages/Register'
import Productos from './pages/Productos'
import ProductoDetalle from './pages/ProductoDetalle'
import Servicios from './pages/Servicios'
import Carrito from './pages/Carrito'
import MiCuenta from './pages/MiCuenta'
import Checkout from './pages/Checkout'
import Chatbot from './components/Chatbot'
import { SettingsProvider } from './context/SettingsContext'
import Nosotros from './pages/Nosotros'
import Contacto from './pages/Contacto'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import MensajesAdmin from './pages/admin/MensajesAdmin'
import ProductosIndex from './pages/admin/productos/index'
import ProductosNew from './pages/admin/productos/new'
import ProductosEdit from './pages/admin/productos/edit'
import ProductosShow from './pages/admin/productos/show'
import CategoriasIndex from './pages/admin/categorias/index'
import CategoriasNew from './pages/admin/categorias/new'
import CategoriasEdit from './pages/admin/categorias/edit'
import CategoriasShow from './pages/admin/categorias/show'
import MarcasIndex from './pages/admin/marcas/index'
import MarcasNew from './pages/admin/marcas/new'
import MarcasEdit from './pages/admin/marcas/edit'
import MarcasShow from './pages/admin/marcas/show'
import DescuentosIndex from './pages/admin/descuentos/index'
import DescuentosNew from './pages/admin/descuentos/new'
import DescuentosEdit from './pages/admin/descuentos/edit'
import DescuentosShow from './pages/admin/descuentos/show'
import ServiciosIndex from './pages/admin/servicios/index'
import ServiciosNew from './pages/admin/servicios/new'
import ServiciosEdit from './pages/admin/servicios/edit'
import ServiciosShow from './pages/admin/servicios/show'
import PedidosIndex from './pages/admin/pedidos/index'
import PedidosShow from './pages/admin/pedidos/show'
import PedidosEdit from './pages/admin/pedidos/edit'
import ClientesIndex from './pages/admin/clientes/index'
import ClientesShow from './pages/admin/clientes/show'
import UsuariosIndex from './pages/admin/usuarios/index'
import UsuariosNew from './pages/admin/usuarios/new'
import UsuariosEdit from './pages/admin/usuarios/edit'
import AdminBanners from './pages/admin/banners/index'
import AdminReportes from './pages/admin/AdminReportes'
import AdminReservaciones from './pages/admin/servicios/AdminReservaciones'
import AjustesDetalle from './pages/admin/AjustesDetalle'
import './App.css'

function App() {
  const { isAuthenticated, isAdmin } = useAuth()

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />
    }
    return children
  }

  const AdminRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />
    }
    if (!isAdmin) {
      return <Navigate to="/" />
    }
    return children
  }

  return (
    <SettingsProvider>
      <Routes>
        {/* Rutas públicas con header/footer */}
        <Route path="/" element={
          <>
            <Header />
            <Home />
            <Footer />
          </>
        } />

        <Route path="/login" element={
          <>
            <Header />
            <Login />
            <Footer />
          </>
        } />

        <Route path="/register" element={
          <>
            <Header />
            <Register />
            <Footer />
          </>
        } />

        <Route path="/forgot-password" element={
          <>
            <Header />
            <ForgotPassword />
            <Footer />
          </>
        } />

        <Route path="/reset-password/:token" element={
          <>
            <Header />
            <ResetPassword />
            <Footer />
          </>
        } />

        <Route path="/productos" element={
          <>
            <Header />
            <Productos />
            <Footer />
          </>
        } />

        <Route path="/producto/:id" element={
          <>
            <Header />
            <ProductoDetalle />
            <Footer />
          </>
        } />

        <Route path="/servicios" element={
          <>
            <Header />
            <Servicios />
            <Footer />
          </>
        } />

        <Route path="/carrito" element={
          <>
            <Header />
            <Carrito />
            <Footer />
          </>
        } />

        <Route path="/perfil" element={
          <ProtectedRoute>
            <Header />
            <MiCuenta />
            <Footer />
          </ProtectedRoute>
        } />

        <Route path="/mis-pedidos" element={
          <ProtectedRoute>
            <Header />
            <MiCuenta />
            <Footer />
          </ProtectedRoute>
        } />

        <Route path="/lista-deseos" element={
          <ProtectedRoute>
            <Header />
            <MiCuenta />
            <Footer />
          </ProtectedRoute>
        } />

        <Route path="/checkout" element={
          <ProtectedRoute>
            <Header />
            <Checkout />
            <Footer />
          </ProtectedRoute>
        } />

        <Route path="/nosotros" element={
          <>
            <Header />
            <Nosotros />
            <Footer />
          </>
        } />

        <Route path="/contacto" element={
          <>
            <Header />
            <Contacto />
            <Footer />
          </>
        } />

        {/* Rutas del panel admin */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="mensajes" element={<MensajesAdmin />} />
          <Route path="productos">
            <Route index element={<ProductosIndex />} />
            <Route path="nuevo" element={<ProductosNew />} />
            <Route path="editar/:id" element={<ProductosEdit />} />
            <Route path="ver/:id" element={<ProductosShow />} />
          </Route>
          <Route path="categorias">
            <Route index element={<CategoriasIndex />} />
            <Route path="nuevo" element={<CategoriasNew />} />
            <Route path="editar/:id" element={<CategoriasEdit />} />
            <Route path="ver/:id" element={<CategoriasShow />} />
          </Route>
          <Route path="marcas">
            <Route index element={<MarcasIndex />} />
            <Route path="nuevo" element={<MarcasNew />} />
            <Route path="editar/:id" element={<MarcasEdit />} />
            <Route path="ver/:id" element={<MarcasShow />} />
          </Route>
          <Route path="descuentos">
            <Route index element={<DescuentosIndex />} />
            <Route path="nuevo" element={<DescuentosNew />} />
            <Route path="editar/:id" element={<DescuentosEdit />} />
            <Route path="ver/:id" element={<DescuentosShow />} />
          </Route>
          <Route path="servicios">
            <Route index element={<ServiciosIndex />} />
            <Route path="nuevo" element={<ServiciosNew />} />
            <Route path="editar/:id" element={<ServiciosEdit />} />
            <Route path="ver/:id" element={<ServiciosShow />} />
            <Route path="reservaciones" element={<AdminReservaciones />} />
          </Route>
          <Route path="pedidos">
            <Route index element={<PedidosIndex />} />
            <Route path="ver/:id" element={<PedidosShow />} />
            <Route path="editar/:id" element={<PedidosEdit />} />
          </Route>
          <Route path="clientes">
            <Route index element={<ClientesIndex />} />
            <Route path="ver/:id" element={<ClientesShow />} />
          </Route>
          <Route path="usuarios">
            <Route index element={<UsuariosIndex />} />
            <Route path="nuevo" element={<UsuariosNew />} />
            <Route path="editar/:id" element={<UsuariosEdit />} />
          </Route>
          <Route path="banners" element={<AdminBanners />} />
          <Route path="reportes" element={<AdminReportes />} />
          <Route path="ajustes" element={<AjustesDetalle />} />
        </Route>
      </Routes>
      <Chatbot />
    </SettingsProvider>
  )
}

export default App
