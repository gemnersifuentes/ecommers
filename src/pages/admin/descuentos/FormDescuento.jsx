import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
    Tag,
    Info,
    Calendar,
    DollarSign,
    Search,
    ChevronDown,
    Save,
    X,
    LayoutGrid,
    Target,
    Percent
} from 'lucide-react';
import { descuentosService, productosService, categoriasService, marcasService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

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

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return dateString.split(' ')[0];
    };

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

            const pList = Array.isArray(productosData) ? productosData : (productosData?.data || []);
            const cList = Array.isArray(categoriasData) ? categoriasData : (categoriasData?.data || []);
            const mList = Array.isArray(marcasData) ? marcasData : (marcasData?.data || []);

            setProductos(pList);
            setCategorias(cList);
            setMarcas(mList);
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
                fecha_inicio: formatDateForInput(data.fecha_inicio),
                fecha_fin: formatDateForInput(data.fecha_fin),
                activo: data.activo,
                aplica_a: data.aplica_a,
                producto_id: data.producto_id || '',
                categoria_id: data.categoria_id || '',
                marca_id: data.marca_id || ''
            });
        } catch (error) {
            console.error('Error al cargar descuento:', error);
            Swal.fire('Error', 'No se pudo cargar el descuento', 'error');
            navigate('/admin/descuentos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (formData.producto_id && productos.length > 0 && !searchProducto) {
            const p = productos.find(x => parseInt(x.id) === parseInt(formData.producto_id));
            if (p) setSearchProducto(p.nombre);
        }
    }, [productos, formData.producto_id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const dataToSend = { ...formData };
        if (dataToSend.fecha_fin && !dataToSend.fecha_fin.includes(' ')) dataToSend.fecha_fin += ' 23:59:59';
        if (dataToSend.fecha_inicio && !dataToSend.fecha_inicio.includes(' ')) dataToSend.fecha_inicio += ' 00:00:00';

        if (dataToSend.aplica_a === 'producto') { dataToSend.categoria_id = null; dataToSend.marca_id = null; }
        else if (dataToSend.aplica_a === 'categoria') { dataToSend.producto_id = null; dataToSend.marca_id = null; }
        else if (dataToSend.aplica_a === 'marca') { dataToSend.producto_id = null; dataToSend.categoria_id = null; }

        try {
            if (id) {
                const response = await descuentosService.update(id, dataToSend);
                const total = response.total_usuarios || 0;
                Swal.fire({
                    title: '¡Actualizado!',
                    text: `Descuento actualizado. Se han encolado correos para ${total} usuarios.`,
                    icon: 'success',
                    timer: 5000,
                    showConfirmButton: false
                });
            } else {
                const response = await descuentosService.create(dataToSend);
                const total = response.total_usuarios || 0;
                Swal.fire({
                    title: '¡Creado!',
                    text: `Descuento creado. Se han encolado correos para ${total} usuarios.`,
                    icon: 'success',
                    timer: 5000,
                    showConfirmButton: false
                });
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
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
                <p className="text-xs text-gray-500 font-medium">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-sm font-bold text-gray-900">{id ? 'Editar Descuento' : 'Nueva Campaña de Oferta'}</h1>
                    <Breadcrumb items={[
                        { label: 'Admin', link: '/admin', isHome: true },
                        { label: 'Descuentos', link: '/admin/descuentos' },
                        { label: id ? 'Editar' : 'Nuevo' }
                    ]} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200 flex items-center gap-2">
                            <Info size={16} className="text-blue-600" /> Información de Campaña
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Nombre de la Promoción <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                    placeholder="Ej: Oferta de Invierno 2024"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Descripción (Interna)</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                                    placeholder="Escribe detalles sobre el objetivo de esta oferta..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200 flex items-center gap-2">
                            <Calendar size={16} className="text-blue-600" /> Periodo de Validez
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Fecha Inicio <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    name="fecha_inicio"
                                    value={formData.fecha_inicio}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Fecha Fin <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    name="fecha_fin"
                                    value={formData.fecha_fin}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200 flex items-center gap-2">
                            <LayoutGrid size={16} className="text-blue-600" /> Valor del Descuento
                        </h3>
                        <div className="space-y-4">
                            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, tipo: 'porcentaje' }))}
                                    className={`flex-1 py-1.5 text-xs font-black rounded-md transition-all ${formData.tipo === 'porcentaje' ? 'bg-white text-orange-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600 uppercase'}`}
                                >
                                    PORCENTAJE (%)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, tipo: 'monto_fijo' }))}
                                    className={`flex-1 py-1.5 text-xs font-black rounded-md transition-all ${formData.tipo === 'monto_fijo' ? 'bg-white text-orange-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600 uppercase'}`}
                                >
                                    MONTO FIJO ($)
                                </button>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Valor <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="valor"
                                        value={formData.valor}
                                        onChange={handleChange}
                                        required
                                        step="0.01"
                                        className="w-full pl-8 pr-3 py-2 text-sm font-bold rounded-lg border border-gray-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                                        {formData.tipo === 'porcentaje' ? '%' : '$'}
                                    </span>
                                </div>
                            </div>
                            <div className="pt-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="activo"
                                        checked={formData.activo === 1}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500 transition-all"
                                    />
                                    <span className="text-xs font-bold text-gray-600 uppercase tracking-widest group-hover:text-orange-600 transition-colors">Promoción Activa</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200 flex items-center gap-2">
                            <Target size={16} className="text-blue-600" /> Segmentación de Oferta
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">¿A quién aplica?</label>
                                <div className="relative">
                                    <select
                                        name="aplica_a"
                                        value={formData.aplica_a}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white appearance-none pr-10 font-medium"
                                    >
                                        <option value="producto">Producto Específico</option>
                                        <option value="categoria">Categoría Completa</option>
                                        <option value="marca">Marca Específica</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="min-h-[100px]">
                                <AnimatePresence mode="wait">
                                    {formData.aplica_a === 'producto' ? (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="prod-sel">
                                            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Buscar Producto</label>
                                            <div className="relative">
                                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Nombre o SKU..."
                                                    value={searchProducto}
                                                    onChange={(e) => { setSearchProducto(e.target.value); setShowProductoDropdown(true); }}
                                                    onFocus={() => setShowProductoDropdown(true)}
                                                    className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                                                />
                                                {searchProducto && <X size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 cursor-pointer hover:text-gray-500" onClick={() => { setSearchProducto(''); setFormData(p => ({ ...p, producto_id: '' })); }} />}
                                            </div>
                                            {showProductoDropdown && (
                                                <div className="relative">
                                                    <div className="fixed inset-0 z-40" onClick={() => setShowProductoDropdown(false)}></div>
                                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto no-scrollbar">
                                                        {productos
                                                            .filter(p => !searchProducto || p.nombre.toLowerCase().includes(searchProducto.toLowerCase()))
                                                            .map(p => (
                                                                <div
                                                                    key={p.id}
                                                                    onClick={() => {
                                                                        setFormData(prev => ({ ...prev, producto_id: p.id }));
                                                                        setSearchProducto(p.nombre);
                                                                        setShowProductoDropdown(false);
                                                                    }}
                                                                    className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-orange-50 border-b border-gray-50 group"
                                                                >
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs font-bold text-gray-900 group-hover:text-orange-700">{p.nombre}</span>
                                                                        <span className="text-[10px] text-gray-400 font-bold uppercase">SKU: {p.sku || 'N/A'}</span>
                                                                    </div>
                                                                    <span className="text-xs font-black text-orange-600">${parseFloat(p.precio_base).toLocaleString()}</span>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ) : formData.aplica_a === 'categoria' ? (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="cat-sel">
                                            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Elegir Categoría</label>
                                            <div className="relative">
                                                <select
                                                    name="categoria_id"
                                                    value={formData.categoria_id}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-white appearance-none pr-10 font-medium"
                                                >
                                                    <option value="">-- Seleccionar --</option>
                                                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </motion.div>
                                    ) : formData.aplica_a === 'marca' ? (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="marca-sel">
                                            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Elegir Marca</label>
                                            <div className="relative">
                                                <select
                                                    name="marca_id"
                                                    value={formData.marca_id}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-white appearance-none pr-10 font-medium"
                                                >
                                                    <option value="">-- Seleccionar --</option>
                                                    {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-0 right-0 w-[calc(100%-250px)] bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 transition-all z-40 flex justify-end">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/admin/descuentos"
                            className="text-xs font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-2 bg-orange-500 text-white text-xs font-black rounded-lg hover:bg-orange-600 transition-all shadow-lg active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                        >
                            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save size={14} />}
                            {id ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default FormDescuento;
