import { useState, useEffect } from 'react';
import { reservacionesService } from '../../../services';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    MessageSquare,
    Phone,
    User,
    CheckCircle,
    XCircle,
    Timer,
    Settings,
    Trash2,
    ChevronRight,
    Info
} from 'lucide-react';

const AdminReservaciones = () => {
    const [reservaciones, setReservaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Todas');
    const [selectedReservacion, setSelectedReservacion] = useState(null);

    useEffect(() => {
        cargarReservaciones();
    }, []);

    const cargarReservaciones = async () => {
        setLoading(true);
        try {
            const data = await reservacionesService.getAll();
            setReservaciones(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar reservaciones:', error);
            Swal.fire('Error', 'No se pudieron cargar las reservaciones', 'error');
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        'Pendiente': 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20',
        'Confirmado': 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
        'En Proceso': 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
        'Completado': 'bg-green-100 dark:bg-emerald-500/10 text-green-700 dark:text-emerald-400 border-green-200 dark:border-emerald-500/20',
        'Cancelado': 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
    };

    const [costoFinal, setCostoFinal] = useState('');
    const [costoInsumos, setCostoInsumos] = useState('');

    useEffect(() => {
        if (selectedReservacion) {
            setCostoFinal(selectedReservacion.costo_final || '');
            setCostoInsumos(selectedReservacion.costo_insumos || '');
        }
    }, [selectedReservacion]);

    const handleUpdateStatus = async (id, nuevoEstado) => {
        try {
            await reservacionesService.update(id, {
                estado: nuevoEstado,
                costo_final: costoFinal || null,
                costo_insumos: costoInsumos || null
            });
            Swal.fire({
                icon: 'success',
                title: 'Estado Actualizado',
                text: `La reservación ahora está en estado: ${nuevoEstado}`,
                timer: 1500,
                showConfirmButton: false
            });
            cargarReservaciones();
            if (selectedReservacion && selectedReservacion.id === id) {
                setSelectedReservacion({ ...selectedReservacion, estado: nuevoEstado, costo_final: costoFinal, costo_insumos: costoInsumos });
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
        }
    };

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar reservación?',
            text: 'Esta acción borrará el registro de forma permanente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444'
        });

        if (result.isConfirmed) {
            try {
                await reservacionesService.delete(id);
                Swal.fire('Eliminado', 'La reservación ha sido borrada.', 'success');
                cargarReservaciones();
                if (selectedReservacion && selectedReservacion.id === id) setSelectedReservacion(null);
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar la reservación', 'error');
            }
        }
    };

    const filteredReservaciones = filter === 'Todas'
        ? reservaciones
        : reservaciones.filter(r => r.estado === filter);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium tracking-widest uppercase text-xs">Accediendo a Protocolos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tight uppercase">
                        Reservaciones<span className="text-orange-600">_Servicios</span>
                    </h2>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Panel de Control de Tickets Técnicos</p>
                </div>

                <div className="flex bg-gray-100 dark:bg-[#111c44] p-1 rounded-xl border border-gray-200 dark:border-white/10 overflow-x-auto no-scrollbar">
                    {['Todas', 'Pendiente', 'Confirmado', 'En Proceso', 'Completado', 'Cancelado'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all whitespace-nowrap ${filter === f
                                ? 'bg-white dark:bg-[#0b1437] text-orange-600 dark:text-orange-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Listado */}
                <div className="lg:col-span-2 space-y-4">
                    {filteredReservaciones.length === 0 ? (
                        <div className="bg-white dark:bg-[#111c44] rounded-2xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-white/10">
                            <Calendar className="mx-auto w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
                            <p className="text-gray-500 dark:text-gray-500 font-bold uppercase text-xs tracking-widest">No hay registros en este sector</p>
                        </div>
                    ) : (
                        filteredReservaciones.map((r) => (
                            <motion.div
                                layoutId={`card-${r.id}`}
                                key={r.id}
                                onClick={() => setSelectedReservacion(r)}
                                className={`bg-white dark:bg-[#111c44] rounded-xl border-2 transition-all cursor-pointer p-4 group ${selectedReservacion?.id === r.id ? 'border-orange-600 shadow-lg' : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">Ticket #00{r.id}</span>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${statusColors[r.estado] || 'bg-gray-100 dark:bg-white/5'}`}>
                                                {r.estado}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-gray-900 dark:text-white uppercase italic tracking-tight">{r.servicio_nombre}</h3>
                                        <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400 font-bold">
                                            <div className="flex items-center gap-1.5">
                                                <User size={12} className="text-orange-600 dark:text-orange-500" />
                                                {r.nombre_cliente}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-green-600 dark:text-emerald-500">
                                                <Phone size={12} />
                                                {r.whatsapp_cliente}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-orange-600 dark:text-orange-500 tracking-tighter italic">
                                            S/ {r.costo_final ? parseFloat(r.costo_final).toFixed(0) : parseFloat(r.costo_sugerido).toFixed(0)}
                                        </div>
                                        <div className="text-[7px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-tighter -mt-1">
                                            {r.costo_final ? 'PRECIO_FINAL' : 'SUGERIDO'}
                                        </div>
                                        <div className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase mt-1">{new Date(r.fecha_registro).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Detalle / Acciones */}
                <div className="lg:col-span-1">
                    <AnimatePresence mode="wait">
                        {selectedReservacion ? (
                            <motion.div
                                key={selectedReservacion.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white dark:bg-[#111c44] rounded-2xl border-2 border-gray-100 dark:border-white/5 p-6 sticky top-24 shadow-sm"
                            >
                                <div className="flex flex-col gap-6">
                                    <div className="border-b border-gray-100 dark:border-white/5 pb-4">
                                        <div className="text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-[0.3em] mb-1">Detalle_Técnico</div>
                                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase italic leading-tight">{selectedReservacion.servicio_nombre}</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-gray-50 dark:bg-[#0b1437] rounded-xl p-4 border border-gray-100 dark:border-white/5">
                                            <div className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-2">Comentarios del Cliente</div>
                                            <p className="text-xs text-gray-600 dark:text-gray-300 italic leading-relaxed">
                                                "{selectedReservacion.detalle_tecnico || 'Sin comentarios adicionales.'}"
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#0b1437] border border-gray-100 dark:border-white/5 rounded-xl">
                                                <div className="w-8 h-8 bg-orange-50 dark:bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400">
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">Solicitante</p>
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white">{selectedReservacion.nombre_cliente}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#0b1437] border border-gray-100 dark:border-white/5 rounded-xl">
                                                <div className="w-8 h-8 bg-green-50 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center text-green-600 dark:text-emerald-400">
                                                    <Phone size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">WhatsApp Directo</p>
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white">{selectedReservacion.whatsapp_cliente}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-900 dark:bg-[#0b1437] rounded-xl p-4 border border-gray-800 dark:border-white/10 shadow-xl">
                                            <div className="text-[9px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-[0.2em] mb-2">Gestión de Cobro</div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">Precio Final (S/)</p>
                                                    <input
                                                        type="number"
                                                        value={costoFinal}
                                                        onChange={(e) => setCostoFinal(e.target.value)}
                                                        className="w-full bg-gray-800 dark:bg-[#111c44] text-white border-2 border-gray-700 dark:border-white/10 rounded-lg px-3 py-2 text-sm font-black focus:border-orange-600 dark:focus:border-orange-500 outline-none transition-all"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">Costo Insumos (S/)</p>
                                                    <input
                                                        type="number"
                                                        value={costoInsumos}
                                                        onChange={(e) => setCostoInsumos(e.target.value)}
                                                        className="w-full bg-gray-800 dark:bg-[#111c44] text-white border-2 border-gray-700 dark:border-white/10 rounded-lg px-3 py-2 text-sm font-black focus:border-orange-600 dark:focus:border-orange-500 outline-none transition-all"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <div className="pt-5">
                                                    <button
                                                        onClick={() => handleUpdateStatus(selectedReservacion.id, selectedReservacion.estado)}
                                                        className="bg-orange-600 dark:bg-orange-600 text-white p-2.5 rounded-lg hover:bg-orange-700 dark:hover:bg-orange-500 transition-all shadow-lg font-bold"
                                                        title="Guardar Precio"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-[8px] text-gray-500 dark:text-gray-600 mt-2 font-bold uppercase italic">* El costo sugerido era: S/ {parseFloat(selectedReservacion.costo_sugerido).toFixed(0)}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-white/5">
                                        <p className="text-[9px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest">Actualizar Protocolo</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleUpdateStatus(selectedReservacion.id, 'Confirmado')}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-lg text-[10px] font-black transition-all border ${selectedReservacion.estado === 'Confirmado' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-[#111c44] border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
                                                    }`}
                                            >
                                                <CheckCircle size={14} /> CONFIRMAR
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedReservacion.id, 'En Proceso')}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-lg text-[10px] font-black transition-all border ${selectedReservacion.estado === 'En Proceso' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-[#111c44] border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-purple-600 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400'
                                                    }`}
                                            >
                                                <Timer size={14} /> PROCESO
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedReservacion.id, 'Completado')}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-lg text-[10px] font-black transition-all border ${selectedReservacion.estado === 'Completado' ? 'bg-green-600 text-white border-green-600' : 'bg-white dark:bg-[#111c44] border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-green-600 dark:hover:border-emerald-500 hover:text-green-600 dark:hover:text-emerald-400'
                                                    }`}
                                            >
                                                <CheckCircle size={14} /> COMPLETAR
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedReservacion.id, 'Cancelado')}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-lg text-[10px] font-black transition-all border ${selectedReservacion.estado === 'Cancelado' ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-[#111c44] border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-red-600 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400'
                                                    }`}
                                            >
                                                <XCircle size={14} /> CANCELAR
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleEliminar(selectedReservacion.id)}
                                            className="w-full mt-2 flex items-center justify-center gap-2 p-3 bg-gray-900 dark:bg-black text-white rounded-lg text-[10px] font-black tracking-widest hover:bg-red-700 dark:hover:bg-red-600 transition-all uppercase"
                                        >
                                            <Trash2 size={14} /> Eliminar Registro
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-orange-50 dark:bg-orange-500/10 rounded-2xl p-8 border-2 border-orange-100 dark:border-orange-500/20 flex flex-col items-center text-center">
                                <Info className="w-10 h-10 text-orange-200 dark:text-orange-500/20 mb-4" />
                                <p className="text-[10px] font-black text-orange-400 dark:text-orange-500/50 uppercase tracking-widest leading-loose">
                                    Seleccione un ticket para visualizar el protocolo de servicio completo.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AdminReservaciones;
