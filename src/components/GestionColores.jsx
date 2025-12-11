import { useState, useEffect } from 'react';
import { atributosService } from '../services';
import Swal from 'sweetalert2';

const GestionColores = ({ productoId, onClose, onSave }) => {
    const [colores, setColores] = useState([]);
    const [nuevoColor, setNuevoColor] = useState({ valor: '', stock: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (productoId) {
            cargarColores();
        }
    }, [productoId]);

    const cargarColores = async () => {
        try {
            const data = await atributosService.getByProducto(productoId);
            setColores(data.filter(a => a.tipo === 'color'));
        } catch (error) {
            console.error('Error al cargar colores:', error);
        }
    };

    const agregarColor = async () => {
        if (!nuevoColor.valor.trim()) {
            Swal.fire('Error', 'El nombre del color es requerido', 'error');
            return;
        }

        try {
            setLoading(true);
            await atributosService.create(productoId, {
                tipo: 'color',
                valor: nuevoColor.valor,
                stock: parseInt(nuevoColor.stock) || 0
            });

            Swal.fire('Éxito', 'Color agregado correctamente', 'success');
            setNuevoColor({ valor: '', stock: 0 });
            cargarColores();
        } catch (error) {
            Swal.fire('Error', 'No se pudo agregar el color', 'error');
        } finally {
            setLoading(false);
        }
    };

    const actualizarStock = async (atributoId, nuevoStock) => {
        try {
            await atributosService.update(atributoId, { stock: parseInt(nuevoStock) });
            Swal.fire('Éxito', 'Stock actualizado', 'success');
            cargarColores();
        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar el stock', 'error');
        }
    };

    const eliminarColor = async (atributoId) => {
        const result = await Swal.fire({
            title: '¿Eliminar color?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await atributosService.delete(atributoId);
                Swal.fire('Eliminado', 'Color eliminado correctamente', 'success');
                cargarColores();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el color', 'error');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                        🎨 Gestión de Colores
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                {/* Colores existentes */}
                <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-3">Colores disponibles:</h4>
                    {colores.length === 0 ? (
                        <p className="text-gray-500 text-sm">No hay colores registrados</p>
                    ) : (
                        <div className="space-y-2">
                            {colores.map((color) => (
                                <div key={color.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <span className="font-medium">{color.valor}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={color.stock}
                                            onChange={(e) => {
                                                const newColores = colores.map(c =>
                                                    c.id === color.id ? { ...c, stock: e.target.value } : c
                                                );
                                                setColores(newColores);
                                            }}
                                            onBlur={(e) => actualizarStock(color.id, e.target.value)}
                                            className="w-20 px-2 py-1 border rounded text-sm"
                                            min="0"
                                        />
                                        <span className="text-sm text-gray-500">unidades</span>
                                        <button
                                            onClick={() => eliminarColor(color.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Agregar nuevo color */}
                <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Agregar nuevo color:</h4>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Nombre del color (ej. Negro, Cian)"
                            value={nuevoColor.valor}
                            onChange={(e) => setNuevoColor({ ...nuevoColor, valor: e.target.value })}
                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                        <input
                            type="number"
                            placeholder="Stock"
                            value={nuevoColor.stock}
                            onChange={(e) => setNuevoColor({ ...nuevoColor, stock: e.target.value })}
                            className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            min="0"
                        />
                        <button
                            onClick={agregarColor}
                            disabled={loading}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Agregar'}
                        </button>
                    </div>
                </div>

                {/* Botón cerrar */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GestionColores;
