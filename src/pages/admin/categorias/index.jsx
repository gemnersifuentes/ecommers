import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { categoriasService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const CategoriasIndex = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);

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
            Swal.fire('Error', 'No se pudieron cargar las categorías', 'error');
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
                await categoriasService.delete(id);
                Swal.fire('Eliminado', 'Categoría eliminada exitosamente', 'success');
                cargarDatos();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar la categoría', 'error');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Categorías</h2>
                    <Breadcrumb items={[
                        { label: 'Inicio', link: '/admin', isHome: true },
                        { label: 'Categorías' }
                    ]} />
                </div>
                <Link
                    to="/admin/categorias/nuevo"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                    <i className="fas fa-plus"></i>
                    Nueva Categoría
                </Link>
            </div>

            {/* Grid de Categorías */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorias.map(categoria => (
                    <div key={categoria.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <i className="fas fa-tag text-blue-600 text-xl"></i>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    to={`/admin/categorias/editar/${categoria.id}`}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <i className="fas fa-edit"></i>
                                </Link>
                                <button
                                    onClick={() => handleEliminar(categoria.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{categoria.nombre}</h3>
                        <p className="text-sm text-gray-500">{categoria.descripcion || 'Sin descripción'}</p>
                    </div>
                ))}
            </div>

            {categorias.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <i className="fas fa-tags text-gray-300 text-5xl mb-4"></i>
                    <p className="text-gray-500 font-medium">No hay categorías registradas</p>
                </div>
            )}
        </div>
    );
};

export default CategoriasIndex;
