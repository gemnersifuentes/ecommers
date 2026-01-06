import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCardCompact = ({ producto }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const precioFinal = producto.precio_final || producto.precio_base;
    const tieneDescuento = producto.descuento_valor > 0;

    // Logic for hover images
    let imagenPrincipal = producto.imagen;
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
            // Error parsing gallery
        }
    }

    // Helper URLs
    const getUrl = (img) => img?.startsWith('http') ? img : `http://localhost:8000${img}`;

    return (
        <motion.div
            whileHover={{ y: -4 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 relative group h-[300px]"
        >
            <Link to={`/producto/${producto.id}`} className="h-full flex flex-col">
                {/* Image Section */}
                <div className="relative h-48 bg-white overflow-hidden p-6 flex items-center justify-center">
                    {producto.imagen ? (
                        <>
                            <img
                                src={getUrl(imagenPrincipal)}
                                alt={producto.nombre}
                                className={`w-full h-full object-contain transition-opacity duration-700 ${isHovered && imagenSecundaria !== imagenPrincipal ? 'opacity-0' : 'opacity-100'}`}
                            />
                            {imagenSecundaria !== imagenPrincipal && (
                                <img
                                    src={getUrl(imagenSecundaria)}
                                    alt={producto.nombre}
                                    className={`absolute inset-0 w-full h-full object-contain p-4 transition-all duration-700 ease-in-out ${isHovered ? 'opacity-100 scale-110' : 'opacity-0 scale-95'}`}
                                />
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">cuando aga el cambio e imge la seguanda que baya asiendo un somm cuando aparece
                            <ShoppingCart className="w-12 h-12 text-gray-300" />
                        </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setIsFavorite(!isFavorite);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors z-10"
                    >
                        <Heart
                            className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                        />
                    </button>

                    {/* Discount Badge */}
                    {tieneDescuento && (
                        <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                            -{Math.round(producto.descuento_valor)}%
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-3 border-t border-gray-100 flex-1 flex flex-col justify-start gap-1">
                    {/* Brand */}
                    {producto.marca_nombre && (
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {producto.marca_nombre}
                        </p>
                    )}

                    {/* Product Name */}
                    <h3 className="text-sm text-gray-800 line-clamp-2 leading-tight">
                        {producto.nombre}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400"
                            />
                        ))}
                        <span className="text-xs text-gray-500"> (0)</span>
                    </div>

                    {/* Price */}
                    <div className="mt-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-base font-bold text-gray-900">
                                ${parseFloat(precioFinal).toFixed(2)}
                            </span>
                            {tieneDescuento && (
                                <span className="text-xs text-gray-400 line-through">
                                    ${parseFloat(producto.precio_base).toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCardCompact;
