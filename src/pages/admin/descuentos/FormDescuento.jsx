import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { descuentosService, productosService, categoriasService, marcasService } from '../../../services';

const FormDescuento = ({ id = null }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [searchProducto, setSearchProducto] = useState('');
    const [showProductoDropdown, setShowProductoDropdown] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo: 'porcentaje',
        valor: '',
        fecha_inicio: '',
        fecha_fin: '',
        activo: 1,
        aplica_a: 'producto',
        producto_id: '',
        categoria_id: '',
        marca_id: ''
    });

    useEffect(() => {
        cargarDatosAuxiliares();
        if (id) {
            cargarDescuento();
        }
    }, [id]);

    const cargarDatosAuxiliares = async () => {
        try {
            const [productosData, categoriasData, marcasData] = await Promise.all([
                productosService.getAll(),
                categoriasService.getAll(),
                marcasService.getAll()
            ]);

            const productos = Array.isArray(productosData) ? productosData :
                (productosData?.data ? productosData.data : []);
            const categorias = Array.isArray(categoriasData) ? categoriasData :
                (categoriasData?.data ? categoriasData.data : []);
            const marcas = Array.isArray(marcasData) ? marcasData :
                (marcasData?.data ? marcasData.data : []);

            setProductos(productos);
            setCategorias(categorias);
            setMarcas(marcas);
        } catch (error) {
            console.error('Error al cargar datos auxiliares:', error);
            Swal.fire('Error', 'No se pudieron cargar los datos necesarios', 'error');
        }
    };

    const cargarDescuento = async () => {
        setLoading(true);
        try {
            const data = await descuentosService.getById(id);
            setFormData({
                nombre: data.nombre,
                descripcion: data.descripcion || '',
                tipo: data.tipo,
                valor: data.valor,
                fecha_inicio: data.fecha_inicio,
                fecha_fin: data.fecha_fin,
                activo: data.activo,
                aplica_a: data.aplica_a,
                producto_id: data.producto_id || '',
                categoria_id: data.categoria_id || '',
                marca_id: data.marca_id || ''
            });
            if (data.producto_id) {
                const producto = productos.find(p => p.id === data.producto_id);
                if (producto) {
                    setSearchProducto(producto.nombre);
                }
            }
        } catch (error) {
            console.error('Error al cargar descuento:', error);
            Swal.fire('Error', 'No se pudo cargar el descuento', 'error');
            navigate('/admin/descuentos');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const dataToSend = { ...formData };

        // Add 23:59:59 to fecha_fin so discount is valid until end of day
        if (dataToSend.fecha_fin) {
            dataToSend.fecha_fin = dataToSend.fecha_fin + ' 23:59:59';
        }

        // Add 00:00:00 to fecha_inicio for consistency
        if (dataToSend.fecha_inicio) {
            dataToSend.fecha_inicio = dataToSend.fecha_inicio + ' 00:00:00';
        }

        if (dataToSend.aplica_a === 'producto') {
            dataToSend.categoria_id = null;
            dataToSend.marca_id = null;
        } else if (dataToSend.aplica_a === 'categoria') {
            dataToSend.producto_id = null;
            dataToSend.marca_id = null;
        } else if (dataToSend.aplica_a === 'marca') {
            dataToSend.producto_id = null;
            dataToSend.categoria_id = null;
        }

        try {
            if (id) {
                await descuentosService.update(id, dataToSend);
                Swal.fire('Actualizado', 'Descuento actualizado exitosamente', 'success');
            } else {
                await descuentosService.create(dataToSend);
                Swal.fire('Creado', 'Descuento creado exitosamente', 'success');
            }
            navigate('/admin/descuentos');
        } catch (error) {
            console.error(error);
            Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading && id && !formData.nombre) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Información Básica */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                            Información Básica
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre del Descuento <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Ej: Black Friday 2024"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                    placeholder="Descripción del descuento..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Tipo y Valor */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                            Tipo y Valor
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                >
                                    <option value="porcentaje">Porcentaje</option>
                                    <option value="monto_fijo">Monto Fijo</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Valor <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="valor"
                                    value={formData.valor}
                                    onChange={handleChange}
                                    required
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder={formData.tipo === 'porcentaje' ? '15' : '50'}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Aplicación del Descuento */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                            Aplicación del Descuento
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Aplica a <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="aplica_a"
                                    value={formData.aplica_a}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                >
                                    <option value="producto">Producto</option>
                                    <option value="categoria">Categoría</option>
                                    <option value="marca">Marca</option>
                                </select>
                            </div>

                            {/* Selector condicional - Producto */}
                            {formData.aplica_a === 'producto' && (
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Producto <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Buscar producto..."
                                            value={searchProducto}
                                            onChange={(e) => {
                                                setSearchProducto(e.target.value);
                                                setShowProductoDropdown(true);
                                                if (!e.target.value) {
                                                    setFormData(prev => ({ ...prev, producto_id: '' }));
                                                }
                                            }}
                                            onFocus={() => setShowProductoDropdown(true)}
                                            className="w-full px-3 py-2.5 pl-10 text-sm rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        />
                                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                                        {searchProducto && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearchProducto('');
                                                    setFormData(prev => ({ ...prev, producto_id: '' }));
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <i className="fas fa-times text-sm"></i>
                                            </button>
                                        )}
                                    </div>

                                    {showProductoDropdown && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setShowProductoDropdown(false)}
                                            ></div>
                                            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                                                {productos
                                                    .filter(p => p.nombre.toLowerCase().includes(searchProducto.toLowerCase()))
                                                    .map((p, index) => (
                                                        <div
                                                            key={`${p.id}-${index}`}
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, producto_id: p.id }));
                                                                setSearchProducto(p.nombre);
                                                                setShowProductoDropdown(false);
                                                            }}
                                                            className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-colors ${formData.producto_id === p.id ? 'bg-blue-100' : ''
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 ${formData.producto_id === p.id ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
                                                                    }`}>
                                                                    {p.imagen_url ? (
                                                                        <img
                                                                            src={p.imagen_url}
                                                                            alt={p.nombre}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                                            <i className="fas fa-box text-gray-400"></i>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-sm font-medium truncate ${formData.producto_id === p.id ? 'text-blue-700' : 'text-gray-900'
                                                                        }`}>
                                                                        {p.nombre}
                                                                    </p>
                                                                    {p.precio && (
                                                                        <p className="text-xs text-gray-500">
                                                                            ${parseFloat(p.precio).toFixed(2)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {formData.producto_id === p.id && (
                                                                    <i className="fas fa-check text-blue-600"></i>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                                {productos.filter(p => p.nombre.toLowerCase().includes(searchProducto.toLowerCase())).length === 0 && (
                                                    <div className="p-6 text-center text-gray-500 text-sm">
                                                        No se encontraron productos
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Selector de Categoría */}
                            {formData.aplica_a === 'categoria' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Categoría <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="categoria_id"
                                        value={formData.categoria_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                    >
                                        <option value="">Seleccionar categoría</option>
                                        {categorias.map((c, index) => (
                                            <option key={`${c.id}-${index}`} value={c.id}>{c.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Selector de Marca */}
                            {formData.aplica_a === 'marca' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Marca <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="marca_id"
                                        value={formData.marca_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                    >
                                        <option value="">Seleccionar marca</option>
                                        {marcas.map((m, index) => (
                                            <option key={`${m.id}-${index}`} value={m.id}>{m.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Vigencia */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                            Vigencia
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha Inicio <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="fecha_inicio"
                                    value={formData.fecha_inicio}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha Fin <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="fecha_fin"
                                    value={formData.fecha_fin}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <Link
                    to="/admin/descuentos"
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                    Cancelar
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 text-sm"
                >
                    {loading ? 'Guardando...' : (id ? 'Actualizar Descuento' : 'Crear Descuento')}
                </button>
            </div>
        </form>
    );
};

export default FormDescuento;
