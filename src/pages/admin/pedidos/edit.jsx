import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { pedidosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const PedidosEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pedido, setPedido] = useState(null);
    const [estado, setEstado] = useState('');

    useEffect(() => {
        // Debugging logs to verify ID
        console.log("PedidosEdit mounted. ID param:", id);

        if (id && id !== 'undefined') {
            cargarPedido();
        } else {
            console.error("ID is undefined or invalid");
            setLoading(false);
            // Don't alert immediately on mount to avoid spam if it's a momentary route flush,
            // but the UI will show the error state.
        }
    }, [id]);

    const cargarPedido = async () => {
        setLoading(true);
        try {
            console.log("Fetching pedido param:", id);
            const data = await pedidosService.getById(id);
            console.log("Pedido data received:", data);

            if (!data) {
                throw new Error("No data received");
            }

            setPedido(data);
            setEstado(data.estado);
        } catch (error) {
            console.error('Error al cargar pedido:', error);
            Swal.fire('Error', 'No se pudo cargar el pedido. Verifique la consola.', 'error');
            navigate('/admin/pedidos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await pedidosService.updateEstado(id, estado);
            Swal.fire('Actualizado', 'El estado del pedido ha sido actualizado', 'success');
            navigate('/admin/pedidos');
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo actualizar el pedido', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!pedido) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 mb-4 font-bold">Error: No se encontró el pedido.</p>
                <p className="text-gray-600 mb-4">ID solicitado: {id}</p>
                <Link to="/admin/pedidos" className="text-blue-600 underline hover:text-blue-800">
                    Volver a la lista de pedidos
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Editar Pedido #{pedido.id}</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Pedidos', link: '/admin/pedidos' },
                    { label: `Editar #${pedido.id}` }
                ]} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulario de Edición */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                            Actualizar Estado
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between items-center">
                                    <span>Estado del Pedido</span>
                                    {pedido.metodo_envio === 'tienda' ? (
                                        <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-orange-100 text-orange-700">
                                            Retiro en Tienda
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-blue-100 text-blue-700">
                                            Envío a Domicilio
                                        </span>
                                    )}
                                </label>
                                <select
                                    value={estado}
                                    onChange={(e) => setEstado(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                >
                                    {(() => {
                                        const method = pedido.metodo_envio ? pedido.metodo_envio.toLowerCase().trim() : 'domicilio';
                                        const isPickup = method === 'tienda';

                                        const estadosComunes = ['Pendiente', 'Pagado', 'En proceso', 'En Preparación'];
                                        const estadosFinales = ['Entregado', 'Completado', 'Cancelado', 'Devuelto'];

                                        const estadosDomicilio = [...estadosComunes, 'Enviado', ...estadosFinales];
                                        const estadosTienda = [...estadosComunes, 'Listo para recoger', ...estadosFinales];

                                        const opciones = isPickup ? estadosTienda : estadosDomicilio;

                                        return opciones.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ));
                                    })()}
                                </select>
                                <div className="mt-2 text-sm text-gray-500 flex items-start gap-2">
                                    <i className="fas fa-info-circle mt-0.5"></i>
                                    <p>
                                        {pedido.metodo_envio === 'tienda'
                                            ? 'Modo Retiro en Tienda activo: Se muestra "Listo para recoger" y se oculta "Enviado".'
                                            : 'Modo Envío a Domicilio activo: Se muestra "Enviado" y se oculta "Listo para recoger".'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                                <Link
                                    to="/admin/pedidos"
                                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Guardando...
                                        </>
                                    ) : (
                                        'Guardar Cambios'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Resumen del Pedido (Solo lectura) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                            Resumen del Pedido
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Cliente</p>
                                <p className="font-medium text-gray-900">{pedido.cliente_nombre}</p>
                                <p className="text-sm text-gray-600">{pedido.correo}</p>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Total</p>
                                <p className="text-xl font-bold text-blue-600">
                                    ${parseFloat(pedido.total).toFixed(2)}
                                </p>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Fecha</p>
                                <p className="text-sm text-gray-900">
                                    {new Date(pedido.fecha).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PedidosEdit;
