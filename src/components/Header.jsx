import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CartSidebar from "./CartSidebar";
import { categoriasService } from "../services";
import {
  ShoppingCart,
  User,
  Search,
  Heart,
  Menu,
  X,
  ChevronDown,
  ShoppingBag,
  ShieldCheck,
  Smartphone,
  MessageCircleQuestion,
  Globe,
  Zap,
  Package,
  LogOut
} from "lucide-react";

const headerStyles = `
  .header-shadow {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .search-input-falabella {
    transition: all 0.3s ease;
  }

  .search-input-falabella:focus {
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    border-color: #f97316;
  }
`

const Header = () => {
  const { usuario, logout, isAuthenticated } = useAuth()
  const { getItemsCount, getTotal } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false)
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false)
  const [categorias, setCategorias] = useState([])

  /* Scroll Hide Logic */
  const [isNavVisible, setIsNavVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Always show if near top
      if (currentScrollY < 100) {
        setIsNavVisible(true)
        setLastScrollY(currentScrollY)
        return
      }

      // Hide if scrolling down, Show if scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavVisible(false)
      } else {
        setIsNavVisible(true)
      }

      setLastScrollY(currentScrollY)
      setIsScrolled(currentScrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const data = await categoriasService.getAll()
        setCategorias(data)
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    loadCategorias()
  }, [])

  const handleLogout = async () => {
    await logout()
    setShowUserMenu(false)
    navigate("/")
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/productos?busqueda=${searchQuery}`)
      setSearchQuery("")
    }
  }

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      navigate(`/productos?busqueda=${searchQuery}`)
      setSearchQuery("")
    }
  }

  const isActivePath = (path) => location.pathname === path

  return (
    <>
      <style>{headerStyles}</style>

      {/* Overlay con Blur */}
      <AnimatePresence>
        {(showUserMenu || mobileMenuOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowUserMenu(false);
              setMobileMenuOpen(false);
            }}
            className="fixed inset-0 bg-black/20 z-40"
          />
        )}
      </AnimatePresence>

      <header className="fixed top-0 left-0 right-0 z-50 bg-white header-shadow">
        {/* Top Bar */}
        <div className="bg-black text-white py-2 text-xs font-medium">
          <div className="container mx-auto px-4 flex justify-between items-center">
            {/* Left Side */}
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 hover:text-orange-400 transition-colors cursor-pointer">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Garantía de Entrega
              </span>
              <span className="hover:text-orange-400 transition-colors cursor-pointer">
                Devoluciones Gratis
              </span>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-6">
              <a href="#" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
                <Smartphone className="w-4 h-4" />
                App
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
                <MessageCircleQuestion className="w-4 h-4" />
                Ayuda
              </a>
              <button className="flex items-center gap-2 hover:text-orange-400 transition-colors">
                <Globe className="w-4 h-4" />
                ES / USD
              </button>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="bg-white py-4">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-6">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
                <h1 className="text-2xl lg:text-3xl font-bold text-orange-600">
                  tiendatec<span className="text-gray-800">.com</span>
                </h1>
              </Link>

              {/* Search Bar */}
              <div className="hidden md:flex flex-1 max-w-3xl">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearch}
                    placeholder="Buscar en tiendatec.com"
                    className="w-full pl-4 pr-14 py-3 border-2 border-gray-300 rounded-full text-sm focus:outline-none focus:border-gray-400 transition-colors search-input-falabella"
                  />
                  <button
                    onClick={handleSearchClick}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-orange-600 hover:bg-orange-700 rounded-full flex items-center justify-center transition-colors"
                  >
                    <Search className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-8 ml-auto">
                {/* User Menu */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowUserMenu(true)}
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <button
                    onClick={() => {
                      if (isAuthenticated) setShowUserMenu(!showUserMenu);
                      else navigate('/login');
                    }}
                    className="flex items-center gap-3 hover:opacity-100 transition-colors text-left group"
                  >
                    <User className="w-6 h-6 text-gray-700 group-hover:text-orange-600 transition-colors" strokeWidth={2} />
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs text-gray-500 font-normal">Bienvenido</span>
                      <span className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {isAuthenticated ? usuario.nombre : "Entrar / Registro"}
                      </span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && isAuthenticated && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 p-2"
                      >


                        {usuario.rol === "admin" && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors mb-1 group"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">Panel Admin</span>
                          </Link>
                        )}

                        <Link
                          to="/perfil"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors mb-1 group"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">Mi Perfil</span>
                        </Link>

                        <Link
                          to="/mis-pedidos"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors mb-1 group"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Package className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">Mis Pedidos</span>
                        </Link>

                        <div className="border-t border-gray-50 my-1"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors group"
                        >
                          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">Salir</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Deseos (Wishlist) */}
                <Link to="/lista-deseos" className="hidden lg:flex flex-col items-center group gap-0.5">
                  <Heart className="w-6 h-6 text-gray-700 group-hover:text-orange-600 transition-colors" strokeWidth={2} />
                  <span className="text-xs font-medium text-gray-600 group-hover:text-orange-600 transition-colors">Deseos</span>
                </Link>

                {/* Carrito */}
                <button
                  onClick={() => setCartSidebarOpen(true)}
                  className="flex items-center gap-3 hover:opacity-100 transition-colors text-left group"
                >
                  <div className="relative">
                    <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-orange-600 transition-colors" strokeWidth={2} />
                    {getItemsCount() > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {getItemsCount()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs text-gray-500 font-normal">Carrito</span>
                    <span className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                      ${getTotal().toFixed(2)}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile Search */}
            <div className="md:hidden mt-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearch}
                  placeholder="Buscar productos..."
                  className="w-full pl-10 pr-20 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <button
                  onClick={handleSearchClick}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg text-sm"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <AnimatePresence>
          {isNavVisible && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="hidden lg:block bg-white border-t border-gray-200 overflow-hidden"
            >
              <div className="container mx-auto px-4">
                <ul className="flex items-center gap-8 w-full">
                  {/* Inicio Link */}
                  <li>
                    <Link
                      to="/"
                      className={`block py-4 text-sm font-medium transition-colors ${isActivePath('/') ? 'text-orange-600 font-bold' : 'text-gray-600 hover:text-orange-600'}`}
                    >
                      Inicio
                    </Link>
                  </li>

                  {/* Todas las Categorías (Dropdown) */}
                  <li
                    className="relative"
                    onMouseEnter={() => setShowCategoriesMenu(true)}
                    onMouseLeave={() => setShowCategoriesMenu(false)}
                  >
                    <button
                      onClick={() => navigate('/productos')}
                      className="flex items-center gap-2 py-4 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      <Menu className="w-5 h-5" />
                      Todas las Categorías
                      <ChevronDown className={`w-4 h-4 transition-transform ${showCategoriesMenu ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showCategoriesMenu && categorias.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute left-0 top-full mt-0 w-64 bg-white rounded-b-lg shadow-2xl border border-gray-200 z-50"
                        >
                          <div className="py-2">
                            <Link
                              to="/productos"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors font-bold"
                              onClick={() => setShowCategoriesMenu(false)}
                            >
                              Ver todas las categorías
                            </Link>
                            <div className="border-t border-gray-100 my-1" />
                            {categorias.map(cat => (
                              <Link
                                key={cat.id}
                                to={`/productos?categoria=${cat.id}`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                onClick={() => setShowCategoriesMenu(false)}
                              >
                                {cat.nombre}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>

                  {/* Enlaces Principales */}
                  {[
                    { to: '/servicios', label: 'Servicios' },
                    { to: '/nosotros', label: 'Nosotros' },
                    { to: '/contacto', label: 'Contacto' }
                  ].map((item, i) => (
                    <li key={i}>
                      <Link
                        to={item.to}
                        className={`block py-4 text-sm font-medium transition-colors ${isActivePath(item.to) ? 'text-orange-600 font-bold' : 'text-gray-600 hover:text-orange-600'
                          }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}

                  {/* Ofertas Flash Link (Right aligned if possible, or just at end) */}
                  <li className="ml-auto">
                    <Link
                      to="/productos?ofertas=1"
                      className="flex items-center gap-1.5 py-2 px-3 bg-red-50 text-red-600 rounded-full text-sm font-bold hover:bg-red-100 transition-colors"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      Ofertas Flash
                    </Link>
                  </li>
                </ul>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-200"
            >
              <div className="container mx-auto px-4 py-4">
                <ul className="space-y-1">
                  {[
                    { to: '/', label: 'Inicio' },
                    { to: '/productos', label: 'Productos' },
                    { to: '/servicios', label: 'Servicios' },
                    { to: '/nosotros', label: 'Nosotros' },
                    { to: '/contacto', label: 'Contacto' }
                  ].map((item, i) => (
                    <li key={i}>
                      <Link
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActivePath(item.to)
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer - Ajustado para altura del header fijo */}
      <div className="h-[148px] lg:h-[160px]" />

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartSidebarOpen} onClose={() => setCartSidebarOpen(false)} />
    </>
  )
}

export default Header