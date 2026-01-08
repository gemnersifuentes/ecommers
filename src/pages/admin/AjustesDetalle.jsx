import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Save,
    Building2,
    Mail,
    Phone,
    MapPin,
    Globe,
    Server,
    Link as LinkIcon,
    ShieldCheck,
    Palette,
    FileText,
    Target,
    Eye,
    MessageSquare,
    Facebook,
    Instagram,
    LogIn
} from 'lucide-react';
import { ajustesService } from '../../services';
import Breadcrumb from '../../components/Breadcrumb';
import Swal from 'sweetalert2';

const AjustesDetalle = () => {
    const [ajustes, setAjustes] = useState({
        nombre_empresa: '',
        ruc: '',
        telefono: '',
        correo_contacto: '',
        direccion: '',
        mision: '',
        vision: '',
        smtp_host: '',
        smtp_user: '',
        smtp_pass: '',
        smtp_port: '',
        redes_sociales: {
            facebook: '',
            instagram: '',
            whatsapp: ''
        },
        color_primario: '#f97316',
        color_secundario: '#1e293b',
        google_client_id: '892467941848-u323sdjer75uhgc7cufdj3ae8k08unrn.apps.googleusercontent.com'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        cargarAjustes();
    }, []);

    const cargarAjustes = async () => {
        try {
            const data = await ajustesService.get();
            if (data && !data.error) {
                setAjustes({
                    ...data,
                    redes_sociales: data.redes_sociales || { facebook: '', instagram: '', whatsapp: '' }
                });
            }
        } catch (error) {
            console.error('Error al cargar ajustes:', error);
            Swal.fire('Error', 'No se pudieron cargar los ajustes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setAjustes(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setAjustes(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await ajustesService.update(ajustes);
            if (response.success) {
                Swal.fire({
                    title: '¡Actualizado!',
                    text: 'Los ajustes globales se han guardado correctamente',
                    icon: 'success',
                    confirmButtonColor: '#f97316'
                });
            }
        } catch (error) {
            console.error('Error al guardar ajustes:', error);
            Swal.fire('Error', 'No se pudieron guardar los cambios', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4" />
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Cargando configuración...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-1"
                >
                    <h2 className="text-3xl font-black text-[#1e293b] dark:text-white tracking-tight uppercase">
                        Configuración Global
                    </h2>
                    <Breadcrumb items={[
                        { label: 'Panel', link: '/admin', isHome: true },
                        { label: 'Ajustes' }
                    ]} />
                </motion.div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Columna Izquierda: Identidad y Contacto */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Sección: Identidad de Empresa */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-[#111c44] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden"
                    >
                        <div className="px-8 py-6 border-b border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-[#0b1437]/30 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <Building2 size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-[#1e293b] dark:text-white uppercase tracking-wider">Identidad Corporativa</h3>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tight">Información básica de la empresa</p>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-widest px-1">Nombre Comercial</label>
                                <input
                                    type="text"
                                    name="nombre_empresa"
                                    value={ajustes.nombre_empresa}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-[#0b1437] border-2 border-transparent focus:border-orange-500/20 dark:focus:border-orange-500/40 focus:bg-white dark:focus:bg-[#0b1437] rounded-2xl focus:outline-none transition-all text-xs font-bold text-[#1e293b] dark:text-white"
                                    placeholder="Ej: RedHard SAC"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-widest px-1">RUC / Registro Fiscal</label>
                                <input
                                    type="text"
                                    name="ruc"
                                    value={ajustes.ruc}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-[#0b1437] border-2 border-transparent focus:border-orange-500/20 dark:focus:border-orange-500/40 focus:bg-white dark:focus:bg-[#0b1437] rounded-2xl focus:outline-none transition-all text-xs font-bold text-[#1e293b] dark:text-white"
                                    placeholder="Ej: 20601234567"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-widest px-1">Dirección Física</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={ajustes.direccion}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-5 py-3.5 bg-gray-50 dark:bg-[#0b1437] border-2 border-transparent focus:border-orange-500/20 dark:focus:border-orange-500/40 focus:bg-white dark:focus:bg-[#0b1437] rounded-2xl focus:outline-none transition-all text-xs font-bold text-[#1e293b] dark:text-white"
                                        placeholder="Ej: Av. Las Begonias 123, Lima - Perú"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sección: Misión y Visión */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-[#111c44] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden"
                    >
                        <div className="px-8 py-6 border-b border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-[#0b1437]/30 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Target size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-[#1e293b] dark:text-white uppercase tracking-wider">Filosofía Empresarial</h3>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tight">Propósito y metas a largo plazo</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-widest px-1">Misión</label>
                                <textarea
                                    name="mision"
                                    value={ajustes.mision}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-[#0b1437] border-2 border-transparent focus:border-indigo-500/20 dark:focus:border-indigo-500/40 focus:bg-white dark:focus:bg-[#0b1437] rounded-2xl focus:outline-none transition-all text-xs font-bold text-[#1e293b] dark:text-white resize-none"
                                    placeholder="Nuestra misión es..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-widest px-1">Visión</label>
                                <textarea
                                    name="vision"
                                    value={ajustes.vision}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-[#0b1437] border-2 border-transparent focus:border-indigo-500/20 dark:focus:border-indigo-500/40 focus:bg-white dark:focus:bg-[#0b1437] rounded-2xl focus:outline-none transition-all text-xs font-bold text-[#1e293b] dark:text-white resize-none"
                                    placeholder="Nuestra visión es..."
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Sección: Redes Sociales */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-[#111c44] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden"
                    >
                        <div className="px-8 py-6 border-b border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-[#0b1437]/30 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
                                <Globe size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-[#1e293b] dark:text-white uppercase tracking-wider">Presencia Digital</h3>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tight">Enlaces a perfiles sociales</p>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <Facebook size={12} /> Facebook
                                </label>
                                <input
                                    type="text"
                                    name="redes_sociales.facebook"
                                    value={ajustes.redes_sociales.facebook}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1437] border border-transparent focus:border-sky-500/20 dark:focus:border-sky-500/40 focus:bg-white dark:focus:bg-[#0b1437] rounded-xl focus:outline-none transition-all text-xs font-bold text-[#1e293b] dark:text-white"
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <Instagram size={12} /> Instagram
                                </label>
                                <input
                                    type="text"
                                    name="redes_sociales.instagram"
                                    value={ajustes.redes_sociales.instagram}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1437] border border-transparent focus:border-pink-500/20 dark:focus:border-pink-500/40 focus:bg-white dark:focus:bg-[#0b1437] rounded-xl focus:outline-none transition-all text-xs font-bold text-[#1e293b] dark:text-white"
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <MessageSquare size={12} /> WhatsApp
                                </label>
                                <input
                                    type="text"
                                    name="redes_sociales.whatsapp"
                                    value={ajustes.redes_sociales.whatsapp}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1437] border border-transparent focus:border-emerald-500/20 dark:focus:border-emerald-500/40 focus:bg-white dark:focus:bg-[#0b1437] rounded-xl focus:outline-none transition-all text-xs font-bold text-[#1e293b] dark:text-white"
                                    placeholder="Ej: +51914746440"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Columna Derecha: Configuración Técnica y Botón */}
                <div className="space-y-8">

                    {/* Sección: Configuración SMTP */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-[#111c44] rounded-3xl border border-orange-100 dark:border-orange-500/20 shadow-[0_20px_50px_-20px_rgba(249,115,22,0.1)] overflow-hidden"
                    >
                        <div className="px-8 py-6 border-b border-orange-50 dark:border-white/5 bg-orange-50/20 dark:bg-[#0b1437]/30 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/20">
                                <Server size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-[#1e293b] dark:text-white uppercase tracking-wider">Servidor de Correo</h3>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tight">Configuración técnica SMTP</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-widest px-1">Servidor SMTP</label>
                                <input
                                    type="text"
                                    name="smtp_host"
                                    value={ajustes.smtp_host}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1437] border-2 border-transparent focus:border-orange-500/20 dark:focus:border-orange-500/40 focus:bg-white dark:focus:bg-[#0b1437] rounded-xl focus:outline-none transition-all text-xs font-bold text-[#1e293b] dark:text-white"
                                    placeholder="Ej: smtp.gmail.com"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-widest px-1">Puerto</label>
                                    <input
                                        type="number"
                                        name="smtp_port"
                                        value={ajustes.smtp_port}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1437] border-2 border-transparent focus:border-orange-500/20 dark:focus:border-orange-500/40 focus:bg-white dark:focus:bg-[#0b1437] rounded-xl focus:outline-none transition-all text-xs font-bold text-[#1e293b] dark:text-white"
                                        placeholder="587"
                                    />
                                </div>
                                <div className="col-span-1 flex items-end justify-center pb-3">
                                    <ShieldCheck size={24} className="text-emerald-500 opacity-30 dark:opacity-50" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-widest px-1">Usuario / Email</label>
                                <input
                                    type="email"
                                    name="smtp_user"
                                    value={ajustes.smtp_user}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1437] border-2 border-transparent focus:border-orange-500/20 dark:focus:border-orange-500/40 focus:bg-white dark:focus:bg-[#0b1437] rounded-xl focus:outline-none transition-all text-xs font-bold text-[#1e293b] dark:text-white"
                                    placeholder="user@gmail.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-widest px-1">Clave de Aplicación</label>
                                <input
                                    type="password"
                                    name="smtp_pass"
                                    value={ajustes.smtp_pass}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1437] border-2 border-transparent focus:border-orange-500/20 dark:focus:border-orange-500/40 focus:bg-white dark:focus:bg-[#0b1437] rounded-xl focus:outline-none transition-all text-xs font-bold text-[#1e293b] dark:text-white tracking-widest"
                                    placeholder="•••• •••• •••• ••••"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Sección: Google Integration */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-white dark:bg-[#111c44] rounded-3xl border border-blue-100 dark:border-blue-500/20 shadow-[0_20px_50px_-20px_rgba(59,130,246,0.1)] overflow-hidden"
                    >
                        <div className="px-8 py-6 border-b border-blue-50 dark:border-white/5 bg-blue-50/20 dark:bg-[#0b1437]/30 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <LogIn size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-[#1e293b] dark:text-white uppercase tracking-wider">Google Auth</h3>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tight">API de inicio de sesión</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-widest px-1">Google Client ID</label>
                                <input
                                    type="text"
                                    name="google_client_id"
                                    value={ajustes.google_client_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1437] border-2 border-transparent focus:border-blue-500/20 dark:focus:border-blue-500/40 focus:bg-white dark:focus:bg-[#0b1437] rounded-xl focus:outline-none transition-all text-xs font-bold text-[#1e293b] dark:text-white"
                                    placeholder="XXXX-XXXX.apps.googleusercontent.com"
                                />
                                <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold px-1 uppercase leading-relaxed">
                                    Obtenlo en cloud.google.com {'>'} APIs & Services {'>'} Credentials.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sección: Apariencia */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-[#111c44] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden"
                    >
                        <div className="px-8 py-6 border-b border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-[#0b1437]/30 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-fuchsia-500 text-white flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
                                <Palette size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-[#1e293b] dark:text-white uppercase tracking-wider">Identidad Visual</h3>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tight">Colores y Personalización</p>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-widest px-1">Primario</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        name="color_primario"
                                        value={ajustes.color_primario}
                                        onChange={handleChange}
                                        className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                                    />
                                    <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase">{ajustes.color_primario}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#64748b] dark:text-gray-400 uppercase tracking-widest px-1">Secundario</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        name="color_secundario"
                                        value={ajustes.color_secundario}
                                        onChange={handleChange}
                                        className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                                    />
                                    <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase">{ajustes.color_secundario}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Botón de Guardado Flotante / Al final */}
                    <motion.button
                        type="submit"
                        disabled={saving}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.2em] transition-all shadow-xl ${saving
                            ? 'bg-gray-100 dark:bg-[#0b1437] text-gray-400 dark:text-gray-600 cursor-not-allowed'
                            : 'bg-[#1e293b] dark:bg-orange-600 text-white hover:bg-orange-600 dark:hover:bg-orange-500 shadow-orange-600/20'
                            }`}
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-gray-400 dark:border-gray-600 border-t-white rounded-full animate-spin" />
                                🎬 Guardando...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Confirmar Cambios
                            </>
                        )}
                    </motion.button>

                    <div className="px-6 text-center">
                        <p className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest leading-loose">
                            Esta configuración afecta globalmente a la tienda, incluyendo correos electrónicos y facturación.
                        </p>
                    </div>

                </div>
            </form>
        </div>
    );
};

export default AjustesDetalle;
