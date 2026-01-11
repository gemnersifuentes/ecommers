import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services';
import { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

// --- CUSTOM REMOS ICONS (SVGs) ---
const Icons = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  ),
  Message: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  Ecommerce: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
  ),
  Category: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
      <path d="M2 17l10 5 10-5"></path>
      <path d="M2 12l10 5 10-5"></path>
    </svg>
  ),
  Attributes: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  ),
  Order: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="12" y1="18" x2="12" y2="12"></line>
      <line x1="9" y1="15" x2="15" y2="15"></line>
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Roles: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="8.5" cy="7" r="4"></circle>
      <line x1="20" y1="8" x2="20" y2="14"></line>
      <line x1="23" y1="11" x2="17" y2="11"></line>
    </svg>
  ),
  Gallery: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  ),
  Report: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  Finance: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  ),
  SubItem: () => (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2.5" y="2.5" width="3" height="3" transform="rotate(45 4 4)" />
    </svg>
  ),
  Truck: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"></rect>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
      <circle cx="5.5" cy="18.5" r="2.5"></circle>
      <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>
  ),
  Purchase: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
      <path d="M3 6h18"></path>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  )
};

const menuGroups = [
  {
    title: "PRINCIPAL",
    items: [
      { id: 'dashboard', path: '/admin', icon: Icons.Dashboard, label: 'Dashboard' },
      { id: 'messages', path: '/admin/mensajes', icon: Icons.Message, label: 'Mensajes' }
    ]
  },
  {
    title: "PÁGINAS",
    items: [
      {
        id: 'ecommerce', label: 'Ecommerce', icon: Icons.Ecommerce,
        subItems: [
          { path: '/admin/productos', label: 'Productos' },
          { path: '/admin/pedidos', label: 'Pedidos' },
        ]
      },
      {
        id: 'category', label: 'Categorías', icon: Icons.Category,
        subItems: [
          { path: '/admin/categorias', label: 'Lista de Categorías' },
          { path: '/admin/categorias/nuevo', label: 'Nueva Categoría' }
        ]
      },
      {
        id: 'attributes', label: 'Atributos', icon: Icons.Attributes,
        subItems: [
          { path: '/admin/marcas', label: 'Marcas' },
          { path: '/admin/descuentos', label: 'Descuentos' }
        ]
      },
      { id: 'banners', path: '/admin/banners', icon: Icons.Gallery, label: 'Banners' },
      {
        id: 'abastecimiento', label: 'Abastecimiento', icon: Icons.Truck,
        subItems: [
          { path: '/admin/compras', label: 'Compras' },
          { path: '/admin/proveedores', label: 'Proveedores' }
        ]
      },
      {
        id: 'servicios', label: 'Servicios', icon: Icons.Order,
        subItems: [
          { path: '/admin/servicios', label: 'Lista de Servicios' },
          { path: '/admin/servicios/reservaciones', label: 'Reservaciones' }
        ]
      },
      {
        id: 'usuarios', label: 'Usuarios', icon: Icons.User,
        subItems: [
          { path: '/admin/usuarios', label: 'Gestión de Usuarios' },
          { path: '/admin/clientes', label: 'Clientes' }
        ]
      },
      { id: 'gastos', path: '/admin/gastos', icon: Icons.Finance, label: 'Gastos' },
      { id: 'report', path: '/admin/reportes', icon: Icons.Report, label: 'Reportes' },
      { id: 'ajustes', path: '/admin/ajustes', icon: Icons.Settings, label: 'Ajustes' }
    ]
  }
];

