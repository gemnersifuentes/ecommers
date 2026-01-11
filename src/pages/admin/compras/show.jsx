import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    ShoppingBag,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Clock,
    FileText,
    User,
    ChevronRight,
    Store,
    RotateCcw,
    CreditCard
} from 'lucide-react';
import { comprasService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';
import Swal from 'sweetalert2';

const ComprasShow = () => {
    const { id } = useParams();
    const [compra, setCompra] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(null);

    const cargarCompra = async () => {
        setLoading(true);
        try {
            const data = await comprasService.getById(id);
            setCompra(data);
        } catch (error) {
            console.error('Error al cargar compra:', error);
            Swal.fire('Error', 'No se pudo cargar la información de la compra', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCompra();
    }, [id]);

    const cambiarEstado = async (nuevoEstado) => {
        if (compra.estado === 'Completado' && nuevoEstado !== 'Completado') {
            const confirm = await Swal.fire({
                title: '¿Estás seguro?',
                text: "Cambiar el estado de una compra completada puede afectar el historial de stock.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ea580c',
                confirmButtonText: 'Sí, cambiar',
                cancelButtonText: 'Cancelar'
            });
            if (!confirm.isConfirmed) return;
        }

        setUpdatingStatus(nuevoEstado);
        try {
            await comprasService.update(id, {
                ...compra,
                estado: nuevoEstado
            });

            Swal.fire({
                icon: 'success',
                title: 'Estado actualizado',
                toast: true,
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false
            });
            await cargarCompra();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const getStatusConfig = (estado) => {
        const configs = {
            'Pendiente': {
                label: 'Pendiente',
                color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20',
                icon: Clock,
                dot: 'bg-amber-500'
            },
            'Completado': {
                label: 'Completado',
                color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20',
                icon: CheckCircle2,
                dot: 'bg-emerald-500'
            },
            'Cancelado': {
                label: 'Cancelado',
                color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20',
                icon: XCircle,
                dot: 'bg-red-500'
            }
        };
        return configs[estado] || {
            label: estado || 'Desconocido',
            color: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10',
            icon: AlertCircle,
            dot: 'bg-gray-500'
        };
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Cargando detalles de compra...</span>
            </div>
        );
    }

    if (!compra) {
        return (
            <div className="text-center py-20 bg-white dark:bg-[#111c44] rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                <ShoppingBag size={48} className="mx-auto text-gray-200 dark:text-gray-800 mb-4" strokeWidth={1} />
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Compra no encontrada</h3>
                <Link to="/admin/compras" className="mt-4 inline-flex items-center gap-2 text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-widest hover:gap-3 transition-all">
                    <ArrowLeft size={14} /> Volver a compras
                </Link>
            </div>
        );
    }

    const config = getStatusConfig(compra.estado);
    const StatusIcon = config.icon;

    return (
        <div className="pb-20 p-4">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-1"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Link to="/admin/compras" className="p-2 bg-white dark:bg-[#111c44] border border-gray-100 dark:border-white/5 rounded-xl text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all shadow-sm">
                                <ArrowLeft size={16} />
                            </Link>
                            <span className="text-[10px] font-black text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded uppercase tracking-tighter border border-orange-100 dark:border-orange-500/20">
                                COMPRA #{compra.id.toString().padStart(5, '0')}
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-[#1e293b] dark:text-white tracking-tight uppercase">
                            Detalles de Abastecimiento
                        </h2>
                        <Breadcrumb items={[
                            { label: 'Panel', link: '/admin' },
                            { label: 'Compras', link: '/admin/compras' },
                            { label: `Compra #${compra.id}` }
                        ]} />
                    </motion.div>

                    <div className={`px-4 py-1.5 rounded-xl border flex items-center gap-2 shadow-sm ${config.color}`}>
                        <div className={`w-2 h-2 rounded-full ${config.dot} ${compra.estado === 'Pendiente' ? 'animate-pulse' : ''}`} />
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
                                    <Package size={18} className="text-orange-500 dark:text-orange-400" />
                                </div>
                                <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Artículos Recibidos</h3>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{compra.detalles?.length} Items</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-4 text-[9px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-widest border-b border-gray-50 dark:border-white/5">Producto</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-widest border-b border-gray-50 dark:border-white/5 text-center">Cant.</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-widest border-b border-gray-50 dark:border-white/5 text-right">Costo Unit.</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest border-b border-gray-50 dark:border-white/5 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                    {compra.detalles?.map((detalle, index) => (
                                        <tr key={index} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#0b1437] border border-gray-100 dark:border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                        {(detalle.variacion_imagen || detalle.producto_imagen) ? (
                                                            <img
                                                                src={(detalle.variacion_imagen || detalle.producto_imagen).startsWith('http')
                                                                    ? (detalle.variacion_imagen || detalle.producto_imagen)
                                                                    : `http://localhost:8000/public/uploads/${detalle.variacion_imagen || detalle.producto_imagen}`}
                                                                className="w-full h-full object-cover"
                                                                alt=""
                                                            />
                                                        ) : (
                                                            <Package size={20} className="text-gray-300" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-black text-[#1e293b] dark:text-white uppercase leading-tight">{detalle.producto_nombre}</p>
                                                        {detalle.variacion_nombre && (
                                                            <span className="text-[8px] font-bold text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded mt-1 inline-block uppercase tracking-wider">
                                                                {detalle.variacion_nombre}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-[11px] font-black text-[#1e293b] dark:text-white tabular-nums">
                                                    {detalle.cantidad}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 tabular-nums">
                                                    S/ {parseFloat(detalle.precio_unidad).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
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
                                    <span>Subtotal</span>
                                    <span className="w-24 text-right text-gray-600 dark:text-gray-400">S/ {(parseFloat(compra.total) / 1.18).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex items-center gap-8 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                    <span>IGV (18%)</span>
                                    <span className="w-24 text-right text-gray-600 dark:text-gray-400">S/ {(parseFloat(compra.total) - (parseFloat(compra.total) / 1.18)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex items-center gap-8 mt-2 pt-2 border-t border-gray-200 dark:border-white/10">
                                    <span className="text-xs font-black text-[#1e293b] dark:text-white uppercase tracking-tighter">Inversión Total</span>
                                    <span className="w-24 text-right text-xl font-black text-orange-600 dark:text-orange-500 tabular-nums">
                                        S/ {parseFloat(compra.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Status Management */}
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
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Cambiar Estado de la Compra</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { id: 'Pendiente', config: getStatusConfig('Pendiente') },
                                { id: 'Completado', config: getStatusConfig('Completado') },
                                { id: 'Cancelado', config: getStatusConfig('Cancelado') }
                            ].map((st) => (
                                <button
                                    key={st.id}
                                    onClick={() => cambiarEstado(st.id)}
                                    disabled={compra.estado === st.id || !!updatingStatus}
                                    className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all group ${compra.estado === st.id
                                        ? `${st.config.color} opacity-50 cursor-default`
                                        : updatingStatus === st.id
                                            ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 animate-pulse'
                                            : 'bg-white dark:bg-[#0b1437] border-gray-100 dark:border-white/5 hover:border-orange-200 dark:hover:border-orange-500/30 hover:shadow-lg cursor-pointer'
                                        }`}
                                >
                                    <div className={`p-3 rounded-xl transition-colors ${compra.estado === st.id ? 'bg-white/50' : 'bg-gray-50 dark:bg-[#111c44] group-hover:bg-orange-50 dark:group-hover:bg-orange-500/10'}`}>
                                        <st.config.icon size={24} className={compra.estado === st.id ? '' : 'text-gray-400 group-hover:text-orange-500'} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{st.config.label}</span>
                                </button>
                            ))}
                        </div>
                        {compra.estado === 'Pendiente' && (
                            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-500/5 rounded-2xl border border-orange-100 dark:border-orange-500/20 flex gap-3">
                                <AlertCircle size={18} className="text-orange-500 flex-shrink-0" />
                                <p className="text-[10px] font-bold text-orange-800 dark:text-orange-400 uppercase leading-snug">
                                    Al marcar como "Completado", el stock de los productos se actualizará automáticamente en el inventario.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-8">
                    {/* Supplier Info */}
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
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Proveedor</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 font-black text-xl">
                                    {compra.proveedor_nombre?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-tight">{compra.proveedor_nombre}</p>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ID Proveedor: #{compra.proveedor_id}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Document Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-[#111c44] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white dark:bg-[#111c44] rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
                                <FileText size={18} className="text-gray-900 dark:text-white" />
                            </div>
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Documento</h3>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-1">Tipo de Comprobante</label>
                                <p className="text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase">{compra.tipo_comprobante || 'No especificado'}</p>
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-1">Número de Comprobante</label>
                                <p className="text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase">{compra.numero_comprobante || 'SIN NÚMERO'}</p>
                            </div>
                            <div className="pt-4 border-t border-gray-50 dark:border-white/5">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-gray-400" />
                                    <div>
                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] block">Fecha de Compra</label>
                                        <p className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase">
                                            {new Date(compra.fecha_compra).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Notes */}
                    {compra.notas && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-orange-50/50 dark:bg-orange-500/5 rounded-3xl border border-orange-100/50 dark:border-orange-500/10 p-8"
                        >
                            <h4 className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-3">Notas Internas</h4>
                            <p className="text-[10px] font-bold text-orange-800 dark:text-gray-400 leading-relaxed uppercase tracking-tight">
                                {compra.notas}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComprasShow;
