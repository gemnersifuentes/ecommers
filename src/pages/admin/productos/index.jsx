import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
    Package,
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Star,
    Zap,
    AlertTriangle,
    Layers,
    List,
    Box,
    Cpu,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import { productosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const ProductosIndex = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalProductos, setTotalProductos] = useState(0);
    const [activeTab, setActiveTab] = useState('todos');

    const tabs = [
        { id: 'todos', label: 'Todos', icon: List },
        { id: 'destacados', label: 'Destacados', icon: Star },
        { id: 'nuevos', label: 'Nuevos', icon: Zap },
        { id: 'bajo_stock', label: 'Bajo Stock', icon: AlertTriangle },
    ];

    const cargarProductos = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                admin_mode: 'true',
                busqueda: searchTerm
            };

            if (activeTab === 'destacados') params.destacado = '1';
            if (activeTab === 'nuevos') params.nuevo = '1';
            if (activeTab === 'bajo_stock') params.bajo_stock = '1';

            const response = await productosService.getAll(params);

            if (response && response.data) {
                setProductos(response.data);
                setTotalProductos(response.total || 0);
            } else if (Array.isArray(response)) {
                setProductos(response);
                setTotalProductos(response.length);
            } else {
                setProductos([]);
                setTotalProductos(0);
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            Swal.fire({
                title: 'Error de Sistema',
                text: 'No se pudo sincronizar el inventario.',
                icon: 'error',
                confirmButtonColor: '#f97316'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            cargarProductos();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [currentPage, itemsPerPage, searchTerm, activeTab]);

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar producto?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            customClass: {
                popup: 'rounded-xl',
                title: 'text-sm font-bold',
                htmlContainer: 'text-xs'
            }
        });

        if (result.isConfirmed) {
            try {
                await productosService.delete(id);
                Swal.fire({
                    title: 'Eliminado',
                    text: 'El producto ha sido purgado del sistema.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                cargarProductos();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
            }
        }
    };

    const totalPages = Math.ceil(totalProductos / itemsPerPage);

    if (loading && productos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-[10px] text-gray-400 font-medium">Cargando inventario...</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 min-h-screen">
            {/* Header Simplified */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Package size={16} className="text-orange-500" />
                        Inventario de Productos
                    </h1>
                    <Breadcrumb items={[
                        { label: 'Admin', link: '/admin', isHome: true },
                        { label: 'Productos' }
                    ]} />
                </div>

                <Link
                    to="/admin/productos/nuevo"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                >
                    <Plus size={14} />
                    Nuevo Producto
                </Link>
            </div>

            {/* Middle Bar: Tabs & Search */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Tabs */}
                <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-full lg:w-auto overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setCurrentPage(1);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-orange-50 text-orange-600 shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon size={14} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Search & Actions */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar en el catálogo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm"
                        />
                    </div>

                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-600 outline-none hover:border-gray-300 transition-all cursor-pointer shadow-sm"
                    >
                        <option value={10}>10 items</option>
                        <option value={25}>25 items</option>
                        <option value={50}>50 items</option>
                    </select>
                </div>
            </div>

            {/* Light Industrial Targeted Table Area */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-[#f8fafc]/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        PRODUCTO
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 whitespace-nowrap">CATEGORÍA</th>
                                <th className="px-4 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 whitespace-nowrap">MARCA</th>
                                <th className="px-4 py-4 text-[10px] font-black text-orange-600 uppercase tracking-wider border-b border-gray-100 text-center whitespace-nowrap">PRECIO</th>
                                <th className="px-4 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 text-center whitespace-nowrap">STOCK</th>
                                <th className="px-4 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 text-center whitespace-nowrap">ESTADO</th>
                                <th className="px-4 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 text-center whitespace-nowrap">VAR.</th>
                                <th className="px-4 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 text-right whitespace-nowrap">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody
                            key={`${activeTab}-${currentPage}-${searchTerm}`}
                            className="divide-y divide-gray-50"
                        >
                            <AnimatePresence>
                                {productos.map((producto, idx) => (
                                    <motion.tr
                                        key={producto.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        whileHover={{
                                            backgroundColor: "rgba(249, 115, 22, 0.02)",
                                            transition: { duration: 0.2, ease: "easeOut" }
                                        }}
                                        transition={{
                                            opacity: { duration: 0.5, delay: idx * 0.045 },
                                            x: { duration: 0.5, delay: idx * 0.045, ease: [0.16, 1, 0.3, 1] }
                                        }}
                                        className="relative group cursor-default"
                                    >
                                        <td className="px-4 py-3 relative">
                                            {/* Industrial Selector Indicator */}
                                            <div className="absolute left-0 top-0 bottom-0 w-1 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300 z-10" />

                                            <div className="flex items-center gap-2">
                                                <div className="relative w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-orange-200 transition-all duration-300">
                                                    {producto.imagen ? (
                                                        <img src={producto.imagen} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <Box size={14} className="text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-black text-[#1e293b] uppercase tracking-tight truncate max-w-[140px]" title={producto.nombre}>
                                                        {producto.nombre}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[9px] font-mono font-bold text-gray-400 bg-gray-50 px-1 py-0.5 rounded border border-gray-100">
                                                            {producto.sku || 'N/A-00'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded font-black text-[11px]  tracking-wider border border-indigo-100/50 whitespace-nowrap">
                                                <Layers size={10} strokeWidth={3} />
                                                {producto.categoria_nombre || 'General'}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-600 rounded font-black text-[11px] tracking-wider border border-amber-100/50 whitespace-nowrap">
                                                <Cpu size={10} strokeWidth={3} />
                                                {producto.marca_nombre || 'N/A'}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[11px] font-black text-[#1e293b] tabular-nums whitespace-nowrap">
                                                    USD {parseFloat(producto.precio_base).toLocaleString()}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex flex-col items-center gap-1.5 min-w-[60px]">
                                                <div className="flex items-end gap-1 font-mono">
                                                    <span className={`text-[11px] font-black ${producto.stock <= producto.stock_minimo ? 'text-red-500' : 'text-[#1e293b]'
                                                        }`}>
                                                        {producto.stock.toString().padStart(2, '0')}
                                                    </span>
                                                    <span className="text-[8px] text-gray-400 font-bold mb-0.5 uppercase tracking-tighter">und</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden max-w-[30px] border border-gray-100 p-[1px]">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(100, (producto.stock / 50) * 100)}%` }}
                                                        transition={{ duration: 1.2, ease: "circOut" }}
                                                        className={`h-full rounded-full ${producto.stock <= producto.stock_minimo
                                                            ? 'bg-gradient-to-r from-red-500 to-orange-500'
                                                            : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm font-black text-[11px] tracking-[0.05em] border-2 transition-all whitespace-nowrap ${producto.activo
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                                                : 'bg-gray-50 text-gray-400 border-gray-200'
                                                }`}>
                                                <div className="relative flex items-center justify-center">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${producto.activo ? 'bg-emerald-500 animate-ping' : 'bg-gray-300'}`} />
                                                    <div className={`absolute w-1.5 h-1.5 rounded-full ${producto.activo ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                                </div>
                                                {producto.activo ? 'activo' : 'inactivo'}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center justify-center min-w-[20px] px-1 py-0.5 bg-gray-50 text-[#1e293b] rounded-lg font-black text-[11px] border border-gray-200">
                                                {producto.variaciones?.length || 0}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                {[
                                                    { to: `/admin/productos/ver/${producto.id}`, icon: Eye, label: 'Vista', color: 'hover:text-orange-500 hover:bg-orange-50' },
                                                    { to: `/admin/productos/editar/${producto.id}`, icon: Edit, label: 'Editar', color: 'hover:text-blue-600 hover:bg-blue-50' },
                                                    { onClick: () => handleEliminar(producto.id), icon: Trash2, label: 'Baja', color: 'hover:text-red-600 hover:bg-red-50' }
                                                ].map((action, i) => (
                                                    <Link
                                                        key={i}
                                                        to={action.to}
                                                        onClick={action.onClick}
                                                        className={`p-1.5 transition-all duration-300 rounded-lg border-2 border-transparent bg-gray-50 text-[#1e293b] hover:border-[#1e293b]/10 hover:shadow-md ${action.color}`}
                                                        title={action.label}
                                                    >
                                                        <action.icon size={14} strokeWidth={2.5} />
                                                    </Link>
                                                ))}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {
                    productos.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Package size={40} className="mb-4 opacity-20" />
                            <p className="text-xs font-medium">No se encontraron productos coincidentes.</p>
                        </div>
                    )
                }

            </div >

            {/* Pagination Simplified (Moved Outside) */}
            {
                totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-xs text-gray-500 font-medium">
                            Página <span className="text-gray-900 font-bold">{currentPage}</span> de <span className="text-gray-900 font-bold">{totalPages}</span>
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-gray-600 hover:border-gray-300 transition-all shadow-sm"
                                title="Primera página"
                            >
                                <ChevronsLeft size={14} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-gray-600 hover:border-gray-300 transition-all shadow-sm"
                                title="Anterior"
                            >
                                <ChevronLeft size={14} />
                            </button>

                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const n = i + 1;
                                    if (n === 1 || n === totalPages || (n >= currentPage - 1 && n <= currentPage + 1)) {
                                        return (
                                            <button
                                                key={n}
                                                onClick={() => setCurrentPage(n)}
                                                className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${currentPage === n
                                                    ? 'bg-orange-500 text-white shadow-md'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                {n}
                                            </button>
                                        );
                                    }
                                    if (n === currentPage - 2 || n === currentPage + 2) {
                                        return <span key={n} className="text-gray-300 px-1">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-gray-600 hover:border-gray-300 transition-all shadow-sm"
                                title="Siguiente"
                            >
                                <ChevronRight size={14} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-gray-600 hover:border-gray-300 transition-all shadow-sm"
                                title="Última página"
                            >
                                <ChevronsRight size={14} />
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ProductosIndex;

