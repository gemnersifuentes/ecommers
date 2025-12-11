import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
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
  SubItem: () => (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2.5" y="2.5" width="3" height="3" transform="rotate(45 4 4)" />
    </svg>
  )
};

const AdminLayout = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State for open menus
  const [openMenus, setOpenMenus] = useState({});

  // Remos Brand Colors
  const brandColor = '#2F80ED';

  const customScrollbarStyles = `
    /* SHARED SCROLLBAR BASE STYLES */
    .sidebar-scrollbar::-webkit-scrollbar,
    .main-scrollbar::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    .sidebar-scrollbar::-webkit-scrollbar-track,
    .main-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    
    /* DEFAULT STATE: INVISIBLE (Transparent) */
    .sidebar-scrollbar::-webkit-scrollbar-thumb,
    .main-scrollbar::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 10px;
      transition: background 0.2s ease;
    }

    /* --- SIDEBAR ISOLATION --- */
    .sidebar-scrollbar:hover::-webkit-scrollbar-thumb {
      background: rgba(47, 128, 237, 0.2);
    }
    .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
      background: ${brandColor};
    }

    /* --- MAIN CONTENT ISOLATION --- */
    .main-scrollbar:hover::-webkit-scrollbar-thumb {
      background: rgba(47, 128, 237, 0.2);
    }
    .main-scrollbar::-webkit-scrollbar-thumb:hover {
      background: ${brandColor};
    }

    /* Firefox */
    .sidebar-scrollbar, .main-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: transparent transparent;
    }
    .sidebar-scrollbar:hover, .main-scrollbar:hover {
      scrollbar-color: rgba(47, 128, 237, 0.2) transparent;
    }
  `;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Check if any child of a group is active
  const isGroupActive = (subItems) => {
    return subItems?.some(item => location.pathname === item.path);
  };

  const toggleMenu = (menuId) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  // Initialize open menus based on current route
  useEffect(() => {
    const newOpenMenus = {};
    menuGroups.forEach(group => {
      group.items.forEach(item => {
        if (item.subItems && isGroupActive(item.subItems)) {
          newOpenMenus[item.id] = true;
        }
      });
    });
    setOpenMenus(prev => ({ ...prev, ...newOpenMenus }));
  }, [location.pathname]);

  // Remos-style Menu Structure with Custom SVGs
  const menuGroups = [
    {
      title: "PRINCIPAL",
      items: [
        { id: 'dashboard', path: '/admin', icon: Icons.Dashboard, label: 'Dashboard' }
      ]
    },
    {
      title: "PÁGINAS",
      items: [
        {
          id: 'ecommerce',
          label: 'Ecommerce',
          icon: Icons.Ecommerce,
          subItems: [
            { path: '/admin/productos', label: 'Productos' },
            { path: '/admin/pedidos', label: 'Pedidos' },
          ]
        },
        {
          id: 'category',
          label: 'Categorías',
          icon: Icons.Category,
          subItems: [
            { path: '/admin/categorias', label: 'Lista de Categorías' },
            { path: '/admin/categorias/nuevo', label: 'Nueva Categoría' }
          ]
        },
        {
          id: 'attributes',
          label: 'Atributos',
          icon: Icons.Attributes,
          subItems: [
            { path: '/admin/marcas', label: 'Marcas' },
            { path: '/admin/descuentos', label: 'Descuentos' }
          ]
        },
        {
          id: 'banners',
          path: '/admin/banners',
          icon: Icons.Gallery,
          label: 'Banners'
        },
        {
          id: 'servicios',
          path: '/admin/servicios',
          icon: Icons.Order,
          label: 'Servicios'
        },
        {
          id: 'usuarios',
          label: 'Usuarios',
          icon: Icons.User,
          subItems: [
            { path: '/admin/usuarios', label: 'Gestión de Usuarios' },
            { path: '/admin/clientes', label: 'Clientes' }
          ]
        },
        {
          id: 'report',
          path: '/admin/reportes',
          icon: Icons.Report,
          label: 'Reportes'
        }
      ]
    }
  ];

  // NavItem Component - Remos Style with Submenu Support
  const NavItem = ({ item }) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const active = item.path ? isActive(item.path) : false;
    const groupActive = hasSubItems && isGroupActive(item.subItems);
    const isOpen = openMenus[item.id];
    const Icon = item.icon;

    // Parent Item Styles
    const parentClasses = `
      relative flex items-center gap-3 px-4 py-3 transition-all duration-200 group cursor-pointer select-none
      ${(active || groupActive) ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'}
      rounded-xl
    `;

    return (
      <div className="mb-1">
        {hasSubItems ? (
          // Collapsible Parent
          <div onClick={() => toggleMenu(item.id)} className={parentClasses}>
            <div className={`w-6 flex justify-center transition-colors ${(active || groupActive) ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`}>
              <Icon />
            </div>

            {sidebarOpen && (
              <>
                <span className="text-sm tracking-wide flex-1 font-medium">{item.label}</span>
                <i className={`fas fa-chevron-${isOpen ? 'up' : 'right'} text-[10px] transition-transform duration-200 ${(active || groupActive) ? 'text-blue-600' : 'text-gray-400'}`}></i>
              </>
            )}
          </div>
        ) : (
          // Single Link
          <Link to={item.path} className={parentClasses}>
            <div className={`w-6 flex justify-center transition-colors ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`}>
              <Icon />
            </div>
            {sidebarOpen && <span className="text-sm tracking-wide flex-1 font-medium">{item.label}</span>}
          </Link>
        )}

        {/* Submenu Items */}
        <AnimatePresence>
          {hasSubItems && isOpen && sidebarOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-1 pb-2 pl-4 space-y-1">
                {item.subItems.map((subItem, idx) => {
                  const isSubActive = isActive(subItem.path);
                  return (
                    <Link
                      key={idx}
                      to={subItem.path}
                      className={`
                        flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm
                        ${isSubActive ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-blue-600'}
                      `}
                    >
                      {/* Remos style: Small diamond/rhombus icon for subitems */}
                      <div className={`w-4 flex justify-center ${isSubActive ? 'text-blue-600' : 'text-gray-300'}`}>
                        <Icons.SubItem />
                      </div>
                      <span className="font-medium">{subItem.label}</span>
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

  return (
    <div className="h-screen bg-[#F4F7FE] flex font-['Public_Sans'] overflow-hidden selection:bg-blue-100 selection:text-blue-600">
      <style>{customScrollbarStyles}</style>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar (Remos Style) */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        bg-white
        flex flex-col
        transition-all duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        ${sidebarOpen ? 'lg:w-[260px]' : 'lg:w-[80px]'}
      `}>
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-6 flex-shrink-0">
          <div className={`flex items-center gap-3 overflow-hidden ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            {sidebarOpen && (
              <span className="text-gray-900 font-bold text-2xl tracking-tight">Remos</span>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-blue-600 transition-colors"
            >
              <i className="fas fa-indent text-lg"></i>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-4 sidebar-scrollbar">
          {menuGroups.map((group, index) => (
            <div key={index} className="mb-6">
              {sidebarOpen && group.title && (
                <div className="px-4 mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavItem key={item.id || item.path} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>


      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F4F7FE]">
        {/* Header (Remos Style) */}
        <header className="h-20 sticky top-0 z-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md transition-all duration-300">

          {/* Menu Toggle Button (Left side, shows when sidebar is collapsed or on mobile) */}
          <button
            onClick={() => {
              setSidebarOpen(!sidebarOpen);
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="mr-4 w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all lg:hidden"
          >
            <i className="fas fa-bars"></i>
          </button>

          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="hidden lg:flex mr-4 w-10 h-10 rounded-xl bg-gray-50 items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              <i className="fas fa-bars"></i>
            </button>
          )}

          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar aquí..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all font-['Public_Sans']"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6 ml-4">
            {/* Theme Toggle (Mock) */}
            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all">
              <i className="far fa-moon"></i>
            </button>

            {/* Notifications */}
            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all relative">
              <i className="far fa-bell"></i>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Messages */}
            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all relative">
              <i className="far fa-comment-alt"></i>
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Fullscreen */}
            <button className="hidden sm:flex w-10 h-10 rounded-full bg-gray-50 items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all">
              <i className="fas fa-expand"></i>
            </button>

            {/* Grid */}
            <button className="hidden sm:flex w-10 h-10 rounded-full bg-gray-50 items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all">
              <i className="fas fa-th"></i>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-900 leading-none">{usuario?.nombre || 'Admin'}</p>
                <p className="text-xs text-gray-500 mt-1">{usuario?.rol || 'Administrador'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                <img
                  src={`https://ui-avatars.com/api/?name=${usuario?.nombre || 'Admin'}&background=2F80ED&color=fff`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={handleLogout}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                title="Cerrar Sesión"
              >
                <i className="fas fa-cog"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 main-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
