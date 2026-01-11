import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tiendaService, favoritosService } from '../services';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/ui/Loading';
import Swal from 'sweetalert2';
import { useLoader } from '../context/LoaderContext';



import {
    FaShoppingCart,
    FaArrowLeft,
    FaCheck,
    FaHeart,
    FaRegHeart,
    FaStar,
    FaMinus,
    FaPlus
} from 'react-icons/fa';
import { CheckCircle2, FileText, Settings, ChevronLeft, ChevronRight, Store, Truck, Package, ChevronDown, ArrowLeft, Heart, Home, MessageCircle as Chat } from 'lucide-react';
import ProductReviews from '../components/products/ProductReviews';
import SimpleToast from '../components/ui/SimpleToast';

const ProductoDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { isAuthenticated } = useAuth();

    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imagenActual, setImagenActual] = useState(0);
    const [cantidad, setCantidad] = useState(1);
    const [imagenesGaleria, setImagenesGaleria] = useState([]);
    const [variacionSeleccionada, setVariacionSeleccionada] = useState(null);
    const [seleccionesAtributos, setSeleccionesAtributos] = useState({});
    const [isFavorite, setIsFavorite] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, days: 0 });
    const [toast, setToast] = useState(null);

    // Estado para el zoom de la imagen
    const [isHovering, setIsHovering] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

    // Estados para secciones expandibles
    const [stockExpanded, setStockExpanded] = useState(false);
    const [deliveryExpanded, setDeliveryExpanded] = useState(false);
    const [pickupExpanded, setPickupExpanded] = useState(false);
    const [specsExpanded, setSpecsExpanded] = useState(false);
    const { showLoader, hideLoader } = useLoader();

    useEffect(() => {
        cargarProducto();
    }, [id]);

    useEffect(() => {
        setSeleccionesAtributos({});
        setVariacionSeleccionada(null);
    }, [id]);

    // Calculate discount
    const descuento = useMemo(() => {
        if (!producto || !producto.tiene_descuento) return 0;
        const precioBase = parseFloat(producto.precio_base);
        const precioFinal = parseFloat(producto.precio_final);
        return Math.round(((precioBase - precioFinal) / precioBase) * 100);
    }, [producto]);

    // Countdown timer for discounts - Calculate real time remaining
    useEffect(() => {
        if (descuento > 0 && producto) {
            const calculateTimeLeft = () => {
                const now = new Date();
                // Set target to end of current week (Sunday 23:59:59)
                const target = new Date();
                const daysUntilSunday = 7 - now.getDay();
                target.setDate(now.getDate() + daysUntilSunday);
                target.setHours(23, 59, 59, 999);

                const difference = target - now;

                if (difference > 0) {
                    setTimeLeft({
                        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                        minutes: Math.floor((difference / 1000 / 60) % 60),
                        seconds: Math.floor((difference / 1000) % 60)
                    });
                }
            };

            calculateTimeLeft();
            const timer = setInterval(calculateTimeLeft, 1000);
            return () => clearInterval(timer);
        }
    }, [descuento, producto]);

    // Helper para construir la URL completa de la imagen
    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path; // Already full URL
        // Remove leading slash if present to avoid double slashes
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        // Use import.meta.env.VITE_API_URL or default to localhost:8000
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        return `${baseUrl}/${cleanPath}`;
    };

    const cargarProducto = async () => {
        try {
            const data = await tiendaService.getProductoById(id);

            // Ensure product is valid before setting state
            if (!data || !data.id) {
                throw new Error('Producto no válido');
            }

            setProducto(data);

            // 🔍 ROBUST IMAGE LOADING STRATEGY
            // 1. Try 'imagenes' array (standard API)
            // 2. Try 'galeria_imagenes' string (legacy/list API)
            // 3. Fallback to 'imagen' (single)
            let rawImages = [];

            if (Array.isArray(data.imagenes) && data.imagenes.length > 0) {
                rawImages = data.imagenes;
            } else if (typeof data.galeria_imagenes === 'string') {
                try {
                    const parsed = JSON.parse(data.galeria_imagenes);
                    if (Array.isArray(parsed)) rawImages = parsed;
                } catch (e) { console.error('Error parsing galeria', e); }
            }

            // Ensure main image is included if gallery is empty or doesn't have it
            if (data.imagen && !rawImages.includes(data.imagen)) {
                rawImages.unshift(data.imagen);
            }

            // 4. Collect images from Variations (Only if Color)
            if (data.variaciones && Array.isArray(data.variaciones)) {
                data.variaciones.forEach(v => {
                    // Check if variation has 'color' attribute
                    const isColorVariant = v.atributos?.some(a =>
                        a.atributo_nombre?.toLowerCase() === 'color'
                    );

                    if (isColorVariant && v.imagen && !rawImages.includes(v.imagen)) {
                        rawImages.push(v.imagen);
                    }
                });
            }

            // Fallback if still empty
            if (rawImages.length === 0 && data.imagen) {
                rawImages = [data.imagen];
            }

            // Process URLs - create objects with type info
            const processedMedia = rawImages
                .filter(img => img) // Remove nulls
                .map(img => ({
                    type: 'image',
                    url: getImageUrl(img)
                }));

            // Add product video if exists
            if (data.video_url) {
                processedMedia.push({
                    type: 'video',
                    url: getImageUrl(data.video_url)
                });
            }

            setImagenesGaleria(processedMedia);

            // Check favorite status if authenticated
            if (isAuthenticated) {
                try {
                    const favoritos = await favoritosService.getAll();
                    // Assuming favorites return an array of objects which contain product_id or id
                    const esFavorito = Array.isArray(favoritos) && favoritos.some(f => String(f.id) === String(id) || String(f.producto_id) === String(id));
                    setIsFavorite(esFavorito);
                } catch (error) {
                    console.error('Error checking favorite status:', error);
                }
            }
        } catch (error) {
            console.error('Error al cargar producto:', error);
            Swal.fire('Error', 'No se pudo cargar el producto', 'error');
            navigate('/productos');
        } finally {
            setLoading(false);
        }
    };

    // Sincronizar imagen principal al seleccionar variante
    useEffect(() => {
        if (variacionSeleccionada && variacionSeleccionada.imagen) {
            const fullUrl = getImageUrl(variacionSeleccionada.imagen);
            // imagenesGaleria now contains objects with {type, url}
            const index = imagenesGaleria.findIndex(img => img.url === fullUrl);
            if (index !== -1) {
                setImagenActual(index);
            }
        }
    }, [variacionSeleccionada, imagenesGaleria]);

    const handlePrevImage = (e) => {
        e.stopPropagation();
        if (imagenesGaleria.length <= 1) return;
        setImagenActual((prev) => (prev === 0 ? imagenesGaleria.length - 1 : prev - 1));
    };

    const handleNextImage = (e) => {
        e.stopPropagation();
        if (imagenesGaleria.length <= 1) return;
        setImagenActual((prev) => (prev === imagenesGaleria.length - 1 ? 0 : prev + 1));
    };

    const toggleFavorite = async () => {
        if (!isAuthenticated) {
            Swal.fire('Inicia sesión', 'Debes iniciar sesión para agregar a favoritos', 'info');
            return;
        }
        try {
            const newState = !isFavorite;
            setIsFavorite(newState);
            await favoritosService.toggle(id);

            // Show simple toast
            setToast({
                message: newState ? 'Añadido a favoritos' : 'Eliminado de favoritos',
                type: 'favorite'
            });
        } catch (error) {
            setIsFavorite(!isFavorite); // Revert state on error
            console.error('Error toggle favorite:', error);
            setToast({ message: 'Error al actualizar favoritos', type: 'error' });
        }
    };

    const handleSeleccionAtributo = (nombreAtributo, valorId) => {
        const nuevasSelecciones = { ...seleccionesAtributos, [nombreAtributo]: valorId };
        setSeleccionesAtributos(nuevasSelecciones);

        // Búsqueda robusta: encontrar variante que COINCIDA con la selección actual
        const varianteEncontrada = producto.variaciones.find(variante => {
            // La variante debe tener exactamente los mismos atributos que la selección
            if (variante.atributos.length !== Object.keys(nuevasSelecciones).length) return false;

            return variante.atributos.every(attr =>
                String(nuevasSelecciones[attr.atributo_nombre]) === String(attr.valor_id)
            );
        });

        setVariacionSeleccionada(varianteEncontrada || null);
    };

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setCursorPos({ x, y });
    };

    const handleAddToCart = async () => {
        if (producto.variaciones?.length > 0 && !variacionSeleccionada) {
            Swal.fire('Selecciona opciones', 'Por favor selecciona todas las opciones disponibles', 'warning');
            return;
        }

        if (variacionSeleccionada && variacionSeleccionada.stock < cantidad) {
            Swal.fire('Stock insuficiente', 'No hay suficiente stock para la cantidad seleccionada', 'warning');
            return;
        }

        showLoader();
        try {
            await addItem(producto, variacionSeleccionada, cantidad);
            await new Promise(resolve => setTimeout(resolve, 800));
            setToast({ message: 'Añadido al carrito', type: 'success' });
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            setToast({ message: 'Error al agregar al carrito', type: 'error' });
        } finally {
            hideLoader();
        }
    };

    const atributosAgrupados = useMemo(() => {
        if (!producto?.variaciones) return {};

        const grupos = {};
        producto.variaciones.forEach(variante => {
            variante.atributos.forEach(attr => {
                if (!grupos[attr.atributo_nombre]) {
                    grupos[attr.atributo_nombre] = [];
                }
                if (!grupos[attr.atributo_nombre].some(v => v.id === attr.valor_id)) {
                    grupos[attr.atributo_nombre].push({
                        id: attr.valor_id,
                        valor: attr.valor,
                        tipo: attr.tipo // 'color', 'texto', etc.
                    });
                }
            });
        });
        return grupos;
    }, [producto]);

    if (loading) return <Loading />;
    if (!producto) return null;

    // Dynamic values for Price and Stock
    // If variant is selected but has no price (0 or null), use product base price
    const precioActual = variacionSeleccionada
        ? (variacionSeleccionada.precio > 0 ? variacionSeleccionada.precio : (producto.precio_final || producto.precio))
        : (producto.precio_final || producto.precio);
    const precioBase = variacionSeleccionada
        ? (variacionSeleccionada.precio_regular || (variacionSeleccionada.precio > 0 ? variacionSeleccionada.precio * 1.2 : producto.precio_base))
        : (producto.precio_base || producto.precio_regular);
    const stockActual = variacionSeleccionada ? variacionSeleccionada.stock : producto.stock;
    const tieneStock = stockActual > 0;

    return (
        <div className="min-h-screen bg-gray-50 w-full pt-36 md:pt-48">
            <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
                {/* Header with Back, Title, SKU */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">


                        <nav className="flex items-center text-xs text-gray-500">
                            <button onClick={() => { showLoader(); navigate('/'); setTimeout(hideLoader, 500); }} className="hover:text-primary flex items-center gap-1">
                                <Home size={14} /> Inicio
                            </button>
                            <span className="mx-2">/</span>
                            <button onClick={() => { showLoader(); navigate('/productos'); setTimeout(hideLoader, 500); }} className="hover:text-primary">
                                Productos
                            </button>
                            <span className="mx-2">/</span>
                            <span className="text-gray-900 font-medium truncate max-w-[200px]">{producto.nombre}</span>
                        </nav>
                    </div>


                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left Column - Gallery & Reviews */}
                    <div className="space-y-12">
                        {/* Main Image Gallery */}
                        <div className="flex flex-col gap-4">
                            <div
                                className="relative aspect-square bg-white rounded-lg overflow-hidden group"
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}
                                onMouseMove={handleMouseMove}
                            >
                                {imagenesGaleria.length > 0 ? (
                                    imagenesGaleria[imagenActual]?.type === 'video' ? (
                                        <video
                                            key={imagenesGaleria[imagenActual].url}
                                            src={imagenesGaleria[imagenActual].url}
                                            controls
                                            className="w-full h-full object-contain"
                                            preload="metadata"
                                        />
                                    ) : (
                                        <img
                                            src={imagenesGaleria[imagenActual]?.url}
                                            alt={producto.nombre}
                                            onMouseEnter={() => setIsHovering(true)}
                                            onMouseLeave={() => setIsHovering(false)}
                                            className={`w-full h-full object-contain transition-transform duration-200 ${isHovering ? 'scale-[2]' : 'scale-100'}`}
                                            style={isHovering ? {
                                                transformOrigin: `${cursorPos.x}% ${cursorPos.y}%`,
                                                cursor: 'zoom-in'
                                            } : { cursor: 'zoom-in' }}
                                        />
                                    )
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                                        <Package size={64} className="mb-2 opacity-50" />
                                        <span className="text-sm font-medium">Sin imagen</span>
                                    </div>
                                )}

                                {!tieneStock && (
                                    <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                                        Sin Stock
                                    </div>
                                )}


                                {/* Navigation Arrows */}
                                {imagenesGaleria.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrevImage}
                                            onMouseEnter={(e) => { e.stopPropagation(); setIsHovering(false); }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 z-10 cursor-pointer"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={handleNextImage}
                                            onMouseEnter={(e) => { e.stopPropagation(); setIsHovering(false); }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 z-10 cursor-pointer"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Thumbnails & Pagination Matches Reference */}
                            {imagenesGaleria.length > 1 && (
                                <div className="flex flex-col items-center gap-4">
                                    {/* Thumbnails Row - Now wraps on mobile */}
                                    {/* Thumbnails Row - Improved Mobile Layout */}
                                    <div className="flex flex-wrap justify-center gap-3 w-full max-w-lg mx-auto px-1">
                                        {imagenesGaleria.map((img, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setImagenActual(index)}
                                                className={`w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${imagenActual === index
                                                    ? 'border-orange-500  ring-orange-500 '
                                                    : 'border-transparent hover:border-orange-300 bg-gray-50'
                                                    }`}
                                            >
                                                {img.type === 'video' ? (
                                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                        </svg>
                                                        <video
                                                            src={img.url}
                                                            className="absolute inset-0 w-full h-full object-cover opacity-40"
                                                            muted
                                                            preload="metadata"
                                                        />
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={img.url}
                                                        alt={`Vista ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Dots Pagination */}
                                    <div className="flex gap-2">
                                        {imagenesGaleria.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setImagenActual(index)}
                                                className={`h-1.5 rounded-full transition-all ${imagenActual === index
                                                    ? 'w-6 bg-gray-900' // Active dot line
                                                    : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                                                    }`}
                                                aria-label={`Ir a imagen ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>


                    </div>

                    {/* Right Column - Product Info */}
                    <div className="lg:sticky lg:top-4 flex flex-col gap-6 h-fit">
                        <div className="bg-white rounded-lg p-6 h-fit">
                            {/* Brand & Title */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center text-[10px] md:text-sm text-gray-600">
                                    <p className="mb-1">{producto.marca_nombre || 'JBL'}</p>
                                    <div className="flex items-center gap-4 text-[10px] text-gray-500 ">
                                        <span className="flex items-center gap-1">
                                            <span className="font-semibold text-gray-700">Código:</span> {producto.id}
                                        </span>
                                        <span className="w-px h-3 bg-gray-300"></span>
                                        <span className="flex items-center gap-1">
                                            <span className="font-semibold text-gray-700">SKU:</span> {producto.sku || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <h1 className="text-[11px] md:text-[18px] font-bold text-gray-900 leading-snug mb-2">
                                    {producto.nombre}
                                </h1>
                                <p className="text-[10px] md:text-[11px] text-gray-500 leading-relaxed line-clamp-2 mb-3">
                                    {producto.descripcion}
                                </p>
                                <div className="flex items-center gap-1.5 mb-4">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} size={10} className={i < Math.round(producto.promedio_calificacion || 5) ? 'text-yellow-400' : 'text-gray-300'} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] md:text-xs text-gray-600">{producto.promedio_calificacion || '5'} ({producto.total_resenas || '0'}) comentarios</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] md:text-sm text-gray-600 mb-6">
                                <span>Vendido por</span>
                                <div className="flex items-center gap-1">
                                    <Store size={14} className="text-green-600" />
                                    <span className="text-gray-900 font-medium">{producto.marca_nombre || 'Falabella'}</span>
                                </div>
                                <button
                                    onClick={toggleFavorite}
                                    className="ml-auto p-2 "
                                >
                                    {isFavorite ? (
                                        <FaHeart className="text-red-500" size={22} />
                                    ) : (
                                        <FaRegHeart className="text-gray-400" size={22} />
                                    )}
                                </button>
                            </div>
                            {/* SPLIT GRID for Details */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-6 mt-2">
                                {/* Inner Left Column: Specs & Delivery */}
                                <div className="space-y-6 order-2 xl:order-1">
                                    {/* Especificaciones Principales Mini-Box */}
                                    <div className="bg-gray-50 rounded-md p-4">
                                        <h4 className="font-bold text-[10px] md:text-xs text-gray-900 mb-3">Especificaciones principales</h4>
                                        <ul className="space-y-2.5 text-[10px] md:text-xs text-gray-700 mb-3">

                                            {producto.especificaciones?.slice(0, 3).map((especificacion, index) => (
                                                <li key={index} className="flex gap-2 items-start">
                                                    <span className="text-gray-400 font-bold text-xs flex-shrink-0">•</span>
                                                    <div className="flex-1">
                                                        <span className="font-semibold text-[10px] text-gray-900">{especificacion.nombre}: </span>
                                                        <span className="text-[10px] text-gray-700">{especificacion.valor}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            onClick={() => {
                                                setSpecsExpanded(true);
                                                document.getElementById('especificaciones-completas')?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="text-[10px] md:text-xs text-gray-500 hover:text-primary hover:underline transition-colors mt-1"
                                        >
                                            Ver más especificaciones
                                        </button>
                                    </div>

                                    {/* Badges de servicio */}
                                    <div className="space-y-3">
                                        <h4 className="font-bold text-[10px] md:text-xs text-gray-900 mb-3">Metodos de envio</h4>
                                        <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-xl p-2 flex items-center gap-2 transition-colors">
                                            <div className="bg-orange-500 p-2 rounded-full text-[#c2410c]">
                                                <Home size={15} className="text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-[#9a3412] font-bold text-[10px] md:text-xs">Envío a Domicilio</h4>
                                                <p className="text-[#9a3412]/70 text-[10px]">Recíbelo en tu casa</p>
                                            </div>
                                        </div>

                                        <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-xl p-2 flex items-center gap-2 transition-colors">
                                            <div className="bg-orange-500 p-2 rounded-full text-[#c2410c]">
                                                <Store size={15} className="text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-[#9a3412] font-bold text-[10px] md:text-xs">Retiro en Tienda</h4>
                                                <p className="text-[#9a3412]/70 text-[10px]">Recógelo gratis</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Inner Right Column: Price, Vars, Actions */}
                                <div className="space-y-6 order-1 xl:order-2 sticky top-4 h-fit">
                                    {/* Price section */}
                                    <div>
                                        <div className="flex items-baseline gap-3 mb-1">
                                            <span className="text-lg md:text-xl font-bold text-gray-900">
                                                S/ {parseFloat(precioActual).toFixed(2)}
                                            </span>
                                            {descuento > 0 && (
                                                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] md:text-xs font-bold border border-red-100">
                                                    {descuento}% OFF
                                                </span>
                                            )}
                                        </div>

                                        {descuento > 0 && (
                                            <span className="text-[10px] md:text-xs text-gray-400 line-through decoration-gray-400/50 block mb-3">
                                                S/ {parseFloat(precioBase).toFixed(2)}
                                            </span>
                                        )}

                                        <div className="flex gap-2">
                                            {(producto.envio_gratis === 1 || producto.envio_gratis === true) && (
                                                <span className="inline-block bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded animate-fade-in">
                                                    Envío Gratis
                                                </span>
                                            )}
                                            <div
                                                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded animate-fade-in ${stockActual > 0
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}
                                            >
                                                Stock: {stockActual} unidades
                                            </div>
                                        </div>
                                    </div>

                                    {/* Atributos / Variaciones - RESTORED */}
                                    {Object.keys(atributosAgrupados).length > 0 && (
                                        <div className="space-y-4">
                                            {Object.entries(atributosAgrupados).map(([nombre, valores]) => {
                                                const isColor = nombre.toLowerCase() === 'color';
                                                return (
                                                    <div key={nombre}>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <label className="text-[10px] md:text-xs font-bold text-gray-900 capitalize">
                                                                {nombre}: <span className="text-gray-500 font-normal ml-1">
                                                                    {valores.find(v => seleccionesAtributos[nombre] === v.id)?.valor || 'Seleccionar'}
                                                                </span>
                                                            </label>
                                                        </div>

                                                        {/* Color Variations: Large Image + Label style */}
                                                        {isColor ? (
                                                            <div className="flex flex-wrap gap-4">
                                                                {valores.map((valor) => {
                                                                    const isSelected = seleccionesAtributos[nombre] === valor.id;
                                                                    // Find image for this color value
                                                                    const variationWithColor = producto.variaciones?.find(v =>
                                                                        v.atributos?.some(a => a.valor_id === valor.id)
                                                                    );
                                                                    const imgUrl = getImageUrl(variationWithColor?.imagen || producto.imagen);

                                                                    return (
                                                                        <button
                                                                            key={valor.id}
                                                                            onClick={() => handleSeleccionAtributo(nombre, valor.id)}
                                                                            className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-all relative ${isSelected
                                                                                ? 'ring-2 ring-orange-500 bg-orange-50 border-orange-500 shadow-md'
                                                                                : 'border border-gray-100 hover:border-orange-200 hover:bg-orange-50 hover:shadow-md'
                                                                                } `}
                                                                        >
                                                                            {/* Icono de chat en esquina superior derecha */}
                                                                            {isSelected && (
                                                                                <div className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs z-10">

                                                                                    <CheckCircle2 size={12} />
                                                                                </div>
                                                                            )}

                                                                            {/* Large Image Container */}
                                                                            <div
                                                                                className={`w-12 h-12 rounded-sm border overflow-hidden bg-white shadow-sm transition-all${isSelected
                                                                                    }`}
                                                                            >
                                                                                <img
                                                                                    src={imgUrl || 'https://via.placeholder.com/150'}
                                                                                    alt={valor.valor}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            </div>

                                                                            {/* Label Button */}
                                                                            <span
                                                                                className={`px-1 py-1 rounded-lg text-[10px] md:text-xs font-bold border transition-all min-w-[5rem] ${isSelected
                                                                                    ? 'border-orange-500 text-orange-700 bg-orange-50'
                                                                                    : 'border-gray-200 text-gray-600 bg-white group-hover:border-orange-300 group-hover:text-orange-600'
                                                                                    }`}
                                                                            >
                                                                                {valor.valor}
                                                                            </span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            /* Standard Variations: Pill style */
                                                            <div className="flex flex-wrap gap-2">
                                                                {valores.map((valor) => {
                                                                    const isSelected = seleccionesAtributos[nombre] === valor.id;
                                                                    return (
                                                                        <button
                                                                            key={valor.id}
                                                                            onClick={() => handleSeleccionAtributo(nombre, valor.id)}
                                                                            className={`
                                                                            px-4 py-2 rounded-lg text-[10px] md:text-sm border font-medium transition-all min-w-[4rem]
                                                                            ${isSelected
                                                                                    ? 'border-orange-500 text-orange-600 bg-orange-50 ring-1 ring-orange-500'
                                                                                    : 'border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500 bg-white'}
                                                                        `}
                                                                        >
                                                                            {valor.valor}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Quantity & Add to Cart */}
                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center border border-gray-200 rounded-lg h-10 w-32 bg-white">
                                                <button
                                                    onClick={() => setCantidad(c => Math.max(1, c - 1))}
                                                    disabled={cantidad <= 1 || !tieneStock}
                                                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-primary transition-colors disabled:opacity-30"
                                                >
                                                    <FaMinus size={10} />
                                                </button>
                                                <div className="flex-1 text-center font-semibold text-gray-900">
                                                    {cantidad}
                                                </div>
                                                <button
                                                    onClick={() => setCantidad(c => Math.min(Math.min(10, stockActual), c + 1))}
                                                    disabled={cantidad >= Math.min(10, stockActual) || !tieneStock}
                                                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-primary transition-colors disabled:opacity-30"
                                                >
                                                    <FaPlus size={10} />
                                                </button>
                                            </div>
                                            <span className="text-[10px] md:text-xs text-gray-500">Máximo 10 unidades</span>
                                        </div>

                                        <button
                                            onClick={handleAddToCart}
                                            disabled={!tieneStock || (producto.variaciones?.length > 0 && !variacionSeleccionada)}
                                            className={`
                                            w-full py-3 rounded-full font-bold text-white text-[10px] md:text-sm
                                            transition-all active:scale-[0.98]
                                            ${(tieneStock && (!producto.variaciones?.length || variacionSeleccionada))
                                                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
                                                    : 'bg-orange-100 cursor-not-allowed shadow-none'}
                                        `}
                                        >
                                            <span className={tieneStock ? "drop-shadow-sm" : ""}>
                                                {producto.variaciones?.length > 0 && !variacionSeleccionada
                                                    ? 'Seleccionar Opciones'
                                                    : (tieneStock ? 'Agregar al Carro' : 'Sin Stock')}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>


                        </div>



                    </div>

                </div>

                {/* Reviews Grid Section */}
                <div className="mt-16 flex flex-col lg:grid lg:grid-cols-2 gap-12">
                    {/* Reviews - Second on mobile (order-2), Left on desktop */}
                    <div className="order-2 lg:order-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <FaStar className="text-yellow-400" />
                            Opiniones de Clientes
                        </h3>
                        <ProductReviews productoId={id} />
                    </div>

                    {/* Specifications - First on mobile (order-1), Right on desktop */}
                    <div id="especificaciones-completas" className="order-1 lg:order-2 bg-white rounded-lg p-6 h-fit">
                        <h3 className="text-[11px] md:text-xl font-bold text-gray-900 mb-6 flex items-center gap-4">
                            <div className="p-2.5 rounded-full text-[#c2410c]">
                                <FileText size={20} />
                            </div>
                            Especificaciones
                        </h3>

                        {/* Logic to compile all specs into an array for easy slicing */}
                        {(() => {
                            const standardSpecs = [
                                { label: 'Marca', value: producto.marca },
                                { label: 'Modelo', value: producto.modelo || 'Estándar' },
                                { label: 'SKU', value: producto.sku || 'N/A' },
                                producto.garantia ? { label: 'Garantía', value: producto.garantia } : null,
                                producto.peso ? { label: 'Peso', value: `${producto.peso} kg` } : null,
                                producto.dimensiones ? { label: 'Dimensiones', value: producto.dimensiones } : null,
                            ].filter(Boolean);

                            const dynamicSpecs = (producto.especificaciones && Array.isArray(producto.especificaciones))
                                ? producto.especificaciones.map(s => ({ label: s.nombre, value: s.valor }))
                                : [];

                            const allSpecs = [...standardSpecs, ...dynamicSpecs];
                            const visibleSpecs = specsExpanded ? allSpecs : allSpecs.slice(0, 5);
                            const hasMore = allSpecs.length > 5;

                            return (
                                <>
                                    <div className="relative overflow-hidden rounded-lg border border-gray-100">
                                        <table className="w-full text-[10px] md:text-sm text-left">
                                            <tbody className="divide-y divide-gray-100">

                                                {visibleSpecs.map((spec, i) => (
                                                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                                                        <td className="px-4 py-3 font-semibold text-gray-700 w-1/3">{spec.label}</td>
                                                        <td className="px-4 py-3 text-gray-600">{spec.value}</td>


                                                    </tr>
                                                ))}

                                            </tbody>
                                        </table>

                                        {/* Gradient Fade */}
                                        {!specsExpanded && hasMore && (
                                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
                                        )}
                                    </div>

                                    {/* Toggle Button matching Reviews style */}
                                    {hasMore && (
                                        <div className="mt-6 text-center">
                                            <button
                                                onClick={() => setSpecsExpanded(!specsExpanded)}
                                                className="mt-4 text-[10px] md:text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2 transition-colors"
                                            >
                                                {specsExpanded ? (
                                                    <>Ver menos</>
                                                ) : (
                                                    <>Ver más</>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* Toast Notification */}
                {toast && (
                    <SimpleToast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default ProductoDetalle;
