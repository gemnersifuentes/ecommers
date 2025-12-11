import { useState, useEffect } from 'react';
import { variacionesService, catalogosService } from '../services';
import Swal from 'sweetalert2';

const GestionVariantes = ({ productoId, onClose, onSave, onChange, embedded = false }) => {
    const [variantes, setVariantes] = useState([]);
    const [atributosGlobales, setAtributosGlobales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [nuevaVariante, setNuevaVariante] = useState({
        atributo_id: '',
        valor_id: '',
        precio: '',
        stock: '',
        sku: '',
        imagen: ''
    });

    useEffect(() => {
        cargarDatos();
    }, [productoId]);

    useEffect(() => {
        if (!productoId && onChange) {
            onChange(variantes);
        }
    }, [variantes, productoId, onChange]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const atributosData = await catalogosService.getAtributos();
            if (Array.isArray(atributosData)) {
                setAtributosGlobales(atributosData);
                if (atributosData.length > 0) {
                    setNuevaVariante(prev => ({ ...prev, atributo_id: atributosData[0].id }));
                }
            } else {
                console.error('Atributos data is not an array:', atributosData);
                setAtributosGlobales([]);
            }

            if (productoId) {
                const variantesData = await variacionesService.getByProducto(productoId);
                setVariantes(Array.isArray(variantesData) ? variantesData : []);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAtributoChange = (e) => {
        const attrId = parseInt(e.target.value);
        setNuevaVariante({
            ...nuevaVariante,
            atributo_id: attrId,
            valor_id: '',
            precio: ''
        });
        setErrors({});
    };

    const handleImagenVarianteChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            Swal.fire('Error', 'Solo se permiten archivos de imagen', 'error');
            return;
        }

        const formDataImg = new FormData();
        formDataImg.append('imagen', file);

        try {
            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formDataImg
            });
            const data = await response.json();

            if (data.success && data.url) {
                setNuevaVariante({ ...nuevaVariante, imagen: data.url });
                Swal.fire({
                    icon: 'success',
                    title: 'Imagen subida',
                    text: 'La imagen se ha subido correctamente',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                Swal.fire('Error', data.message || 'Error al subir imagen', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'Error al subir la imagen', 'error');
        }
    };

    const agregarVariante = async () => {
        const newErrors = {};
        if (!nuevaVariante.valor_id) newErrors.valor_id = 'El valor es requerido';
        if (!nuevaVariante.stock) newErrors.stock = 'El stock es requerido';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});

        const attrSeleccionado = atributosGlobales.find(a => a.id == nuevaVariante.atributo_id);
        const precioFinal = (attrSeleccionado && attrSeleccionado.permite_precio == 1) ? nuevaVariante.precio : null;

        if (!productoId) {
            const valorSeleccionado = attrSeleccionado?.valores.find(v => v.id == nuevaVariante.valor_id);

            const nueva = {
                id: `temp-${Date.now()}`,
                atributo_id: nuevaVariante.atributo_id,
                atributo_nombre: attrSeleccionado?.nombre || '',
                valor_id: nuevaVariante.valor_id,
                valor_nombre: valorSeleccionado ? valorSeleccionado.valor : 'Desconocido',
                precio: precioFinal,
                stock: parseInt(nuevaVariante.stock),
                sku: nuevaVariante.sku,
                imagen: nuevaVariante.imagen,
                valores: [{
                    id: nuevaVariante.valor_id,
                    valor: valorSeleccionado ? valorSeleccionado.valor : 'Desconocido',
                    atributo_nombre: attrSeleccionado?.nombre || ''
                }]
            };

            setVariantes([...variantes, nueva]);
            setNuevaVariante(prev => ({ ...prev, valor_id: '', stock: '', precio: '', sku: '', imagen: '' }));
            return;
        }

        try {
            setLoading(true);
            const dataToSend = {
                producto_id: productoId,
                precio: precioFinal || null,
                stock: parseInt(nuevaVariante.stock),
                sku: nuevaVariante.sku,
                imagen: nuevaVariante.imagen,
                valores: [parseInt(nuevaVariante.valor_id)]
            };

            await variacionesService.create(dataToSend);
            Swal.fire('Éxito', 'Variante agregada correctamente', 'success');

            setNuevaVariante(prev => ({ ...prev, valor_id: '', stock: '', precio: '', sku: '', imagen: '' }));
            const variantesData = await variacionesService.getByProducto(productoId);
            setVariantes(variantesData);

            if (onSave) onSave();
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudo agregar la variante', 'error');
        } finally {
            setLoading(false);
        }
    };

    const eliminarVariante = async (id) => {
        if (!productoId) {
            setVariantes(variantes.filter(v => v.id !== id));
            return;
        }

        const result = await Swal.fire({
            title: '¿Eliminar variante?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                await variacionesService.delete(id);
                const variantesData = await variacionesService.getByProducto(productoId);
                setVariantes(variantesData);
                if (onSave) onSave();
                Swal.fire('Eliminado', 'Variante eliminada', 'success');
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar', 'error');
            }
        }
    };

    const atributoSeleccionado = atributosGlobales.find(a => a.id == nuevaVariante.atributo_id);

    // ✅ Estilo unificado: igual que GestionEspecificaciones
    const content = (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${embedded ? '' : 'max-w-4xl w-full'}`}>
            {/* Encabezado */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <i className="fas fa-boxes text-blue-600"></i> Variantes del Producto
                </h3>

                {/* Botón Guardar SOLO si hay productoId y no está embebido */}
                {!embedded && productoId && (
                    <button
                        onClick={agregarVariante}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i> Guardando...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save"></i> Guardar Cambios
                            </>
                        )}
                    </button>
                )}

                {/* Botón Cerrar (solo en modal) */}
                {!embedded && !productoId && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Cerrar"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                )}
            </div>

            <div className="p-6">
                {/* Formulario Agregar */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <i className="fas fa-plus-circle text-blue-600"></i> Nueva Variante
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        {/* Atributo */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                                value={nuevaVariante.atributo_id}
                                onChange={handleAtributoChange}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            >
                                {atributosGlobales.map(attr => (
                                    <option key={attr.id} value={attr.id}>{attr.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Valor */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Valor</label>
                            <select
                                value={nuevaVariante.valor_id}
                                onChange={(e) => {
                                    setNuevaVariante({ ...nuevaVariante, valor_id: e.target.value });
                                    if (errors.valor_id) setErrors({ ...errors, valor_id: null });
                                }}
                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.valor_id ? 'border-red-500' : ''}`}
                                disabled={!atributoSeleccionado}
                            >
                                <option value="">Seleccionar...</option>
                                {atributoSeleccionado?.valores?.map(val => (
                                    <option key={val.id} value={val.id}>{val.valor}</option>
                                ))}
                            </select>
                            {errors.valor_id && <p className="text-red-500 text-xs mt-1">{errors.valor_id}</p>}
                        </div>

                        {/* Precio (condicional) */}
                        {atributoSeleccionado?.permite_precio == 1 && (
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Precio (Opcional)</label>
                                <input
                                    type="number"
                                    placeholder="Igual al base"
                                    value={nuevaVariante.precio}
                                    onChange={(e) => setNuevaVariante({ ...nuevaVariante, precio: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        )}

                        {/* Stock */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
                            <input
                                type="number"
                                placeholder="Cant."
                                value={nuevaVariante.stock}
                                onChange={(e) => {
                                    setNuevaVariante({ ...nuevaVariante, stock: e.target.value });
                                    if (errors.stock) setErrors({ ...errors, stock: null });
                                }}
                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.stock ? 'border-red-500' : ''}`}
                                min="0"
                            />
                            {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
                        </div>


                        {/* Imagen (solo para Color) */}
                        {atributoSeleccionado?.nombre?.toLowerCase() === 'color' && (
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Imagen</label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                                    {nuevaVariante.imagen ? (
                                        <div className="p-2 flex items-center gap-2">
                                            <img
                                                src={nuevaVariante.imagen}
                                                alt="Preview"
                                                className="w-16 h-16 object-contain border border-gray-200 rounded"
                                            />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-600">Imagen cargada</p>
                                                <button
                                                    type="button"
                                                    onClick={() => setNuevaVariante({ ...nuevaVariante, imagen: '' })}
                                                    className="text-xs text-red-600 hover:text-red-800"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-6 text-center">
                                            <i className="fas fa-cloud-upload-alt text-gray-400 text-2xl mb-2"></i>
                                            <p className="text-xs text-gray-500">Haz clic para subir imagen</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImagenVarianteChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Botón Agregar */}
                        <button
                            type="button"
                            onClick={agregarVariante}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold h-[38px]"
                        >
                            Agregar
                        </button>
                    </div>
                </div>

                {/* Tabla de variantes */}
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Cargando variantes...</div>
                ) : variantes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        No hay variantes agregadas.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3">Imagen</th>
                                    <th className="px-4 py-3">Variante</th>
                                    <th className="px-4 py-3">Precio</th>
                                    <th className="px-4 py-3">Stock</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {variantes.map((variante) => (
                                    <tr key={variante.id} className="bg-white hover:bg-gray-50">
                                        {/* Imagen */}
                                        <td className="px-4 py-3">
                                            {variante.imagen ? (
                                                <img
                                                    src={variante.imagen}
                                                    alt="Variante"
                                                    className="w-12 h-12 object-contain border border-gray-200 rounded"
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Sin imagen</span>
                                            )}
                                        </td>
                                        {/* Variante */}
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {variante.valores?.map((val, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 rounded text-xs mr-2"
                                                >
                                                    <span className="text-gray-600">{val.atributo_nombre}:</span>
                                                    <span className="font-semibold text-gray-800">{val.valor}</span>
                                                </span>
                                            )) || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {variante.precio ? (
                                                <span className="text-green-600 font-semibold">${parseFloat(variante.precio).toFixed(2)}</span>
                                            ) : (
                                                <span className="text-gray-500 italic">Base</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            <span className={variante.stock > 0 ? 'text-gray-700' : 'text-red-500 font-semibold'}>
                                                {variante.stock} unid.
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => eliminarVariante(variante.id)}
                                                className="text-red-600 hover:text-red-900 transition-colors"
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

            {/* Botón Cerrar (solo en modal sin productoId) */}
            {!embedded && !productoId && (
                <div className="px-6 pb-6 pt-4 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors text-sm"
                    >
                        Cerrar
                    </button>
                </div>
            )}
        </div>
    );

    if (embedded) {
        return content;
    }

    // ✅ Modal: solo se muestra si no está embebido y no hay productoId (flujo independiente)
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {content}
        </div>
    );
};

export default GestionVariantes;