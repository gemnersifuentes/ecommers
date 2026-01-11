import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye,
    ArrowLeft,
    Clock,
    CreditCard,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RotateCcw,
    ShoppingBag,
    Home,
    Store,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ChevronRight,
    Box,
    X
} from 'lucide-react';
import Swal from 'sweetalert2';
import { pedidosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const PedidosShow = () => {
    const { id } = useParams();
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        cargarPedido();
    }, [id]);

    const cargarPedido = async () => {
        setLoading(true);
        try {
            const data = await pedidosService.getById(id);
            setPedido(data);
        } catch (error) {
            console.error('Error al cargar pedido:', error);
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstado = async (nuevoEstado) => {
        setUpdatingStatus(nuevoEstado);
        try {
            const response = await pedidosService.updateEstado(id, nuevoEstado);

            let message = 'Estado del pedido actualizado correctamente';
            let icon = 'success';

            if (response.email_sent) {
                message += ' y notificación enviada al cliente 📧';
            } else {
                message += `, pero falló el envío del correo ⚠️\n(${response.email_error})`;
                icon = 'warning';
            }

            Swal.fire({
                title: response.email_sent ? '¡Éxito!' : 'Estado Actualizado',
                text: message,
                icon: icon,
                timer: 4000,
                showConfirmButton: true,
                confirmButtonColor: '#f97316',
                background: '#fff',
                customClass: {
                    title: 'text-lg font-black uppercase tracking-tight',
                    content: 'text-sm font-bold text-gray-600'
                }
            });
            await cargarPedido();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const getEstadoConfig = (estado) => {
        const configs = {
            'pendiente': { label: 'Pendiente', color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-100 dark:border-yellow-500/20', icon: Clock, dot: 'bg-yellow-500' },
            'pendiente_verificacion': { label: 'Pendiente de Verificación', color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20', icon: AlertCircle, dot: 'bg-orange-500' },
            'pagado': { label: 'Pagado', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20', icon: CreditCard, dot: 'bg-blue-500' },
            'en_preparacion': { label: 'En Preparación', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20', icon: Box, dot: 'bg-indigo-500' },
            'enviado': { label: 'Enviado', color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20', icon: Truck, dot: 'bg-purple-500' },
            'listo_recoger': { label: 'Listo para recoger', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20', icon: ShoppingBag, dot: 'bg-amber-500' },
            'entregado': { label: 'Entregado', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20', icon: CheckCircle2, dot: 'bg-emerald-500' },
            'completado': { label: 'Completado', color: 'text-green-600 dark:text-emerald-400 bg-green-50 dark:bg-emerald-500/10 border-green-100 dark:border-emerald-500/20', icon: CheckCircle2, dot: 'bg-green-500' },
            'cancelado': { label: 'Cancelado', color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20', icon: XCircle, dot: 'bg-red-500' },
            'devuelto': { label: 'Devuelto', color: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10', icon: AlertCircle, dot: 'bg-gray-500' }
        };
        const config = configs[estado] || { label: estado || 'Desconocido', color: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10', icon: AlertCircle, dot: 'bg-gray-500' };
        return config;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Cargando detalles...</span>
            </div>
        );
    }

    if (!pedido) {
        return (
            <div className="text-center py-20 bg-white dark:bg-[#111c44] rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                <Package size={48} className="mx-auto text-gray-200 dark:text-gray-800 mb-4" strokeWidth={1} />
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Pedido no encontrado</h3>
                <Link to="/admin/pedidos" className="mt-4 inline-flex items-center gap-2 text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-widest hover:gap-3 transition-all">
                    <ArrowLeft size={14} /> Volver a pedidos
                </Link>
            </div>
        );
    }

    const config = getEstadoConfig(pedido.estado);
    const StatusIcon = config.icon;

    return (
        <div className="pb-20">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-1"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Link to="/admin/pedidos" className="p-2 bg-white dark:bg-[#111c44] border border-gray-100 dark:border-white/5 rounded-xl text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all shadow-sm">
                                <ArrowLeft size={16} />
                            </Link>
                            <span className="text-[10px] font-black text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded uppercase tracking-tighter border border-orange-100 dark:border-orange-500/20">
                                ORDEN #{pedido.id.toString().padStart(5, '0')}
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-[#1e293b] dark:text-white tracking-tight uppercase">
                            Detalles del Pedido
                        </h2>
                        <Breadcrumb items={[
                            { label: 'Panel', link: '/admin' },
                            { label: 'Pedidos', link: '/admin/pedidos' },
                            { label: `Pedido #${pedido.id}` }
                        ]} />
                    </motion.div>

                    <div className={`px-4 py-1.5 rounded-xl border flex items-center gap-2 shadow-sm ${config.color}`}>
                        <div className={`w-2 h-2 rounded-full ${config.dot} ${pedido.estado === 'pendiente_verificacion' ? 'animate-pulse' : ''}`} />
                        <StatusIcon size={16} strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{config.label}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Products Table Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-[#111c44] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-[#0b1437]/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-[#111c44] rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
                                    <ShoppingBag size={18} className="text-orange-500 dark:text-orange-400" />
                                </div>
                                <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Productos en la Orden</h3>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{pedido.items?.length} Items</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-4 text-[9px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-widest border-b border-gray-50 dark:border-white/5">Producto</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-widest border-b border-gray-50 dark:border-white/5 text-center">Cant.</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-widest border-b border-gray-50 dark:border-white/5 text-right">Precio</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest border-b border-gray-50 dark:border-white/5 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                    {pedido.items?.map((detalle, index) => (
                                        <tr key={index} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#0b1437] border border-gray-100 dark:border-white/10 overflow-hidden flex-shrink-0">
                                                        {detalle.imagen ? (
                                                            <img
                                                                src={detalle.imagen.startsWith('http') ? detalle.imagen : `http://localhost:8000/public/uploads/${detalle.imagen}`}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
                                                                <Package size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-black text-[#1e293b] dark:text-white uppercase leading-tight">{detalle.nombre}</p>
                                                        {detalle.variacion_nombre && (
                                                            <span className="text-[8px] font-bold text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded mt-1 inline-block uppercase tracking-wider">
                                                                {detalle.variacion_nombre}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-[11px] font-black text-[#1e293b] dark:text-white tabular-nums font-mono">
                                                    x{detalle.cantidad}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex flex-col items-end">
                                                    {parseFloat(detalle.precio_regular) > parseFloat(detalle.precio_unitario) && (
                                                        <span className="text-[9px] font-bold text-gray-300 dark:text-gray-600 line-through tabular-nums mb-1">
                                                            S/ {parseFloat(detalle.precio_regular).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    )}
                                                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 tabular-nums">
                                                        S/ {parseFloat(detalle.precio_unitario || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <span className="text-[11px] font-black text-orange-600 dark:text-orange-400 tabular-nums">
                                                    S/ {parseFloat(detalle.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-8 bg-[#f8fafc]/50 dark:bg-[#0b1437]/30 border-t border-gray-50 dark:border-white/5">
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-8 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                    <span>Neto (Base Imponible)</span>
                                    <span className="w-24 text-right text-gray-600 dark:text-gray-400">S/ {(parseFloat(pedido.total) / 1.18).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex items-center gap-8 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                    <span>IGV (18%)</span>
                                    <span className="w-24 text-right text-orange-600 dark:text-orange-400 font-black">+ S/ {(parseFloat(pedido.total) - (parseFloat(pedido.total) / 1.18)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                {pedido.items?.reduce((acc, item) => acc + (parseFloat(item.precio_regular || item.precio_unitario) - parseFloat(item.precio_unitario)) * item.cantidad, 0) > 0 && (
                                    <div className="flex items-center gap-8 text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest">
                                        <span>Tu Ahorro Total</span>
                                        <span className="w-24 text-right">
                                            - S/ {pedido.items.reduce((acc, item) => acc + (parseFloat(item.precio_regular || item.precio_unitario) - parseFloat(item.precio_unitario)) * item.cantidad, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-8 mt-2 pt-2 border-t-2 border-orange-500/20">
                                    <span className="text-xs font-black text-[#1e293b] dark:text-white uppercase tracking-tighter">Total Pagado</span>
                                    <span className="w-24 text-right text-xl font-black text-orange-600 dark:text-orange-500 tabular-nums">
                                        S/ {parseFloat(pedido.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Status Management Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-[#111c44] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-8"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-white dark:bg-[#111c44] rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
                                <RotateCcw size={18} className="text-blue-500 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Gestionar Estado de Operación</h3>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {[
                                { id: 'pendiente', config: getEstadoConfig('pendiente') },
                                { id: 'pendiente_verificacion', config: getEstadoConfig('pendiente_verificacion') },
                                { id: 'pagado', config: getEstadoConfig('pagado') },
                                { id: 'en_preparacion', config: getEstadoConfig('en_preparacion') },
                                { id: pedido.metodo_envio === 'tienda' ? 'listo_recoger' : 'enviado', config: getEstadoConfig(pedido.metodo_envio === 'tienda' ? 'listo_recoger' : 'enviado') },
                                { id: 'entregado', config: getEstadoConfig('entregado') },
                                { id: 'completado', config: getEstadoConfig('completado') },
                                { id: 'cancelado', config: getEstadoConfig('cancelado') },
                                { id: 'devuelto', config: getEstadoConfig('devuelto') },
                            ].map((st) => (
                                <button
                                    key={st.id}
                                    onClick={() => cambiarEstado(st.id)}
                                    disabled={pedido.estado === st.id || !!updatingStatus}
                                    className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all group overflow-hidden ${pedido.estado === st.id
                                        ? `${st.config.color} opacity-50 cursor-default shadow-inner`
                                        : updatingStatus === st.id
                                            ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 shadow-md'
                                            : 'bg-white dark:bg-[#0b1437] border-gray-100 dark:border-white/5 hover:border-orange-200 dark:hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5 cursor-pointer'
                                        }`}
                                >
                                    {(pedido.estado === st.id || updatingStatus === st.id) && (
                                        <div className="absolute top-2 right-2">
                                            {updatingStatus === st.id ? (
                                                <div className="w-3 h-3 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                                            ) : (
                                                <CheckCircle2 size={12} className="opacity-50" />
                                            )}
                                        </div>
                                    )}
                                    <div className={`p-2 rounded-xl transition-colors ${pedido.estado === st.id ? 'bg-white/50 dark:bg-white/5' : updatingStatus === st.id ? 'bg-white dark:bg-[#111c44]' : 'bg-gray-50 dark:bg-[#111c44] group-hover:bg-orange-50 dark:group-hover:bg-orange-500/10'}`}>
                                        <st.config.icon size={18} className={pedido.estado === st.id ? 'opacity-80' : updatingStatus === st.id ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 group-hover:text-orange-500 dark:group-hover:text-orange-400'} />
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-tighter text-center leading-none ${pedido.estado === st.id ? '' : 'text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400'}`}>
                                        {st.config.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Sidebar: Client & Shipping Info */}
                <div className="space-y-8">
                    {/* Payment Verification Card */}
                    {pedido.comprobante_pago && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }}
                            className="bg-white dark:bg-[#111c44] rounded-3xl border-2 border-orange-100 dark:border-orange-500/20 shadow-xl shadow-orange-500/5 p-8 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 px-4 py-1.5 bg-orange-500 dark:bg-orange-600 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-2xl">
                                Requiere Acción
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-xl shadow-sm border border-orange-100 dark:border-orange-500/20">
                                    <Eye size={18} className="text-orange-600 dark:text-orange-400" />
                                </div>
                                <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Verificación de Pago</h3>
                            </div>

                            <div
                                className="group relative aspect-[3/4] rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#0b1437] overflow-hidden cursor-zoom-in mb-6"
                                onClick={() => setShowModal(true)}
                            >
                                <img
                                    src={`http://localhost:8000/uploads/comprobantes/${pedido.comprobante_pago}`}
                                    alt="Comprobante de pago"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="bg-white dark:bg-[#111c44] p-3 rounded-full text-gray-900 dark:text-white shadow-xl">
                                        <Eye size={20} />
                                    </div>
                                </div>
                            </div>

                            {pedido.estado === 'pendiente_verificacion' && (
                                <button
                                    onClick={() => cambiarEstado('pagado')}
                                    disabled={!!updatingStatus}
                                    className="w-full py-4 bg-emerald-500 dark:bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:active:scale-100"
                                >
                                    {updatingStatus === 'pagado' ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                                    )}
                                    <span>{updatingStatus === 'pagado' ? 'PROCESANDO...' : 'APROBAR Y MARCAR PAGADO'}</span>
                                </button>
                            )}
                        </motion.div>
                    )}

                    {/* Client Info Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-[#111c44] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white dark:bg-[#111c44] rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
                                <User size={18} className="text-gray-900 dark:text-white" />
                            </div>
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Perfil del Cliente</h3>
                        </div>

                        <div className="space-y-5">
                            <div className="group">
                                <label className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] block mb-1">Nombre Completo</label>
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-3 bg-gray-100 dark:bg-white/10 rounded-full group-hover:bg-orange-500 transition-colors" />
                                    <p className="text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-tight">{pedido.cliente_nombre}</p>
                                </div>
                            </div>
                            <div className="group">
                                <label className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] block mb-1">Contacto Digital</label>
                                <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-[#0b1437] rounded-xl border border-gray-100 dark:border-white/5">
                                    <Mail size={14} className="text-gray-400 dark:text-gray-500" />
                                    <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 truncate">{pedido.correo}</p>
                                </div>
                            </div>
                            <div className="group">
                                <label className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] block mb-1">Contacto Telefónico</label>
                                <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-[#0b1437] rounded-xl border border-gray-100 dark:border-white/5">
                                    <Phone size={14} className="text-gray-400 dark:text-gray-500" />
                                    <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{pedido.telefono || 'No registrado'}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Shipping Address Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-[#111c44] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-8 relative overflow-hidden"
                    >
                        {/* Shipping Method Indicator */}
                        <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[8px] font-black uppercase tracking-widest ${pedido.metodo_envio === 'tienda' ? 'bg-orange-500 dark:bg-orange-600 text-white' : 'bg-blue-600 dark:bg-blue-700 text-white'
                            }`}>
                            <div className="flex items-center gap-1.5">
                                {pedido.metodo_envio === 'tienda' ? <Store size={10} /> : <Home size={10} />}
                                {pedido.metodo_envio || 'Domicilio'}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white dark:bg-[#111c44] rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
                                <MapPin size={18} className="text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Información de Entrega</h3>
                        </div>

                        <div className="p-4 bg-orange-50/50 dark:bg-orange-500/5 rounded-2xl border border-orange-100/50 dark:border-orange-500/20">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#111c44] flex items-center justify-center border border-orange-100 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 flex-shrink-0">
                                    <MapPin size={14} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase leading-snug">
                                        {pedido.metodo_envio === 'tienda' ? 'Punto de Recojo: Tienda Principal' : pedido.direccion}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                        <span className="text-[9px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                                            {pedido.distrito ? `${pedido.distrito}, ${pedido.departamento}` : 'Dirección verificada'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#0b1437] rounded-xl border border-gray-100 dark:border-white/5">
                            <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
                            <div className="flex-1">
                                <span className="text-[8px] font-black text-gray-400 dark:text-gray-600 uppercase block tracking-widest">Fecha de Orden</span>
                                <span className="text-[10px] font-black text-gray-600 dark:text-gray-400">
                                    {new Date(pedido.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Access Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="p-6 bg-[#1e293b] dark:bg-[#111c44] rounded-3xl shadow-xl shadow-slate-900/10 dark:shadow-none border dark:border-white/5"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-slate-800 dark:bg-[#0b1437] rounded-xl border border-slate-700 dark:border-white/10">
                                <AlertCircle size={16} className="text-orange-500" />
                            </div>
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Nota Técnica</h4>
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 dark:text-gray-400 leading-relaxed uppercase tracking-tight">
                            Esta orden está vinculada al sistema de pagos seguro. Cualquier cambio de estado notificará automáticamente al cliente vía correo electrónico institucional.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Verification Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 dark:bg-black/95 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative max-w-4xl w-full max-h-[90vh] bg-white dark:bg-[#111c44] rounded-3xl overflow-hidden shadow-2xl border dark:border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black transition-colors z-10"
                            >
                                <X size={24} />
                            </button>
                            <div className="w-full h-full overflow-auto p-4 flex items-center justify-center bg-gray-100 dark:bg-[#0b1437]">
                                <img
                                    src={`http://localhost:8000/uploads/comprobantes/${pedido.comprobante_pago}`}
                                    alt="Comprobante de pago"
                                    className="max-w-full h-auto rounded-xl shadow-lg"
                                />
                            </div>
                            <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#111c44] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                                        <AlertCircle size={18} className="text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Verificando Pedido</p>
                                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase">Orden #{pedido.id}</p>
                                    </div>
                                </div>
                                {pedido.estado === 'pendiente_verificacion' && (
                                    <button
                                        onClick={async () => {
                                            await cambiarEstado('pagado');
                                            setShowModal(false);
                                        }}
                                        disabled={!!updatingStatus}
                                        className="px-6 py-3 bg-emerald-500 dark:bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {updatingStatus === 'pagado' ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <CheckCircle2 size={16} />
                                        )}
                                        <span>{updatingStatus === 'pagado' ? 'PROCESANDO...' : 'CONFIRMAR PAGO'}</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PedidosShow;
