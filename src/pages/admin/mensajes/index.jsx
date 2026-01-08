import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    MessageSquare,
    Trash2,
    Search,
    Eye
} from 'lucide-react';
import { mensajesService } from '../../../services';
import Swal from 'sweetalert2';
import Breadcrumb from '../../../components/Breadcrumb';
import { Link } from 'react-router-dom';

const MensajesIndex = () => {
    const [mensajes, setMensajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('TODOS');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMensajes();
    }, []);

    const fetchMensajes = async () => {
        try {
            const data = await mensajesService.getAll();
            setMensajes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMensajes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar mensaje?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            customClass: { popup: 'rounded-[30px]' }
        });

        if (result.isConfirmed) {
            try {
                await mensajesService.delete(id);
                setMensajes(mensajes.filter(m => m.id !== id));
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: { popup: 'rounded-[30px]' }
                });
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error al eliminar' });
            }
        }
    };

    const filteredMensajes = mensajes.filter(m => {
        const matchesFilter = filter === 'TODOS' || m.estado === filter;
        const matchesSearch =
            m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.asunto.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusStyle = (estado) => {
        switch (estado) {
            case 'RESPONDIDO': return 'bg-green-100 text-green-700 border-green-200';
            case 'LEIDO': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-orange-100 text-orange-700 border-orange-200';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-4 space-y-6 bg-gray-50 dark:bg-[#0b1437] min-h-screen transition-colors duration-300">
            {/* Header Simplified */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <MessageSquare size={16} className="text-orange-500" />
                        Bandeja de Entrada
                    </h1>
                    <Breadcrumb items={[
                        { label: 'Admin', link: '/admin', isHome: true },
                        { label: 'Mensajes' }
                    ]} />
                </div>
            </div>

            {/* Middle Bar: Tabs & Search */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Tabs */}
                <div className="flex bg-white dark:bg-[#111c44] p-1 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm w-full lg:w-auto overflow-x-auto no-scrollbar">
                    {['TODOS', 'PENDIENTE', 'LEIDO', 'RESPONDIDO'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${filter === f
                                ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 lg:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-700 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Content Table Area */}
            <div className="bg-white dark:bg-[#111c44] rounded-2xl border border-gray-200 dark:border-white/5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-[#f8fafc]/80 dark:bg-white/5 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 dark:border-white/5">
                            <tr>
                                <th className="px-4 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        CLIENTE
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 whitespace-nowrap">ASUNTO / MENSAJE</th>
                                <th className="px-4 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 text-center whitespace-nowrap">ESTADO</th>
                                <th className="px-4 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 text-center whitespace-nowrap">FECHA</th>
                                <th className="px-4 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 text-right whitespace-nowrap">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            <AnimatePresence mode='popLayout'>
                                {filteredMensajes.length > 0 ? filteredMensajes.map((msg, idx) => (
                                    <motion.tr
                                        key={msg.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        whileHover={{
                                            backgroundColor: "rgba(249, 115, 22, 0.04)",
                                            transition: { duration: 0.2, ease: "easeOut" }
                                        }}
                                        transition={{
                                            opacity: { duration: 0.5, delay: idx * 0.045 },
                                            x: { duration: 0.5, delay: idx * 0.045, ease: [0.16, 1, 0.3, 1] }
                                        }}
                                        className="relative group cursor-default"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 rounded-lg flex items-center justify-center font-black border border-orange-100 dark:border-white/10">
                                                    {msg.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-[#1e293b] dark:text-white uppercase tracking-tight truncate max-w-[140px]">{msg.nombre}</p>
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono tracking-tighter truncate max-w-[140px]">{msg.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-black text-[#1e293b] dark:text-white uppercase tracking-tight truncate max-w-[200px] mb-0.5">{msg.asunto}</p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">{msg.mensaje}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-black text-[10px] border uppercase tracking-widest ${getStatusStyle(msg.estado).replace('border-', 'border-')}`}>
                                                {msg.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <p className="text-[10px] font-black text-[#1e293b] dark:text-white tabular-nums">{new Date(msg.fecha_creacion).toLocaleDateString()}</p>
                                            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 tracking-tighter">{new Date(msg.fecha_creacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {[
                                                    { to: `/admin/mensajes/ver/${msg.id}`, icon: Eye, label: 'Ver / Responder', color: 'hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/5' },
                                                    { onClick: () => handleDelete(msg.id), icon: Trash2, label: 'Eliminar', color: 'hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/5' }
                                                ].map((action, i) => (
                                                    <Link
                                                        key={i}
                                                        to={action.to}
                                                        onClick={action.onClick}
                                                        className={`p-1.5 transition-all duration-300 rounded-lg border-2 border-transparent bg-gray-50 dark:bg-white/5 text-[#1e293b] dark:text-gray-400 hover:border-[#1e293b]/10 dark:hover:border-white/20 hover:shadow-md ${action.color}`}
                                                        title={action.label}
                                                    >
                                                        <action.icon size={14} strokeWidth={2.5} />
                                                    </Link>
                                                ))}
                                            </div>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-4 text-gray-400 dark:text-gray-600">
                                                <Mail size={48} className="opacity-20" />
                                                <p className="font-medium">No hay mensajes que coincidan con los criterios.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MensajesIndex;
