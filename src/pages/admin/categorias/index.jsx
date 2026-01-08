import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
    Tag,
    Plus,
    Search,
    Edit,
    Trash2,
    Layers,
    ChevronRight,
    Type,
    FileText,
    Eye
} from 'lucide-react';
import { categoriasService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const CategoriasIndex = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const data = await categoriasService.getAll();
            setCategorias(data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar las categorías',
                icon: 'error',
                confirmButtonColor: '#4f46e5'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar categoría?',
            text: 'Esto podría afectar a los productos vinculados.',
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
                await categoriasService.delete(id);
                Swal.fire({
                    title: 'Eliminado',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                cargarDatos();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar la categoría', 'error');
            }
        }
    };

    const filtradas = categorias.filter(c =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-[10px] text-gray-400 font-medium">Cargando categorías...</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 bg-gray-50 dark:bg-[#0b1437] min-h-screen transition-colors duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Layers size={16} className="text-indigo-600" />
                        Gestión de Categorías
                    </h1>
                    <Breadcrumb items={[
                        { label: 'Admin', link: '/admin', isHome: true },
                        { label: 'Categorías' }
                    ]} />
                </div>

                <Link
                    to="/admin/categorias/nuevo"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={14} />
                    Nueva Categoría
                </Link>
            </div>

            {/* Search Bar */}
            <div className="max-w-md">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar categoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-800 dark:text-white focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence>
                    {filtradas.map((categoria, idx) => (
                        <motion.div
                            key={categoria.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, delay: idx * 0.05 }}
                            className="group bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all"
                        >
                            <div className={`flex items-start justify-between mb-3 ${!categoria.activo ? 'opacity-60' : ''}`}>
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Tag size={16} />
                                </div>
                                <div className="flex gap-1">
                                    <div className={`mr-2 flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${categoria.activo
                                        ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                        : 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                                        }`}>
                                        {categoria.activo ? 'Activo' : 'Inactivo'}
                                    </div>
                                    <Link
                                        to={`/admin/categorias/ver/${categoria.id}`}
                                        className="p-1.5 transition-all duration-300 rounded-lg border-2 border-transparent bg-gray-50 dark:bg-white/5 text-[#1e293b] dark:text-gray-400 hover:border-[#1e293b]/10 dark:hover:border-white/20 hover:shadow-md hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/5"
                                        title="Ver Detalles"
                                    >
                                        <Eye size={14} strokeWidth={2.5} />
                                    </Link>
                                    <Link
                                        to={`/admin/categorias/editar/${categoria.id}`}
                                        className="p-1.5 transition-all duration-300 rounded-lg border-2 border-transparent bg-gray-50 dark:bg-white/5 text-[#1e293b] dark:text-gray-400 hover:border-[#1e293b]/10 dark:hover:border-white/20 hover:shadow-md hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/5"
                                        title="Editar"
                                    >
                                        <Edit size={14} strokeWidth={2.5} />
                                    </Link>
                                </div>
                            </div>

                            <div className={`space-y-1 ${!categoria.activo ? 'opacity-60' : ''}`}>
                                <h3 className="text-xs font-bold text-gray-800 dark:text-white">{categoria.nombre}</h3>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">
                                    {categoria.descripcion || 'Sin descripción técnica registrada.'}
                                </p>
                            </div>

                            <Link
                                to={`/admin/categorias/ver/${categoria.id}`}
                                className={`mt-4 pt-3 border-t border-gray-50 dark:border-white/5 flex items-center justify-between group/link ${!categoria.activo ? 'opacity-60' : ''}`}
                            >
                                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 group-hover/link:text-indigo-600 transition-colors">ID: {categoria.id}</span>
                                <ChevronRight size={12} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-600 transition-colors" />
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filtradas.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                    <Layers size={40} className="mb-4 opacity-20" />
                    <p className="text-xs font-medium">No se encontraron categorías.</p>
                </div>
            )}
        </div>
    );
};

export default CategoriasIndex;

