import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    IdCard,
    Mail,
    Calendar,
    ShoppingCart,
    Wrench,
    ArrowUpRight,
    TrendingUp,
    Clock,
    UserCheck,
    CreditCard,
    DollarSign,
    Box
} from 'lucide-react';
import { usuariosService, tiendaService, reservacionesService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const ClientesShow = () => {
    const { id } = useParams();
    const [cliente, setCliente] = useState(null);
    const [pedidos, setPedidos] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Fetch basic user info
                const users = await usuariosService.getAll();
                const found = users.find(u => u.id.toString() === id);

                if (found) {
                    setCliente(found);
                    // Fetch history in parallel
                    const [pedidosData, serviciosData] = await Promise.all([
                        tiendaService.getPedidos(id),
                        tiendaService.getPedidos(id) // Dummy for services if real logic differs, but based on previous steps we use individual services
                    ]);

                    // Actually use the reservaciones service for services
                    const realServicios = await reservacionesService.getAll(id);

                    setPedidos(Array.isArray(pedidosData) ? pedidosData : []);
                    setServicios(Array.isArray(realServicios) ? realServicios : []);
                }
            } catch (error) {
                console.error("Error fetching client data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">Abriendo Expediente...</p>
            </div>
        );
    }

    if (!cliente) return (
        <div className="p-20 text-center bg-white dark:bg-[#111c44] rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
            <IdCard size={48} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
            <h2 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Identidad no localizada</h2>
            <Link to="/admin/clientes" className="mt-4 inline-block text-orange-600 dark:text-orange-400 font-bold uppercase text-[10px] tracking-widest border-b-2 border-orange-100 dark:border-orange-500/20 pb-1 hover:border-orange-500 transition-all">Regresar al Directorio</Link>
        </div>
    );

    const totalInvertido = pedidos.reduce((acc, p) => acc + parseFloat(p.total || 0), 0);

    return (
        <div className="p-4 space-y-8 min-h-screen pb-20">
            {/* Minimal Header Mirroring Products Index Style */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Link to="/admin/clientes" className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors group">
                        <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Volver</span>
                    </Link>
                    <h1 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                        <IdCard size={18} className="text-orange-500" />
                        Expediente Cliente: <span className="text-orange-600 dark:text-orange-400 ml-1">{cliente.nombre}</span>
                    </h1>
                    <Breadcrumb items={[
                        { label: 'Admin', link: '/admin', isHome: true },
                        { label: 'Clientes', link: '/admin/clientes' },
                        { label: `PERFIL #${cliente.id}` }
                    ]} />
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-[#111c44] p-3 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center text-xl font-black border border-orange-100 dark:border-orange-500/20">
                        {cliente.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Mail Vinculado</p>
                        <p className="text-xs font-bold text-[#1e293b] dark:text-gray-300">{cliente.correo}</p>
                    </div>
                </div>
            </div>

            {/* Industrial Data Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Valor LTV', val: `$${totalInvertido.toLocaleString()}`, icon: DollarSign, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-100 dark:border-orange-500/20' },
                    { label: 'Ordenes', val: pedidos.length, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' },
                    { label: 'Servicios', val: servicios.length, icon: Wrench, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100 dark:border-indigo-500/20' },
                    { label: 'Antigüedad', val: new Date(cliente.fecha_registro).toLocaleDateString(), icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`bg-white dark:bg-[#111c44] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm group hover:shadow-md transition-all`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center border ${stat.border}`}>
                                <stat.icon size={18} />
                            </div>
                            <span className="text-[8px] font-black text-gray-200 dark:text-gray-700 uppercase">Live Data</span>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h4 className="text-xl font-black text-[#1e293b] dark:text-white tracking-tight">{stat.val}</h4>
                    </motion.div>
                ))}
            </div>

            {/* Content Grid: Technical View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Orders Log */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <ShoppingCart size={14} className="text-orange-500" />
                            <h3 className="text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-[0.2em]">Log de Transacciones</h3>
                        </div>
                        <span className="text-[8px] font-black bg-gray-100 dark:bg-[#111c44] text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded uppercase">Histórico Social</span>
                    </div>

                    <div className="bg-white dark:bg-[#111c44] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden min-h-[400px]">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead className="bg-[#f8fafc]/80 dark:bg-[#0b1437]/50 border-b border-gray-100 dark:border-white/5">
                                <tr>
                                    <th className="px-4 py-3 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-white/5">ID / Fecha</th>
                                    <th className="px-4 py-3 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-white/5 text-center">Estado</th>
                                    <th className="px-4 py-3 text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase border-b border-gray-100 dark:border-white/5 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {pedidos.length > 0 ? pedidos.map((p, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-[#0b1437]/50 transition-colors group">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-gray-50 dark:bg-[#0b1437] flex items-center justify-center font-mono text-[10px] font-bold text-gray-400 dark:text-gray-500 group-hover:text-orange-500 transition-colors border border-gray-100 dark:border-white/5">
                                                    #{p.id}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-[#1e293b] dark:text-gray-300 uppercase">Pedido Retail</p>
                                                    <p className="text-[8px] text-gray-400 dark:text-gray-500 font-bold">{new Date(p.fecha).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="inline-flex px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded text-[8px] font-black uppercase">
                                                Pagado
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <p className="text-[11px] font-black text-[#1e293b] dark:text-white tracking-tight">${parseFloat(p.total).toLocaleString()}</p>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="py-20 text-center">
                                            <Box size={32} className="mx-auto text-gray-100 dark:text-gray-800 mb-2" />
                                            <p className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase">Sin movimientos registrados</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Services Log */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <Wrench size={14} className="text-blue-500" />
                            <h3 className="text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-[0.2em]">Servicios de Taller</h3>
                        </div>
                        <span className="text-[8px] font-black bg-gray-100 dark:bg-[#111c44] text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded uppercase">Soporte Técnico</span>
                    </div>

                    <div className="bg-white dark:bg-[#111c44] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden min-h-[400px]">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead className="bg-[#f8fafc]/80 dark:bg-[#0b1437]/50 border-b border-gray-100 dark:border-white/5">
                                <tr>
                                    <th className="px-4 py-3 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-white/5">Servicio / Ticket</th>
                                    <th className="px-4 py-3 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-white/5 text-center">Estatus</th>
                                    <th className="px-4 py-3 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-white/5 text-right">Registro</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {servicios.length > 0 ? servicios.map((s, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-[#0b1437]/50 transition-colors group">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-gray-50 dark:bg-[#0b1437] flex items-center justify-center text-blue-500 border border-gray-100 dark:border-white/5">
                                                    <TrendingUp size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-[#1e293b] dark:text-gray-300 uppercase truncate max-w-[150px]">{s.servicio_nombre}</p>
                                                    <p className="text-[8px] text-gray-400 dark:text-gray-500 font-bold uppercase">Case #{s.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase border ${s.estado === 'Completado' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20'
                                                }`}>
                                                {s.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500">{new Date(s.fecha_registro).toLocaleDateString()}</p>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="py-20 text-center">
                                            <Wrench size={32} className="mx-auto text-gray-100 dark:text-gray-800 mb-2" />
                                            <p className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase">Sin solicitudes activas</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientesShow;
