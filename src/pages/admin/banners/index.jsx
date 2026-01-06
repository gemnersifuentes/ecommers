import { useState, useEffect } from 'react';
import { bannersService, categoriasService, marcasService, productosService } from '../../../services';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Edit2, Trash2, X, Save, Eye, EyeOff,
    Image as ImageIcon, Layout, Upload, Link as LinkIcon, Palette
} from 'lucide-react';

const OVERLAY_STYLES = [
    { name: 'Sin Overlay', value: '', preview: 'bg-transparent' },
    // Oscuros básicos
    { name: 'Oscuro Suave', value: 'bg-black/30', preview: 'bg-black/30' },
    { name: 'Oscuro Medio', value: 'bg-black/50', preview: 'bg-black/50' },
    { name: 'Oscuro Fuerte', value: 'bg-black/70', preview: 'bg-black/70' },
    // Gradientes negros
    { name: 'Gradiente ↑ Negro', value: 'bg-gradient-to-t from-black/80 via-black/40 to-transparent', preview: 'bg-gradient-to-t from-black/80 to-transparent' },
    { name: 'Gradiente ↓ Negro', value: 'bg-gradient-to-b from-black/80 via-black/40 to-transparent', preview: 'bg-gradient-to-b from-black/80 to-transparent' },
    { name: 'Gradiente → Negro', value: 'bg-gradient-to-r from-black/80 via-black/40 to-transparent', preview: 'bg-gradient-to-r from-black/80 to-transparent' },
    { name: 'Gradiente ← Negro', value: 'bg-gradient-to-l from-black/80 via-black/40 to-transparent', preview: 'bg-gradient-to-l from-black/80 to-transparent' },
    // Gradientes azules
    { name: 'Gradiente ↑ Azul', value: 'bg-gradient-to-t from-blue-900/80 via-blue-700/40 to-transparent', preview: 'bg-gradient-to-t from-blue-900 to-blue-400' },
    { name: 'Gradiente ↓ Azul', value: 'bg-gradient-to-b from-blue-900/80 via-blue-700/40 to-transparent', preview: 'bg-gradient-to-b from-blue-900 to-blue-400' },
    { name: 'Gradiente → Azul', value: 'bg-gradient-to-r from-blue-900/80 via-blue-700/40 to-transparent', preview: 'bg-gradient-to-r from-blue-900 to-blue-400' },
    { name: 'Azul-Cyan', value: 'bg-gradient-to-br from-blue-600/70 to-cyan-400/70', preview: 'bg-gradient-to-br from-blue-600 to-cyan-400' },
    // Gradientes púrpuras y rosas
    { name: 'Gradiente ↑ Púrpura', value: 'bg-gradient-to-t from-purple-900/80 via-purple-700/40 to-transparent', preview: 'bg-gradient-to-t from-purple-900 to-purple-400' },
    { name: 'Gradiente ↓ Púrpura', value: 'bg-gradient-to-b from-purple-900/80 via-purple-700/40 to-transparent', preview: 'bg-gradient-to-b from-purple-900 to-purple-400' },
    { name: 'Púrpura-Rosa', value: 'bg-gradient-to-br from-purple-600/70 to-pink-500/70', preview: 'bg-gradient-to-br from-purple-600 to-pink-500' },
    { name: 'Rosa-Naranja', value: 'bg-gradient-to-br from-pink-600/70 to-orange-400/70', preview: 'bg-gradient-to-br from-pink-600 to-orange-400' },
    // Gradientes verdes
    { name: 'Gradiente ↑ Verde', value: 'bg-gradient-to-t from-green-900/80 via-green-700/40 to-transparent', preview: 'bg-gradient-to-t from-green-900 to-green-400' },
    { name: 'Gradiente ↓ Verde', value: 'bg-gradient-to-b from-green-900/80 via-green-700/40 to-transparent', preview: 'bg-gradient-to-b from-green-900 to-green-400' },
    { name: 'Verde-Esmeralda', value: 'bg-gradient-to-br from-green-600/70 to-emerald-400/70', preview: 'bg-gradient-to-br from-green-600 to-emerald-400' },
    // Gradientes naranjas y rojos
    { name: 'Gradiente ↑ Naranja', value: 'bg-gradient-to-t from-orange-900/80 via-orange-700/40 to-transparent', preview: 'bg-gradient-to-t from-orange-900 to-orange-400' },
    { name: 'Gradiente ↓ Rojo', value: 'bg-gradient-to-b from-red-900/80 via-red-700/40 to-transparent', preview: 'bg-gradient-to-b from-red-900 to-red-400' },
    { name: 'Rojo-Naranja', value: 'bg-gradient-to-br from-red-600/70 to-orange-400/70', preview: 'bg-gradient-to-br from-red-600 to-orange-400' },
    { name: 'Naranja-Amarillo', value: 'bg-gradient-to-br from-orange-600/70 to-yellow-400/70', preview: 'bg-gradient-to-br from-orange-600 to-yellow-400' },
    // Gradientes multicolor
    { name: 'Atardecer', value: 'bg-gradient-to-br from-purple-900/70 via-pink-700/60 to-orange-600/70', preview: 'bg-gradient-to-br from-purple-900 via-pink-700 to-orange-600' },
    { name: 'Océano', value: 'bg-gradient-to-br from-blue-900/70 via-cyan-700/60 to-teal-600/70', preview: 'bg-gradient-to-br from-blue-900 via-cyan-700 to-teal-600' },
    { name: 'Bosque', value: 'bg-gradient-to-br from-green-900/70 via-emerald-700/60 to-lime-600/70', preview: 'bg-gradient-to-br from-green-900 via-emerald-700 to-lime-600' },
    { name: 'Fuego', value: 'bg-gradient-to-br from-red-900/70 via-orange-700/60 to-yellow-600/70', preview: 'bg-gradient-to-br from-red-900 via-orange-700 to-yellow-600' },
    // Sólidos
    { name: 'Sólido Negro', value: 'bg-gray-900', preview: 'bg-gray-900' },
    { name: 'Sólido Azul', value: 'bg-blue-900', preview: 'bg-blue-900' },
    { name: 'Sólido Púrpura', value: 'bg-purple-900', preview: 'bg-purple-900' },
    { name: 'Sólido Gris', value: 'bg-slate-800', preview: 'bg-slate-800' },
    // Transparentes
    { name: 'Azul Transparente', value: 'bg-blue-900/40', preview: 'bg-blue-900/40' },
    { name: 'Púrpura Transparente', value: 'bg-purple-900/40', preview: 'bg-purple-900/40' },
    { name: 'Verde Transparente', value: 'bg-green-900/40', preview: 'bg-green-900/40' },
    { name: 'Dorado Transparente', value: 'bg-yellow-900/30', preview: 'bg-yellow-900/30' },
    { name: 'Rojo Transparente', value: 'bg-red-900/40', preview: 'bg-red-900/40' }
];

