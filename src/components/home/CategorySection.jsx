import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productosService } from '../../services';
import ProductCardCompact from '../products/ProductCardCompact';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:8000';

const CategorySection = ({ banner }) => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProductos = async () => {
            try {
                // Extract category ID from banner.link (format: "?categoria=1")
                const match = banner.link?.match(/categoria=(\d+)/);
                if (!match) {
                    console.warn('No category ID found in banner link:', banner.link);
                    setLoading(false);
                    return;
                }

                const categoryId = match[1];
                const response = await productosService.getAll({
                    categoria: categoryId,
                    limit: 5
                });

                const productosArray = Array.isArray(response) ? response : (response.data || []);
                setProductos(productosArray.slice(0, 5));
            } catch (error) {
                console.error('Error loading category products:', error);
            } finally {
                setLoading(false);
            }
        };

        if (banner?.link) {
            loadProductos();
        }
    }, [banner]);

    if (!banner) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="py-4 bg-gray-50"
        >
            <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-1">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left Banner - spans full height */}
                    <div className="lg:col-span-1 lg:row-span-1 min-w-[240px]">
                        <Link
                            to={banner.link || '/productos'}
                            className="relative rounded-lg shadow-sm overflow-hidden  cursor-pointer block h-full min-h-[500px] lg:min-h-[350px] group"
                        >
                            {/* Gradient Background (Base) */}
                            <div
                                className={`absolute inset-0 z-0 transition-opacity duration-500 ${banner.gradiente?.startsWith('bg-') ? banner.gradiente : (!banner.gradiente ? 'bg-gray-900/40' : '')}`}
                                style={banner.gradiente && !banner.gradiente.startsWith('bg-') ? { backgroundColor: banner.gradiente } : {}}
                            ></div>

                            {/* Background Image (Cover) */}
                            {banner.imagen && (
                                <img
                                    src={banner.imagen.startsWith('http') ? banner.imagen : `${API_URL}/${banner.imagen.startsWith('/') ? banner.imagen.substring(1) : banner.imagen}`}
                                    alt={banner.titulo}
                                    className="absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-700 ease-in-out group-hover:scale-110"
                                />
                            )}

                            {/* Text Content (Top, Full Width) */}
                            <div className="relative z-20 h-full flex flex-col justify-start items-start px-2 py-5 w-full">

                                <h3 className="text-3xl lg:text-[15px]  font-black text-gray-900  max-w-[90%]">
                                    {banner.titulo}
                                </h3>
                                {banner.descripcion && (
                                    <p className="text-xs font-medium text-black     mb-3  line-clamp-2 max-w-[80%]">
                                        {banner.descripcion}
                                    </p>
                                )}
                                <span className="inline-flex items-center gap-2 bg-gray-900 text-white text-[10px] px-3 py-2 rounded-xl shadow-lg hover:bg-gray-800 transition-all uppercase tracking-wide group-hover:gap-3">
                                    {banner.texto_boton || 'Ver todo'}
                                    <ChevronRight className="w-3 h-3" />
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Right Content - Header + Products */}
                    <div className="lg:col-span-4 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-lg font-bold text-gray-900">
                                {banner.subtitulo}
                            </h2>
                            <Link
                                to={banner.link || '/productos'}
                                className="hidden lg:flex text-gray-400 hover:text-orange-600 transition-colors"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </Link>
                        </div>
                        <div className=" h-0.5 bg-orange-600 mb-3">

                        </div>
                        {/* Products Grid */}
                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 flex-1">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`bg-white rounded-lg h-[300px] animate-pulse ${i === 4 ? 'hidden lg:block' : ''}`}
                                    ></div>
                                ))}
                            </div>
                        ) : productos.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 flex-1">
                                {productos.map((producto, index) => (
                                    <div key={producto.id} className={index === 4 ? 'hidden lg:block' : ''}>
                                        <ProductCardCompact producto={producto} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg p-8 text-center flex-1 flex items-center justify-center">
                                <p className="text-gray-500">No hay productos disponibles en esta categoría</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CategorySection;
