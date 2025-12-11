import { useState, useRef, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, FaHeart, FaRegHeart, FaTimes, FaPlus } from 'react-icons/fa';
import { Zap, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { favoritosService } from '../../services';
import Swal from 'sweetalert2';

const ProductCard = ({ producto }) => {
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { isAuthenticated } = useAuth();

    // Estado local para UI
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorite, setIsFavorite] = useState(producto.es_favorito);
    const [showModal, setShowModal] = useState(false);
    const [cantidad, setCantidad] = useState(1);
    const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
    const [seleccionesAtributos, setSeleccionesAtributos] = useState({});
    const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

    // Calcular precio con descuento
    const precioBase = parseFloat(producto.precio_base);
    const precioFinal = producto.tiene_descuento === 1
        ? parseFloat(producto.precio_final)
        : precioBase;
    const descuento = producto.tiene_descuento === 1
        ? Math.round(((precioBase - precioFinal) / precioBase) * 100)
        : 0;

    // Imágenes para hover (solo en card)
    let imagenPrincipal = producto.imagen || '/placeholder.png';
    let imagenSecundaria = imagenPrincipal;

    if (producto.galeria_imagenes) {
        try {
            const galeria = JSON.parse(producto.galeria_imagenes);
            if (galeria.length > 0) {
                const indexPrincipal = galeria.indexOf(producto.imagen);
                if (indexPrincipal !== -1 && galeria.length > 1) {
                    imagenSecundaria = galeria[(indexPrincipal + 1) % galeria.length];
                } else if (galeria.length > 0 && galeria[0] !== producto.imagen) {
                    imagenSecundaria = galeria[0];
                }
            }
        } catch (e) {
            // Error parsing gallery, fallback
        }
    }

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={`full-${i}`} className="text-yellow-400" />);
        }
        if (hasHalfStar) {
            stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
        }
        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FaRegStar key={`empty-${i}`} className="text-gray-300" />);
        }
        return stars;
    };

    const toggleFavorite = async (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            Swal.fire({
                icon: 'info',
                title: 'Inicia sesión',
                text: 'Debes iniciar sesión para agregar a favoritos',
                showCancelButton: true,
                confirmButtonText: 'Ir al login',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login');
                }
            });
            return;
        }

        try {
            const newState = !isFavorite;
            setIsFavorite(newState);
            await favoritosService.toggle(producto.id);

            const toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
            });

            toast.fire({
                icon: 'success',
                title: newState ? 'Agregado a favoritos' : 'Eliminado de favoritos'
            });
        } catch (error) {
            setIsFavorite(!isFavorite);
            console.error('Error al cambiar favorito:', error);
        }
    };

    const tieneVariantes = producto.variaciones && producto.variaciones.length > 0;

    const coloresDisponibles = producto.variaciones
        ?.flatMap(v => v.atributos?.filter(a => a.atributo_nombre?.toLowerCase() === 'color') || [])
        .filter((color, index, self) =>
            index === self.findIndex(c => c.valor_id === color.valor_id)
        )
        .slice(0, 4) || [];

    const handleOpenModal = (e) => {
        e.stopPropagation();
        if (tieneVariantes) {
            setSeleccionesAtributos({});
            setVarianteSeleccionada(null);
            setCantidad(1);
            setImagenSeleccionada(null);
            setShowModal(true);
        } else {
            handleAddDirectly();
        }
    };

    const handleAddDirectly = async () => {
        try {
            await addItem(producto, null, 1);
            Swal.fire({
                icon: 'success',
                title: '¡Agregado!',
                text: `${producto.nombre} agregado al carrito`,
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSeleccionAtributo = (nombreAtributo, valorId) => {
        const nuevasSelecciones = { ...seleccionesAtributos, [nombreAtributo]: valorId };
        setSeleccionesAtributos(nuevasSelecciones);
        const varianteEncontrada = producto.variaciones.find(variante => {
            return Object.entries(nuevasSelecciones).every(([nombreAttr, valorIdSelec]) => {
                return variante.atributos?.some(a =>
                    a.atributo_nombre === nombreAttr && String(a.valor_id) === String(valorIdSelec)
                );
            });
        });
        setVarianteSeleccionada(varianteEncontrada || null);

        if (nombreAtributo.toLowerCase() === 'color' && varianteEncontrada?.imagen) {
            setImagenSeleccionada(varianteEncontrada.imagen);
        }
    };

    const handleAgregarDesdeModal = async () => {
        if (!varianteSeleccionada && tieneVariantes) {
            Swal.fire({
                icon: 'warning',
                title: 'Selecciona una variante',
                text: 'Por favor selecciona todas las opciones del producto',
                timer: 2000
            });
            return;
        }
        try {
            await addItem(producto, varianteSeleccionada, cantidad);
            Swal.fire({
                icon: 'success',
                title: '¡Agregado!',
                text: `${cantidad} ${producto.nombre} agregado(s) al carrito`,
                timer: 2000,
                showConfirmButton: false
            });
            setShowModal(false);
            setCantidad(1);
            setSeleccionesAtributos({});
            setVarianteSeleccionada(null);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const atributosAgrupados = {};
    if (tieneVariantes) {
        producto.variaciones.forEach(variante => {
            variante.atributos?.forEach(attr => {
                if (!atributosAgrupados[attr.atributo_nombre]) {
                    atributosAgrupados[attr.atributo_nombre] = { valores: [] };
                }
                if (!atributosAgrupados[attr.atributo_nombre].valores.find(v => v.valor_id === attr.valor_id)) {
                    atributosAgrupados[attr.atributo_nombre].valores.push({
                        valor_id: attr.valor_id,
                        valor: attr.valor,
                        color_hex: attr.color_hex
                    });
                }
            });
        });
    }

    // 🔍 Lógica de imágenes para el modal (reutilizamos lo que ya tenías)
    const todasLasImagenes = (() => {
        const imgs = [];

        // Galería principal
        try {
            const galeria = producto.galeria_imagenes ? JSON.parse(producto.galeria_imagenes) : [];
            galeria.forEach(url => url && imgs.push({ url, nombre: 'Galería' }));
        } catch (e) { }

        // Si no hay galería, añadir imagen principal
        if (imgs.length === 0 && producto.imagen) {
            imgs.push({ url: producto.imagen, nombre: 'Principal' });
        }

        // Imágenes por color (sin duplicados)
        const atributoColor = Object.keys(atributosAgrupados).find(n => n.toLowerCase() === 'color');
        if (atributoColor && atributosAgrupados[atributoColor]) {
            atributosAgrupados[atributoColor].valores.forEach(val => {
                const varianteColor = producto.variaciones?.find(v =>
                    v.atributos?.some(a => a.valor_id === val.valor_id)
                );
                if (varianteColor?.imagen && !imgs.find(i => i.url === varianteColor.imagen)) {
                    imgs.push({ url: varianteColor.imagen, nombre: `Color: ${val.valor}` });
                }
            });
        }

        return imgs;
    })();

    // Estado para carrusel en modal
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentImageSrc = (imagenSeleccionada || varianteSeleccionada?.imagen || todasLasImagenes[currentIndex]?.url || producto.imagen);

    // Resetear índice al cambiar variante/imágenes
    useEffect(() => {
        const idx = todasLasImagenes.findIndex(img => img.url === currentImageSrc);
        if (idx !== -1) {
            setCurrentIndex(idx);
        } else {
            setCurrentIndex(0);
        }
    }, [currentImageSrc, todasLasImagenes]);

    // Funciones para carrusel
    const nextImage = () => {
        setCurrentIndex(prev => (prev + 1) % todasLasImagenes.length);
    };
    const prevImage = () => {
        setCurrentIndex(prev => (prev - 1 + todasLasImagenes.length) % todasLasImagenes.length);
    };

    // 🔍 Zoom focal (solo en modal)
    const [zoomActive, setZoomActive] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x, y });
    };

    return (
        <>
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group border border-gray-100 relative h-full flex flex-col"
            >
                {/* Badges */}
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                    {descuento > 0 && (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                            <Zap className="w-3 h-3 fill-current" /> FLASH
                        </span>
                    )}
                </div>

                {/* Botón Favorito */}
                <button
                    onClick={toggleFavorite}
                    className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-red-500 shadow-sm transition-colors"
                >
                    {isFavorite ? (
                        <FaHeart className="text-red-500" />
                    ) : (
                        <FaRegHeart />
                    )}
                </button>

                {/* Imagen (card preview) */}
                <div
                    onClick={() => navigate(`/producto/${producto.id}`)}
                    className="relative h-52 w-full p-4 bg-white flex items-center justify-center"
                >
                    <img
                        src={imagenPrincipal}
                        alt={producto.nombre}
                        className={`w-full h-full object-contain transition-opacity duration-500 ${isHovered && imagenSecundaria !== imagenPrincipal ? 'opacity-0' : 'opacity-100'}`}
                    />
                    {imagenSecundaria !== imagenPrincipal && (
                        <img
                            src={imagenSecundaria}
                            alt={producto.nombre}
                            className={`absolute inset-0 w-full h-full object-contain p-4 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                        />
                    )}
                </div>

                {/* Información */}
                <div className="p-4 pt-0 flex-1 flex flex-col" onClick={() => navigate(`/producto/${producto.id}`)}>
                    <h3 className="text-sm text-gray-600 mb-2 line-clamp-2 h-10 hover:text-orange-500 transition-colors">
                        {producto.nombre}
                    </h3>

                    {/* Rating */}
                    {/* Rating + Vendidos */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                            <div className="flex text-[10px] text-yellow-400 gap-0.5">
                                {renderStars(parseFloat(producto.promedio_calificacion || 0))}
                            </div>
                            <span className="text-[10px] text-gray-400">
                                ({producto.total_resenas || 0})
                            </span>
                        </div>

                    </div>

                    {/* Envío Gratis + Descuento */}
                    <div className="flex flex-wrap items-baseline gap-2 mb-2">
                        {(producto.envio_gratis === 1 || producto.envio_gratis === true) && (
                            <span className="inline-block bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded animate-fade-in">
                                Envío Gratis
                            </span>
                        )}
                        {descuento > 0 && (
                            <span className="inline-block bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded animate-fade-in">
                                {descuento}% OFF
                            </span>
                        )}
                    </div>

                    {/* Precio */}


                    {/* Footer Card: Left Col (Price/Sold) + Right (Button) */}
                    <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-50">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xl font-black text-orange-500 leading-none">
                                ${precioFinal.toFixed(2)}
                            </span>
                            {descuento > 0 && (
                                <span className="text-xs text-gray-400 line-through decoration-gray-400">
                                    ${precioBase.toFixed(2)}
                                </span>
                            )}
                            <span className="text-[10px] text-gray-500 mt-1">
                                {producto.vendidos || 0} vendidos
                            </span>
                        </div>

                        <button
                            onClick={handleOpenModal}
                            className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors shadow-lg hover:scale-105 active:scale-95 mb-1"
                        >
                            {producto.variaciones && producto.variaciones.length > 0 ? <FaPlus size={12} /> : <ShoppingCart size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <>
                    <div
                        onClick={() => setShowModal(false)}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50"
                    />
                    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white rounded-lg shadow-2xl z-50 max-h-[90vh] overflow-hidden">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <FaTimes className="text-gray-600 text-lg" />
                        </button>

                        <div className="flex flex-col md:flex-row overflow-y-auto max-h-[90vh]">
                            {/* Left: Image Gallery con Zoom */}
                            <div className="w-full md:w-1/2 bg-white p-8">
                                {/* 🖼️ Contenedor de imagen con zoom focal */}
                                <div
                                    ref={containerRef}
                                    className="w-full h-96 mb-4 bg-gray-50 rounded-lg overflow-hidden relative flex items-center justify-center"
                                    onMouseMove={handleMouseMove}
                                    onMouseEnter={() => setZoomActive(true)}
                                    onMouseLeave={() => setZoomActive(false)}
                                >
                                    {/* Imagen principal */}
                                    <img
                                        src={currentImageSrc}
                                        alt={producto.nombre}
                                        className="max-w-full max-h-full object-contain transition-opacity duration-200"
                                        style={{ opacity: zoomActive ? 0.2 : 1 }}
                                    />

                                    {/* Lupa de zoom (solo cuando zoomActive) */}
                                    {zoomActive && (
                                        <div
                                            className="absolute w-36 h-36 rounded-full border-2 border-orange-500 pointer-events-none z-10"
                                            style={{
                                                left: `${zoomPosition.x}%`,
                                                top: `${zoomPosition.y}%`,
                                                transform: 'translate(-50%, -50%)',
                                                backgroundSize: '300%',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundImage: `url(${currentImageSrc})`,
                                                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                            }}
                                        />
                                    )}

                                    {/* Controles ◀️ ▶️ */}
                                    {todasLasImagenes.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-1.5 rounded-full shadow-md transition-all hover:scale-105 focus:outline-none"
                                                aria-label="Anterior"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={nextImage}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-1.5 rounded-full shadow-md transition-all hover:scale-105 focus:outline-none"
                                                aria-label="Siguiente"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>

                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">
                                                {currentIndex + 1}/{todasLasImagenes.length}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Miniaturas */}
                                <div className="flex gap-2 flex-wrap">
                                    {todasLasImagenes.map((img, idx) => {
                                        const isActive = currentImageSrc === img.url;
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    setImagenSeleccionada(img.url);
                                                    setCurrentIndex(idx);
                                                }}
                                                className={`w-20 h-20 border-2 rounded overflow-hidden cursor-pointer transition-colors ${isActive ? 'border-orange-500' : 'border-gray-200 hover:border-orange-500'
                                                    }`}
                                                title={img.nombre}
                                            >
                                                <img src={img.url} alt={img.nombre} className="w-full h-full object-contain p-1" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right: Details */}
                            <div className="w-full md:w-1/2 p-8 flex flex-col">
                                <h2 className="text-lg font-normal text-gray-800 mb-2 leading-relaxed">
                                    {producto.nombre}
                                </h2>

                                <div className="flex items-center gap-1 mb-4">
                                    <span className="text-xs text-gray-500">Vendido por</span>
                                    <span className="text-xs text-orange-500 font-medium flex items-center gap-1">
                                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                        </svg>
                                        {producto.marca_nombre || 'Tienda'}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-normal text-gray-900">
                                            S/ {(() => {
                                                if (varianteSeleccionada && varianteSeleccionada.precio) {
                                                    return parseFloat(varianteSeleccionada.precio).toFixed(2);
                                                }
                                                return precioFinal.toFixed(2);
                                            })()}
                                        </span>
                                        {producto.tiene_descuento === 1 && descuento > 0 && (
                                            <span className="text-sm text-gray-400 line-through">
                                                S/{precioBase.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Stock Status */}
                                {varianteSeleccionada && (
                                    <div className="mb-4">
                                        {varianteSeleccionada.stock > 0 ? (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-md border border-green-200 w-fit">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                <span className="text-[10px] font-medium text-green-700">
                                                    Stock disponible
                                                </span>
                                                {varianteSeleccionada.stock != null && (
                                                    <span className="text-[10px] font-semibold text-green-800 ml-1">
                                                        ({varianteSeleccionada.stock})
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 rounded-md border border-red-200 w-fit">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                <span className="text-[10px] font-medium text-red-700">
                                                    Sin stock
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-wrap items-baseline gap-2 mb-2">
                                    {(producto.envio_gratis === 1 || producto.envio_gratis === true) && (
                                        <span className="inline-block bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded animate-fade-in">
                                            Envío Gratis
                                        </span>
                                    )}
                                    {producto.tiene_descuento === 1 && descuento > 0 && (
                                        <span className="inline-block bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded animate-fade-in">
                                            {descuento}% OFF
                                        </span>
                                    )}
                                </div>

                                {/* Attributes */}
                                <div className="flex-1 overflow-y-auto mb-6">
                                    {Object.entries(atributosAgrupados).map(([nombreAtributo, infoAtributo]) => (
                                        <div key={nombreAtributo} className="mb-6">
                                            <div className="mb-3">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {nombreAtributo}:
                                                </span>
                                                {seleccionesAtributos[nombreAtributo] && (
                                                    <span className="ml-2 text-sm text-gray-900">
                                                        {infoAtributo.valores.find(v => v.valor_id === seleccionesAtributos[nombreAtributo])?.valor}
                                                    </span>
                                                )}
                                            </div>

                                            {nombreAtributo.toLowerCase() === 'color' ? (
                                                <div className="flex gap-3 flex-wrap mb-4">
                                                    {infoAtributo.valores.map(val => {
                                                        const isSelected = seleccionesAtributos[nombreAtributo] === val.valor_id;
                                                        const varianteColor = producto.variaciones?.find(v =>
                                                            v.atributos?.some(a => a.valor_id === val.valor_id)
                                                        );
                                                        const imagenMostrar = varianteColor?.imagen || producto.imagen;

                                                        return (
                                                            <button
                                                                key={val.valor_id}
                                                                onClick={() => handleSeleccionAtributo(nombreAtributo, val.valor_id)}
                                                                className="flex flex-col items-center"
                                                            >
                                                                <div className={`w-16 h-16 border-2 rounded overflow-hidden mb-1 ${isSelected ? 'border-orange-500' : 'border-gray-200'
                                                                    }`}>
                                                                    <img
                                                                        src={imagenMostrar}
                                                                        alt={val.valor}
                                                                        className="w-full h-full object-contain p-1"
                                                                    />
                                                                </div>
                                                                <div className={`px-3 py-1 border rounded text-xs ${isSelected
                                                                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
                                                                    : 'border-gray-300 text-gray-700'
                                                                    }`}>
                                                                    [{val.valor}]
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="flex gap-2 flex-wrap mb-4">
                                                    {infoAtributo.valores.map(val => {
                                                        const isSelected = seleccionesAtributos[nombreAtributo] === val.valor_id;
                                                        return (
                                                            <button
                                                                key={val.valor_id}
                                                                onClick={() => handleSeleccionAtributo(nombreAtributo, val.valor_id)}
                                                                className={`px-4 py-1.5 rounded border text-sm ${isSelected
                                                                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                                                    }`}
                                                            >
                                                                [{val.valor}]
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className="mb-6">
                                        <label className="block text-sm text-gray-700 font-medium mb-2">
                                            Cant.
                                        </label>
                                        <select
                                            value={cantidad}
                                            onChange={(e) => setCantidad(parseInt(e.target.value))}
                                            className="w-20 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-orange-500"
                                        >
                                            {(() => {
                                                const stockDisponible = varianteSeleccionada
                                                    ? varianteSeleccionada.stock
                                                    : (producto.stock || 10);
                                                const maxOpciones = Math.min(stockDisponible, 10);
                                                return Array.from({ length: maxOpciones }, (_, i) => (
                                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                                ));
                                            })()}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAgregarDesdeModal}
                                    disabled={!varianteSeleccionada || varianteSeleccionada.stock < cantidad}
                                    className="w-full py-2 bg-orange-500 text-white font-medium rounded-[30px] hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-3"
                                >
                                    Añadir al carrito
                                </button>

                                <button
                                    onClick={() => navigate(`/producto/${producto.id}`)}
                                    className="text-xs font-bold text-orange-600 hover:text-orange-700 text-center"
                                >
                                    Todos los detalles →
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default ProductCard;