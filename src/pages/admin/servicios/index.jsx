import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
    Wrench,
    Plus,
    Search,
    Edit,
    Trash2,
    Clock,
    DollarSign,
    Layers
} from 'lucide-react';
import { serviciosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const ServiciosIndex = () => {
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const data = await serviciosService.getAll();
            const list = Array.isArray(data) ? data : (data?.data ? data.data : []);
            setServicios(list);
        } catch (error) {
            console.error('Error al cargar servicios:', error);
            Swal.fire({
                title: 'Error de Sistema',
                text: 'No se pudo sincronizar la base de servicios.',
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
            title: '¿Eliminar servicio?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
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
                await serviciosService.delete(id);
                Swal.fire({
                    title: 'Eliminado',
                    text: 'El servicio ha sido retirado del sistema.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                cargarDatos();
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo eliminar el servicio.', 'error');
            }
        }
    };

    const filteredServicios = servicios.filter(s =>
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && servicios.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-xs text-gray-400 font-medium">Sincronizando servicios...</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 min-h-screen">
            {/* Header Simplified */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Wrench size={16} className="text-orange-500" />
                        Gestión de Servicios
                    </h1>
                    <Breadcrumb items={[
                        { label: 'Admin', link: '/admin', isHome: true },
                        { label: 'Servicios' }
                    ]} />
                </div>

                <Link
                    to="/admin/servicios/nuevo"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                >
                    <Plus size={14} />
                    Nuevo Servicio
                </Link>
            </div>

            {/* Middle Bar: Search */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 lg:max-w-md w-full">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre de servicio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Light Industrial Table Area */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-[#f8fafc]/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-4 text-xs font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 whitespace-nowrap text-center w-16">IMG</th>
                                <th className="px-4 py-4 text-xs font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        SERVICIO
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-xs font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 whitespace-nowrap text-center">PRECIO</th>
                                <th className="px-4 py-4 text-xs font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 whitespace-nowrap text-center">DURACIÓN</th>
                                <th className="px-4 py-4 text-xs font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 text-right whitespace-nowrap">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence>
                                {filteredServicios.map((s, idx) => (
                                    <motion.tr
                                        key={s.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        whileHover={{
                                            backgroundColor: "rgba(249, 115, 22, 0.02)",
                                            transition: { duration: 0.2, ease: "easeOut" }
                                        }}
                                        transition={{
                                            opacity: { duration: 0.5, delay: idx * 0.045 },
                                            x: { duration: 0.5, delay: idx * 0.045, ease: [0.16, 1, 0.3, 1] }
                                        }}
                                        className="relative group cursor-default"
                                    >
                                        <td className="px-4 py-3 text-center">
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden mx-auto group-hover:border-orange-200 transition-all duration-300">
                                                {s.imagen ? (
                                                    <img
                                                        src={s.imagen.startsWith('http') ? s.imagen : `http://localhost:8000${s.imagen}`}
                                                        alt={s.nombre}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Wrench size={14} className="text-gray-300" />
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-[#1e293b] uppercase tracking-tight truncate max-w-[250px]" title={s.nombre}>
                                                    {s.nombre}
                                                </p>
                                                <p className="text-xs font-bold text-gray-400 italic truncate max-w-[250px]">
                                                    {s.descripcion || 'Sin descripción adicional'}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <div className="inline-flex items-center gap-1 text-sm font-black text-[#1e293b]">
                                                <DollarSign size={10} className="text-orange-500" />
                                                {parseFloat(s.precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 text-gray-500 rounded border border-gray-100 text-xs font-bold transition-all">
                                                <Clock size={10} />
                                                {s.duracion || 'N/A'}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                {[
                                                    { to: `/admin/servicios/editar/${s.id}`, icon: Edit, label: 'Editar', color: 'hover:text-blue-600 hover:bg-blue-50' },
                                                    { onClick: () => handleEliminar(s.id), icon: Trash2, label: 'Eliminar', color: 'hover:text-red-600 hover:bg-red-50' }
                                                ].map((action, i) => (
                                                    <Link
                                                        key={i}
                                                        to={action.to}
                                                        onClick={action.onClick}
                                                        className={`p-1.5 transition-all duration-300 rounded-lg border-2 border-transparent bg-gray-50 text-[#1e293b] hover:border-[#1e293b]/10 hover:shadow-md ${action.color}`}
                                                        title={action.label}
                                                    >
                                                        <action.icon size={14} strokeWidth={2.5} />
                                                    </Link>
                                                ))}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredServicios.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Wrench size={40} className="mb-4 opacity-20" />
                        <p className="text-xs font-medium">No se encontraron servicios registrados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiciosIndex;
