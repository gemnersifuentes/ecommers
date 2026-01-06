import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import Breadcrumb from '../components/Breadcrumb';
import {
    Target,
    Eye,
    Cpu,
    ShieldCheck,
    Zap,
    Users,
    Award,
    TrendingUp,
    Monitor,
    ChevronRight,
    Server,
    Smartphone
} from 'lucide-react';

const Nosotros = () => {
    const { settings, loading } = useSettings();

    if (loading) return null;

    const stats = [
        { icon: Award, label: 'Años Liderando', value: '12+', color: 'text-orange-600', bg: 'bg-orange-50' },
        { icon: Users, label: 'Clientes en Red', value: '15k+', color: 'text-blue-600', bg: 'bg-blue-50' },
        { icon: Zap, label: 'Soporte Técnico', value: '24/7', color: 'text-amber-600', bg: 'bg-amber-50' },
        { icon: TrendingUp, label: 'Sedes Activas', value: '3', color: 'text-rose-600', bg: 'bg-rose-50' }
    ];

    const values = [
        {
            icon: Cpu,
            title: 'Eficiencia_Hardware',
            description: 'Seleccionamos cada componente bajo estándares de rendimiento crítico, asegurando que tu inversión tecnológica sea escalable y duradera.',
            accent: 'bg-orange-600'
        },
        {
            icon: ShieldCheck,
            title: 'Respaldo_Técnico',
            description: 'Nuestra garantía no es solo un papel; es un compromiso de soporte nivel 3 para mantener tu operatividad al 99.9%.',
            accent: 'bg-slate-900'
        },
        {
            icon: Monitor,
            title: 'Consultoría_Gaming',
            description: 'Entendemos el ecosistema gaming desde adentro. Optimizamos configuraciones para obtener cada FPS de ventaja competitiva.',
            accent: 'bg-orange-600'
        }
    ];

    return (
        <div className="bg-[#f8fafc] min-h-screen pt-24 pb-20 relative overflow-hidden">
            {/* Background elements like Login page */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/20 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2"></div>

            <div className="container mx-auto px-4 max-w-6xl relative">

                {/* Header Section */}
                <div className="mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center mb-6"
                    >
                        <Breadcrumb items={[{ label: 'Inicio', link: '/' }, { label: 'Corporativo' }]} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm mb-4">
                            <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Misión_Logística_Activa</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none uppercase italic">
                            RedHard<span className="text-orange-600 italic">.Net</span>_About
                        </h1>
                        <p className="max-w-2xl mx-auto text-sm md:text-base text-slate-500 font-medium leading-relaxed">
                            Potenciando la infraestructura tecnológica del país con hardware de alto rendimiento y consultoría especializada en entornos críticos.
                        </p>
                    </motion.div>
                </div>

                {/* Stats Section - Premium Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center group hover:-translate-y-1 transition-all"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                                <stat.icon size={26} strokeWidth={2.5} />
                            </div>
                            <p className="text-2xl font-black text-slate-900 mb-1">{stat.value}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Mission & Vision - Comparison Style Card */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[100px] -z-0 group-hover:bg-orange-100 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-600/20">
                                <Target size={24} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 italic">Nuestra_Misión</h2>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                {settings.mision || "Proveer soluciones de hardware de élite, garantizando el máximo rendimiento y soporte técnico personalizado para cada cliente gaming y corporativo."}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px] -z-0"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 text-orange-500 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                                <Eye size={24} />
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4 italic">Nuestra_Visión</h2>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                {settings.vision || "Ser el principal Hub de tecnología avanzada en la región, liderando la transición hacia infraestructuras digitales más potentes y eficientes."}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Values Section - Premium Grid */}
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden mb-16">
                    <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-600"></div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">ADN_RedHard_Corporativo</h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                        {values.map((v, idx) => (
                            <div key={idx} className="p-10 group hover:bg-slate-50/50 transition-all">
                                <div className={`w-12 h-12 ${v.accent} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-600/10 group-hover:scale-110 transition-transform`}>
                                    <v.icon size={22} />
                                </div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-3 italic group-hover:text-orange-600 transition-colors">{v.title}</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase tracking-tight opacity-70">
                                    {v.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Integration Section - Dark Premium */}
                <div className="relative rounded-[3rem] bg-slate-900 p-12 md:p-20 overflow-hidden text-center md:text-left">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="max-w-md">
                            <h4 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight italic mb-3">
                                ¿Listo para el_ <br />
                                <span className="text-orange-500">Siguiente_Nivel?</span>
                            </h4>
                            <p className="text-sm text-slate-400 font-medium uppercase tracking-widest leading-relaxed">
                                Optimizamos cada byte_ <br />
                                Maximizamos cada setup_
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <a href="/productos" className="px-10 py-4 bg-orange-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all text-center active:scale-95">
                                Catálogo_
                            </a>
                            <a href="/contacto" className="px-10 py-4 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all text-center active:scale-95 backdrop-blur-sm">
                                Contacto_
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <p className="mt-20 text-center text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em] opacity-50">
                &copy; {new Date().getFullYear()} RedHard.Net_Infrastructure
            </p>
        </div>
    );
};

export default Nosotros;
