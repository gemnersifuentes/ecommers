import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save,
    X,
    Plus,
    Trash2,
    ShoppingBag,
    Search,
    User,
    Calendar,
    FileText,
    Package,
    ArrowLeft,
    ChevronDown,
    Layers,
    AlertCircle,
    CheckCircle2,
    Clock,
    Check
} from 'lucide-react';
import { proveedoresService, comprasService, productosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';
import Swal from 'sweetalert2';
import BulkAddModal from './BulkAddModal';
import DatePicker from '../../../components/ui/DatePicker';

const FormCompra = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [productos, setProductos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);

    const [formData, setFormData] = useState({
        proveedor_id: '',
        numero_comprobante: '',
        tipo_comprobante: 'Factura',
        fecha_compra: new Date().toISOString().split('T')[0],
        estado: 'Pendiente',
        notas: '',
        total: 0,
        detalles: []
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [provData, prodData] = await Promise.all([
                    proveedoresService.getAll(),
                    productosService.getAll({ limit: 200, admin_mode: 'true' })
                ]);
                setProveedores(Array.isArray(provData) ? provData.filter(p => p.activo == 1) : []);

                const listaProductos = prodData?.data || (Array.isArray(prodData) ? prodData : []);
                setProductos(listaProductos);

                if (isEdit) {
                    const compData = await comprasService.getById(id);
                    if (compData.estado === 'Completado') {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Atención',
                            text: 'No se recomienda editar una compra que ya ha sido completada.',
                            confirmButtonColor: '#ea580c'
                        });
                    }

                    setFormData({
                        ...compData,
                        total: parseFloat(compData.total),
                        detalles: compData.detalles.map(d => ({
                            ...d,
                            uniqueId: d.variacion_id ? `v-${d.variacion_id}` : `p-${d.producto_id}`,
                            precio_unidad: parseFloat(d.precio_unidad),
                            subtotal: parseFloat(d.subtotal),
                            cantidad: parseInt(d.cantidad)
                        }))
                    });
                }
            } catch (error) {
                console.error('Error loading data:', error);
                Swal.fire('Error', 'No se pudo cargar la información necesaria', 'error');
            }
        };
        loadInitialData();
    }, [id, isEdit]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addProductToDetail = (producto, variacion = null, cantidadManual = null) => {
        const detailId = variacion ? `v-${variacion.id}` : `p-${producto.id}`;
        const qtyToAdd = cantidadManual !== null ? cantidadManual : 1;

        setFormData(prev => {
            const existingDetailIdx = prev.detalles.findIndex(d => d.uniqueId === detailId);
            let newDetalles;

            if (existingDetailIdx !== -1) {
                newDetalles = [...prev.detalles];
                newDetalles[existingDetailIdx].cantidad += qtyToAdd;
                newDetalles[existingDetailIdx].subtotal = newDetalles[existingDetailIdx].cantidad * newDetalles[existingDetailIdx].precio_unidad;

                Swal.fire({
                    icon: 'success',
                    title: 'Cantidad actualizada',
                    text: `+${qtyToAdd} ${producto.nombre} añadido.`,
                    toast: true,
                    position: 'top-end',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                const newDetail = {
                    uniqueId: detailId,
                    producto_id: producto.id,
                    producto_nombre: producto.nombre,
                    variacion_id: variacion ? variacion.id : null,
                    variacion_nombre: variacion ? variacion.atributo : null,
                    cantidad: qtyToAdd,
                    precio_unidad: variacion ? (parseFloat(variacion.precio_compra) || 0) : (parseFloat(producto.precio_compra) || 0),
                    subtotal: 0
                };
                newDetail.subtotal = newDetail.cantidad * newDetail.precio_unidad;
                newDetalles = [...prev.detalles, newDetail];

                Swal.fire({
                    icon: 'success',
                    title: 'Producto añadido',
                    toast: true,
                    position: 'top-end',
                    timer: 1500,
                    showConfirmButton: false
                });
            }

            return {
                ...prev,
                detalles: newDetalles,
                total: newDetalles.reduce((acc, curr) => acc + curr.subtotal, 0)
            };
        });

        setShowProductSearch(false);
        setSearchTerm('');
    };

    const handleBulkAdd = (itemsToAdd) => {
        itemsToAdd.forEach(({ item, variant, parent, cantidad }) => {
            addProductToDetail(parent, variant, cantidad);
        });
        Swal.fire({
            icon: 'success',
            title: 'Carga completada',
            text: `Se añadieron ${itemsToAdd.length} productos a la lista.`,
            confirmButtonColor: '#ea580c'
        });
    };

    const toggleSelectAll = () => {
        if (formData.detalles.length === 0) return;

        const allSelected = formData.detalles.length > 0 && selectedItems.length === formData.detalles.length;
        if (allSelected) {
            setSelectedItems([]);
        } else {
            setSelectedItems(formData.detalles.map(d => d.uniqueId));
        }
    };

    const toggleSelectItem = (uniqueId) => {
        setSelectedItems(prev =>
            prev.includes(uniqueId)
                ? prev.filter(id => id !== uniqueId)
                : [...prev, uniqueId]
        );
    };

    const deleteSelected = async () => {
        const result = await Swal.fire({
            title: '¿Eliminar seleccionados?',
            text: `Se eliminarán ${selectedItems.length} artículos de la lista.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            setFormData(prev => {
                const newDetalles = prev.detalles.filter(d => !selectedItems.includes(d.uniqueId));
                return {
                    ...prev,
                    detalles: newDetalles,
                    total: newDetalles.reduce((acc, curr) => acc + curr.subtotal, 0)
                };
            });
            setSelectedItems([]);
        }
    };

    const removeDetail = (index) => {
        setFormData(prev => {
            const newDetalles = prev.detalles.filter((_, i) => i !== index);
            return {
                ...prev,
                detalles: newDetalles,
                total: newDetalles.reduce((acc, curr) => acc + curr.subtotal, 0)
            };
        });
    };

    const handleDetailChange = (index, field, value) => {
        setFormData(prev => {
            const newDetalles = [...prev.detalles];
            newDetalles[index][field] = parseFloat(value) || 0;
            newDetalles[index].subtotal = newDetalles[index].cantidad * newDetalles[index].precio_unidad;

            return {
                ...prev,
                detalles: newDetalles,
                total: newDetalles.reduce((acc, curr) => acc + curr.subtotal, 0)
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.detalles.length === 0) {
            Swal.fire('Atención', 'Debe agregar al menos un producto a la compra', 'warning');
            return;
        }

        setLoading(true);
        try {
            if (isEdit) {
                await comprasService.update(id, formData);
            } else {
                await comprasService.create(formData);
            }

            await Swal.fire({
                icon: 'success',
                title: isEdit ? 'Compra actualizada' : 'Compra registrada',
                text: formData.estado === 'Completado' ? 'El stock se ha actualizado correctamente.' : 'La compra se guardó como pendiente.',
                confirmButtonColor: '#ea580c'
            });
            navigate('/admin/compras');
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', error.response?.data?.message || 'Error al registrar compra', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = productos.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-4 space-y-6 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                        <ShoppingBag size={16} className="text-orange-500" />
                        {isEdit ? 'Editar Abastecimiento' : 'Nueva Adquisición de Stock'}
                    </h1>
                    <Breadcrumb items={[
                        { label: 'Admin', link: '/admin', isHome: true },
                        { label: 'Compras', link: '/admin/compras' },
                        { label: isEdit ? `Editando #${id}` : 'Registro Nuevo' }
                    ]} />
                </div>

                <button
                    onClick={() => navigate('/admin/compras')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all w-fit"
                >
                    <ArrowLeft size={14} />
                    Volver al Listado
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-[#111c44] rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-sm">
                        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 border-b border-gray-50 dark:border-white/5 pb-2">Datos del Comprobante</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">Proveedor *</label>
                                <div className="relative">
                                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <select
                                        required
                                        name="proveedor_id"
                                        value={formData.proveedor_id}
                                        onChange={handleInputChange}
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 outline-none transition-all dark:text-white appearance-none"
                                    >
                                        <option value="">Seleccione proveedor...</option>
                                        {proveedores.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre} {p.ruc ? `(${p.ruc})` : ''}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">Tipo Doc.</label>
                                    <select
                                        name="tipo_comprobante"
                                        value={formData.tipo_comprobante}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 outline-none transition-all dark:text-white"
                                    >
                                        <option value="Factura">Factura</option>
                                        <option value="Boleta">Boleta</option>
                                        <option value="Guia">Guía de Remisión</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">N° Documento</label>
                                    <input
                                        type="text"
                                        name="numero_comprobante"
                                        value={formData.numero_comprobante}
                                        onChange={handleInputChange}
                                        placeholder="F001-00123"
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 outline-none transition-all dark:text-white"
                                    />
                                </div>
                            </div>

                            <DatePicker
                                label="Fecha de Compra"
                                value={formData.fecha_compra}
                                onChange={(val) => setFormData(prev => ({ ...prev, fecha_compra: val }))}
                            />

                            <div>
                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">Estado Inicial</label>
                                <div className={`grid ${isEdit ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, estado: 'Pendiente' }))}
                                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all text-[9px] font-black uppercase tracking-tighter ${formData.estado === 'Pendiente' ? 'bg-amber-50 border-amber-500 text-amber-600 dark:bg-amber-500/10' : 'bg-gray-50 border-gray-100/50 dark:border-white/5 text-gray-400 dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/10'}`}
                                    >
                                        <div className={`p-1 rounded-lg ${formData.estado === 'Pendiente' ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                                            <Clock size={12} />
                                        </div>
                                        Pendiente
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, estado: 'Completado' }))}
                                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all text-[9px] font-black uppercase tracking-tighter ${formData.estado === 'Completado' ? 'bg-emerald-50 border-emerald-500 text-emerald-600 dark:bg-emerald-500/10' : 'bg-gray-50 border-gray-100/50 dark:border-white/5 text-gray-400 dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/10'}`}
                                    >
                                        <div className={`p-1 rounded-lg ${formData.estado === 'Completado' ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                                            <CheckCircle2 size={12} />
                                        </div>
                                        Ingresado
                                    </button>
                                    {isEdit && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, estado: 'Cancelado' }))}
                                            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all text-[9px] font-black uppercase tracking-tighter ${formData.estado === 'Cancelado' ? 'bg-red-50 border-red-500 text-red-600 dark:bg-red-500/10' : 'bg-gray-50 border-gray-100/50 dark:border-white/5 text-gray-400 dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/10'}`}
                                        >
                                            <div className={`p-1 rounded-lg ${formData.estado === 'Cancelado' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                                                <X size={12} />
                                            </div>
                                            Cancelado
                                        </button>
                                    )}
                                </div>
                                <p className="text-[9px] text-gray-400 mt-2 font-medium italic">* 'Ingresado' actualizará el stock inmediatamente al guardar.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#111c44] rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-sm">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 block">Notas Adicionales</label>
                        <textarea
                            name="notas"
                            value={formData.notas}
                            onChange={handleInputChange}
                            rows="4"
                            placeholder="Observaciones de la entrega, crédito, etc..."
                            className="w-full p-4 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-2xl text-xs focus:ring-1 focus:ring-orange-500 outline-none transition-all dark:text-white resize-none"
                        />
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-[#111c44] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-gray-50 dark:border-white/5">
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Selección de Artículos</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowBulkModal(true)}
                                        className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-500/10 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-orange-200 transition-all"
                                    >
                                        <Plus size={12} />
                                        Carga Masiva
                                    </button>
                                    <div className="text-[10px] font-black text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-3 py-1 rounded-full uppercase">
                                        {formData.detalles.length} Items agregados
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar producto por nombre o SKU para agregar..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowProductSearch(e.target.value.length >= 2);
                                    }}
                                    onFocus={() => searchTerm.length >= 2 && setShowProductSearch(true)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#0b1437] border border-gray-100 dark:border-white/5 rounded-2xl text-xs focus:ring-2 focus:ring-orange-500/10 outline-none transition-all dark:text-white"
                                />

                                <AnimatePresence>
                                    {showProductSearch && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#111c44] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto main-scrollbar"
                                        >
                                            {filteredProducts.length === 0 ? (
                                                <div className="p-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">Sin coincidencias</div>
                                            ) : (
                                                filteredProducts.map(prod => (
                                                    <div key={prod.id} className="border-b border-gray-50 dark:border-white/5 last:border-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => addProductToDetail(prod)}
                                                            className="w-full flex items-center gap-3 p-4 hover:bg-orange-50/50 dark:hover:bg-white/5 text-left transition-colors"
                                                        >
                                                            <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                                {prod.imagen ? <img src={prod.imagen} className="w-full h-full object-cover" /> : <Package size={16} className="text-gray-400" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate uppercase">{prod.nombre}</p>
                                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Stock: {prod.stock} {prod.sku ? `| SKU: ${prod.sku}` : ''}</p>
                                                            </div>
                                                            <Plus size={14} className="text-orange-500" />
                                                        </button>
                                                        {prod.variaciones && prod.variaciones.map(v => (
                                                            <button
                                                                key={v.id}
                                                                type="button"
                                                                onClick={() => addProductToDetail(prod, v)}
                                                                className="w-full flex items-center gap-3 p-3 pl-10 hover:bg-orange-50/50 dark:hover:bg-white/5 text-left transition-colors border-t border-gray-50 dark:border-white/5"
                                                            >
                                                                <div className="w-8 h-8 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                                    {(v.imagen || prod.imagen) ? (
                                                                        <img src={v.imagen || prod.imagen} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <Layers size={12} className="text-gray-400" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase">
                                                                        <span className="text-gray-400 font-bold">{prod.nombre}</span> - {v.atributo}
                                                                    </p>
                                                                    <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase">Stock Var: {v.stock} {v.sku ? `| SKU: ${v.sku}` : ''}</p>
                                                                </div>
                                                                <Plus size={12} className="text-orange-500" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                ))
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#111c44] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden flex-1 overflow-y-auto no-scrollbar min-h-[400px]">
                            <AnimatePresence>
                                {selectedItems.length > 0 && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-orange-600 overflow-hidden border-b border-orange-700"
                                    >
                                        <div className="p-3 flex items-center justify-between px-6">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedItems([])}
                                                    className="w-5 h-5 rounded-md border-2 border-white bg-white/20 flex items-center justify-center hover:bg-white/40 transition-all cursor-pointer"
                                                    title="Desmarcar todos"
                                                >
                                                    <X size={12} className="text-white h-3 w-3 stroke-[4]" />
                                                </button>
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                                    {selectedItems.length} Artículos Seleccionados
                                                </span>
                                            </div>
                                            <button
                                                onClick={deleteSelected}
                                                className="flex items-center gap-2 bg-white text-orange-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all hover:bg-orange-50"
                                            >
                                                <Trash2 size={12} />
                                                Eliminar Seleccionados
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-separate border-spacing-0">
                                    <thead className="bg-gray-50/80 dark:bg-black/20 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 dark:border-white/5">
                                        <tr>
                                            <th className="pl-6 py-4 w-10">
                                                <div
                                                    onClick={toggleSelectAll}
                                                    className={`w-5 h-5 rounded-md border-2 transition-all cursor-pointer flex items-center justify-center ${formData.detalles.length > 0 && selectedItems.length === formData.detalles.length ? 'bg-orange-600 border-orange-600 shadow-lg shadow-orange-500/30' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-orange-500'}`}
                                                >
                                                    {formData.detalles.length > 0 && selectedItems.length === formData.detalles.length && (
                                                        <motion.div
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                        >
                                                            <Check size={12} className="text-white h-3 w-3 stroke-[4]" />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Producto</th>
                                            <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-32">Cant.</th>
                                            <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-32">Costo Un.</th>
                                            <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Subtotal</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right w-16"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        <AnimatePresence>
                                            {formData.detalles.map((item, idx) => (
                                                <motion.tr
                                                    key={item.uniqueId}
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    className={`group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${selectedItems.includes(item.uniqueId) ? 'bg-orange-50/30 dark:bg-orange-500/5' : ''}`}
                                                >
                                                    <td className="pl-6 py-4">
                                                        <div
                                                            onClick={() => toggleSelectItem(item.uniqueId)}
                                                            className={`w-5 h-5 rounded-md border-2 transition-all cursor-pointer flex items-center justify-center ${selectedItems.includes(item.uniqueId) ? 'bg-orange-600 border-orange-600 shadow-lg shadow-orange-500/30' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-orange-500'}`}
                                                        >
                                                            {selectedItems.includes(item.uniqueId) && (
                                                                <motion.div
                                                                    initial={{ scale: 0, opacity: 0 }}
                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                >
                                                                    <Check size={12} className="text-white h-3 w-3 stroke-[4]" />
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-tight truncate max-w-[200px]">{item.producto_nombre}</span>
                                                            {item.variacion_nombre && (
                                                                <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase mt-0.5 inline-flex items-center gap-1">
                                                                    <Layers size={10} />
                                                                    {item.variacion_nombre}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-4 text-center">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.cantidad}
                                                            onChange={(e) => handleDetailChange(idx, 'cantidad', e.target.value)}
                                                            className="w-20 mx-auto bg-white dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-xl px-2 py-1.5 text-xs text-center font-black dark:text-white focus:ring-1 focus:ring-orange-500 outline-none"
                                                        />
                                                    </td>
                                                    <td className="px-2 py-4 text-center">
                                                        <div className="relative w-28 mx-auto">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">S/</span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={item.precio_unidad}
                                                                onChange={(e) => handleDetailChange(idx, 'precio_unidad', e.target.value)}
                                                                className="w-full pl-6 pr-2 py-1.5 bg-white dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-xl text-xs text-center font-black dark:text-white focus:ring-1 focus:ring-orange-500 outline-none"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <span className="text-xs font-black text-gray-900 dark:text-gray-200">S/ {item.subtotal.toFixed(2)}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeDetail(idx)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                        {formData.detalles.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3 opacity-20">
                                                        <Package size={40} className="text-gray-400" />
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">La lista está vacía</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-6 bg-gray-50/50 dark:bg-black/20 border-t border-gray-50 dark:border-white/5 mt-auto">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4 text-gray-400 dark:text-gray-500">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase tracking-widest">Base Imponible</span>
                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">S/ {(Number(formData.total) / 1.18).toFixed(2)}</span>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200 dark:bg-white/5"></div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase tracking-widest">IGV (18%)</span>
                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">S/ {(Number(formData.total) - (Number(formData.total) / 1.18)).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Importe Total</p>
                                            <p className="text-3xl font-black text-gray-950 dark:text-white leading-none">S/ {Number(formData.total).toFixed(2)}</p>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading || formData.detalles.length === 0}
                                            className={`px-8 py-4 bg-orange-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-700 shadow-xl shadow-orange-200 dark:shadow-none transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {loading ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <Save size={18} />
                                            )}
                                            {isEdit ? 'Guardar Cambios' : (formData.estado === 'Completado' ? 'Finalizar Ingreso' : 'Guardar Pendiente')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <BulkAddModal
                isOpen={showBulkModal}
                onClose={() => setShowBulkModal(false)}
                productos={productos}
                onAdd={handleBulkAdd}
            />
        </div>
    );
};

export default FormCompra;
