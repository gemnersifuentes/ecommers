import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    User,
    Mail,
    Phone,
    Calendar,
    ArrowLeft,
    Send,
    CheckCircle2,
    Trash2,
    Clock
} from 'lucide-react';
import { mensajesService } from '../../../services';
import Swal from 'sweetalert2';
import Breadcrumb from '../../../components/Breadcrumb';

const MensajeShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mensaje, setMensaje] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    useEffect(() => {
        if (id) {
            fetchMensaje();
        }
    }, [id]);

    const fetchMensaje = async () => {
        try {
            const data = await mensajesService.getAll(); // Using getAll then filtering because service might not have getById
            const found = data.find(m => m.id.toString() === id.toString());

            if (found) {
                setMensaje(found);
                // Mark as read if pending
                if (found.estado === 'PENDIENTE') {
                    await mensajesService.update({ id: found.id, estado: 'LEIDO' });
                }
            } else {
                Swal.fire('Error', 'Mensaje no encontrado', 'error');
                navigate('/admin/mensajes');
            }
        } catch (error) {
            console.error('Error fetching message:', error);
            Swal.fire('Error', 'No se pudo cargar el mensaje', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        setIsReplying(true);

        try {
            const response = await mensajesService.responder({
                id: mensaje.id,
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
                fetchMensaje();
                setReplyText('');
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error al enviar respuesta' });
        } finally {
            setIsReplying(false);
        }
    };

    const handleDelete = async () => {
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
                await mensajesService.delete(mensaje.id);
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: { popup: 'rounded-[30px]' }
                });
                navigate('/admin/mensajes');
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error al eliminar' });
            }
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!mensaje) return null;

    return (
        <div className="p-4 md:p-8 bg-[#f8fafc] dark:bg-[#0b1437] min-h-screen transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/mensajes')}
                            className="p-2 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft size={20} className="text-gray-500 dark:text-gray-400" />
                        </button>
                        <div>
                            <Breadcrumb items={[{ label: 'Dashboard', link: '/admin' }, { label: 'Mensajes', link: '/admin/mensajes' }, { label: 'Detalle' }]} />
                            <h1 className="text-2xl font-black text-[#1e293b] dark:text-white uppercase tracking-tight mt-1">Detalle del Mensaje</h1>
                        </div>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="px-6 py-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Eliminar
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Client Info Card */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#111c44] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-xl shadow-black/[0.02] overflow-hidden p-6 space-y-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-600/20 text-orange-600 dark:text-orange-500 rounded-[24px] flex items-center justify-center font-black text-3xl mb-4">
                                    {mensaje.nombre.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-xl font-black text-[#1e293b] dark:text-white uppercase tracking-tight">{mensaje.nombre}</h2>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">{mensaje.email}</p>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-white/5">
                                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                    <Clock size={16} className="text-orange-600" />
                                    <span className="text-xs font-bold uppercase tracking-widest">{new Date(mensaje.fecha_creacion).toLocaleDateString()} - {new Date(mensaje.fecha_creacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="pt-4">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 text-left">Estado actual</p>
                                    <span className={`inline-block px-4 py-2 rounded-full text-[10px] font-black border uppercase tracking-widest ${mensaje.estado === 'RESPONDIDO' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30' : (mensaje.estado === 'LEIDO' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30')}`}>
                                        {mensaje.estado}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Message & Reply Area */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Message Content */}
                        <div className="bg-white dark:bg-[#111c44] p-8 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-xl shadow-black/[0.02]">
                            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <MessageSquare size={14} className="text-orange-500" /> Asunto: {mensaje.asunto}
                            </h3>
                            <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-[32px] border border-gray-100 dark:border-white/10">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                    {mensaje.mensaje}
                                </p>
                            </div>
                        </div>

                        {/* Reply Form / Response */}
                        <div className="bg-white dark:bg-[#111c44] p-8 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-xl shadow-black/[0.02]">
                            {mensaje.estado === 'RESPONDIDO' ? (
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-green-500" /> Respuesta Enviada
                                    </h3>
                                    <div className="p-8 bg-green-50 dark:bg-green-500/10 rounded-[32px] border border-green-100 dark:border-green-500/20 text-gray-700 dark:text-gray-300 font-medium">
                                        <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-2">Respondido por: {mensaje.respondido_por || 'Admin'}</p>
                                        {mensaje.respuesta}
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleReply} className="bg-[#1e293b] dark:bg-[#1b254b] rounded-[32px] shadow-xl overflow-hidden p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Send className="text-orange-500" size={24} />
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Enviar Respuesta</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Escribe tu respuesta aquí..."
                                                className="w-full bg-white/10 dark:bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 focus:bg-white/20 transition-all font-medium min-h-[150px] resize-none"
                                                required
                                            />
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <p className="text-[10px] text-white/40 font-medium flex items-center gap-2">
                                                <CheckCircle2 size={12} />
                                                Tu respuesta será marcada como leída automáticamente al enviar.
                                            </p>

                                            <button
                                                type="submit"
                                                disabled={isReplying}
                                                className="px-8 py-3 bg-orange-600 text-white rounded-[20px] font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-orange-900/20 hover:bg-orange-500 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-3 disabled:opacity-50 disabled:translate-y-0"
                                            >
                                                {isReplying ? 'Enviando...' : (
                                                    <>
                                                        Enviar Respuesta <Send size={16} />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MensajeShow;
