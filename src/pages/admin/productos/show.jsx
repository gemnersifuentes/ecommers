import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { productosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const ProductosShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducto = async () => {
            try {
                const data = await productosService.getById(id);
                setProducto(data);
            } catch (error) {
                console.error('Error loading product:', error);
                Swal.fire('Error', 'No se pudo cargar el producto', 'error');
                navigate('/admin/productos');
            } finally {
                setLoading(false);
            }
        };
        loadProducto();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!producto) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/productos')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                    >
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{producto.nombre}</h1>
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
                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <i className="fas fa-edit"></i> Editar
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda: Imagen e Info Principal */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                            {producto.imagen ? (
                                <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <i className="fas fa-box-open text-4xl mb-2"></i>
                                    <p>Sin imagen</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-3xl font-bold text-gray-900">${parseFloat(producto.precio_base).toFixed(2)}</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${producto.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {producto.stock > 0 ? 'En Stock' : 'Agotado'}
                                </span>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Categoría</span>
                                    <span className="font-medium">{producto.categoria_nombre || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Marca</span>
                                    <span className="font-medium">{producto.marca_nombre || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">SKU</span>
                                    <span className="font-medium">{producto.sku || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Detalles Completos */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Descripción */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <i className="fas fa-align-left text-indigo-500"></i> Descripción
                        </h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {producto.descripcion || 'Sin descripción disponible.'}
                        </p>
                    </div>

                    {/* Detalles Técnicos y Logística */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <i className="fas fa-truck text-blue-500"></i> Logística
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Peso</span>
                                    <span className="font-medium">{producto.peso ? `${producto.peso} kg` : '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Dimensiones</span>
                                    <span className="font-medium">
                                        {producto.largo && producto.ancho && producto.alto
                                            ? `${producto.largo}x${producto.ancho}x${producto.alto} cm`
                                            : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Envío Gratis</span>
                                    <span className="font-medium">{Number(producto.envio_gratis) === 1 ? 'Sí' : 'No'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Stock Mínimo</span>
                                    <span className="font-medium">{producto.stock_minimo}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <i className="fas fa-info-circle text-purple-500"></i> Info Adicional
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Condición</span>
                                    <span className="font-medium capitalize">{producto.condicion}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Garantía</span>
                                    <span className="font-medium">{producto.garantia_meses} meses</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Modelo</span>
                                    <span className="font-medium">{producto.modelo || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Fabricante</span>
                                    <span className="font-medium">{producto.marca_fabricante || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <i className="fas fa-search text-green-500"></i> SEO & Marketing
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs text-gray-500 block mb-1">Meta Título</span>
                                <p className="text-sm font-medium text-gray-900">{producto.meta_titulo || '-'}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 block mb-1">Meta Descripción</span>
                                <p className="text-sm text-gray-600">{producto.meta_descripcion || '-'}</p>
                            </div>
                            <div className="flex gap-2 pt-2">
                                {Number(producto.destacado) === 1 && (
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold flex items-center gap-1">
                                        <i className="fas fa-star"></i> Destacado
                                    </span>
                                )}
                                {Number(producto.nuevo) === 1 && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold flex items-center gap-1">
                                        <i className="fas fa-certificate"></i> Nuevo
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Galería */}
                    {producto.galeria_imagenes && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <i className="fas fa-images text-orange-500"></i> Galería
                            </h3>
                            <div className="grid grid-cols-4 gap-4">
                                {(() => {
                                    try {
                                        const galeria = JSON.parse(producto.galeria_imagenes);
                                        return galeria.map((img, idx) => (
                                            <div key={idx} className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                                                <img src={img} alt={`Galeria ${idx}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                                            </div>
                                        ));
                                    } catch (e) {
                                        return <p className="text-sm text-gray-500 col-span-4">No hay imágenes adicionales.</p>;
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
