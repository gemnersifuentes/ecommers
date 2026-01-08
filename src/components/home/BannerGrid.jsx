import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaMicrochip } from 'react-icons/fa';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:8000';

const BannerGrid = ({ banners }) => {
    if (!banners || banners.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="py-6"
        >
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {banners.slice(0, 4).map((banner) => (
                        <Link
                            key={banner.id}
                            to={banner.link || '/productos'}
                            className="group relative h-auto min-h-[180px] rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                        >
                            {/* Gradient Background (Base) */}
                            <div
                                className={`absolute inset-0 z-0 transition-opacity duration-500 ${banner.gradiente?.startsWith('bg-') ? banner.gradiente : (!banner.gradiente ? 'bg-gray-900' : '')}`}
                                style={banner.gradiente && !banner.gradiente.startsWith('bg-') ? { backgroundColor: banner.gradiente } : {}}
                            ></div>

                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 z-0"></div>

                            {/* Product Image (Floating on Top) */}
                            {banner.imagen && (
                                <img
                                    src={banner.imagen.startsWith('http') ? banner.imagen : `${API_URL}/${banner.imagen.startsWith('/') ? banner.imagen.substring(1) : banner.imagen}`}
                                    alt={banner.titulo}
                                    className="absolute left-1 bottom-0 h-full w-[43%] object-contain object-center z-10 drop-shadow-xl transition-transform duration-700 ease-in-out group-hover:scale-110 p-1"
                                />
                            )}

                            <div className="relative z-20 flex justify-end items-center p-4 h-full">
                                {/* Text Content (Right Aligned) */}
                                <div className="w-2/3 flex flex-col items-end justify-center text-right pl-3">
                                    {banner.subtitulo && (
                                        <span className="text-white/90 text-xs font-medium tracking-wide mb-1 uppercase drop-shadow-md">
                                            {banner.subtitulo}
                                        </span>
                                    )}
                                    <h3 className="text-base md:text-lg font-black text-white mb-2 leading-none tracking-tight drop-shadow-lg">
                                        {banner.titulo}
                                    </h3>
                                    <span className="text-white font-bold text-xs tracking-wider uppercase border-b-2 border-white/80 pb-1 hover:border-orange-600 hover:text-orange-600 transition-all cursor-pointer drop-shadow-md">
                                        {banner.texto_boton || 'VER MODELOS'}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default BannerGrid;