const ROUTE_TYPES = [
    { name: 'Ruta Directa', value: 'direct', icon: LinkIcon },
    { name: 'Categoría', value: 'categoria', icon: Layout },
    { name: 'Marca', value: 'marca', icon: Layout },
    { name: 'Producto', value: 'producto', icon: Layout }
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AdminBanners = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [bannerEdit, setBannerEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [productos, setProductos] = useState([]);

    const initialForm = {
        tipo: 'carousel',
        titulo: '',
        subtitulo: '',
        descripcion: '',
        texto_boton: '',
        link: '',
        imagen: '',
        gradiente: '',
        orden: 0,
        activo: 1
    };

    const [formData, setFormData] = useState(initialForm);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [routeType, setRouteType] = useState('direct');
    const [selectedRouteId, setSelectedRouteId] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [customColor, setCustomColor] = useState('#000000');
    const [customColorOpacity, setCustomColorOpacity] = useState(50);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [bannersData, categoriasData, marcasData, productosData] = await Promise.all([
                bannersService.getAll(),
                categoriasService.getAll(),
                marcasService.getAll(),
                productosService.getAll()
            ]);

            setBanners(Array.isArray(bannersData) ? bannersData : []);
            setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
            setMarcas(Array.isArray(marcasData) ? marcasData : []);
            // productosService.getAll() devuelve { data: [...], total: X }
            setProductos(Array.isArray(productosData?.data) ? productosData.data : (Array.isArray(productosData) ? productosData : []));
        } catch (error) {
            console.error('Error al cargar datos:', error);
            if (!error.response || error.response.status !== 401) {
                Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
            }
            setBanners([]);
        } finally {
            setLoading(false);
        }
    };

    const handleNuevo = () => {
        setBannerEdit(null);
        setFormData({ ...initialForm, link: '/productos' });
        setSelectedFile(null);
        setPreviewUrl('');
        setRouteType('direct');
        setSelectedRouteId('');
        setProductSearch('');
        setShowProductDropdown(false);
        setMostrarModal(true);
    };

    const parseLink = (link) => {
        if (!link) return { type: 'direct', id: '', path: '' };

        if (link.includes('?categoria=')) {
            const match = link.match(/categoria=(\d+)/);
            return { type: 'categoria', id: match ? match[1] : '', path: link };
        } else if (link.includes('?marca=')) {
            const match = link.match(/marca=(\d+)/);
            return { type: 'marca', id: match ? match[1] : '', path: link };
        } else if (link.startsWith('/producto/')) {
            return { type: 'producto', id: link.split('/')[2], path: link };
        }
        return { type: 'direct', id: '', path: link || '/productos' };
    };

    const handleEditar = (banner) => {
        setBannerEdit(banner);
        setFormData({
            tipo: banner.tipo,
            titulo: banner.titulo,
            subtitulo: banner.subtitulo || '',
            descripcion: banner.descripcion || '',
            texto_boton: banner.texto_boton || '',
            link: banner.link || '',
            imagen: banner.imagen,
            gradiente: banner.gradiente || '',
            orden: banner.orden || 0,
            activo: banner.activo
        });

        const parsedLink = parseLink(banner.link);
        setRouteType(parsedLink.type);
        setSelectedRouteId(parsedLink.id);

        // Si es un producto, cargar el nombre en el campo de búsqueda
        if (parsedLink.type === 'producto' && parsedLink.id) {
            const producto = productos.find(p => p.id == parsedLink.id);
            setProductSearch(producto ? producto.nombre : '');
        } else {
            setProductSearch('');
        }
        setShowProductDropdown(false);

        setSelectedFile(null);
        const imageUrl = banner.imagen ?
            (banner.imagen.startsWith('http') ? banner.imagen : `${API_URL}${banner.imagen}?t=${Date.now()}`) : '';
        setPreviewUrl(imageUrl);
        setMostrarModal(true);
    };

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280'
        });

        if (result.isConfirmed) {
            try {
                await bannersService.delete(id);
                Swal.fire('Eliminado', 'Banner eliminado exitosamente', 'success');
                cargarDatos();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el banner', 'error');
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSize = 20 * 1024 * 1024;
            if (file.size > maxSize) {
                Swal.fire({
                    icon: 'error',
                    title: 'Archivo muy grande',
                    text: `La imagen debe ser menor a 20MB. Tu archivo tiene ${(file.size / 1024 / 1024).toFixed(2)}MB`,
                    footer: 'Por favor, comprime la imagen o usa una más pequeña'
                });
                e.target.value = '';
                return;
            }

            const allowedTypes = [
                'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
                'image/svg+xml', 'image/avif', 'image/bmp', 'image/tiff'
            ];
            if (!allowedTypes.includes(file.type)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Tipo de archivo no válido',
                    text: 'Solo se permiten imágenes JPG, PNG, GIF, WEBP, SVG, AVIF, BMP o TIFF'
                });
                e.target.value = '';
                return;
            }

            console.log('Archivo seleccionado:', {
                name: file.name,
                size: file.size,
                type: file.type
            });

            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const buildLink = () => {
        if (routeType === 'direct') {
            return formData.link || '/productos';
        } else if (routeType === 'categoria' && selectedRouteId) {
            return `/productos?categoria=${selectedRouteId}`;
        } else if (routeType === 'marca' && selectedRouteId) {
            return `/productos?marca=${selectedRouteId}`;
        } else if (routeType === 'producto' && selectedRouteId) {
            return `/producto/${selectedRouteId}`;
        }
        return '/productos';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile && !formData.imagen) {
            Swal.fire('Error', 'Debes subir una imagen', 'error');
            return;
        }

        try {
            const data = new FormData();
            const finalLink = buildLink();

            console.log('=== PREPARANDO ENVÍO ===');
            console.log('Archivo seleccionado:', selectedFile);
            console.log('Link construido:', finalLink);

            Object.keys(formData).forEach(key => {
                if (key === 'link') {
                    data.append(key, finalLink);
                } else {
                    data.append(key, formData[key]);
                }
            });

            if (selectedFile) {
                data.append('imagen_file', selectedFile);
                console.log('✅ Archivo agregado a FormData:', selectedFile.name, selectedFile.size, 'bytes');
            } else {
                console.log('⚠️ No hay archivo seleccionado');
            }

            console.log('=== ENVIANDO PETICIÓN ===');
            console.log('Modo:', bannerEdit ? 'UPDATE' : 'CREATE');

            if (bannerEdit) {
                const response = await bannersService.update(bannerEdit.id, data);
                console.log('Respuesta UPDATE:', response);
                Swal.fire('Actualizado', 'Banner actualizado exitosamente', 'success');
            } else {
                const response = await bannersService.create(data);
                console.log('Respuesta CREATE:', response);
                Swal.fire('Creado', 'Banner creado exitosamente', 'success');
            }
            setMostrarModal(false);
            await cargarDatos();
            console.log('=== DATOS RECARGADOS ===');
        } catch (error) {
            console.error('❌ ERROR:', error);
            console.error('Respuesta del servidor:', error.response?.data);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'No se pudo guardar el banner';
            Swal.fire('Error', errorMsg, 'error');
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    const bannersFiltrados = Array.isArray(banners) ? banners.filter(banner =>
        banner.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (banner.subtitulo && banner.subtitulo.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : [];

    const carouselBanners = bannersFiltrados.filter(b => b.tipo === 'carousel');
    const lateralBanners = bannersFiltrados.filter(b => b.tipo === 'lateral');
    const gridBanners = bannersFiltrados.filter(b => b.tipo === 'grid');
    const categoryGridBanners = bannersFiltrados.filter(b => b.tipo === 'category_grid');

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Cargando banners...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Banners</h1>
                            <p className="text-gray-600">Administra los banners del carrusel y laterales de tu tienda</p>
                        </div>
                        <button
                            onClick={handleNuevo}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <Plus size={20} />
                            Nuevo Banner
                        </button>
                    </div>

                    {/* Search */}
                    <div className="mt-6 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar banners por título o subtítulo..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Carrusel Banners */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Layout size={24} className="text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Carrusel Principal</h2>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {carouselBanners.length} banners
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {carouselBanners.map((banner) => (
                            <BannerCard
                                key={banner.id}
                                banner={banner}
                                onEdit={() => handleEditar(banner)}
                                onDelete={() => handleEliminar(banner.id)}
                            />
                        ))}
                        {carouselBanners.length === 0 && (
                            <div className="col-span-full py-16 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                <ImageIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg font-medium">No hay banners en el carrusel</p>
                                <p className="text-gray-400 text-sm mt-2">Crea tu primer banner para comenzar</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lateral Banners */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Layout size={24} className="text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Banners Laterales</h2>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                            {lateralBanners.length} banners
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lateralBanners.map((banner) => (
                            <BannerCard
                                key={banner.id}
                                banner={banner}
                                onEdit={() => handleEditar(banner)}
                                onDelete={() => handleEliminar(banner.id)}
                            />
                        ))}
                        {lateralBanners.length === 0 && (
                            <div className="col-span-full py-16 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                <ImageIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg font-medium">No hay banners laterales</p>
                                <p className="text-gray-400 text-sm mt-2">Agrega banners laterales para complementar tu tienda</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid Banners */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Layout size={24} className="text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Banners Centrales (Grid)</h2>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                            {gridBanners.length} banners
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gridBanners.map((banner) => (
                            <BannerCard
                                key={banner.id}
                                banner={banner}
                                onEdit={() => handleEditar(banner)}
                                onDelete={() => handleEliminar(banner.id)}
                            />
                        ))}
                        {gridBanners.length === 0 && (
                            <div className="col-span-full py-16 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                <ImageIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg font-medium">No hay banners tipo Grid</p>
                                <p className="text-gray-400 text-sm mt-2">Estos banners aparecen debajo del carrusel</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Grid Banners */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Layout size={24} className="text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Sección con Productos</h2>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            {categoryGridBanners.length} secciones
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryGridBanners.map((banner) => (
                            <BannerCard
                                key={banner.id}
                                banner={banner}
                                onEdit={() => handleEditar(banner)}
                                onDelete={() => handleEliminar(banner.id)}
                            />
                        ))}
                        {categoryGridBanners.length === 0 && (
                            <div className="col-span-full py-16 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                <ImageIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg font-medium">No hay secciones con productos</p>
                                <p className="text-gray-400 text-sm mt-2">Banner + productos de una categoría</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Formulario */}
                <AnimatePresence>
                    {mostrarModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                            >
                                {/* Modal Header */}
                                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {bannerEdit ? 'Editar Banner' : 'Nuevo Banner'}
                                            </h2>
                                            <p className="text-gray-600 text-sm mt-1">
                                                {bannerEdit ? 'Modifica los detalles del banner' : 'Crea un nuevo banner para tu tienda'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setMostrarModal(false)}
                                            className="p-2 hover:bg-white rounded-lg transition-colors"
                                        >
                                            <X size={24} className="text-gray-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                                    <div className="space-y-6">
                                        {/* Configuración Básica */}
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <Layout size={20} className="text-blue-600" />
                                                Configuración Básica
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Banner</label>
                                                    <select
                                                        name="tipo"
                                                        value={formData.tipo}
                                                        onChange={handleChange}
                                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    >
                                                        <option value="carousel">🎠 Carrusel Principal</option>
                                                        <option value="lateral">📱 Lateral Pequeño</option>
                                                        <option value="grid">🔳 Banners Centrales (Grid)</option>
                                                        <option value="category_grid">🛍️ Sección con Productos</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Orden de Aparición</label>
                                                    <input
                                                        type="number"
                                                        name="orden"
                                                        value={formData.orden}
                                                        onChange={handleChange}
                                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
                                                        <input
                                                            type="checkbox"
                                                            name="activo"
                                                            id="activo"
                                                            checked={formData.activo == 1}
                                                            onChange={handleChange}
                                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                                        />
                                                        <div className="flex-1">
                                                            <span className="text-sm font-medium text-gray-900">Banner Activo</span>
                                                            <p className="text-xs text-gray-500 mt-0.5">El banner se mostrará en la tienda</p>
                                                        </div>
                                                        {formData.activo == 1 ? <Eye className="text-green-600" size={20} /> : <EyeOff className="text-gray-400" size={20} />}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contenido del Banner */}
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                ✏️ Contenido del Banner
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Título Principal *</label>
                                                    <input
                                                        type="text"
                                                        name="titulo"
                                                        value={formData.titulo}
                                                        onChange={handleChange}
                                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg font-semibold"
                                                        placeholder="Ej: OFERTA ESPECIAL"
                                                        required
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Subtítulo / Badge</label>
                                                        <input
                                                            type="text"
                                                            name="subtitulo"
                                                            value={formData.subtitulo}
                                                            onChange={handleChange}
                                                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                            placeholder="Ej: NUEVO"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Texto del Botón</label>
                                                        <input
                                                            type="text"
                                                            name="texto_boton"
                                                            value={formData.texto_boton}
                                                            onChange={handleChange}
                                                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                            placeholder="Ej: Ver más"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                                                    <textarea
                                                        name="descripcion"
                                                        value={formData.descripcion}
                                                        onChange={handleChange}
                                                        rows="3"
                                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                                        placeholder="Descripción breve del banner..."
                                                    ></textarea>
                                                </div>
                                                {/* Category Selector for category_grid type */}
                                                {formData.tipo === 'category_grid' && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría de Productos *</label>
                                                        <select
                                                            name="link"
                                                            value={formData.link}
                                                            onChange={handleChange}
                                                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                            required
                                                        >
                                                            <option value="">Seleccionar categoría...</option>
                                                            {categorias.map(cat => (
                                                                <option key={cat.id} value={`?categoria=${cat.id}`}>
                                                                    {cat.nombre}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <p className="text-xs text-gray-500 mt-1">Los productos de esta categoría se mostrarán junto al banner</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Imagen */}
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <ImageIcon size={20} className="text-blue-600" />
                                                Imagen del Banner *
                                            </h3>
                                            <div className="space-y-4">
                                                <label className="block">
                                                    <div className="relative cursor-pointer group">
                                                        <input
                                                            type="file"
                                                            onChange={handleFileChange}
                                                            accept="image/*"
                                                            className="hidden"
                                                        />
                                                        <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 bg-white hover:bg-blue-50 transition-all text-center group-hover:border-blue-500">
                                                            <Upload className="mx-auto h-12 w-12 text-blue-500 mb-3" />
                                                            <p className="text-gray-700 font-medium mb-1">
                                                                {selectedFile ? selectedFile.name : 'Click para subir imagen'}
                                                            </p>
                                                            <p className="text-sm text-gray-500">JPG, PNG, GIF, WEBP, SVG, AVIF (máx. 20MB)</p>
                                                        </div>
                                                    </div>
                                                </label>

                                                {previewUrl && (
                                                    <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-white">
                                                        <div className="aspect-video relative">
                                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                            {formData.gradiente && (
                                                                <div
                                                                    className={`absolute inset-0 ${formData.gradiente.startsWith('bg-') ? formData.gradiente : ''}`}
                                                                    style={!formData.gradiente.startsWith('bg-') ? { backgroundColor: formData.gradiente } : {}}
                                                                ></div>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedFile(null);
                                                                setPreviewUrl('');
                                                                setFormData({ ...formData, imagen: '' });
                                                            }}
                                                            className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Overlay de Estilo */}
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <Palette size={20} className="text-purple-600" />
                                                Overlay de Estilo
                                            </h3>
                                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                                {OVERLAY_STYLES.map((style) => (
                                                    <button
                                                        key={style.value}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, gradiente: style.value })}
                                                        className={`relative p-2 rounded-lg border transition-all ${formData.gradiente === style.value
                                                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                                            }`}
                                                    >
                                                        <div className={`h-10 rounded mb-1 ${style.preview}`}></div>
                                                        <p className="text-[10px] font-medium text-gray-700 text-center leading-tight">{style.name}</p>
                                                        {formData.gradiente === style.value && (
                                                            <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                                <span className="text-white text-xs">✓</span>
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Selector de Color Personalizado */}
                                            <div className="mt-4 p-3 bg-white rounded-lg border border-dashed border-purple-300">
                                                <p className="text-xs font-semibold text-gray-700 mb-2">🎨 Color Personalizado</p>
                                                <div className="flex flex-col md:flex-row gap-2 items-end">
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-medium text-gray-600 mb-2">Color</label>
                                                        <div className="flex gap-2 items-center">
                                                            <input
                                                                type="color"
                                                                value={customColor}
                                                                onChange={(e) => setCustomColor(e.target.value)}
                                                                className="h-8 w-12 rounded border border-gray-300 cursor-pointer"
                                                            />
                                                            <div
                                                                className="h-8 w-8 rounded border border-gray-300"
                                                                style={{ backgroundColor: customColor }}
                                                            ></div>
                                                            <span className="text-[10px] font-mono text-gray-600">{customColor}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-medium text-gray-600 mb-2">
                                                            Opacidad: {customColorOpacity}%
                                                        </label>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={customColorOpacity}
                                                            onChange={(e) => setCustomColorOpacity(Number(e.target.value))}
                                                            className="w-full h-1.5 bg-gray-200 rounded appearance-none cursor-pointer"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const opacity = (customColorOpacity / 100).toFixed(2);
                                                            const hex = customColor.replace('#', '');
                                                            const r = parseInt(hex.substring(0, 2), 16);
                                                            const g = parseInt(hex.substring(2, 4), 16);
                                                            const b = parseInt(hex.substring(4, 6), 16);
                                                            setFormData({ ...formData, gradiente: `rgba(${r},${g},${b},${opacity})` });
                                                        }}
                                                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-all font-medium text-xs whitespace-nowrap"
                                                    >
                                                        Aplicar Color
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Destino del Banner */}
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <LinkIcon size={20} className="text-green-600" />
                                                Destino del Banner
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {ROUTE_TYPES.map((type) => (
                                                        <button
                                                            key={type.value}
                                                            type="button"
                                                            onClick={() => {
                                                                setRouteType(type.value);
                                                                setSelectedRouteId('');
                                                                setProductSearch('');
                                                                setShowProductDropdown(false);
                                                                // Resetear el link a /productos cuando cambias a Ruta Directa
                                                                if (type.value === 'direct') {
                                                                    setFormData({ ...formData, link: '/productos' });
                                                                }
                                                            }}
                                                            className={`p-4 rounded-lg border-2 transition-all ${routeType === type.value
                                                                ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                                                }`}
                                                        >
                                                            <type.icon className={`mx-auto mb-2 ${routeType === type.value ? 'text-green-600' : 'text-gray-400'}`} size={24} />
                                                            <p className="text-sm font-medium text-gray-700 text-center">{type.name}</p>
                                                        </button>
                                                    ))}
                                                </div>

                                                {routeType === 'direct' && (
                                                    <input
                                                        type="text"
                                                        name="link"
                                                        value={formData.link}
                                                        onChange={handleChange}
                                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                        placeholder="/ruta-personalizada"
                                                    />
                                                )}

                                                {routeType === 'categoria' && (
                                                    <select
                                                        value={selectedRouteId}
                                                        onChange={(e) => setSelectedRouteId(e.target.value)}
                                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                    >
                                                        <option value="">Selecciona una categoría</option>
                                                        {categorias.map(cat => (
                                                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                                        ))}
                                                    </select>
                                                )}

                                                {routeType === 'marca' && (
                                                    <select
                                                        value={selectedRouteId}
                                                        onChange={(e) => setSelectedRouteId(e.target.value)}
                                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                    >
                                                        <option value="">Selecciona una marca</option>
                                                        {marcas.map(marca => (
                                                            <option key={marca.id} value={marca.id}>{marca.nombre}</option>
                                                        ))}
                                                    </select>
                                                )}

                                                {routeType === 'producto' && (
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={productSearch}
                                                            onChange={(e) => {
                                                                setProductSearch(e.target.value);
                                                                setShowProductDropdown(true);
                                                            }}
                                                            onFocus={() => setShowProductDropdown(true)}
                                                            placeholder="Buscar producto..."
                                                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                        />
                                                        {showProductDropdown && (
                                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                                {productos
                                                                    .filter(prod => prod.nombre.toLowerCase().includes(productSearch.toLowerCase()))
                                                                    .slice(0, 50)
                                                                    .map(prod => (
                                                                        <button
                                                                            key={prod.id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSelectedRouteId(prod.id);
                                                                                setProductSearch(prod.nombre);
                                                                                setShowProductDropdown(false);
                                                                            }}
                                                                            className="w-full text-left px-4 py-2 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0"
                                                                        >
                                                                            <p className="font-medium text-gray-900">{prod.nombre}</p>
                                                                            {prod.precio && (
                                                                                <p className="text-sm text-gray-500">Precio: ${prod.precio}</p>
                                                                            )}
                                                                        </button>
                                                                    ))}
                                                                {productos.filter(prod => prod.nombre.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                                                                    <div className="px-4 py-3 text-gray-500 text-center">
                                                                        No se encontraron productos
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                {/* Modal Footer */}
                                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setMostrarModal(false)}
                                        className="px-6 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                                    >
                                        <Save size={20} />
                                        Guardar Banner
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )
                    }
                </AnimatePresence >
            </div >
        </div >
    );
};

const BannerCard = ({ banner, onEdit, onDelete }) => {
    const imageUrl = banner.imagen ?
        (banner.imagen.startsWith('http') ? banner.imagen : `${API_URL}${banner.imagen}?t=${Date.now()}`) : '';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
        >
            <div className="h-48 relative bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-105 transition-transform duration-300">
                {imageUrl ? (
                    <>
                        <img
                            src={imageUrl}
                            alt={banner.titulo}
                            className="w-full h-full object-cover"
                        />
                        {banner.gradiente && (
                            <div
                                className={`absolute inset-0 ${banner.gradiente.startsWith('bg-') ? banner.gradiente : ''}`}
                                style={!banner.gradiente.startsWith('bg-') ? { backgroundColor: banner.gradiente } : {}}
                            ></div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="text-gray-300" size={64} />
                    </div>
                )}

                {/* Overlay con acciones */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                        onClick={onEdit}
                        className="p-3 bg-white rounded-xl hover:bg-blue-50 text-blue-600 transform hover:scale-110 transition-all shadow-lg"
                    >
                        <Edit2 size={20} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-3 bg-white rounded-xl hover:bg-red-50 text-red-600 transform hover:scale-110 transition-all shadow-lg"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>

                {/* Badge de estado */}
                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${banner.activo
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                        }`}>
                        {banner.activo ? '✓ Activo' : '✕ Inactivo'}
                    </span>
                </div>

                {/* Badge de orden */}
                <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-mono font-bold text-gray-700">
                        #{banner.orden}
                    </span>
                </div>
            </div>

            <div className="p-5">
                <div className="mb-3">
                    {banner.subtitulo && (
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1.5">
                            {banner.subtitulo}
                        </p>
                    )}
                    <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">
                        {banner.titulo}
                    </h3>
                </div>

                {banner.descripcion && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {banner.descripcion}
                    </p>
                )}

                {banner.link && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                        <LinkIcon size={14} />
                        <span className="truncate">{banner.link}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default AdminBanners;
