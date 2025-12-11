import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { serviciosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const ServiciosShow = () => {
    const { id } = useParams();
    const [servicio, setServicio] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarServicio();
    }, [id]);

    const cargarServicio = async () => {
        setLoading(true);
        try {
            const data = await serviciosService.getById(id);
            setServicio(data);
        } catch (error) {
            console.error('Error al cargar servicio:', error);
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

    if (!servicio) {
        return <div className="text-center py-12">Servicio no encontrado</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Detalle de Servicio</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Servicios', link: '/admin/servicios' },
                    { label: servicio.nombre }
                ]} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                            <i className="fas fa-wrench text-blue-600 text-3xl"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{servicio.nombre}</h1>
                            <p className="text-gray-500">ID: {servicio.id}</p>
                        </div>
                    </div>
                    <Link
                        to={`/admin/servicios/editar/${servicio.id}`}
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
                            {servicio.descripcion || 'Sin descripción'}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Detalles</h3>
                        <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Precio:</span>
                                <span className="font-medium">${parseFloat(servicio.precio).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Duración:</span>
                                <span className="font-medium">{servicio.duracion || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiciosShow;
