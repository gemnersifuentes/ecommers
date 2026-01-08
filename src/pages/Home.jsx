import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { productosService, serviciosService, tiendaCategoriasService, tiendaService, bannersService } from '../services';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import HeroCarousel from '../components/HeroCarousel';
import BannerGrid from '../components/home/BannerGrid';
import CategorySection from '../components/home/CategorySection';

const API_URL = 'http://localhost:8000';
import {
  FaShippingFast,
  FaShieldAlt,
  FaHeadset,
  FaUndo,
  FaStar,
  FaHeart,
  FaShoppingCart,
  FaArrowRight,
  FaTruck,
  FaMemory,
  FaHdd,
  FaMicrochip,
  FaKeyboard,
  FaTools,
  FaBox,
  FaCheckCircle,
  FaRegHeart
} from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';
import {
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Zap,
  ArrowRight,
  Star,
  Heart,
  ShoppingCart as CartIcon,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      let target;
      if (targetDate) {
        // MySQL datetime format: "2024-12-31 23:59:59" - convert to ISO
        const fechaISO = targetDate.replace(' ', 'T');
        target = new Date(fechaISO);
      } else {
        // Fallback to end of today if no date provided
        target = new Date();
        target.setHours(23, 59, 59, 999);
      }

      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const pad = (num) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-2 text-white font-mono text-sm md:text-base">
      {timeLeft.days > 0 && (
        <>
          <div className="bg-white text-orange-600 rounded px-2 py-1 min-w-[30px] md:min-w-[40px] text-center shadow-sm flex flex-col items-center justify-center leading-none">
            <span className="text-sm md:text-base font-bold">{timeLeft.days}</span>
            <span className="text-[8px] uppercase font-bold text-gray-500">Días</span>
          </div>
          <span className="text-orange-200 font-bold">:</span>
        </>
      )}
      <div className="bg-white text-orange-600 rounded px-2 py-1 min-w-[30px] md:min-w-[40px] text-center shadow-sm flex flex-col items-center justify-center leading-none">
        <span className="text-sm md:text-base font-bold">{pad(timeLeft.hours)}</span>
        <span className="text-[8px] uppercase font-bold text-gray-500">Hs</span>
      </div>
      <span className="text-orange-200 font-bold">:</span>
      <div className="bg-white text-orange-600 rounded px-2 py-1 min-w-[30px] md:min-w-[40px] text-center shadow-sm flex flex-col items-center justify-center leading-none">
        <span className="text-sm md:text-base font-bold">{pad(timeLeft.minutes)}</span>
        <span className="text-[8px] uppercase font-bold text-gray-500">Min</span>
      </div>
      <span className="text-orange-200 font-bold">:</span>
      <div className="bg-white text-orange-600 rounded px-2 py-1 min-w-[30px] md:min-w-[40px] text-center shadow-sm flex flex-col items-center justify-center leading-none">
        <span className="text-sm md:text-base font-bold">{pad(timeLeft.seconds)}</span>
        <span className="text-[8px] uppercase font-bold text-gray-500">Seg</span>
      </div>
    </div>
  );
};

import ProductCard from '../components/products/ProductCard';

