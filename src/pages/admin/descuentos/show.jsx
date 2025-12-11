import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { descuentosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const DescuentosShow = () => {
    const { id } = useParams();
    const [descuento, setDescuento] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDescuento();
    }, [id]);

    const cargarDescuento = async () => {
        setLoading(true);
        try {
            const data = await descuentosService.getById(id);
            setDescuento(data);
        } catch (error) {
            console.error('Error al cargar descuento:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoBadge = (descuento) => {
        const hoy = new Date();
        const inicio = new Date(descuento.fecha_inicio);
        const fin = new Date(descuento.fecha_fin);

        if (!descuento.activo) {
            return <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">Inactivo</span>;
        }
        if (hoy < inicio) {
            return <span className="px-2 py-1 bg-blue-200 text-blue-700 rounded text-xs">Próximo</span>;
        }
        if (hoy > fin) {
            return <span className="px-2 py-1 bg-red-200 text-red-700 rounded text-xs">Vencido</span>;
        }
        return <span className="px-2 py-1 bg-green-200 text-green-700 rounded text-xs">Activo</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!descuento) {
        return <div className="text-center py-12">Descuento no encontrado</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Detalle de Descuento</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Descuentos', link: '/admin/descuentos' },
                    { label: descuento.nombre }
                ]} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
                            <i className="fas fa-percent text-indigo-600 text-3xl"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{descuento.nombre}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-gray-500">ID: {descuento.id}</span>
                                {getEstadoBadge(descuento)}
                            </div>
                        </div>
                    </div>
                    <Link
                        to={`/admin/descuentos/editar/${descuento.id}`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <i className="fas fa-edit mr-2"></i>
                        Editar
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Descripción</h3>
                        <p className="text-gray-900 bg-gray-50 p-4 rounded-xl">
                            {descuento.descripcion || 'Sin descripción'}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Detalles</h3>
                        <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tipo:</span>
                                <span className="font-medium capitalize">{descuento.tipo}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Valor:</span>
                                <span className="font-medium">
                                    {descuento.tipo === 'porcentaje' ? `${descuento.valor}%` : `$${descuento.valor}`}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Aplica a:</span>
                                <span className="font-medium capitalize">{descuento.aplica_a}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Vigencia:</span>
                                <span className="font-medium">{descuento.fecha_inicio} - {descuento.fecha_fin}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DescuentosShow;
