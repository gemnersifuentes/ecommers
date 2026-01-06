import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
    Copyright,
    Plus,
    Search,
    Edit,
    Trash2,
    Cpu,
    ShieldCheck,
    ChevronRight
} from 'lucide-react';
import { marcasService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const MarcasIndex = () => {
    const [marcas, setMarcas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        cargarMarcas();
    }, []);

    const cargarMarcas = async () => {
        setLoading(true);
        try {
            const data = await marcasService.getAll();
            setMarcas(data);
        } catch (error) {
            console.error('Error al cargar marcas:', error);
            Swal.fire({
                title: 'Error de Red',
                text: 'No se pudo establecer conexión con el servidor.',
                icon: 'error',
                confirmButtonColor: '#f97316'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar socio estratégico?',
            text: 'Esta acción desvinculará la marca del catálogo.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirmar Eliminación',
            cancelButtonText: 'Abortar',
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
                await marcasService.delete(id);
                Swal.fire({
                    title: 'Operación Exitosa',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                cargarMarcas();
            } catch (error) {
                Swal.fire('Error', 'Restricción de integridad: No se puede eliminar.', 'error');
            }
        }
    };

    const filtradas = marcas.filter(m =>
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-[10px] text-gray-400 font-medium">Validando proveedores...</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Copyright size={16} className="text-orange-500" />
                        Marcas y Fabricantes
                    </h1>
                    <Breadcrumb items={[
                        { label: 'Admin', link: '/admin', isHome: true },
                        { label: 'Marcas' }
                    ]} />
                </div>

                <Link
                    to="/admin/marcas/nuevo"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                >
                    <Plus size={14} />
                    Agregar Socio
                </Link>
            </div>

            {/* Search */}
            <div className="max-w-md">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filtrar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence>
                    {filtradas.map((marca, idx) => (
                        <motion.div
                            key={marca.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, delay: idx * 0.05 }}
                            className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:border-orange-200 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                                    <Cpu size={20} />
                                </div>
                                <div className="flex gap-1">
                                    <Link
                                        to={`/admin/marcas/editar/${marca.id}`}
                                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <Edit size={14} />
                                    </Link>
                                    <button
                                        onClick={() => handleEliminar(marca.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <h3 className="text-xs font-bold text-gray-800">{marca.nombre}</h3>
                                    <ShieldCheck size={12} className="text-green-500" />
                                </div>
                                <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                                    {marca.descripcion || 'Sin información adicional del fabricante.'}
                                </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tight">Reg: 00{marca.id}</span>
                                <ChevronRight size={12} className="text-gray-300 group-hover:text-orange-500 transition-colors" />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filtradas.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <Copyright size={40} className="mb-4 opacity-20" />
                    <p className="text-xs font-medium">No se encontraron socios.</p>
                </div>
            )}
        </div>
    );
};

export default MarcasIndex;

