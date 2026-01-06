import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CartSidebar from "./CartSidebar";
import { categoriasService } from "../services";
import searchService from "../services/searchService";
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
  LogOut,
  Home,
  Mail,
  Info,
  Wrench,
  Clock // Added Clock import
} from "lucide-react";
import { useLoader } from "../context/LoaderContext";
import { useSettings } from "../context/SettingsContext";

const headerStyles = `
  .header-shadow {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .search-input-falabella {
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
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
  const { showLoader, hideLoader } = useLoader()
  const { settings } = useSettings()
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(location.search)
    return params.get('busqueda') || ""
  })
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false)
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false)
  const [categorias, setCategorias] = useState([])

  // Search states
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState({ products: [], brands: [], categories: [] })
  const [searchHistory, setSearchHistory] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const searchContainerRef = useRef(null)

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

  // Load search history on mount
  useEffect(() => {
    setSearchHistory(searchService.getSearchHistory())
  }, [])

  // Sync search query with URL on mount and updates
  // Sync search query with URL on mount and updates
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const busqueda = params.get('busqueda');
    // If busqueda exists, set it. If not, clear the search query
    // This allows the input to clear when navigating to pages without search or home
    if (busqueda) {
      setSearchQuery(busqueda);
    } else {
      setSearchQuery("");
    }
  }, [location.search]);

  // Fetch suggestions when query changes
  useEffect(() => {
    // Immediate clear if query is too short
    if (searchQuery.trim().length < 2) {
      setSearchSuggestions({ products: [], brands: [], categories: [] })
      return
    }

    const fetchSuggestions = async () => {
      setIsSearching(true)
      const suggestions = await searchService.getSearchSuggestions(searchQuery)
      setSearchSuggestions(suggestions)
      setIsSearching(false)
    }

    const timeoutId = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const mobileSearchRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isDesktopClick = searchContainerRef.current && searchContainerRef.current.contains(event.target);
      const isMobileClick = mobileSearchRef.current && mobileSearchRef.current.contains(event.target);

      if (!isDesktopClick && !isMobileClick) {
        setShowSearchDropdown(false)
      }
    }

    if (showSearchDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSearchDropdown])

  const handleLogout = async () => {
    await logout()
    setShowUserMenu(false)
    navigate("/")
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      searchService.saveSearchTerm(searchQuery)
      navigate(`/productos?busqueda=${searchQuery}`)
      setShowSearchDropdown(false)
    }
  }

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      searchService.saveSearchTerm(searchQuery)
      navigate(`/productos?busqueda=${searchQuery}`)
      setShowSearchDropdown(false)
    }
  }

  const handleSearchFocus = () => {
    setShowSearchDropdown(true)
    setSearchHistory(searchService.getSearchHistory())
  }

  const handleSearchBlur = () => {
    // Delay to allow click on suggestions
    setTimeout(() => setShowSearchDropdown(false), 200)
  }

  const handleHistoryClick = (term) => {
    setSearchQuery(term)
    searchService.saveSearchTerm(term)
    navigate(`/productos?busqueda=${term}`)
    setShowSearchDropdown(false)
  }

  const handleClearHistory = () => {
    searchService.clearSearchHistory()
    setSearchHistory([])
  }

  const handleSuggestionClick = (type, value) => {
    if (type === 'product') {
      navigate(`/producto/${value.id}`)
    } else if (type === 'brand') {
      if (value.id) {
        navigate(`/productos?marca=${value.id}`)
      } else {
        const searchTerm = value.nombre || value
        searchService.saveSearchTerm(searchTerm)
        navigate(`/productos?busqueda=${searchTerm}`)
      }
    } else if (type === 'category') {
      if (value.id) {
        navigate(`/productos?categoria=${value.id}`)
      } else {
        const searchTerm = value.nombre || value
        searchService.saveSearchTerm(searchTerm)
        navigate(`/productos?busqueda=${searchTerm}`)
      }
    }
    setShowSearchDropdown(false)
  }

  const isActivePath = (path) => location.pathname === path

  const shouldShowDropdown = showSearchDropdown && (
    (searchQuery.trim().length === 0 && searchHistory.length > 0) ||
    (searchQuery.trim().length >= 2 && (
      (searchSuggestions.products && searchSuggestions.products.length > 0) ||
      (searchSuggestions.brands && searchSuggestions.brands.length > 0) ||
      (searchSuggestions.categories && searchSuggestions.categories.length > 0)
    ))
  );

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
            <div className="flex items-center gap-3 md:gap-6">
              <span className="flex items-center gap-2 hover:text-orange-400 transition-colors cursor-pointer">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="hidden sm:inline">Garantía de Entrega</span>
              </span>
              <span className="hidden sm:inline hover:text-orange-400 transition-colors cursor-pointer">
                Devoluciones Gratis
              </span>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3 md:gap-6">
              <a href="#" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">App</span>
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
                <MessageCircleQuestion className="w-4 h-4" />
                <span className="hidden sm:inline">Ayuda</span>
              </a>
              <button className="flex items-center gap-2 hover:text-orange-400 transition-colors">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">ES / USD</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="bg-white py-0 md:py-4">
          <div className="container mx-auto px-0 md:px-4 py-0 md:py-3">
            <div className="flex items-center gap-6 px-4 md:px-0">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-orange-600">
                  {settings.nombre_empresa?.toLowerCase() === 'tiendatec' ? 'redhard' : settings.nombre_empresa.toLowerCase()}<span className="text-gray-800">.com</span>
                </h1>
              </Link>

              {/* Search Bar */}
              <div className="hidden md:flex flex-1 max-w-3xl">
                {/* Search Bar Container - seamless design */}
                <div ref={searchContainerRef} className={`relative w-full z-50 transition-all duration-200 ${shouldShowDropdown ? 'shadow-lg rounded-3xl' : ''}`}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearch}
                    onFocus={handleSearchFocus}
                    autoComplete="off"
                    placeholder={`Buscar en ${settings.nombre_empresa.toLowerCase()}.com`}
                    className={`w-full pl-4 pr-14 py-3 border-2 border-gray-300 text-sm focus:outline-none focus:border-gray-400 search-input-falabella 
                        ${shouldShowDropdown
                        ? 'rounded-t-3xl rounded-b-none border-b-0 shadow-none'
                        : 'rounded-full shadow-sm hover:shadow-md'}`}
                  />
                  <button
                    onClick={handleSearchClick}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 bg-orange-600 hover:bg-orange-700 rounded-full flex items-center justify-center transition-colors z-30"
                  >
                    <Search className="w-5 h-5 text-white" />
                  </button>

                  {/* Search Dropdown */}
                  {shouldShowDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-0 bg-white rounded-b-3xl shadow-lg border-2 border-t-0 border-orange-600 max-h-[500px] overflow-hidden z-20">
                      {/* Search History - Show when no query */}
                      {searchQuery.trim().length === 0 && searchHistory.length > 0 && (
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-semibold text-gray-700">Buscaste recientemente</h3>
                            <button
                              onClick={handleClearHistory}
                              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                            >
                              Limpiar
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {searchHistory.slice(0, 12).map((term, index) => (
                              <button
                                key={index}
                                onClick={() => handleHistoryClick(term)}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors"
                              >
                                {term}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Search Suggestions - Show when typing AND has results */}
                      {searchQuery.trim().length >= 2 && (
                        (searchSuggestions?.products?.length > 0 ||
                          searchSuggestions?.brands?.length > 0 ||
                          searchSuggestions?.categories?.length > 0) ? (
                          <div className="grid grid-cols-3 gap-4 p-4">
                            {/* Products Column */}
                            {searchSuggestions?.products?.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">{searchQuery}</h4>
                                <div className="space-y-2">
                                  {searchSuggestions.products.slice(0, 5).map((product) => (
                                    <button
                                      key={product.id}
                                      onClick={() => handleSuggestionClick('product', product)}
                                      className="w-full text-left hover:bg-gray-50 p-2 rounded flex items-center gap-2"
                                    >
                                      {product.imagen && (
                                        <img src={product.imagen} alt={product.nombre} className="w-10 h-10 object-contain" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-700 truncate">{product.nombre}</p>
                                        <p className="text-xs text-orange-600 font-semibold">${product.precio.toFixed(2)}</p>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Brands Column */}
                            {searchSuggestions?.brands?.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Marcas relacionadas</h4>
                                <div className="space-y-1">
                                  {searchSuggestions.brands.slice(0, 8).map((brand, index) => (
                                    <button
                                      key={brand.id || index}
                                      onClick={() => handleSuggestionClick('brand', brand)}
                                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm text-gray-700"
                                    >
                                      {brand.nombre || brand}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Categories Column */}
                            {searchSuggestions?.categories?.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Categorías relacionadas</h4>
                                <div className="space-y-1">
                                  {searchSuggestions.categories.slice(0, 8).map((category, index) => (
                                    <button
                                      key={category.id || index}
                                      onClick={() => handleSuggestionClick('category', category)}
                                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm text-gray-700"
                                    >
                                      {category.nombre || category}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          isSearching && (
                            <div className="p-4 text-center text-sm text-gray-500">
                              Buscando...
                            </div>
                          )
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Icons */}
              <div className="hidden md:flex items-center gap-8 ml-auto">
                {/* User Menu */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowUserMenu(true)}
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <button
                    onClick={() => {
                      showLoader();
                      if (isAuthenticated) setShowUserMenu(!showUserMenu);
                      else navigate('/login');
                      setTimeout(hideLoader, 500);
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
                            onClick={() => { showLoader(); setShowUserMenu(false); setTimeout(hideLoader, 500); }}
                          >
                            <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">Panel Admin</span>
                          </Link>
                        )}

                        <Link
                          to="/perfil"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors mb-1 group"
                          onClick={() => { showLoader(); setShowUserMenu(false); setTimeout(hideLoader, 500); }}
                        >
                          <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">Mi Perfil</span>
                        </Link>

                        <Link
                          to="/mis-pedidos"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors mb-1 group"
                          onClick={() => { showLoader(); setShowUserMenu(false); setTimeout(hideLoader, 500); }}
                        >
                          <Package className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">Mis Pedidos</span>
                        </Link>

                        <div className="border-t border-gray-50 my-1"></div>

                        <button
                          onClick={async () => { showLoader(); await handleLogout(); setTimeout(hideLoader, 500); }}
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
                <Link to="/lista-deseos" className="flex flex-col items-center group gap-0.5">
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

              {/* Mobile Action Icons */}
              <div className="flex md:hidden items-center gap-3 ml-auto">
                {/* User Mobile - Show name when authenticated */}
                <button
                  onClick={() => {
                    showLoader();
                    if (isAuthenticated) navigate('/perfil');
                    else navigate('/login');
                    setTimeout(hideLoader, 500);
                  }}
                  className="flex items-center gap-2 transition-colors max-w-[140px]"
                >
                  <User className="w-5 h-5 text-gray-700 flex-shrink-0" strokeWidth={2} />
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {isAuthenticated ? usuario.nombre : 'Entrar'}
                  </span>
                </button>

                {/* Cart Mobile */}
                <button
                  onClick={() => setCartSidebarOpen(true)}
                  className="relative"
                >
                  <ShoppingCart className="w-6 h-6 text-gray-700" strokeWidth={2} />
                  {getItemsCount() > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {getItemsCount()}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Search */}
            <div className={`md:hidden mt-2 mb-2 px-4 transition-all duration-200 ${shouldShowDropdown ? 'relative z-50' : ''}`}>
              <div ref={mobileSearchRef} className={`relative w-full transition-all duration-200 ${shouldShowDropdown ? 'shadow-lg rounded-3xl' : ''}`}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearch}
                  onFocus={handleSearchFocus}
                  autoComplete="off"
                  placeholder={`Buscar en ${settings.nombre_empresa.toLowerCase()}.com`}
                  className={`w-full pl-3 pr-12 py-2 border-2 border-gray-300 text-xs focus:outline-none focus:border-gray-400 search-input-falabella box-border
                     ${shouldShowDropdown
                      ? 'rounded-t-3xl rounded-b-none border-b-0 shadow-none'
                      : 'rounded-full shadow-sm'}`}
                />
                <button
                  onClick={handleSearchClick}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-orange-600 hover:bg-orange-700 rounded-full flex items-center justify-center transition-colors z-30"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>

                {/* Mobile Search Dropdown */}
                {showSearchDropdown && ((searchQuery.trim().length === 0 && searchHistory.length > 0) || (searchQuery.trim().length >= 2 && (searchSuggestions.products?.length > 0 || searchSuggestions.brands?.length > 0 || searchSuggestions.categories?.length > 0 || isSearching))) && (
                  <div className="absolute top-full left-0 right-0 mt-0 bg-white rounded-b-3xl shadow-lg border-2 border-t-0 border-gray-300 max-h-[400px] overflow-hidden z-20">
                    {/* Search History - Show when no query */}
                    {searchQuery.trim().length === 0 && searchHistory.length > 0 && (
                      <div className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Historial</h3>
                          <button
                            onClick={handleClearHistory}
                            className="text-[10px] text-orange-600 hover:text-orange-700 font-medium"
                          >
                            Borrar
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {searchHistory.slice(0, 6).map((term, index) => (
                            <button
                              key={index}
                              onClick={() => handleHistoryClick(term)}
                              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Search Suggestions - Show when typing AND has results */}
                    {searchQuery.trim().length >= 2 && (
                      searchSuggestions?.products?.length > 0 ||
                      searchSuggestions?.brands?.length > 0 ||
                      searchSuggestions?.categories?.length > 0
                    ) && (
                        <div className="p-3">
                          {/* Products */}
                          {searchSuggestions?.products?.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">{searchQuery}</h4>
                              <div className="space-y-0.5">
                                {searchSuggestions.products.slice(0, 5).map((product) => (
                                  <button
                                    key={product.id}
                                    onClick={() => handleSuggestionClick('product', product)}
                                    className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center gap-2"
                                  >
                                    {product.imagen && (
                                      <img src={product.imagen} alt={product.nombre} className="w-10 h-10 object-contain" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-gray-700 font-medium truncate">{product.nombre}</p>
                                      <p className="text-[10px] text-orange-600 font-bold">${product.precio.toFixed(2)}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Brands */}
                          {searchSuggestions?.brands?.length > 0 && (
                            <div className="mb-3 bg-gray-50/50 p-2 rounded">
                              <h4 className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Marcas</h4>
                              <div className="space-y-0.5">
                                {searchSuggestions.brands.slice(0, 5).map((brand, index) => (
                                  <button
                                    key={brand.id || index}
                                    onClick={() => handleSuggestionClick('brand', brand)}
                                    className="w-full text-left px-2 py-1.5 hover:bg-white hover:shadow-sm rounded text-xs text-gray-600 hover:text-orange-600 transition-all"
                                  >
                                    {brand.nombre || brand}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Categories */}
                          {searchSuggestions?.categories?.length > 0 && (
                            <div className="bg-gray-50/50 p-2 rounded">
                              <h4 className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Categorías</h4>
                              <div className="space-y-0.5">
                                {searchSuggestions.categories.slice(0, 5).map((category, index) => (
                                  <button
                                    key={category.id || index}
                                    onClick={() => handleSuggestionClick('category', category)}
                                    className="w-full text-left px-2 py-1.5 hover:bg-white hover:shadow-sm rounded text-xs text-gray-600 hover:text-orange-600 transition-all"
                                  >
                                    {category.nombre || category}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    {/* Loading state */}
                    {isSearching && (
                      <div className="p-3 border-t border-gray-100 text-center text-xs text-gray-400">
                        Buscando...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div >
        </div >

        {/* Navigation */}
        < AnimatePresence >
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
                      onClick={() => { showLoader(); setTimeout(hideLoader, 500); }}
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
                      onClick={() => { showLoader(); navigate('/productos'); setTimeout(hideLoader, 800); }}
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
                              onClick={() => { showLoader(); setShowCategoriesMenu(false); setTimeout(hideLoader, 800); }}
                            >
                              Ver todas las categorías
                            </Link>
                            <div className="border-t border-gray-100 my-1" />
                            {categorias.map(cat => (
                              <Link
                                key={cat.id}
                                to={`/productos?categoria=${cat.id}`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                onClick={() => { showLoader(); setShowCategoriesMenu(false); setTimeout(hideLoader, 800); }}
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
                        onClick={() => { showLoader(); setTimeout(hideLoader, 500); }}
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
        </AnimatePresence >

        {/* Mobile Sidebar Menu */}
        < AnimatePresence >
          {mobileMenuOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 overflow-y-auto"
            >
              {/* Sidebar Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Menú</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {isAuthenticated ? usuario.nombre : 'Invitado'}
                    </p>
                    {!isAuthenticated && (
                      <button
                        onClick={() => {
                          navigate('/login');
                          setMobileMenuOpen(false);
                        }}
                        className="text-sm text-white/90 hover:text-white underline"
                      >
                        Iniciar sesión
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="p-4">
                <ul className="space-y-1">
                  {[
                    { to: '/', label: 'Inicio', Icon: Home },
                    { to: '/productos', label: 'Productos', Icon: ShoppingBag },
                    { to: '/lista-deseos', label: 'Lista de Deseos', Icon: Heart },
                    { to: '/servicios', label: 'Servicios', Icon: Wrench },
                    { to: '/nosotros', label: 'Nosotros', Icon: Info },
                    { to: '/contacto', label: 'Contacto', Icon: Mail }
                  ].map((item, i) => (
                    <li key={i}>
                      <Link
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActivePath(item.to)
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <item.Icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* User Actions */}
                {isAuthenticated && (
                  <>
                    <div className="border-t border-gray-200 my-4" />
                    <ul className="space-y-1">
                      <li>
                        <Link
                          to="/perfil"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-5 h-5" />
                          Mi Perfil
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/mis-pedidos"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Package className="w-5 h-5" />
                          Mis Pedidos
                        </Link>
                      </li>
                      {usuario.rol === 'admin' && (
                        <li>
                          <Link
                            to="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors"
                          >
                            <ShieldCheck className="w-5 h-5" />
                            Panel Admin
                          </Link>
                        </li>
                      )}
                      <li>
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          Cerrar Sesión
                        </button>
                      </li>
                    </ul>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence >
      </header >

      {/* Cart Sidebar */}
      < CartSidebar isOpen={cartSidebarOpen} onClose={() => setCartSidebarOpen(false)} />

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          {/* Home */}
          <Link
            to="/"
            className="flex flex-col items-center gap-1 px-4 py-2 transition-colors"
          >
            <div className={`${isActivePath('/') ? 'text-orange-600' : 'text-gray-600'}`}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <span className={`text-xs ${isActivePath('/') ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
              Inicio
            </span>
          </Link>

          {/* Categories */}
          <Link
            to="/productos"
            className="flex flex-col items-center gap-1 px-4 py-2 transition-colors"
          >
            <div className={`${isActivePath('/productos') ? 'text-orange-600' : 'text-gray-600'}`}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <span className={`text-xs ${isActivePath('/productos') ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
              Productos
            </span>
          </Link>

          {/* Cart */}
          <button
            onClick={() => setCartSidebarOpen(true)}
            className="flex flex-col items-center gap-1 px-4 py-2 transition-colors relative"
          >
            <div className="text-gray-600 relative">
              <ShoppingCart className="w-6 h-6" strokeWidth={2} />
              {getItemsCount() > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {getItemsCount()}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-600">Carrito</span>
          </button>

          {/* Wishlist */}
          <Link
            to="/lista-deseos"
            className="flex flex-col items-center gap-1 px-4 py-2 transition-colors"
          >
            <div className={`${isActivePath('/lista-deseos') ? 'text-orange-600' : 'text-gray-600'}`}>
              <Heart className="w-6 h-6" strokeWidth={2} />
            </div>
            <span className={`text-xs ${isActivePath('/lista-deseos') ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
              Deseos
            </span>
          </Link>
        </div>
      </nav>
    </>
  )
}

export default Header