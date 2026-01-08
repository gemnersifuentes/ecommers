import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { productosService, variacionesService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';
import { useNotifications } from '../../../context/NotificationContext';

const ProductosShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { refreshNotifications } = useNotifications();
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingStock, setUpdatingStock] = useState(false);
    const [quickStock, setQuickStock] = useState('');
    const [variantStocks, setVariantStocks] = useState({});

    useEffect(() => {
        loadProducto();
    }, [id]);

    const loadProducto = async () => {
        setLoading(true);
        try {
            const data = await productosService.getById(id);
            setProducto(data);
            setQuickStock(data.stock);

            // Initialize variant stocks
            if (data.variaciones) {
                const vStocks = {};
                data.variaciones.forEach(v => {
                    vStocks[v.id] = v.stock;
                });
                setVariantStocks(vStocks);
            }
        } catch (error) {
            console.error('Error loading product:', error);
            Swal.fire('Error', 'No se pudo cargar el producto', 'error');
            navigate('/admin/productos');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStock = async () => {
        setUpdatingStock(true);
        try {
            await productosService.update(id, {
                nombre: producto.nombre, // Backend currently requires name
                precio_base: producto.precio_base, // and price
                stock: quickStock,
                stock_only: true
            });
            Swal.fire({
                title: '¡Actualizado!',
                text: 'El stock se ha actualizado correctamente.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            setProducto({ ...producto, stock: quickStock });
            refreshNotifications();
        } catch (error) {
            console.error('Error updating stock:', error);
            Swal.fire('Error', 'No se pudo actualizar el stock', 'error');
        } finally {
            setUpdatingStock(false);
        }
    };

    const handleUpdateVariantStock = async (variantId) => {
        try {
            await variacionesService.update(variantId, {
                stock: variantStocks[variantId]
            });
            Swal.fire({
                title: '¡Variante Actualizada!',
                text: 'El stock de la variante se ha actualizado.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            refreshNotifications();
        } catch (error) {
            console.error('Error updating variant stock:', error);
            Swal.fire('Error', 'No se pudo actualizar el stock de la variante', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
        );
    }

    if (!producto) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white dark:bg-[#111c44] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/productos')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                    >
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">{producto.nombre}</h1>
                        <Breadcrumb items={[
                            { label: 'Inicio', link: '/admin', isHome: true },
                            { label: 'Gestión de Productos', link: '/admin/productos' },
                            { label: 'Ver Detalles' }
                        ]} />
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link
                        to={`/admin/productos/editar/${producto.id}`}
                        className="px-6 py-2.5 bg-indigo-600 dark:bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
                    >
                        <i className="fas fa-edit"></i> Editar Todo
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda: Imagen e Info Principal */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-[#111c44] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                        <div className="aspect-square bg-gray-50 dark:bg-[#0b1437] flex items-center justify-center p-4">
                            {producto.imagen ? (
                                <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-center text-gray-400 dark:text-gray-600">
                                    <i className="fas fa-box-open text-4xl mb-2"></i>
                                    <p className="text-[10px] uppercase font-black tracking-widest">Sin imagen</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">${parseFloat(producto.precio_base).toFixed(2)}</span>
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${producto.stock > 0 ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
                                    {producto.stock > 0 ? 'En Stock' : 'Agotado'}
                                </span>
                            </div>

                            {/* Quick Stock Update */}
                            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/5">
                                <label className="block text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Sincronización de Stock Base</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={quickStock}
                                        onChange={(e) => setQuickStock(e.target.value)}
                                        className="flex-1 px-4 py-2 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-xl text-sm font-black text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="0"
                                    />
                                    <button
                                        onClick={handleUpdateStock}
                                        disabled={updatingStock}
                                        className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all border border-indigo-100 dark:border-indigo-500/20 disabled:opacity-50"
                                    >
                                        {updatingStock ? <i className="fas fa-circle-notch animate-spin"></i> : 'Aplicar'}
                                    </button>
                                </div>
                                <p className="text-[9px] font-bold text-gray-400 dark:text-gray-600 mt-2 uppercase tracking-tight">Este cambio afecta al stock base del producto.</p>
                            </div>

                            <div className="space-y-3 text-[10px] mt-6 bg-gray-50 dark:bg-[#0b1437] p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                <div className="flex justify-between items-center group">
                                    <span className="font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Categoría</span>
                                    <span className="font-black text-gray-900 dark:text-gray-300 uppercase tracking-tight">{producto.categoria_nombre || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Marca</span>
                                    <span className="font-black text-gray-900 dark:text-gray-300 uppercase tracking-tight">{producto.marca_nombre || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">SKU</span>
                                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">{producto.sku || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Detalles Completos */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Gestión de Inventario / Variantes */}
                    {producto.variaciones && producto.variaciones.length > 0 && (
                        <div className="bg-white dark:bg-[#111c44] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="text-xs font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
                                <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                                    <i className="fas fa-boxes text-purple-600 dark:text-purple-400"></i>
                                </div>
                                Control de Stock por Variantes
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-[10px]">
                                    <thead>
                                        <tr className="text-left text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-50 dark:border-white/5">
                                            <th className="pb-4 pr-4 font-black">Atributo</th>
                                            <th className="pb-4 pr-4 font-black">SKU</th>
                                            <th className="pb-4 pr-4 font-black">Precio</th>
                                            <th className="pb-4 w-32 font-black">Stock</th>
                                            <th className="pb-4 text-right font-black">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                        {producto.variaciones.map(v => (
                                            <tr key={v.id} className="group hover:bg-gray-50 dark:hover:bg-[#0b1437]/50 transition-colors">
                                                <td className="py-4 pr-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {v.atributos?.map((attr, idx) => (
                                                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-[8px] font-black uppercase border border-gray-200 dark:border-white/10">
                                                                {attr.atributo_nombre}: {attr.valor}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-4 font-mono font-bold text-gray-400 dark:text-gray-500">{v.sku}</td>
                                                <td className="py-4 pr-4 font-black text-gray-900 dark:text-white uppercase tracking-tight">${parseFloat(v.precio).toFixed(2)}</td>
                                                <td className="py-4 w-32">
                                                    <input
                                                        type="number"
                                                        value={variantStocks[v.id] || 0}
                                                        onChange={(e) => setVariantStocks({ ...variantStocks, [v.id]: e.target.value })}
                                                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#0b1437] border border-transparent group-hover:border-gray-200 dark:group-hover:border-white/10 rounded-xl text-[11px] font-black text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#111c44] focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                                                    />
                                                </td>
                                                <td className="py-4 text-right">
                                                    <button
                                                        onClick={() => handleUpdateVariantStock(v.id)}
                                                        className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-xl transition-all active:scale-95"
                                                        title="Guardar Stock"
                                                    >
                                                        <i className="fas fa-save shadow-sm"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Descripción */}
                    <div className="bg-white dark:bg-[#111c44] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="text-xs font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                                <i className="fas fa-align-left text-indigo-600 dark:text-indigo-400"></i>
                            </div>
                            Descripción del Producto
                        </h3>
                        <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 leading-relaxed uppercase tracking-tight whitespace-pre-line">
                            {producto.descripcion || 'Sin descripción disponible.'}
                        </p>
                    </div>

                    {/* Detalles Técnicos y Logística */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-[#111c44] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="text-xs font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
                                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                                    <i className="fas fa-truck text-blue-600 dark:text-blue-400"></i>
                                </div>
                                Logística & Envío
                            </h3>
                            <div className="space-y-4 text-[10px]">
                                <div className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-3">
                                    <span className="font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Peso Bruto</span>
                                    <span className="font-black text-gray-900 dark:text-gray-300 uppercase tracking-tight">{producto.peso ? `${producto.peso} kg` : '-'}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-3">
                                    <span className="font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Dimensiones</span>
                                    <span className="font-black text-gray-900 dark:text-gray-300 uppercase tracking-tight">
                                        {producto.largo && producto.ancho && producto.alto
                                            ? `${producto.largo}x${producto.ancho}x${producto.alto} cm`
                                            : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-3">
                                    <span className="font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Envío Gratuito</span>
                                    <span className={`font-black uppercase tracking-tight ${Number(producto.envio_gratis) === 1 ? 'text-emerald-500' : 'text-gray-900 dark:text-gray-300'}`}>
                                        {Number(producto.envio_gratis) === 1 ? 'Sí' : 'No'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-100/50 dark:border-white/5 pb-3 last:border-0 last:pb-0">
                                    <span className="font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Alerta Stock Mín.</span>
                                    <span className="font-black text-gray-900 dark:text-gray-300 uppercase tracking-tight">{producto.stock_minimo} unidades</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#111c44] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="text-xs font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
                                <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                                    <i className="fas fa-info-circle text-purple-600 dark:text-purple-400"></i>
                                </div>
                                Atributos Técnicos
                            </h3>
                            <div className="space-y-4 text-[10px]">
                                <div className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-3">
                                    <span className="font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Condición</span>
                                    <span className="font-black text-gray-900 dark:text-gray-300 uppercase tracking-tight">{producto.condicion}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-3 text-indigo-600 dark:text-indigo-400">
                                    <span className="font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Garantía Off.</span>
                                    <span className="font-black uppercase tracking-tight">{producto.garantia_meses} Meses</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-3">
                                    <span className="font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Modelo Rev.</span>
                                    <span className="font-black text-gray-900 dark:text-gray-300 uppercase tracking-tight">{producto.modelo || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-100/50 dark:border-white/5 pb-3 last:border-0 last:pb-0">
                                    <span className="font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Fabricante ID</span>
                                    <span className="font-black text-gray-900 dark:text-gray-300 uppercase tracking-tight">{producto.marca_fabricante || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="bg-white dark:bg-[#111c44] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="text-xs font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                                <i className="fas fa-search text-emerald-600 dark:text-emerald-400"></i>
                            </div>
                            SEO & Marketing Intelligence
                        </h3>
                        <div className="space-y-6">
                            <div className="group">
                                <label className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] block mb-2">Meta Título Dinámico</label>
                                <p className="text-[11px] font-black text-gray-900 dark:text-gray-200 uppercase tracking-tight">{producto.meta_titulo || '-'}</p>
                            </div>
                            <div className="group">
                                <label className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] block mb-2">Meta Descripción Optimizada</label>
                                <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tight leading-relaxed">{producto.meta_descripcion || '-'}</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                {Number(producto.destacado) === 1 && (
                                    <span className="px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-amber-100 dark:border-amber-500/20 shadow-sm shadow-amber-500/5">
                                        <i className="fas fa-star"></i> Destacado
                                    </span>
                                )}
                                {Number(producto.nuevo) === 1 && (
                                    <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100 dark:border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                                        <i className="fas fa-certificate"></i> Nuevo
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Galería */}
                    {producto.galeria_imagenes && (
                        <div className="bg-white dark:bg-[#111c44] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="text-xs font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
                                <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                                    <i className="fas fa-images text-orange-600 dark:text-orange-400"></i>
                                </div>
                                Galería de Activos Visuales
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {(() => {
                                    try {
                                        const galeria = JSON.parse(producto.galeria_imagenes);
                                        return galeria.map((img, idx) => (
                                            <div key={idx} className="group relative aspect-square bg-gray-50 dark:bg-[#0b1437] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm transition-all hover:shadow-xl hover:shadow-orange-500/10">
                                                <img src={img} alt={`Galeria ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <i className="fas fa-search-plus text-white text-xl"></i>
                                                </div>
                                            </div>
                                        ));
                                    } catch (e) {
                                        return <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest col-span-4 py-8 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl">No hay activos visuales adicionales registrados.</p>;
                                    }
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductosShow;
