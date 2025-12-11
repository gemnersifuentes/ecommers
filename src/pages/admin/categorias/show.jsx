import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { categoriasService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const CategoriasShow = () => {
    const { id } = useParams();
    const [categoria, setCategoria] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarCategoria();
    }, [id]);

    const cargarCategoria = async () => {
        setLoading(true);
        try {
            const data = await categoriasService.getById(id);
            setCategoria(data);
        } catch (error) {
            console.error('Error al cargar categoría:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!categoria) {
        return <div className="text-center py-12">Categoría no encontrada</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Detalle de Categoría</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Categorías', link: '/admin/categorias' },
                    { label: categoria.nombre }
                ]} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                            <i className="fas fa-tag text-blue-600 text-3xl"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{categoria.nombre}</h1>
                            <p className="text-gray-500">ID: {categoria.id}</p>
                        </div>
                    </div>
                    <Link
                        to={`/admin/categorias/editar/${categoria.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <i className="fas fa-edit mr-2"></i>
                        Editar
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Descripción</h3>
                        <p className="text-gray-900 bg-gray-50 p-4 rounded-xl">
                            {categoria.descripcion || 'Sin descripción'}
                        </p>
                    </div>

                    {/* Aquí podrías agregar más detalles como productos asociados, fecha de creación, etc. */}
                </div>
            </div>
        </div>
    );
};

export default CategoriasShow;
