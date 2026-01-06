import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye,
    Edit,
    Trash2,
    Package,
    Search,
    Filter,
    Calendar,
    ChevronRight,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight,
    User,
    Mail,
    CreditCard,
    ShoppingBag,
    Clock,
    CheckCircle2,
    Truck,
    AlertCircle,
    XCircle,
    RotateCcw,
    Home,
    Store,
    MapPin,
    Box
} from 'lucide-react';
import { pedidosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';
import Swal from 'sweetalert2';

const PedidosIndex = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroEnvio, setFiltroEnvio] = useState('');

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        cargarPedidos();
        setCurrentPage(1); // Reset page on filter change
    }, [filtroEstado, filtroEnvio, itemsPerPage]);

    const cargarPedidos = async () => {
        setLoading(true);
        try {
            const data = await pedidosService.getAll(filtroEstado || null);
            setPedidos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Procesamiento de datos (Filtros locales y Paginación)
    const filteredPedidos = useMemo(() => {
        let result = [...pedidos];
        if (filtroEnvio) {
            result = result.filter(p => p.metodo_envio === filtroEnvio);
        }
        return result;
    }, [pedidos, filtroEnvio]);

    const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage);
    const currentItems = filteredPedidos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getEstadoConfig = (estado) => {
        const configs = {
            'pendiente': {
                label: 'Pendiente',
                color: 'text-yellow-600 bg-yellow-50 border-yellow-100/50',
                icon: Clock,
                dot: 'bg-yellow-500'
            },
            'pendiente_verificacion': {
                label: 'P. de Verificación',
                color: 'text-orange-600 bg-orange-50 border-orange-100/50',
                icon: AlertCircle,
                dot: 'bg-orange-500'
            },
            'pagado': {
                label: 'Pagado',
                color: 'text-blue-600 bg-blue-50 border-blue-100/50',
                icon: CreditCard,
                dot: 'bg-blue-500'
            },
            'en_preparacion': {
                label: 'En Preparación',
                color: 'text-indigo-600 bg-indigo-50 border-indigo-100/50',
                icon: Package,
                dot: 'bg-indigo-500'
            },
            'enviado': {
                label: 'Enviado',
                color: 'text-purple-600 bg-purple-50 border-purple-100/50',
                icon: Truck,
                dot: 'bg-purple-500'
            },
            'listo_recoger': {
                label: 'Listo p/Recoger',
                color: 'text-amber-600 bg-amber-50 border-amber-100/50',
                icon: ShoppingBag,
                dot: 'bg-amber-500'
            },
            'entregado': {
                label: 'Entregado',
                color: 'text-emerald-600 bg-emerald-50 border-emerald-100/50',
                icon: CheckCircle2,
                dot: 'bg-emerald-500'
            },
            'completado': {
                label: 'Completado',
                color: 'text-green-600 bg-green-50 border-green-100/50',
                icon: CheckCircle2,
                dot: 'bg-green-500'
            },
            'cancelado': {
                label: 'Cancelado',
                color: 'text-red-600 bg-red-50 border-red-100/50',
                icon: XCircle,
                dot: 'bg-red-500'
            },
            'devuelto': {
                label: 'Devuelto',
                color: 'text-gray-600 bg-gray-50 border-gray-100/50',
                icon: AlertCircle,
                dot: 'bg-gray-500'
            }
        };
        const config = configs[estado] || { label: estado || 'Desconocido', color: 'text-gray-600 bg-gray-50 border-gray-100/50', icon: AlertCircle, dot: 'bg-gray-500' };
        return config;
    };

    const getMetodoEnvioIcon = (metodo) => {
        if (metodo === 'tienda') return { icon: Store, label: 'RECOJO' };
        return { icon: Home, label: 'DOMICILIO' };
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Premium Header Container */}
            <div className="mb-8">
                <div className="flex flex-col gap-6 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-1"
                    >
                        <h2 className="text-3xl font-black text-[#1e293b] tracking-tight uppercase">
                            Pedidos
                        </h2>
                        <Breadcrumb items={[
                            { label: 'Panel', link: '/admin', isHome: true },
                            { label: 'Pedidos' }
                        ]} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap items-center gap-4 w-full"
                    >
                        {/* Main Filters (Left Side) */}
                        <div className="flex flex-wrap items-center gap-4 flex-1">
                            {/* Segmented Filter: Envío */}
                            <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                                {[
                                    { id: '', label: 'Todos', icon: MapPin },
                                    { id: 'domicilio', label: 'Domicilio', icon: Home },
                                    { id: 'tienda', label: 'Tienda', icon: Store },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setFiltroEnvio(tab.id);
                                            setFiltroEstado('');
                                        }}
                                        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${filtroEnvio === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        {filtroEnvio === tab.id && (
                                            <motion.div
                                                layoutId="activeEnvio"
                                                className="absolute inset-0 bg-blue-50 rounded-xl"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <tab.icon size={14} className="relative z-10" />
                                        <span className="relative z-10">{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Dropdown Filter: Estado */}
                            <div className="relative group min-w-[180px]">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                                    <Filter size={14} />
                                </div>
                                <select
                                    className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-[10px] font-black text-[#1e293b] appearance-none cursor-pointer shadow-sm uppercase tracking-wider"
                                    value={filtroEstado}
                                    onChange={(e) => setFiltroEstado(e.target.value)}
                                >
                                    <option value="">Estado: Todos</option>
                                    <option value="pendiente">Pendiente</option>
                                    <option value="pendiente_verificacion">Pendiente de Verificación</option>
                                    <option value="pagado">Pagado</option>
                                    <option value="en_preparacion">En Preparación</option>
                                    {filtroEnvio === 'domicilio' && <option value="enviado">Enviado</option>}
                                    {filtroEnvio === 'tienda' && <option value="listo_recoger">Listo para recoger</option>}
                                    {filtroEnvio === '' && (
                                        <>
                                            <option value="enviado">Enviado</option>
                                            <option value="listo_recoger">Listo para recoger</option>
                                        </>
                                    )}
                                    <option value="entregado">Entregado</option>
                                    <option value="completado">Completado</option>
                                    <option value="cancelado">Cancelado</option>
                                    <option value="devuelto">Devuelto</option>
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                                    <ChevronRight size={12} className="rotate-90" />
                                </div>
                            </div>
                        </div>

                        {/* Records Per Page (Right Side) */}
                        <div className="flex items-center gap-3 bg-gray-50/50 px-3 py-1.5 rounded-2xl border border-dashed border-gray-200 ml-auto">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest hidden sm:inline">Mostrar:</span>
                            <div className="relative group min-w-[110px]">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Search size={14} />
                                </div>
                                <select
                                    className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-[10px] font-black text-[#1e293b] appearance-none cursor-pointer shadow-sm uppercase tracking-wider"
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value={10}>10 Por pág.</option>
                                    <option value={20}>20 Por pág.</option>
                                    <option value={50}>50 Por pág.</option>
                                    <option value={100}>100 Por pág.</option>
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                                    <ChevronRight size={12} className="rotate-90" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Redesigned Table Container */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-[#f8fafc]/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        REF / ID
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 whitespace-nowrap">CLIENTE</th>
                                <th className="px-4 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 whitespace-nowrap text-center">ENVÍO</th>
                                <th className="px-4 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 whitespace-nowrap text-center">FECHA</th>
                                <th className="px-4 py-4 text-[10px] font-black text-orange-600 uppercase tracking-wider border-b border-gray-100 text-center whitespace-nowrap">TOTAL</th>
                                <th className="px-4 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 text-center whitespace-nowrap">ESTADO</th>
                                <th className="px-4 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 text-right whitespace-nowrap">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence mode='wait'>
                                {loading ? (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <td colSpan="7" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sincronizando órdenes...</span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ) : currentItems.length === 0 ? (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <td colSpan="7" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <Package size={48} className="mb-4 opacity-10" strokeWidth={1} />
                                                <p className="text-xs font-bold uppercase tracking-widest opacity-40">No se encontraron registros</p>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ) : (
                                    currentItems.map((pedido, idx) => {
                                        const config = getEstadoConfig(pedido.estado);
                                        const StatusIcon = config.icon;
                                        const envio = getMetodoEnvioIcon(pedido.metodo_envio);
                                        const EnvioIcon = envio.icon;

                                        return (
                                            <motion.tr
                                                key={pedido.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.04 }}
                                                className="group hover:bg-[#f8fafc]/50 transition-colors cursor-default"
                                            >
                                                <td className="px-4 py-3 relative">
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-orange-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />

                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-[#1e293b] group-hover:border-orange-200 transition-all duration-300 shadow-sm">
                                                            <ShoppingBag size={14} strokeWidth={2.5} />
                                                        </div>
                                                        <span className="text-[11px] font-black text-[#1e293b] tabular-nums font-mono tracking-wider">
                                                            #{pedido.id.toString().padStart(5, '0')}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1.5 text-[11px] font-black text-[#1e293b] uppercase tracking-tight truncate max-w-[140px]">
                                                            {pedido.cliente_nombre}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 mt-0.5 lowercase truncate max-w-[140px]">
                                                            {pedido.correo}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    <div className="inline-flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg border border-gray-100 bg-gray-50/50 group-hover:bg-white transition-colors">
                                                        <EnvioIcon size={12} className="text-[#64748b]" />
                                                        <span className="text-[8px] font-black text-[#64748b] tracking-tighter">{envio.label}</span>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md font-bold text-[9px] border border-gray-200/50">
                                                        {new Date(pedido.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-[11px] font-black text-[#1e293b] tabular-nums">
                                                        {parseFloat(pedido.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm font-black text-[9px] tracking-wider border transition-all whitespace-nowrap ${config.color}`}>
                                                        <div className={`w-1 h-1 rounded-full ${config.dot} ${pedido.estado === 'pendiente' ? 'animate-pulse' : ''}`} />
                                                        {pedido.estado?.toUpperCase() || 'DESCONOCIDO'}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            to={`/admin/pedidos/ver/${pedido.id}`}
                                                            className="p-1.5 transition-all duration-300 rounded-lg border-2 border-transparent bg-gray-50 text-[#1e293b] hover:border-[#1e293b]/10 hover:bg-orange-50 hover:text-orange-600 hover:shadow-md"
                                                            title="Ver Detalles"
                                                        >
                                                            <Eye size={12} strokeWidth={2.5} />
                                                        </Link>
                                                        <Link
                                                            to={`/admin/pedidos/editar/${pedido.id}`}
                                                            className="p-1.5 transition-all duration-300 rounded-lg border-2 border-transparent bg-gray-50 text-[#1e293b] hover:border-[#1e293b]/10 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
                                                            title="Gestionar Estado"
                                                        >
                                                            <Edit size={12} strokeWidth={2.5} />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Component (Standard Unified Look) */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-2">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        Resumen: <span className="text-gray-900">{currentPage}</span> / <span className="text-gray-400">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-gray-500 hover:border-orange-200 hover:text-orange-500 transition-all shadow-sm"
                        >
                            <ChevronsLeft size={14} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-gray-500 hover:border-orange-200 hover:text-orange-500 transition-all shadow-sm"
                        >
                            <ChevronLeft size={14} />
                        </button>

                        <div className="flex items-center gap-1 px-2">
                            {[...Array(totalPages)].map((_, i) => {
                                const n = i + 1;
                                if (n === 1 || n === totalPages || (n >= currentPage - 1 && n <= currentPage + 1)) {
                                    return (
                                        <button
                                            key={n}
                                            onClick={() => setCurrentPage(n)}
                                            className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all cursor-pointer ${currentPage === n
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'
                                                }`}
                                        >
                                            {n}
                                        </button>
                                    );
                                }
                                if (n === currentPage - 2 || n === currentPage + 2) {
                                    return <span key={n} className="text-gray-300 text-[10px]">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-gray-500 hover:border-orange-200 hover:text-orange-500 transition-all shadow-sm"
                        >
                            <ChevronRight size={14} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-gray-500 hover:border-orange-200 hover:text-orange-500 transition-all shadow-sm"
                        >
                            <ChevronsRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Legend / Info Footer */}
            {!loading && filteredPedidos.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8 flex items-center justify-between text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] px-2"
                >
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            Completado / Entregado
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                            Pendiente Acción
                        </div>
                    </div>
                    <span>Sincronizados {filteredPedidos.length} Pedidos</span>
                </motion.div>
            )}
        </div>
    );
};

export default PedidosIndex;