const Home = () => {
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [productosRecomendados, setProductosRecomendados] = useState([]); // New state
  const [gridBanners, setGridBanners] = useState([]); // Dynamic Grid Banners
  const [categoryGridBanners, setCategoryGridBanners] = useState([]); // Category + Products sections
  const [servicios, setServicios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [ofertasRelampago, setOfertasRelampago] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoriesRef = useRef(null);

  const scrollCategories = (direction) => {
    if (categoriesRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      categoriesRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // CSS para ocultar scrollbar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [productosData, serviciosData, categoriasData, ofertasData, gridBannersData, categoryBannersData] = await Promise.all([
        tiendaService.getProductos({ limit: 60 }),
        serviciosService.getAll(),
        tiendaCategoriasService.getAll(),
        tiendaService.getProductos({ ofertas: 1, limit: 20 }), // Fetch more to shuffle
        bannersService.getActive('grid'), // Fetch grid banners
        bannersService.getActive('category_grid') // Fetch category grid banners
      ]);

      // Verificar si productosData es un array o viene en .data
      const productosArray = Array.isArray(productosData) ? productosData : (productosData.data || []);
      setProductosDestacados(productosArray.slice(0, 6));

      // Randomly select products for "Recommended" or just take a different slice
      // Shuffling for variety
      const shuffled = [...productosArray].sort(() => 0.5 - Math.random());
      setProductosRecomendados(shuffled.slice(0, 36));

      // Procesar ofertas (Ensure Category Variety)
      const ofertasArray = Array.isArray(ofertasData) ? ofertasData : (ofertasData.data || []);

      // Group by category to pick 1 from each
      const groups = {};
      ofertasArray.forEach(p => {
        const cat = p.categoria_id || 'unknown';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(p);
      });

      const variedOfertas = [];
      const keys = Object.keys(groups);
      // Randomize category order
      keys.sort(() => 0.5 - Math.random());

      // Interleave products from different categories
      const maxItems = Math.max(...Object.values(groups).map(g => g.length), 0);
      for (let i = 0; i < maxItems; i++) {
        keys.forEach(key => {
          if (groups[key][i]) variedOfertas.push(groups[key][i]);
        });
      }

      setOfertasRelampago(variedOfertas.slice(0, 6));

      setServicios(Array.isArray(serviciosData) ? serviciosData : (serviciosData.data || []));
      setCategorias(categoriasData);
      setGridBanners(Array.isArray(gridBannersData) ? gridBannersData : []);
      setCategoryGridBanners(Array.isArray(categoryBannersData) ? categoryBannersData : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Cargando productos..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Spacer for fixed header */}
      <div className="h-[120px] md:h-[185px]"></div>

      {/* Hero Carousel */}
      <HeroCarousel />

      <div className="py-4 md:py-8 bg-gray-50">
        <div className="max-w-7xl mx-4 md:mx-auto px-6 py-4 bg-white rounded-lg">
          {/* Cabecera con Navegación PC */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm md:text-base font-bold text-gray-800 uppercase tracking-wider">
              Categorías
            </h2>
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => scrollCategories('left')}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollCategories('right')}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-all shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Scroll horizontal - FIXED RESPONSIVENESS */}
          <div
            ref={categoriesRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-2 touch-pan-x"
            style={{ touchAction: 'pan-x', WebkitOverflowScrolling: 'touch' }}
          >
            {categorias.map((categoria, index) => (
              <motion.div
                key={categoria.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0"
              >
                <Link to={`/productos?categoria=${categoria.id}`}>
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    {/* Círculo con imagen */}
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full border-2 border-transparent group-hover:border-orange-500 transition-all duration-300  mb-2 bg-white p-1">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        {categoria.imagen ? (
                          <img
                            src={categoria.imagen.startsWith('http') ? categoria.imagen : `${API_URL}/${categoria.imagen.startsWith('/') ? categoria.imagen.substring(1) : categoria.imagen}`}
                            alt={categoria.nombre}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
                            <FaBox className="text-3xl text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Nombre */}
                    <p className="text-xs font-semibold text-gray-700 text-center max-w-[90px] leading-tight group-hover:text-orange-500 transition-colors">
                      {categoria.nombre}
                    </p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* RECOMENDADO SECTION */}


      {/* Ofertas Relámpago */}
      {
        ofertasRelampago.length > 0 && (
          <div className="py-4 md:py-8 bg-gray-50">
            {/* Banner OFERTAS WOW */}
            <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-4 md:p-6 mb-8 flex flex-col md:flex-row items-center justify-between shadow-lg text-white relative overflow-hidden max-w-7xl gap-4 md:gap-0 mx-4 md:mx-auto">
              {/* Fondo decorativo */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

              <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 z-10 text-center md:text-left">
                <div className="bg-white p-2 md:p-3 rounded-full shadow-md">
                  <Zap className="text-red-600 w-6 h-6 md:w-8 md:h-8 fill-red-600 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase leading-none">
                    OFERTAS WOW
                  </h2>
                  <p className="text-[10px] md:text-xs font-bold text-orange-100 tracking-widest uppercase mt-1">
                    TIEMPO LIMITADO • GRANDES AHORROS
                  </p>
                </div>
              </div>

              {/* Contador */}
              <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4 z-10 bg-black/20 px-4 md:px-6 py-2 md:py-3 rounded-lg backdrop-blur-sm w-full md:w-auto justify-center">
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-orange-100">Termina en:</span>
                <div className="flex items-center gap-2 font-mono font-bold text-xl md:text-2xl">
                  <CountdownTimer targetDate={
                    (() => {
                      if (!ofertasRelampago.length) return null;
                      // Encontrar la oferta con el ID de descuento más alto (la última registrada)
                      const ultimaOferta = ofertasRelampago.reduce((prev, current) =>
                        (prev.descuento_id > current.descuento_id) ? prev : current
                        , ofertasRelampago[0]);
                      return ultimaOferta.descuento_fecha_fin;
                    })()
                  } />
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-4 md:mx-auto px-6 py-8 bg-white rounded-lg">



              <div className="flex justify-end mb-4">
                <Link to="/productos?ofertas=1" className="text-sm font-medium text-gray-600 hover:text-black flex items-center gap-1 group">
                  Ver todas las ofertas <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="flex lg:grid lg:grid-cols-6 gap-4 overflow-x-auto lg:overflow-visible scrollbar-hide pb-4 px-4 touch-pan-x" style={{ touchAction: 'pan-x', WebkitOverflowScrolling: 'touch' }}>
                {ofertasRelampago.map(producto => (
                  <Link key={producto.id} to={`/producto/${producto.id}`} className="group flex-shrink-0 w-[160px] lg:w-auto">
                    <div className="bg-white rounded-lg p-3 transition-shadow relative">
                      {/* Badge Descuento */}
                      <div className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded z-10">
                        -{Math.round(producto.descuento_valor)}%
                      </div>

                      {/* Imagen */}
                      <div className="aspect-square mb-3 overflow-hidden rounded-md bg-gray-100 relative">
                        {producto.imagen ? (
                          <img
                            src={producto.imagen.startsWith('http') ? producto.imagen : `${API_URL}/${producto.imagen.startsWith('/') ? producto.imagen.substring(1) : producto.imagen}`}
                            alt={producto.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <FaBox className="text-3xl" />
                          </div>
                        )}
                      </div>

                      {/* Precios */}
                      <div className="mb-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-base md:text-lg font-bold text-orange-600">
                            S/ {parseFloat(producto.precio_final).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            S/ {parseFloat(producto.precio_base).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Barra de progreso / Stock */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                          <span>{producto.vendidos || 0} vendidos</span>
                          <span className="text-orange-500 font-bold">¡Arde!</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, ((producto.vendidos || 0) / ((producto.stock || 1) + (producto.vendidos || 0))) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div >
        )
      }
      {/* Dual Banner Section: Dynamic Grid Banners */}
      <BannerGrid banners={gridBanners} />

      {/* Category Product Sections */}
      {categoryGridBanners.map((banner) => (
        <CategorySection key={banner.id} banner={banner} />
      ))}
      {/* Audífonos ideales para ti - Estilo Falabella */}




      <div className="py-4 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-[1px] bg-gray-300 w-full max-w-[600px]"></div>
            <h2 className="text-lg md:text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="text-orange-500 text-sm">🔥</span> RECOMENDADO
            </h2>
            <div className="h-[1px] bg-gray-300 w-full max-w-[600px]"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {productosRecomendados.map((producto, index) => (
              <motion.div
                key={producto.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard producto={producto} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>








      {/* Servicios Profesionales - Style Catálogo */}
      <div className="py-12 md:py-16 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-[0.2em]">Servicios VIP</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                CENTRO <span className="text-orange-600">ESPECIALIZADO</span>
              </h2>
            </div>
            <Link to="/servicios" className="group flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-orange-600 transition-colors">
              VER TODOS LOS SERVICIOS <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicios.slice(0, 4).map((servicio, i) => (
              <motion.div
                key={servicio.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group border border-gray-100 flex flex-col h-full relative"
              >
                {/* Badges al estilo Producto */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-orange-600 text-white text-[9px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 uppercase tracking-tighter">
                    <Sparkles className="w-3 h-3" /> Servicio
                  </span>
                </div>

                {/* Imagen del Servicio */}
                <div className="relative h-48 w-full p-6 bg-white flex items-center justify-center overflow-hidden">
                  {servicio.imagen ? (
                    <img
                      src={servicio.imagen.startsWith('http') ? servicio.imagen : `${API_URL}/${servicio.imagen.startsWith('/') ? servicio.imagen.substring(1) : servicio.imagen}`}
                      alt={servicio.nombre}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg text-orange-200">
                      <FaTools className="text-6xl" />
                    </div>
                  )}
                </div>

                {/* Info del Servicio */}
                <div className="p-4 pt-0 flex-1 flex flex-col">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 block">
                    Soporte Especializado
                  </span>

                  <h3 className="text-sm font-medium text-gray-700 mb-2 line-clamp-2 min-h-[40px] group-hover:text-orange-500 transition-colors">
                    {servicio.nombre}
                  </h3>

                  {/* Rating Estrellas */}
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex text-[10px] text-yellow-400 gap-0.5">
                      <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                    </div>
                    <span className="text-[10px] text-gray-400">(4.9)</span>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-2 mb-4">
                    <span className="inline-block bg-orange-50 text-orange-700 text-[9px] font-bold px-2 py-0.5 rounded border border-orange-100 italic">
                      Calidad Garantizada
                    </span>
                  </div>

                  {/* Footer similar a ProductCard */}
                  <div className="flex items-end justify-between mt-auto pt-2 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-400 font-medium uppercase leading-none opacity-50 mb-1">Precio sugerido</span>
                      <span className="text-xl font-black text-orange-600 leading-none">
                        S/ {parseFloat(servicio.precio).toFixed(0)}
                      </span>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-all shadow-lg hover:scale-110">
                      <FiArrowRight className="text-xl" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Beneficios - Estilo Falabella */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Paga como prefieras */}
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="1.5" />
                  <path d="M2 10h20" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-sm mb-0.5">
                  Paga como prefieras
                </h3>
                <p className="text-gray-600 text-xs leading-tight">
                  Yape, Plin, tarjetas de crédito y débito. Cuotéalo y más ...
                </p>
              </div>
            </div>

            {/* Productos de Calidad */}
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                  <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-sm mb-0.5">
                  Productos de Calidad
                </h3>
                <p className="text-gray-600 text-xs leading-tight">
                  En peru Smart los productos son importados y de calidad.
                </p>
              </div>
            </div>

            {/* Rápido y Seguro */}
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                  <path d="M9 12l2 2 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-sm mb-0.5">
                  Rápido y Seguro
                </h3>
                <p className="text-gray-600 text-xs leading-tight">
                  Compra en Peru Smart y recíbelo en máximo 72 horas.
                </p>
              </div>
            </div>

            {/* Atención personalizada */}
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="12" cy="7" r="4" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-sm mb-0.5">
                  Atención personalizada
                </h3>
                <p className="text-gray-600 text-xs leading-tight">
                  ¿Tienes dudas? ¡Escríbenos vía WhatsApp!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
