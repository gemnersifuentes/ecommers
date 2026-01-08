import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../services/api';

const GestionEspecificaciones = ({ productoId, onChange }) => {
    const [especificaciones, setEspecificaciones] = useState([]);
    const [nuevaSpec, setNuevaSpec] = useState({ nombre: '', valor: '' });
    const [loading, setLoading] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (productoId) {
            cargarEspecificaciones();
        }
    }, [productoId]);

    // Notificar cambios al padre siempre que haya cambios
    useEffect(() => {
        if (onChange) {
            onChange(especificaciones);
        }
    }, [especificaciones, onChange]);

    const cargarEspecificaciones = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/especificaciones?producto_id=${productoId}`);
            if (Array.isArray(response.data)) {
                setEspecificaciones(response.data);
            } else {
                setEspecificaciones([]);
            }
        } catch (error) {
            console.error('Error al cargar especificaciones:', error);
            setEspecificaciones([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAgregar = () => {
        const newErrors = {};
        if (!nuevaSpec.nombre.trim()) newErrors.nombre = 'La característica es requerida';
        if (!nuevaSpec.valor.trim()) newErrors.valor = 'El valor es requerido';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});

        const nuevas = [...especificaciones, { ...nuevaSpec }];
        setEspecificaciones(nuevas);
        setNuevaSpec({ nombre: '', valor: '' });
    };

    const handleEliminar = (index) => {
        const nuevas = [...especificaciones];
        nuevas.splice(index, 1);
        setEspecificaciones(nuevas);
    };

    const handleGuardar = async () => {
        if (!productoId) return; // No debería llamarse si no hay ID

        setGuardando(true);
        try {
            await api.post('/especificaciones', {
                producto_id: productoId,
                especificaciones: especificaciones
            });
            Swal.fire('Éxito', 'Especificaciones guardadas correctamente', 'success');
        } catch (error) {
            console.error('Error al guardar:', error);
            Swal.fire('Error', 'No se pudieron guardar las especificaciones', 'error');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#111c44] rounded-xl shadow-sm border border-gray-200 dark:border-white/5 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <i className="fas fa-list-ul text-blue-600 dark:text-blue-400"></i> Ficha Técnica
                </h3>
                {productoId && (
                    <button
                        type="button"
                        onClick={handleGuardar}
                        disabled={guardando}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold flex items-center gap-2"
                    >
                        {guardando ? (
                            <><i className="fas fa-spinner fa-spin"></i> Guardando...</>
                        ) : (
                            <><i className="fas fa-save"></i> Guardar Cambios</>
                        )}
                    </button>
                )}
            </div>

            <div className="p-6">
                {/* Formulario Agregar */}
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg mb-6 border border-gray-200 dark:border-white/10">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <i className="fas fa-plus-circle text-blue-600 dark:text-blue-400"></i> Nueva Especificación
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Característica</label>
                            <input
                                type="text"
                                placeholder="Ej: Procesador, Pantalla..."
                                value={nuevaSpec.nombre}
                                onChange={(e) => {
                                    setNuevaSpec({ ...nuevaSpec, nombre: e.target.value });
                                    if (errors.nombre) setErrors({ ...errors, nombre: null });
                                }}
                                className={`w-full px-3 py-2 bg-white dark:bg-[#0b1437] border dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.nombre ? 'border-red-500' : ''}`}
                            />
                            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Valor</label>
                            <input
                                type="text"
                                placeholder="Ej: Intel Core i7, 15.6 pulgadas..."
                                value={nuevaSpec.valor}
                                onChange={(e) => {
                                    setNuevaSpec({ ...nuevaSpec, valor: e.target.value });
                                    if (errors.valor) setErrors({ ...errors, valor: null });
                                }}
                                className={`w-full px-3 py-2 bg-white dark:bg-[#0b1437] border dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.valor ? 'border-red-500' : ''}`}
                            />
                            {errors.valor && <p className="text-red-500 text-xs mt-1">{errors.valor}</p>}
                        </div>
                        <button
                            type="button"
                            onClick={handleAgregar}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold h-[38px]"
                        >
                            Agregar
                        </button>
                    </div>
                </div>

                {/* Lista de Especificaciones */}
                {loading ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">Cargando especificaciones...</div>
                ) : especificaciones.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-white/5 rounded-lg border border-dashed border-gray-300 dark:border-white/10">
                        No hay especificaciones técnicas agregadas.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/5">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                                <tr>
                                    <th className="px-4 py-3 w-1/3">Característica</th>
                                    <th className="px-4 py-3 w-1/3">Valor</th>
                                    <th className="px-4 py-3 text-right w-1/6">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                {especificaciones.map((spec, index) => (
                                    <tr key={index} className="bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                            {spec.nombre}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                            {spec.valor}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleEliminar(index)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                                                title="Eliminar"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestionEspecificaciones;
