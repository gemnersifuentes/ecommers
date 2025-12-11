import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
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
            Swal.fire('Error', 'No se pudieron cargar las marcas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280'
        });

        if (result.isConfirmed) {
            try {
                await marcasService.delete(id);
                Swal.fire('Eliminado', 'Marca eliminada exitosamente', 'success');
                cargarMarcas();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar la marca', 'error');
            }
        }
    };

    const marcasFiltradas = marcas.filter(marca =>
        marca.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Marcas</h2>
                    <Breadcrumb items={[
                        { label: 'Inicio', link: '/admin', isHome: true },
                        { label: 'Marcas' }
                    ]} />
                </div>
                <Link
                    to="/admin/marcas/nuevo"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                    <i className="fas fa-plus"></i>
                    Nueva Marca
                </Link>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="relative">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="text"
                        placeholder="Buscar marcas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Marcas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {marcasFiltradas.map((marca, index) => (
                        <motion.div
                            key={marca.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                        <i className="fas fa-copyright text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">{marca.nombre}</h3>
                                        <p className="text-xs text-gray-500">ID: {marca.id}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link
                                        to={`/admin/marcas/editar/${marca.id}`}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </Link>
                                    <button
                                        onClick={() => handleEliminar(marca.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>

                            {marca.descripcion && (
                                <p className="text-sm text-gray-600 line-clamp-2">{marca.descripcion}</p>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {marcasFiltradas.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <i className="fas fa-copyright text-gray-300 text-5xl mb-4"></i>
                    <p className="text-gray-500 font-medium">No se encontraron marcas</p>
                </div>
            )}
        </div>
    );
};

export default MarcasIndex;
