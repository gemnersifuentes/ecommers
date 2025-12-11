import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { bannersService } from '../services';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const HeroCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [carouselBanners, setCarouselBanners] = useState([]);
    const [lateralBanners, setLateralBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarBanners();
    }, []);

    const cargarBanners = async () => {
        try {
            const bannersActivos = await bannersService.getActive();

            const carousel = bannersActivos.filter(b => b.tipo === 'carousel');
            const lateral = bannersActivos.filter(b => b.tipo === 'lateral');

            setCarouselBanners(carousel);
            setLateralBanners(lateral);
        } catch (error) {
            console.error('Error cargando banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % carouselBanners.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + carouselBanners.length) % carouselBanners.length);
    };

    useEffect(() => {
        if (carouselBanners.length === 0) return;
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [carouselBanners]);

    if (loading || carouselBanners.length === 0) {
        return null;
    }

    return (
        <div className="w-full bg-gray-50 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 px-4 max-w-[1300px] mx-auto">
                <div className="lg:col-span-5 relative h-[450px] rounded-2xl overflow-hidden group">
                    <AnimatePresence initial={false}>
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0"
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${carouselBanners[currentSlide].imagen?.startsWith('http')
                                        ? carouselBanners[currentSlide].imagen
                                        : `${API_URL}${carouselBanners[currentSlide].imagen}`
                                        })`
                                }}
                            />

                            {carouselBanners[currentSlide].gradiente && (
                                <div className={`absolute inset-0 ${carouselBanners[currentSlide].gradiente}`} />
                            )}

                            <div className="relative h-full flex flex-col justify-center px-16 text-white">
                                <div className="mb-6">
                                    <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-90">
                                        {carouselBanners[currentSlide].subtitulo || 'OFERTA ESPECIAL'}
                                    </span>
                                </div>

                                <div className="mb-2">
                                    <h2 className="text-lg md:text-5xl font-black leading-[0.9] tracking-tight">
                                        {carouselBanners[currentSlide].titulo}
                                    </h2>
                                </div>

                                <div className="mb-8">
                                    <p className="text-xl w-8/12 font-semibold mb-1">{carouselBanners[currentSlide].descripcion}</p>
                                </div>

                                <div className="flex gap-4">
                                    <a href={carouselBanners[currentSlide].link || '/productos'}>
                                        <button className="px-8 py-3.5 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2">
                                            {carouselBanners[currentSlide].texto_boton || 'Ver más'}
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <button
                        onClick={prevSlide}
                        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5">
                        {carouselBanners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-10' : 'bg-white/50 w-2.5 hover:bg-white/70'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 flex flex-col gap-4">
                    {lateralBanners.map((banner) => (
                        <a
                            key={banner.id}
                            href={banner.link || '/productos'}
                            className={`relative h-[217px] rounded-2xl overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-6 ${banner.gradiente || 'bg-gray-900'}`}
                        >
                            {/* Fondo base oscuro por si el gradiente tiene transparencia */}
                            <div className="absolute inset-0 bg-gray-900 -z-10" />

                            {/* Si hay gradiente seleccionado, se aplica como fondo */}
                            {banner.gradiente && (
                                <div className={`absolute inset-0 ${banner.gradiente} -z-10`} />
                            )}

                            <div className="relative z-10 max-w-[60%]">
                                <span className="text-[11px] font-bold tracking-wider text-yellow-400 uppercase mb-2 block">
                                    {banner.subtitulo || 'OFERTA'}
                                </span>
                                <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                                    {banner.titulo}
                                </h3>
                                <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                                    {banner.descripcion}
                                </p>

                                <div className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:gap-3 transition-all">
                                    {banner.texto_boton || 'Ver más'}
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>

                            {banner.imagen && (
                                <img
                                    src={banner.imagen?.startsWith('http') ? banner.imagen : `${API_URL}${banner.imagen}`}
                                    alt={banner.titulo}
                                    className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 backdrop-blur-sm rounded-tl-[2rem] object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                />
                            )}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeroCarousel;
