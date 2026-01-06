import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import Breadcrumb from '../components/Breadcrumb';
import { Mail, Phone, MapPin, Send, ShieldCheck, Clock, Headphones } from 'lucide-react';
import { mensajesService } from '../services';
import Swal from 'sweetalert2';

const Contacto = () => {
    const { settings, loading } = useSettings();
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: ''
    });
    const [sending, setSending] = useState(false);

    if (loading) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);

        try {
            const response = await mensajesService.create(formData);
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Mensaje Enviado!',
                    text: 'Nuestro equipo técnico procesará su requerimiento en breve.',
                    confirmButtonColor: '#f97316',
                    customClass: {
                        popup: 'rounded-[2rem] border-none shadow-2xl',
                        confirmButton: 'rounded-xl px-12 py-3 font-black uppercase tracking-widest text-xs'
                    }
                });
                setFormData({
                    nombre: '',
                    email: '',
                    telefono: '',
                    asunto: '',
                    mensaje: ''
                });
            } else {
                throw new Error(response.error || 'Error al enviar');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error de Sistema',
                text: 'No pudimos procesar tu mensaje. Reintente.',
                confirmButtonColor: '#ef4444',
                customClass: {
                    popup: 'rounded-[2rem]'
                }
            });
        } finally {
            setSending(false);
        }
    };

    const contactItems = [
        {
            icon: Phone,
            label: 'Atención Directa',
            value: settings.telefono || '+51 914 746 440',
            sub: 'LUN-SAB / 09:00 - 20:00',
            color: 'text-orange-600',
            bg: 'bg-orange-50'
        },
        {
            icon: Mail,
            label: 'Canal Digital',
            value: settings.correo_contacto || 'contacto@redhard.net',
            sub: 'Consultoría Técnica IT',
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            icon: MapPin,
            label: 'Hub Logístico',
            value: settings.direccion || 'Av. Las Begonias 123, San Isidro, Lima',
            sub: 'Taller de Ensamblaje',
            color: 'text-slate-900',
            bg: 'bg-slate-50'
        }
    ];

    return (
        <div className="bg-[#f8fafc] min-h-screen pt-24 pb-24 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-50/50 to-transparent"></div>
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-orange-100/30 rounded-full blur-[120px]"></div>

            <div className="container mx-auto px-4 max-w-6xl relative z-10">

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 flex justify-center"
                >
                    <Breadcrumb items={[{ label: 'Inicio', link: '/' }, { label: 'Canales de Contacto' }]} />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    {/* Left Side: Info Cards */}
                    <div className="lg:col-span-5 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden"
                        >
                            <div className="h-2 w-full bg-orange-600 absolute top-0 left-0"></div>
                            <div className="flex items-center gap-2 mb-6">
                                <Headphones size={18} className="text-orange-600" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Soporte Técnico Especializado</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none mb-6 italic uppercase">
                                Hablemos_ <br />
                                <span className="text-orange-600">Hardware_</span>
                            </h1>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Resolvemos tus requerimientos de infraestructura IT y gaming con precisión técnica. Despliegue de soluciones inmediatas.
                            </p>
                        </motion.div>

                        <div className="space-y-4">
                            {contactItems.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-center gap-6 p-6 bg-white rounded-[2rem] shadow-lg shadow-slate-200/40 border border-slate-100 group hover:border-orange-200/50 transition-all"
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                                        <item.icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                                        <p className="text-base font-black text-slate-900 uppercase tracking-tight">{item.value}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest leading-none">{item.sub}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 bg-slate-900 rounded-[2rem] text-white flex items-center gap-6 shadow-2xl shadow-slate-900/20"
                        >
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                <ShieldCheck size={28} strokeWidth={2.5} className="text-orange-500" />
                            </div>
                            <div>
                                <p className="text-sm font-black uppercase tracking-tight leading-none mb-1 italic">Entorno_Cifrado_SSL</p>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">Protección estratégica de datos.</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side: Contact Form (Login Style) */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden relative"
                        >
                            <div className="h-2 w-full bg-orange-600"></div>
                            <div className="p-10 md:p-14">
                                <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic mb-1">Ticket_Soporte</h3>
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Emisión de requerimiento directo al equipo RedHard.</p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Sistemas_Online</span>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Responsable</label>
                                            <input
                                                required
                                                type="text"
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleChange}
                                                placeholder="NOMBRE_APELLIDO"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-orange-600/50 focus:bg-white focus:ring-4 focus:ring-orange-600/5 transition-all font-bold text-slate-700 text-sm placeholder:opacity-30"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Corporativo</label>
                                            <input
                                                required
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="CORREO@DOMINIO.COM"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-orange-600/50 focus:bg-white focus:ring-4 focus:ring-orange-600/5 transition-all font-bold text-slate-700 text-sm placeholder:opacity-30"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número de Enlace</label>
                                            <input
                                                type="tel"
                                                name="telefono"
                                                value={formData.telefono}
                                                onChange={handleChange}
                                                placeholder="+51 000 000 000"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-orange-600/50 focus:bg-white focus:ring-4 focus:ring-orange-600/5 transition-all font-bold text-slate-700 text-sm placeholder:opacity-30"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motivo_Asunto</label>
                                            <input
                                                required
                                                type="text"
                                                name="asunto"
                                                value={formData.asunto}
                                                onChange={handleChange}
                                                placeholder="EJ. SOPORTE_TECNICO"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-orange-600/50 focus:bg-white focus:ring-4 focus:ring-orange-600/5 transition-all font-bold text-slate-700 text-sm placeholder:opacity-30"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción del Requerimiento</label>
                                        <textarea
                                            required
                                            name="mensaje"
                                            value={formData.mensaje}
                                            onChange={handleChange}
                                            rows="4"
                                            placeholder="INGRESE SU MENSAJE..."
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:border-orange-600/50 focus:bg-white focus:ring-4 focus:ring-orange-600/5 transition-all font-bold text-slate-700 text-sm resize-none leading-relaxed placeholder:opacity-30"
                                        ></textarea>
                                    </div>

                                    <button
                                        disabled={sending}
                                        type="submit"
                                        className="w-full py-5 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-xl shadow-orange-600/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] group"
                                    >
                                        {sending ? (
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send size={16} strokeWidth={3} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                Emitir_Solicitud_
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="flex items-center justify-center gap-2 mt-10 pt-8 border-t border-slate-50">
                                    <Clock size={12} className="text-slate-400" />
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Tiempo de respuesta estimado: 60 - 120 MINS</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <p className="mt-20 text-center text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">
                &copy; {new Date().getFullYear()} RedHard.Net_Support_Infrastructure
            </p>
        </div>
    );
};

export default Contacto;
