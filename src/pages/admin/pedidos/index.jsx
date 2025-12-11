import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pedidosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';
import Swal from 'sweetalert2';

const PedidosIndex = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('');

    useEffect(() => {
        cargarPedidos();
    }, [filtroEstado]);

    const cargarPedidos = async () => {
        setLoading(true);
        try {
            const data = await pedidosService.getAll(filtroEstado || null);
            setPedidos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
        } finally {
            setLoading(false);
        }
    };



    const getEstadoColor = (estado) => {
        const colors = {
            'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Pagado': 'bg-blue-100 text-blue-800 border-blue-200',
            'En proceso': 'bg-cyan-100 text-cyan-800 border-cyan-200',
            'En Preparación': 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'Enviado': 'bg-purple-100 text-purple-800 border-purple-200',
            'Listo para recoger': 'bg-amber-100 text-amber-800 border-amber-200',
            'Entregado': 'bg-green-100 text-green-800 border-green-200',
            'Completado': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'Cancelado': 'bg-red-100 text-red-800 border-red-200',
            'Devuelto': 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
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
                    <h2 className="text-2xl font-bold text-gray-900">Pedidos</h2>
                    <Breadcrumb items={[
                        { label: 'Inicio', link: '/admin', isHome: true },
                        { label: 'Pedidos' }
                    ]} />
                </div>
                <div>
                    <select
                        className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Pagado">Pagado</option>
                        <option value="En proceso">En proceso</option>
                        <option value="En Preparación">En Preparación</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Listo para recoger">Listo para recoger</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Completado">Completado</option>
                        <option value="Cancelado">Cancelado</option>
                        <option value="Devuelto">Devuelto</option>
                    </select>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pedidos.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <i className="fas fa-box-open text-4xl mb-3 text-gray-300"></i>
                                            <p>No hay pedidos registrados</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pedidos.map(pedido => (
                                    <tr key={pedido.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{pedido.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="font-medium">{pedido.cliente_nombre}</div>
                                            <div className="text-xs text-gray-500">{pedido.correo}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(pedido.fecha).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">${parseFloat(pedido.total).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(pedido.estado)}`}>
                                                {pedido.estado || 'Sin Estado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end">
                                                <Link
                                                    to={`/admin/pedidos/ver/${pedido.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Ver detalles completos"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                                <Link
                                                    to={`/admin/pedidos/editar/${pedido.id}`}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Editar pedido"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </Link>
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

export default PedidosIndex;
