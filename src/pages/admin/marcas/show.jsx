import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marcasService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const MarcasShow = () => {
    const { id } = useParams();
    const [marca, setMarca] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarMarca();
    }, [id]);

    const cargarMarca = async () => {
        setLoading(true);
        try {
            const data = await marcasService.getById(id);
            setMarca(data);
        } catch (error) {
            console.error('Error al cargar marca:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!marca) {
        return <div className="text-center py-12">Marca no encontrada</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Detalle de Marca</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Marcas', link: '/admin/marcas' },
                    { label: marca.nombre }
                ]} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <i className="fas fa-copyright text-3xl"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{marca.nombre}</h1>
                            <p className="text-gray-500">ID: {marca.id}</p>
                        </div>
                    </div>
                    <Link
                        to={`/admin/marcas/editar/${marca.id}`}
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
                            {marca.descripcion || 'Sin descripción'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarcasShow;
