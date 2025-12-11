import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { descuentosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const DescuentosIndex = () => {
    const [descuentos, setDescuentos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const data = await descuentosService.getAll();
            setDescuentos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar descuentos:', error);
            Swal.fire('Error', 'No se pudieron cargar los descuentos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esto desactivará el descuento',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, desactivar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await descuentosService.delete(id);
                Swal.fire('¡Desactivado!', 'El descuento ha sido desactivado', 'success');
                cargarDatos();
            } catch (error) {
                Swal.fire('Error', 'No se pudo desactivar el descuento', 'error');
            }
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Descuentos</h2>
                    <Breadcrumb items={[
                        { label: 'Inicio', link: '/admin', isHome: true },
                        { label: 'Descuentos' }
                    ]} />
                </div>
                <Link
                    to="/admin/descuentos/nuevo"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                    <i className="fas fa-plus"></i>
                    Nuevo Descuento
                </Link>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aplica a</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vigencia</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {descuentos.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No hay descuentos creados
                                    </td>
                                </tr>
                            ) : (
                                descuentos.map((desc, index) => (
                                    <tr key={`${desc.id}-${index}`} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{desc.nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{desc.tipo}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {desc.tipo === 'porcentaje' ? `${desc.valor}%` : `$${desc.valor}`}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="capitalize">{desc.aplica_a}</div>
                                            <div className="text-xs text-gray-400">{desc.afecta_nombre}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>{desc.fecha_inicio}</div>
                                            <div className="text-xs text-gray-400">hasta {desc.fecha_fin}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getEstadoBadge(desc)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/admin/descuentos/editar/${desc.id}`}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </Link>
                                                <button
                                                    onClick={() => handleEliminar(desc.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DescuentosIndex;
