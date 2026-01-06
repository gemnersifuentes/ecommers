import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Save,
    X,
    Clock,
    Truck,
    Package,
    Store,
    Home,
    AlertCircle,
    User,
    CreditCard,
    ChevronDown,
    Search
} from 'lucide-react';
import Swal from 'sweetalert2';
import { pedidosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const PedidosEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pedido, setPedido] = useState(null);
    const [estado, setEstado] = useState('');

    useEffect(() => {
        if (id && id !== 'undefined') {
            cargarPedido();
        } else {
            setLoading(false);
        }
    }, [id]);

    const cargarPedido = async () => {
        setLoading(true);
        try {
            const data = await pedidosService.getById(id);
            if (!data) throw new Error("No data received");
            setPedido(data);
            setEstado(data.estado);
        } catch (error) {
            console.error('Error al cargar pedido:', error);
            Swal.fire('Error', 'No se pudo cargar el pedido.', 'error');
            navigate('/admin/pedidos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await pedidosService.updateEstado(id, estado);

            let message = 'El estado del pedido ha sido actualizado';
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
                timer: 3000,
                showConfirmButton: true,
                confirmButtonColor: '#f97316'
            }).then(() => {
                navigate('/admin/pedidos');
            });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo actualizar el pedido', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Iniciando sistema de edición...</span>
            </div>
        );
    }

    if (!pedido) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <Package size={48} className="mx-auto text-gray-200 mb-4" strokeWidth={1} />
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Pedido no identificado</h3>
                <Link to="/admin/pedidos" className="mt-4 inline-flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-widest">
                    <ArrowLeft size={14} /> Volver a la lista
                </Link>
            </div>
        );
    }

    return (
        <div className="pb-20">
            {/* Header Section */}
            <div className="mb-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-1"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Link to="/admin/pedidos" className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-orange-500 transition-all shadow-sm">
                                <ArrowLeft size={16} />
                            </Link>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter border border-blue-100">
                                MODO EDICIÓN
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-[#1e293b] tracking-tight uppercase">
                            Editar Pedido #{pedido.id}
                        </h2>
                        <Breadcrumb items={[
                            { label: 'Panel', link: '/admin' },
                            { label: 'Pedidos', link: '/admin/pedidos' },
                            { label: `Editar #${pedido.id}` }
                        ]} />
                    </motion.div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                    >
                        <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <Clock size={18} className="text-orange-500" />
                                </div>
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Estado de la Orden</h3>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-full shadow-sm">
                                {pedido.metodo_envio === 'tienda' ? (
                                    <>
                                        <Store size={12} className="text-orange-500" />
                                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-wider">Retiro en Tienda</span>
                                    </>
                                ) : (
                                    <>
                                        <Home size={12} className="text-blue-600" />
                                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-wider">Envío a Domicilio</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            <div className="relative">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3">Actualizar estado operativo</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                                        <Search size={18} />
                                    </div>
                                    <select
                                        value={estado}
                                        onChange={(e) => setEstado(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm font-black text-[#1e293b] appearance-none cursor-pointer uppercase tracking-wider h-[60px]"
                                    >
                                        {(() => {
                                            const method = pedido.metodo_envio ? pedido.metodo_envio.toLowerCase().trim() : 'domicilio';
                                            const isPickup = method === 'tienda';

                                            // Mapeo de slugs a etiquetas amigables
                                            const statusMap = [
                                                { value: 'pendiente', label: 'Pendiente' },
                                                { value: 'pendiente_verificacion', label: 'Pendiente de Verificación' },
                                                { value: 'pagado', label: 'Pagado' },
                                                { value: 'en_preparacion', label: 'En Preparación' },
                                                { value: 'enviado', label: 'Enviado', onlyDelivery: true },
                                                { value: 'listo_recoger', label: 'Listo para recoger', onlyPickup: true },
                                                { value: 'entregado', label: 'Entregado' },
                                                { value: 'completado', label: 'Completado' },
                                                { value: 'cancelado', label: 'Cancelado' },
                                                { value: 'devuelto', label: 'Devuelto' }
                                            ];

                                            return statusMap
                                                .filter(opt => {
                                                    if (opt.onlyPickup && !isPickup) return false;
                                                    if (opt.onlyDelivery && isPickup) return false;
                                                    return true;
                                                })
                                                .map(opt => (
                                                    <option key={opt.value} value={opt.value} className="bg-white font-bold">
                                                        {opt.label}
                                                    </option>
                                                ));
                                        })()}
                                    </select>
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-3">
                                    <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-bold text-blue-600/80 uppercase leading-snug tracking-tight">
                                        {pedido.metodo_envio === 'tienda'
                                            ? 'Basado en el método de retiro: Tienes disponible "Listo para recoger" para notificar al cliente que puede pasar por tienda.'
                                            : 'Basado en el método de entrega: Tienes disponible "Enviado" para indicar que el paquete está en ruta.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-50">
                                <Link
                                    to="/admin/pedidos"
                                    className="px-6 py-3 border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-500 rounded-2xl hover:bg-gray-50 hover:text-gray-700 transition-all"
                                >
                                    Cerrar Sin Guardar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={saving || estado === pedido.estado}
                                    className="px-8 py-3 bg-[#1e293b] hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all disabled:opacity-30 disabled:hover:bg-[#1e293b] flex items-center gap-3 shadow-lg shadow-gray-200"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Sincronizando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Confirmar Cambios
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>

                {/* Sidebar Summary */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                                <Package size={18} className="text-gray-900" />
                            </div>
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Resumen de Orden</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                                    <User size={18} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Cliente</span>
                                    <p className="text-[11px] font-black text-[#1e293b] uppercase truncate">{pedido.cliente_nombre}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-orange-50/50 rounded-2xl border border-orange-100/30">
                                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-orange-500">
                                    <CreditCard size={18} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Total a Cobrar</span>
                                    <p className="text-xl font-black text-orange-600 tabular-nums">S/ {parseFloat(pedido.total).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 bg-[#1e293b] rounded-3xl"
                    >
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                            <AlertCircle size={14} className="text-orange-500" />
                            Protocolo de Edición
                        </h4>
                        <p className="text-[9px] font-medium text-slate-400 leading-relaxed uppercase tracking-tight">
                            Al cambiar el estado, asegúrese de que la logística esté coordinada. El sistema registrará su usuario como responsable de esta actualización.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PedidosEdit;

