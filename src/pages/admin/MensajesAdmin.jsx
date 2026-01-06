import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    MessageSquare,
    Trash2,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    Send,
    X,
    User,
    Phone,
    Calendar,
    Eye
} from 'lucide-react';
import { mensajesService } from '../../services';
import Swal from 'sweetalert2';
import Breadcrumb from '../../components/Breadcrumb';

const MensajesAdmin = () => {
    const [mensajes, setMensajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('TODOS');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);

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

    const handleReply = async (e) => {
        e.preventDefault();
        setIsReplying(true);

        try {
            const response = await mensajesService.responder({
                id: selectedMsg.id,
                respuesta: replyText,
                usuario_id: JSON.parse(localStorage.getItem('user'))?.id
            });

            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Respuesta Enviada',
                    text: 'Se ha enviado un correo al cliente.',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { popup: 'rounded-[30px]' }
                });
                fetchMensajes();
                setSelectedMsg(null);
                setReplyText('');
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error al enviar respuesta' });
        } finally {
            setIsReplying(false);
        }
    };

    const markAsRead = async (msg) => {
        if (msg.estado === 'PENDIENTE') {
            try {
                await mensajesService.update({ id: msg.id, estado: 'LEIDO' });
                fetchMensajes();
            } catch (error) {
                console.error(error);
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

    return (
        <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Breadcrumb items={[{ label: 'Dashboard', link: '/admin' }, { label: 'Mensajes' }]} />
                        <h1 className="text-3xl font-black text-[#1e293b] uppercase tracking-tight mt-2 flex items-center gap-3">
                            <MessageSquare className="text-orange-600" size={32} />
                            Bandeja de Entrada
                        </h1>
                        <p className="text-gray-500 font-medium mt-1">Gestiona las consultas y mensajes de tus clientes.</p>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o asunto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['TODOS', 'PENDIENTE', 'LEIDO', 'RESPONDIDO'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === f
                                    ? 'bg-[#1e293b] text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Table */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-black/[0.02] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asunto / Mensaje</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Estado</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Fecha</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <AnimatePresence mode='popLayout'>
                                    {filteredMensajes.length > 0 ? filteredMensajes.map((msg) => (
                                        <motion.tr
                                            key={msg.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-gray-50/50 transition-colors group"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-black">
                                                        {msg.nombre.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#1e293b]">{msg.nombre}</p>
                                                        <p className="text-xs text-gray-500">{msg.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-sm text-[#1e293b] mb-1 line-clamp-1">{msg.asunto}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{msg.mensaje}</p>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${getStatusStyle(msg.estado)}`}>
                                                    {msg.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <p className="text-[10px] font-bold text-gray-500">{new Date(msg.fecha_creacion).toLocaleDateString()}</p>
                                                <p className="text-[9px] text-gray-400">{new Date(msg.fecha_creacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => { setSelectedMsg(msg); markAsRead(msg); }}
                                                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                        title="Ver / Responder"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(msg.id)}
                                                        className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-4 text-gray-400">
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

            {/* View/Reply Modal */}
            <AnimatePresence>
                {selectedMsg && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedMsg(null)}
                            className="absolute inset-0 bg-[#1e293b]/60 backdrop-blur-sm"
                        ></motion.div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="bg-[#1e293b] p-8 text-white relative">
                                <button
                                    onClick={() => setSelectedMsg(null)}
                                    className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-600/30">
                                        {selectedMsg.nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">{selectedMsg.nombre}</h2>
                                        <p className="text-white/60 font-medium">{selectedMsg.email}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="flex items-center gap-2 text-xs font-black text-white/50 uppercase tracking-widest">
                                        <Phone size={14} className="text-orange-500" />
                                        {selectedMsg.telefono || 'Sin teléfono'}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-black text-white/50 uppercase tracking-widest">
                                        <Calendar size={14} className="text-orange-500" />
                                        {new Date(selectedMsg.fecha_creacion).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                                <div>
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Mensaje del Cliente</h3>
                                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 italic text-gray-700 leading-relaxed">
                                        "{selectedMsg.mensaje}"
                                    </div>
                                </div>

                                {selectedMsg.estado === 'RESPONDIDO' ? (
                                    <div>
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Respuesta enviada</h3>
                                        <div className="p-6 bg-green-50 rounded-3xl border border-green-100 text-gray-700">
                                            <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-green-600 uppercase tracking-widest">
                                                <CheckCircle2 size={14} /> Respondido por {selectedMsg.respondido_por || 'Sistema'}
                                            </div>
                                            {selectedMsg.respuesta}
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleReply} className="space-y-4">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Redactar Respuesta</h3>
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            required
                                            rows="4"
                                            placeholder="Escribe tu respuesta aquí para enviarla por correo..."
                                            className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium resize-none shadow-sm"
                                        ></textarea>
                                        <button
                                            type="submit"
                                            disabled={isReplying}
                                            className="w-full py-5 bg-orange-600 text-white rounded-[20px] font-black uppercase tracking-widest text-[10px] hover:bg-orange-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-orange-600/20"
                                        >
                                            {isReplying ? 'Enviando Correo...' : (
                                                <>
                                                    <Send size={16} /> Enviar Respuesta al Cliente
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MensajesAdmin;
