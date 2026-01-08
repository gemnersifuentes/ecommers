import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
    Tag,
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    Calendar,
    Percent,
    DollarSign,
    Box,
    Layers,
    Cpu
} from 'lucide-react';
import { descuentosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const DescuentosIndex = () => {
    const [descuentos, setDescuentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const data = await descuentosService.getAll();
            const list = Array.isArray(data) ? data : (data?.data ? data.data : []);
            setDescuentos(list);
        } catch (error) {
            console.error('Error al cargar descuentos:', error);
            Swal.fire({
                title: 'Error de Sistema',
                text: 'No se pudo sincronizar la base de descuentos.',
                icon: 'error',
                confirmButtonColor: '#f97316'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Desactivar oferta?',
            text: 'El descuento dejará de aplicarse inmediatamente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, desactivar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            customClass: {
                popup: 'rounded-xl',
                title: 'text-sm font-bold',
                htmlContainer: 'text-xs'
            }
        });

        if (result.isConfirmed) {
            try {
                // Assuming deactivate logic remains the same (delete just sets active=0 in many cases or actually deletes)
                await descuentosService.delete(id);
                Swal.fire({
                    title: 'Desactivado',
                    text: 'La promoción ha sido retirada del sistema.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                cargarDatos();
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo retirar el descuento.', 'error');
            }
        }
    };

    const getEstadoBadge = (d) => {
        const hoy = new Date();
        const inicio = new Date(d.fecha_inicio);
        const fin = new Date(d.fecha_fin);

        if (d.activo === 0) return { label: 'inactivo', color: 'bg-gray-50 text-gray-400 border-gray-200' };
        if (hoy < inicio) return { label: 'programado', color: 'bg-blue-50 text-blue-600 border-blue-100/50' };
        if (hoy > fin) return { label: 'expirado', color: 'bg-red-50 text-red-600 border-red-100/50' };
        return { label: 'activo', color: 'bg-emerald-50 text-emerald-600 border-emerald-100/50' };
    };

    const filteredDescuentos = descuentos.filter(d =>
        d.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && descuentos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-xs text-gray-400 font-medium">Sincronizando ofertas...</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 min-h-screen">
            {/* Header Simplified */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Tag size={16} className="text-orange-500" />
                        Gestión de Descuentos
                    </h1>
                    <Breadcrumb items={[
                        { label: 'Admin', link: '/admin', isHome: true },
                        { label: 'Descuentos' }
                    ]} />
                </div>

                <Link
                    to="/admin/descuentos/nuevo"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 dark:bg-orange-600 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 dark:hover:bg-orange-50 transition-colors shadow-sm"
                >
                    <Plus size={14} />
                    Nuevo Descuento
                </Link>
            </div>

            {/* Middle Bar: Search */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 lg:max-w-md w-full">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre de campaña..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                </div>
            </div>

            {/* Light Industrial Table Area */}
            <div className="bg-white dark:bg-[#111c44] rounded-2xl border border-gray-200 dark:border-white/5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-[#f8fafc]/80 dark:bg-[#0b1437]/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 dark:border-white/5">
                            <tr>
                                <th className="px-4 py-4 text-xs font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        CAMPAÑA
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-xs font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 whitespace-nowrap text-center">TIPO</th>
                                <th className="px-4 py-4 text-xs font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 whitespace-nowrap text-center">VALOR</th>
                                <th className="px-4 py-4 text-xs font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 whitespace-nowrap">APLICACIÓN</th>
                                <th className="px-4 py-4 text-xs font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 whitespace-nowrap">VIGENCIA</th>
                                <th className="px-4 py-4 text-xs font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 text-center whitespace-nowrap">ESTADO</th>
                                <th className="px-4 py-4 text-xs font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 text-right whitespace-nowrap">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            <AnimatePresence>
                                {filteredDescuentos.map((d, idx) => {
                                    const badge = getEstadoBadge(d);
                                    return (
                                        <motion.tr
                                            key={d.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
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
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-orange-200 dark:group-hover:border-orange-500 transition-all duration-300">
                                                        <Tag size={12} className="text-orange-500 dark:text-orange-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-black text-[#1e293b] dark:text-gray-200 uppercase tracking-tight truncate max-w-[180px]" title={d.nombre}>
                                                            {d.nombre}
                                                        </p>
                                                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 italic truncate max-w-[180px]">
                                                            {d.descripcion || 'Sin descripción adicional'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-black text-xs uppercase tracking-widest border ${d.tipo === 'porcentaje' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100/50 dark:border-blue-500/20' : 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100/50 dark:border-purple-500/20'}`}>
                                                    {d.tipo === 'porcentaje' ? <Percent size={10} /> : <DollarSign size={10} />}
                                                    {d.tipo.replace('_', ' ')}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-center font-mono">
                                                <span className="text-sm font-black text-[#1e293b] dark:text-gray-200">
                                                    {d.tipo === 'porcentaje' ? `${parseFloat(d.valor)}%` : `$${parseFloat(d.valor).toLocaleString()}`}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    {d.aplica_a === 'producto' && <Box size={12} className="text-gray-400 dark:text-gray-600" />}
                                                    {d.aplica_a === 'categoria' && <Layers size={12} className="text-gray-400 dark:text-gray-600" />}
                                                    {d.aplica_a === 'marca' && <Cpu size={12} className="text-gray-400 dark:text-gray-600" />}
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-gray-400 dark:text-gray-600 uppercase tracking-tighter">{d.aplica_a}</span>
                                                        <span className="text-xs font-bold text-[#1e293b] dark:text-gray-300 truncate max-w-[120px]">
                                                            {d.afecta_nombre || 'General'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                                                    <Calendar size={12} className="text-gray-300 dark:text-gray-600" />
                                                    <div className="flex flex-col">
                                                        <span>{d.fecha_inicio.split(' ')[0]}</span>
                                                        <span className="text-[10px] opacity-70">hasta {d.fecha_fin.split(' ')[0]}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm font-black text-xs tracking-[0.05em] border-2 transition-all whitespace-nowrap ${badge.label === 'inactivo' ? 'dark:bg-white/5 dark:text-gray-500 dark:border-white/10' : (badge.label === 'programado' ? 'dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' : (badge.label === 'expirado' ? 'dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : 'dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'))} ${badge.color}`}>
                                                    <div className="relative flex items-center justify-center">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${badge.label === 'activo' ? 'bg-emerald-500 animate-ping' : (badge.label === 'programado' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600')}`} />
                                                        <div className={`absolute w-1.5 h-1.5 rounded-full ${badge.label === 'activo' ? 'bg-emerald-500' : (badge.label === 'programado' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600')}`} />
                                                    </div>
                                                    {badge.label}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    {[
                                                        { to: `/admin/descuentos/editar/${d.id}`, icon: Edit, label: 'Editar', color: 'hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/5' },
                                                        { onClick: () => handleEliminar(d.id), icon: Trash2, label: 'Baja', color: 'hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5' }
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
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredDescuentos.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Tag size={40} className="mb-4 opacity-20" />
                        <p className="text-xs font-medium">No se encontraron campañas vigentes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DescuentosIndex;
