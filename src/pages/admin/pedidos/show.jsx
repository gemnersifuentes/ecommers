import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { pedidosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const PedidosShow = () => {
    const { id } = useParams();
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarPedido();
    }, [id]);

    const cargarPedido = async () => {
        setLoading(true);
        try {
            const data = await pedidosService.getById(id);
            setPedido(data);
        } catch (error) {
            console.error('Error al cargar pedido:', error);
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstado = async (nuevoEstado) => {
        try {
            await pedidosService.updateEstado(id, nuevoEstado);
            Swal.fire('Actualizado', 'Estado del pedido actualizado', 'success');
            cargarPedido();
        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
        }
    };

    const getEstadoBadge = (estado) => {
        const badges = {
            'Pendiente': 'bg-yellow-100 text-yellow-800',
            'Pagado': 'bg-blue-100 text-blue-800',
            'En Preparación': 'bg-indigo-100 text-indigo-800',
            'Enviado': 'bg-purple-100 text-purple-800',
            'Entregado': 'bg-green-100 text-green-800',
            'Cancelado': 'bg-red-100 text-red-800',
            'Devuelto': 'bg-gray-100 text-gray-800'
        };
        return badges[estado] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!pedido) {
        return <div className="text-center py-12">Pedido no encontrado</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Detalle de Pedido #{pedido.id}</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Pedidos', link: '/admin/pedidos' },
                    { label: `Pedido #${pedido.id}` }
                ]} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda: Detalles del Pedido */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Productos</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {pedido.detalles?.map((detalle, index) => (
                                <div key={index} className="p-6 flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{detalle.producto_nombre}</h4>
                                        {detalle.variacion_nombre && (
                                            <p className="text-sm text-gray-500">Variación: {detalle.variacion_nombre}</p>
                                        )}
                                        <p className="text-sm text-gray-500">Cantidad: {detalle.cantidad}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">${parseFloat(detalle.subtotal).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-gray-50 flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="text-xl font-bold text-blue-600">${parseFloat(pedido.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Info Cliente y Estado */}
                <div className="space-y-6">
                    {/* Info Cliente */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Información del Cliente</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Nombre</p>
                                <p className="font-medium text-gray-900">{pedido.cliente_nombre}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Correo</p>
                                <p className="font-medium text-gray-900">{pedido.correo}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Teléfono</p>
                                <p className="font-medium text-gray-900">{pedido.telefono}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Dirección</p>
                                <p className="font-medium text-gray-900">{pedido.direccion}</p>
                            </div>
                        </div>
                    </div>

                    {/* Estado */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Estado del Pedido</h3>
                        <div className="mb-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getEstadoBadge(pedido.estado)}`}>
                                {pedido.estado}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={() => cambiarEstado('Pendiente')}
                                disabled={pedido.estado === 'Pendiente'}
                                className="w-full px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Marcar como Pendiente
                            </button>
                            <button
                                onClick={() => cambiarEstado('Pagado')}
                                disabled={pedido.estado === 'Pagado'}
                                className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Marcar como Pagado
                            </button>
                            <button
                                onClick={() => cambiarEstado('En Preparación')}
                                disabled={pedido.estado === 'En Preparación'}
                                className="w-full px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Marcar como En Preparación
                            </button>
                            <button
                                onClick={() => cambiarEstado('Enviado')}
                                disabled={pedido.estado === 'Enviado'}
                                className="w-full px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Marcar como Enviado
                            </button>
                            <button
                                onClick={() => cambiarEstado('Entregado')}
                                disabled={pedido.estado === 'Entregado'}
                                className="w-full px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Marcar como Entregado
                            </button>
                            <button
                                onClick={() => cambiarEstado('Cancelado')}
                                disabled={pedido.estado === 'Cancelado'}
                                className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Marcar como Cancelado
                            </button>
                            <button
                                onClick={() => cambiarEstado('Devuelto')}
                                disabled={pedido.estado === 'Devuelto'}
                                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Marcar como Devuelto
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PedidosShow;