const NavItem = ({
  item,
  openMenus,
  sidebarOpen,
  mobileMenuOpen,
  toggleMenu,
  isActive,
  isGroupActive,
  isPathMatch
}) => {
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const active = item.path ? isActive(item.path) : false;
  const groupActive = hasSubItems && isGroupActive(item.subItems);
  const isOpen = openMenus[item.id];
  const Icon = item.icon;

  const parentClasses = `
    relative flex items-center gap-3 px-4 py-3 transition-all duration-200 group cursor-pointer select-none
    ${active ? 'bg-orange-600 text-white shadow-sm' : (groupActive ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'text-gray-500 dark:text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10')}
    rounded-xl
  `;

  return (
    <div className="mb-1">
      {hasSubItems ? (
        <div onClick={() => toggleMenu(item.id)} className={parentClasses}>
          <div className={`w-6 flex justify-center transition-colors ${active ? 'text-white' : (groupActive ? 'text-orange-600' : 'text-gray-400 dark:text-gray-500 group-hover:text-orange-600')}`}>
            <Icon />
          </div>
          {(sidebarOpen || mobileMenuOpen) && (
            <>
              <span className={`text-xs font-bold tracking-tight flex-1 ${active ? 'text-white' : (groupActive ? 'text-orange-600' : 'text-gray-700 dark:text-gray-200')}`}>{item.label}</span>
              <i className={`fas fa-chevron-${isOpen ? 'up' : 'right'} text-[9px] transition-transform duration-200 ${active ? 'text-white' : (groupActive ? 'text-orange-600' : 'text-gray-400 dark:text-gray-500')}`}></i>
            </>
          )}
        </div>
      ) : (
        <Link to={item.path} className={parentClasses}>
          <div className={`w-6 flex justify-center transition-colors ${active ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-orange-600'}`}>
            <Icon />
          </div>
          {(sidebarOpen || mobileMenuOpen) && <span className={`text-xs font-bold tracking-tight flex-1 ${active ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>{item.label}</span>}
        </Link>
      )}
      <AnimatePresence>
        {hasSubItems && isOpen && (sidebarOpen || mobileMenuOpen) && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pt-1 pb-2 pl-4 space-y-1">
              {item.subItems.map((subItem, idx) => {
                const isSubActive = isPathMatch(subItem.path) &&
                  !item.subItems.some(s => s.path !== subItem.path && s.path.startsWith(subItem.path) && isPathMatch(s.path));

                return (
                  <Link
                    key={idx}
                    to={subItem.path}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-xs tracking-tight ${isSubActive
                      ? 'text-orange-600 bg-orange-100/50 dark:bg-orange-500/20 font-black shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-orange-600 hover:bg-gray-50 dark:hover:bg-white/5 font-medium'
                      }`}
                  >
                    <div className={`w-4 flex justify-center ${isSubActive ? 'text-orange-600' : 'text-gray-300 dark:text-gray-600 group-hover:text-orange-600'}`}>
                      <Icons.SubItem />
                    </div>
                    <span>{subItem.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminLayout = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, hasNew, setHasNew, latestToast, markAsSeen, markAllAsSeen } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSearchMobileOpen, setIsSearchMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Estados para Búsqueda Global
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchContainerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Animaciones premium (Efecto Ping discreto)
  const bellPulse = hasNew ? {
    scale: [1, 1.08, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  } : {};

  const pingEffect = {
    scale: [1, 2.2],
    opacity: [0.6, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeOut"
    }
  };

  const [openMenus, setOpenMenus] = useState({});

  const brandColor = '#ea580c';
  const darkBrand = '#111827';

  const customScrollbarStyles = `
    .sidebar-scrollbar::-webkit-scrollbar,
    .main-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
    .sidebar-scrollbar::-webkit-scrollbar-track,
    .main-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .sidebar-scrollbar::-webkit-scrollbar-thumb,
    .main-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; transition: background 0.2s ease; }
    .sidebar-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(234, 88, 12, 0.2); }
    .sidebar-scrollbar::-webkit-scrollbar-thumb:hover { background: ${brandColor}; }
    .main-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(234, 88, 12, 0.2); }
    .main-scrollbar::-webkit-scrollbar-thumb:hover { background: ${brandColor}; }
    
    /* Dark Mode Scrollbar */
    .dark .sidebar-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); }
    .dark .main-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); }
    .dark .sidebar-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); }
  `;

  const handleLogout = () => { logout(); navigate('/'); };
  const isPathMatch = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isActive = (path) => isPathMatch(path);

  const isGroupActive = (subItems) => subItems?.some(item => isPathMatch(item.path));

  const toggleMenu = (menuId) => {
    setOpenMenus(prev => {
      const isOpen = prev[menuId];
      // Cerrar todos y abrir solo el seleccionado (comportamiento acordeón)
      return { [menuId]: !isOpen };
    });
  };

  useEffect(() => {
    let activeMenuId = null;
    menuGroups.forEach(group => {
      group.items.forEach(item => {
        if (item.subItems && isGroupActive(item.subItems)) {
          activeMenuId = item.id;
        }
      });
    });
    if (activeMenuId) {
      setOpenMenus(prev => {
        // IMPORTANTE: Si ya está abierto, devolvemos el mismo objeto literal
        // para que React no dispare un re-render innecesario que re-ejecute la animación
        if (prev[activeMenuId]) return prev;
        return { [activeMenuId]: true };
      });
    }
    // Cerrar búsqueda al cambiar de ruta
    setShowSearch(false);
    setIsSearchMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearch(false);
        setIsSearchMobileOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // Efecto para Búsqueda Global con Debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        setShowSearch(true);
        try {
          const res = await adminService.globalSearch(searchQuery);
          setSearchResults(res);
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
        setShowSearch(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };


  return (
    <div className="h-screen bg-[#F4F7FE] dark:bg-[#0b1437] flex font-['Public_Sans'] overflow-hidden selection:bg-orange-100 selection:text-orange-600 transition-colors duration-300">
      <style>{customScrollbarStyles}</style>

      {/* Overlay para móvil */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 dark:bg-black/60 z-[60] lg:hidden backdrop-blur-sm transition-all"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`fixed lg:static inset-y-0 left-0 z-[70] bg-white dark:bg-[#111c44] flex flex-col transition-all duration-300 ease-in-out border-r border-transparent dark:border-white/5 ${mobileMenuOpen ? 'translate-x-0 w-[240px] sm:w-[280px] shadow-2xl' : '-translate-x-full lg:translate-x-0'} ${sidebarOpen ? 'lg:w-[260px]' : 'lg:w-[80px]'}`}>
        <div className="h-20 flex items-center justify-between px-6 flex-shrink-0">
          <div className={`flex items-center gap-3 overflow-hidden ${(sidebarOpen || mobileMenuOpen) ? 'justify-start' : 'justify-center w-full'}`}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-100 dark:shadow-none">
              <span className="text-white font-bold text-lg sm:text-xl">T</span>
            </div>
            {(sidebarOpen || mobileMenuOpen) && <span className="text-gray-950 dark:text-white font-bold text-lg sm:text-xl tracking-tighter">Tienda<span className="text-orange-600">Tec</span></span>}
          </div>
          {mobileMenuOpen && <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-orange-600 transition-colors dark:text-gray-500 lg:hidden p-2"><i className="fas fa-times text-lg"></i></button>}
          {sidebarOpen && !mobileMenuOpen && <button onClick={() => setSidebarOpen(false)} className="hidden lg:block text-gray-400 hover:text-orange-600 transition-colors dark:text-gray-500"><i className="fas fa-indent text-lg"></i></button>}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-4 sidebar-scrollbar">
          {menuGroups.map((group, index) => (
            <div key={index} className="mb-6">
              {(sidebarOpen || mobileMenuOpen) && group.title && <div className="px-4 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] dark:text-gray-500">{group.title}</div>}
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavItem
                    key={item.id || item.path}
                    item={item}
                    openMenus={openMenus}
                    sidebarOpen={sidebarOpen}
                    mobileMenuOpen={mobileMenuOpen}
                    toggleMenu={toggleMenu}
                    isActive={isActive}
                    isGroupActive={isGroupActive}
                    isPathMatch={isPathMatch}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#F4F7FE] dark:bg-[#0b1437] transition-colors duration-300 relative h-screen overflow-hidden">
        <header className="h-20 sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8 bg-white/80 dark:bg-[#111c44]/80 backdrop-blur-md border-b border-transparent dark:border-white/5 transition-all duration-300">
          <button onClick={() => setMobileMenuOpen(true)} className="mr-3 w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-white/10 hover:text-orange-600 transition-all lg:hidden flex-shrink-0"><i className="fas fa-bars"></i></button>
          {!sidebarOpen && <button onClick={() => setSidebarOpen(true)} className="hidden lg:flex mr-4 w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-white/10 hover:text-orange-600 transition-all flex-shrink-0"><i className="fas fa-bars"></i></button>}

          <div className="flex-1 max-w-xl min-w-0" ref={searchContainerRef}>
            <div className="relative w-full flex items-center justify-start lg:justify-center">

              {/* Desktop Search (LG+) */}
              <div className="relative flex-1 hidden lg:block">
                <i className={`fas ${isSearching ? 'fa-circle-notch fa-spin' : 'fa-search'} absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500`}></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSearch(true)}
                  placeholder="Buscar productos, pedidos, clientes..."
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/20 focus:bg-white dark:focus:bg-white/10 transition-all font-['Public_Sans']"
                />
              </div>

              {/* Mobile Search - Improved Version (layoutId transition) */}
              <AnimatePresence mode="wait">
                {!isSearchMobileOpen ? (
                  <motion.button
                    key="trigger"
                    layoutId="mobile-search-ui"
                    onClick={() => setIsSearchMobileOpen(true)}
                    className="lg:hidden w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-white/10 hover:text-orange-600 transition-all flex-shrink-0"
                  >
                    <motion.i layout className="fas fa-search"></motion.i>
                  </motion.button>
                ) : (
                  <motion.div
                    key="overlay"
                    layoutId="mobile-search-ui"
                    className="fixed inset-x-0 top-0 h-20 bg-white dark:bg-[#111c44] z-[100] px-4 flex items-center lg:hidden shadow-xl border-b border-gray-100 dark:border-white/5"
                  >
                    <motion.button
                      layout
                      onClick={() => { setIsSearchMobileOpen(false); setShowSearch(false); }}
                      className="mr-3 w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-orange-600 transition-colors"
                    >
                      <i className="fas fa-arrow-left"></i>
                    </motion.button>
                    <motion.div layout className="relative flex-1">
                      <i className={`fas ${isSearching ? 'fa-circle-notch fa-spin' : 'fa-search'} absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500`}></i>
                      <input
                        autoFocus
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.length >= 2 && setShowSearch(true)}
                        placeholder="Escribe para buscar..."
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-['Public_Sans']"
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Resultados de Búsqueda Dropdown */}
              <AnimatePresence>
                {showSearch && searchResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className={`absolute left-0 right-0 mt-3 bg-white dark:bg-[#111c44] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden z-[110] max-h-[70vh] flex flex-col ${isSearchMobileOpen ? 'top-20 fixed inset-x-4 h-[calc(100vh-100px)] lg:relative lg:inset-x-0 lg:h-auto lg:top-full' : 'top-full sm:left-auto sm:w-[500px]'}`}
                  >
                    <div className="overflow-y-auto main-scrollbar p-2">
                      {Object.keys(searchResults).every(key => searchResults[key].length === 0) ? (
                        <div className="p-8 text-center">
                          <p className="text-sm font-bold text-gray-400 dark:text-gray-500">No se encontraron resultados para "{searchQuery}"</p>
                        </div>
                      ) : (
                        Object.entries(searchResults).map(([category, items]) => (
                          items.length > 0 && (
                            <div key={category} className="mb-4 last:mb-0">
                              <h4 className="px-3 py-1 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50/50 dark:bg-white/5 rounded-lg mb-1">{category}</h4>
                              <div className="space-y-1">
                                {items.map((item) => (
                                  <Link
                                    key={item.id}
                                    to={
                                      item.type === 'productos' ? `/admin/productos/ver/${item.id}` :
                                        item.type === 'pedidos' ? `/admin/pedidos/ver/${item.id}` :
                                          item.type === 'clientes' ? `/admin/clientes/ver/${item.id}` :
                                            item.type === 'mensajes' ? `/admin/mensajes/ver/${item.id}` : '#'
                                    }
                                    onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                                    className="flex items-center gap-3 p-3 hover:bg-orange-50 dark:hover:bg-white/5 rounded-xl transition-all group"
                                  >
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20 group-hover:text-orange-600 transition-colors flex-shrink-0 overflow-hidden">
                                      {item.image ? (
                                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <i className={`fas ${item.type === 'productos' ? 'fa-box' :
                                          item.type === 'pedidos' ? 'fa-shopping-cart' :
                                            item.type === 'clientes' ? 'fa-user' : 'fa-comment'
                                          } text-sm`}></i>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-orange-600">{item.title}</p>
                                      <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{item.subtitle}</p>
                                    </div>
                                    <i className="fas fa-chevron-right text-[8px] text-gray-300 dark:text-gray-600 group-hover:text-orange-600 transition-transform group-hover:translate-x-1"></i>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-black/10">
                      <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2">
                        <kbd className="px-1 py-0.5 bg-white dark:bg-white/10 rounded border dark:border-transparent">ESC</kbd> para cerrar
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-3 sm:ml-4" ref={dropdownRef}>
            <button onClick={toggleDarkMode} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-white/10 hover:text-orange-600 transition-all">
              <i className={isDarkMode ? "far fa-sun" : "far fa-moon"}></i>
            </button>

            <div className="relative">
              <motion.button
                animate={bellPulse}
                onClick={() => { setActiveDropdown(activeDropdown === 'notifications' ? null : 'notifications'); setHasNew(false); }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative ${activeDropdown === 'notifications' ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-white/10 hover:text-orange-600'}`}
                title={`${notifications.counts.total_alertas} notificaciones recientes`}
              >
                <i className="far fa-bell"></i>
                {notifications.counts.total_alertas > 0 && (
                  <>
                    {hasNew && (
                      <motion.span
                        animate={pingEffect}
                        className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-red-500 rounded-full z-0"
                      />
                    )}
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 rounded-full border-2 border-white dark:border-[#111c44] text-[9px] text-white flex items-center justify-center font-bold px-0.5 shadow-sm z-10">
                      {notifications.counts.total_alertas}
                    </span>
                  </>
                )}
              </motion.button>
              <AnimatePresence>
                {activeDropdown === 'notifications' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#111c44] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden z-50 text-left">
                    <div className="p-4 border-b border-gray-50 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notificaciones</h3>
                      <div className="flex items-center gap-3">
                        {notifications.counts.total_alertas > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markAllAsSeen('global'); }}
                            className="text-[10px] font-extrabold text-orange-600 hover:text-orange-700 uppercase tracking-tight transition-colors hover:underline"
                          >
                            Limpiar todo
                          </button>
                        )}
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{notifications.counts.total_alertas} Totales</span>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto main-scrollbar">
                      {notifications.recent.pedidos.length === 0 &&
                        notifications.recent.servicios.length === 0 &&
                        notifications.recent.stock.length === 0 && (
                          <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                              <i className="far fa-bell-slash text-xl"></i>
                            </div>
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500">Sin notificaciones recientes</p>
                          </div>
                        )}
                      {notifications.recent.pedidos.length > 0 && (
                        <div className="p-2">
                          <div className="flex justify-between items-center px-2 mb-1">
                            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Pedidos ({notifications.counts.pedidos})</p>
                            {notifications.counts.pedidos > 4 && (
                              <Link to="/admin/pedidos" onClick={() => setActiveDropdown(null)} className="text-[9px] font-bold text-orange-600 hover:underline">Ver todos</Link>
                            )}
                          </div>
                          {notifications.recent.pedidos.slice(0, 4).map(p => (
                            <Link key={p.id} to={`/admin/pedidos/ver/${p.id}`} onClick={() => { setActiveDropdown(null); markAsSeen('pedido', p.id); }} className="flex items-center gap-3 p-2 hover:bg-orange-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left">
                              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 flex-shrink-0"><i className="fas fa-shopping-cart text-xs"></i></div>
                              <div className="flex-1 min-w-0"><p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{p.numero_pedido}</p><p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{p.cliente}</p></div>
                              <span className="text-[10px] font-bold text-gray-900 dark:text-white">S/ {p.total}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                      {notifications.recent.servicios.length > 0 && (
                        <div className="p-2 border-t border-gray-50 dark:border-white/5">
                          <div className="flex justify-between items-center px-2 mb-1">
                            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Servicios ({notifications.counts.servicios})</p>
                            {notifications.counts.servicios > 4 && (
                              <Link to="/admin/servicios/reservaciones" onClick={() => setActiveDropdown(null)} className="text-[9px] font-bold text-orange-600 hover:underline">Ver todos</Link>
                            )}
                          </div>
                          {notifications.recent.servicios.slice(0, 4).map(s => (
                            <Link key={s.id} to="/admin/servicios/reservaciones" onClick={() => { setActiveDropdown(null); markAsSeen('servicio', s.id); }} className="flex items-center gap-3 p-2 hover:bg-indigo-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left">
                              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 flex-shrink-0"><i className="fas fa-calendar-alt text-xs"></i></div>
                              <div className="flex-1 min-w-0"><p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{s.servicio_nombre}</p><p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{s.nombre_cliente}</p></div>
                            </Link>
                          ))}
                        </div>
                      )}
                      {notifications.recent.stock.length > 0 && (
                        <div className="p-2 border-t border-gray-50 dark:border-white/5">
                          <div className="flex justify-between items-center px-2 mb-1">
                            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Stock Bajo ({notifications.counts.stock_bajo})</p>
                            {notifications.counts.stock_bajo > 0 && (
                              <Link to="/admin/productos?tab=bajo_stock" onClick={() => setActiveDropdown(null)} className="text-[9px] font-bold text-orange-600 hover:underline">Ver todos</Link>
                            )}
                          </div>
                          {notifications.recent.stock.slice(0, 20).map(st => (
                            <Link key={st.real_id} to={`/admin/productos/ver/${st.id}`} onClick={() => { setActiveDropdown(null); markAsSeen('stock', st.real_id); }} className="flex items-center gap-3 p-2 hover:bg-red-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left">
                              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-600 flex-shrink-0"><i className="fas fa-exclamation-triangle text-xs"></i></div>
                              <div className="flex-1 min-w-0"><p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{st.nombre}</p><p className="text-[10px] text-red-500 font-bold">Quedan: {st.stock}</p></div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <motion.button
                animate={bellPulse}
                onClick={() => { setActiveDropdown(activeDropdown === 'messages' ? null : 'messages'); setHasNew(false); }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative ${activeDropdown === 'messages' ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-white/10 hover:text-orange-600'}`}
                title={`${notifications.counts.mensajes} mensajes pendientes`}
              >
                <i className="far fa-comment-alt"></i>
                {notifications.counts.mensajes > 0 && (
                  <>
                    {hasNew && (
                      <motion.span
                        animate={pingEffect}
                        className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-red-500 rounded-full z-0"
                      />
                    )}
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 rounded-full border-2 border-white dark:border-[#111c44] text-[9px] text-white flex items-center justify-center font-bold px-0.5 shadow-sm z-10">
                      {notifications.counts.mensajes}
                    </span>
                  </>
                )}
              </motion.button>
              <AnimatePresence>
                {activeDropdown === 'messages' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#111c44] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden z-50 text-left">
                    <div className="p-4 border-b border-gray-50 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">Mensajes</h3>
                      <div className="flex items-center gap-3">
                        {notifications.counts.mensajes > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markAllAsSeen('mensaje'); }}
                            className="text-[10px] font-extrabold text-orange-600 hover:text-orange-700 uppercase tracking-tight transition-colors hover:underline"
                          >
                            Limpiar todo
                          </button>
                        )}
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{notifications.counts.mensajes} Pendientes</span>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto main-scrollbar">
                      {notifications.recent.mensajes.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                            <i className="far fa-comment-slash text-xl"></i>
                          </div>
                          <p className="text-xs font-bold text-gray-400 dark:text-gray-500">Sin mensajes nuevos</p>
                        </div>
                      ) : (
                        notifications.recent.mensajes.slice(0, 4).map((msg) => (
                          <Link
                            key={msg.id}
                            to={`/admin/mensajes/ver/${msg.id}`}
                            onClick={() => { setActiveDropdown(null); markAsSeen('mensaje', msg.id); }}
                            className="w-full flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-white/5 last:border-0"
                          >
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center font-black flex-shrink-0">
                              {msg.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{msg.nombre}</p>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">{new Date(msg.fecha_creacion).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 font-medium">{msg.asunto}</p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5 italic">{msg.mensaje}</p>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={toggleFullscreen} className="hidden sm:flex w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-white/10 hover:text-orange-600 transition-all font-bold"><i className="fas fa-expand"></i></button>

            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200 dark:border-white/5 h-10">
              <div className="text-right hidden sm:block"><p className="text-[13px] font-bold text-gray-900 dark:text-white leading-none truncate max-w-[100px]">{usuario?.nombre || 'Admin'}</p><p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">{usuario?.rol || 'Admin'}</p></div>
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:shadow-md hover:border-orange-500 transition-all dark:bg-orange-600 dark:shadow-none dark:border-transparent flex-shrink-0" onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}>
                <img src={`https://ui-avatars.com/api/?name=${usuario?.nombre || 'Admin'}&background=ea580c&color=fff`} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <AnimatePresence>
                {activeDropdown === 'profile' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-8 top-20 mt-2 w-56 bg-white dark:bg-[#111c44] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden z-50 p-2">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all dark:hover:bg-white/5"><i className="fas fa-sign-out-alt text-sm"></i> Cerrar Sesión</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 main-scrollbar bg-[#F4F7FE] dark:bg-[#0b1437]">
          <div className="max-w-[1600px] mx-auto"><Outlet /></div>
        </div>
      </main>

      {/* Toast de Notificación Flotante */}
      <AnimatePresence>
        {latestToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%', scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className="fixed bottom-8 left-1/2 z-[100] flex items-center gap-4 bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 px-6 py-3.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] min-w-[320px] max-w-[90vw]"
          >
            <Link
              to={latestToast.link || '#'}
              className="flex items-center gap-4 flex-1 min-w-0"
              onClick={() => setHasNew(false)}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br text-white shadow-lg flex-shrink-0 ${latestToast.type === 'pedido' ? 'from-orange-500 to-red-500' :
                latestToast.type === 'mensaje' ? 'from-blue-500 to-indigo-500' :
                  latestToast.type === 'servicio' ? 'from-purple-500 to-pink-500' :
                    'from-amber-500 to-orange-600'
                }`}>
                <i className={`fas ${latestToast.type === 'pedido' ? 'fa-shopping-cart' :
                  latestToast.type === 'mensaje' ? 'fa-comment' :
                    latestToast.type === 'servicio' ? 'fa-calendar-check' :
                      'fa-exclamation-triangle'
                  } text-lg`}></i>
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <h4 className="text-white font-bold text-sm tracking-tight leading-tight mb-0.5 truncate">
                  {latestToast.title}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 text-[11px] font-medium truncate uppercase tracking-wider opacity-90">
                    {latestToast.subtitle}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/20"></span>
                  <span className="text-orange-400 text-[11px] font-bold tracking-wide">
                    {latestToast.extra}
                  </span>
                </div>
              </div>
            </Link>

            <button
              onClick={() => setHasNew(false)} // Or just close it if we had a close function, but here just close the dropdown effect
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors flex-shrink-0"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
