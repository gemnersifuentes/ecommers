import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productosService, serviciosService, tiendaCategoriasService, tiendaService } from '../services';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import HeroCarousel from '../components/HeroCarousel';
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
import {
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Zap,
  ArrowRight,
  Star,
  Heart,
  ShoppingCart as CartIcon,
  Package,
  Award,
  Clock,
  ChevronRight
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
  const [servicios, setServicios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [ofertasRelampago, setOfertasRelampago] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const [productosData, serviciosData, categoriasData, ofertasData] = await Promise.all([
        tiendaService.getProductos(),
        serviciosService.getAll(),
        tiendaCategoriasService.getAll(),
        tiendaService.getProductos({ ofertas: 1, limit: 5 })
      ]);

      // Verificar si productosData es un array o viene en .data
      const productosArray = Array.isArray(productosData) ? productosData : (productosData.data || []);
      setProductosDestacados(productosArray.slice(0, 6));

      // Randomly select products for "Recommended" or just take a different slice
      // Shuffling for variety
      const shuffled = [...productosArray].sort(() => 0.5 - Math.random());
      setProductosRecomendados(shuffled.slice(0, 18));

      // Procesar ofertas
      const ofertasArray = Array.isArray(ofertasData) ? ofertasData : (ofertasData.data || []);
      setOfertasRelampago(ofertasArray);

      setServicios(serviciosData);
      setCategorias(categoriasData);
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
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Categorías circulares - Estilo imagen de referencia */}
      <div className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-4 bg-white rounded-lg">
          {/* Scroll horizontal */}
          <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
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
                    <div className="w-20 h-20 rounded-full border-2 border-transparent group-hover:border-orange-500 transition-all duration-300  mb-2 bg-white p-1">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        {categoria.imagen ? (
                          <img
                            src={categoria.imagen}
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
          <div className="py-8 bg-gray-50">
            {/* Banner OFERTAS WOW */}
            <div className="bg-gradient-to-r mx-auto from-red-600 to-orange-500 rounded-xl p-4 md:p-6 mb-8 flex flex-col md:flex-row items-center justify-between shadow-lg text-white relative overflow-hidden max-w-7xl gap-4 md:gap-0">
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
            <div className="max-w-7xl mx-auto px-6 py-8 bg-white rounded-lg">



              <div className="flex justify-end mb-4">
                <Link to="/productos?ofertas=1" className="text-sm font-medium text-gray-600 hover:text-black flex items-center gap-1 group">
                  Ver todas las ofertas <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {ofertasRelampago.map(producto => (
                  <Link key={producto.id} to={`/producto/${producto.id}`} className="group">
                    <div className="bg-white  rounded-lg p-3 transition-shadow relative">
                      {/* Badge Descuento */}
                      <div className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded z-10">
                        -{Math.round(producto.descuento_valor)}%
                      </div>

                      {/* Imagen */}
                      <div className="aspect-square mb-3 overflow-hidden rounded-md bg-gray-100 relative">
                        {producto.imagen ? (
                          <img
                            src={producto.imagen.startsWith('http') ? producto.imagen : `http://localhost:8000${producto.imagen}`}
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
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-orange-600">
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
      {/* Productos Destacados Compactos */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-xs font-bold shadow-lg"
            >
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ⭐
              </motion.span>
              Los Más Vendidos
              <TrendingUp className="w-4 h-4" />
            </motion.div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Productos{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Destacados
              </span>
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Descubre nuestra selección premium con ofertas exclusivas
            </p>
          </motion.div>

          {/* Carrusel de productos */}
          <div className="relative group/carousel">
            {/* Botón anterior */}
            <button
              onClick={() => {
                const container = document.getElementById('productos-carousel');
                container.scrollBy({ left: -500, behavior: 'smooth' });
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-50"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Botón siguiente */}
            <button
              onClick={() => {
                const container = document.getElementById('productos-carousel');
                container.scrollBy({ left: 500, behavior: 'smooth' });
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-50"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Contenedor del carrusel */}
            <div
              id="productos-carousel"
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4 py-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {productosDestacados.map((producto, index) => (
                <motion.div
                  key={producto.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="flex-shrink-0 w-[240px]"
                >
                  <Link to={`/producto/${producto.id}`}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group relative"
                    >
                      {/* Imagen estilo Falabella */}
                      <div className="relative h-48 bg-white overflow-hidden p-4">
                        {producto.imagen ? (
                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="w-20 h-20 text-gray-300" />
                          </div>
                        )}

                        {/* Badge descuento estilo Falabella */}
                        <div className="absolute top-2 left-2">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            -20%
                          </span>
                        </div>
                      </div>

                      {/* Contenido estilo Falabella */}
                      <div className="p-3 border-t border-gray-100">
                        {/* Marca/Categoría */}
                        <p className="text-xs text-gray-500 uppercase mb-1 font-semibold">
                          {producto.categoria || 'TECNOLOGÍA'}
                        </p>

                        {/* Nombre del producto */}
                        <h3 className="text-sm text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem] leading-tight">
                          {producto.nombre}
                        </h3>

                        {/* Precios estilo Falabella */}
                        <div className="mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-gray-900">
                              ${parseFloat(producto.precio_base).toFixed(2)}
                            </span>
                            <span className="text-xs text-white bg-red-500 px-1.5 py-0.5 rounded font-bold">
                              -20%
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 line-through">
                            ${(parseFloat(producto.precio_base) * 1.25).toFixed(2)}
                          </span>
                        </div>

                        {/* Rating estilo Falabella */}
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">4.8</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Botón ver todos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Link to="/productos">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all inline-flex items-center gap-2"
              >
                Ver Todos los Productos
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
      {/* Banner Cuotéalo - Estilo Falabella */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-orange-500 rounded-2xl overflow-hidden">
            {/* Contenido del banner */}
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
              {/* Lado izquierdo - Texto */}
              <div className="p-8 lg:p-12 text-white relative z-10">
                <h2 className="text-3xl lg:text-4xl font-bold mb-2">
                  Con <span className="text-cyan-300">cuotéalo</span>
                </h2>
                <h3 className="text-2xl lg:text-3xl font-bold mb-2">
                  Compra en <span className="font-black">PERU SMART</span>
                </h3>
                <p className="text-lg lg:text-xl">
                  en cuotas y <span className="text-red-400 font-bold">sin tarjeta de crédito</span>
                </p>
              </div>

              {/* Lado derecho - Imagen de productos */}
              <div className="relative h-48 lg:h-64 flex items-center justify-center p-4">
                {/* Decoración de fondo */}
                <div className="absolute inset-0 bg-gradient-to-l from-orange-400/20 to-transparent"></div>

                {/* Productos con imágenes */}
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {productosDestacados.slice(0, 3).map((producto, i) => (
                    <div
                      key={i}
                      className={`w-24 h-32 lg:w-32 lg:h-40 bg-white rounded-lg shadow-2xl transform ${i === 0 ? '-rotate-6' : i === 1 ? 'rotate-3 scale-110' : 'rotate-12'
                        } overflow-hidden`}
                    >
                      {producto.imagen ? (
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Flecha decorativa */}
            <div className="absolute top-0 right-1/2 lg:right-1/3 w-0 h-0 border-t-[200px] border-t-transparent border-l-[100px] border-l-blue-900 border-b-[200px] border-b-transparent opacity-50"></div>
          </div>
        </div>
      </div>
      {/* Audífonos ideales para ti - Estilo Falabella */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Banner lateral izquierdo */}
            <div className="lg:col-span-1">
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg p-6 h-full flex flex-col justify-between text-white overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">LIBERTAD AUDITIVA TOTAL</h3>
                  <h4 className="text-2xl font-black mb-3">CON LOS AIRPODS</h4>
                  <p className="text-sm mb-4 text-gray-300">Sonido de alta calidad y sin cables</p>
                  <span className="inline-block bg-white text-gray-900 text-xs font-bold px-3 py-1 rounded cursor-pointer hover:bg-gray-100 transition-colors">
                    VER PRODUCTO
                  </span>
                </div>
                {/* Imagen de producto */}
                {productosDestacados[0]?.imagen && (
                  <div className="absolute bottom-0 right-0 w-32 h-32 opacity-30">
                    <img
                      src={productosDestacados[0].imagen}
                      alt="Producto"
                      className="w-full h-full object-contain transform rotate-12"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Productos a la derecha */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Audífonos ideales para ti
                </h2>
                <Link to="/productos" className="text-blue-600 font-semibold text-sm hover:underline flex items-center gap-1">
                  VER TODO
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {productosDestacados.slice(0, 4).map((producto) => (
                  <Link key={producto.id} to={`/producto/${producto.id}`}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative h-40 bg-white overflow-hidden p-3">
                        {producto.imagen ? (
                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="w-16 h-16 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                            -17%
                          </span>
                        </div>
                      </div>
                      <div className="p-3 border-t border-gray-100">
                        <h3 className="text-sm text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem] leading-tight">
                          {producto.nombre}
                        </h3>
                        <div className="mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base font-bold text-gray-900">
                              ${parseFloat(producto.precio_base).toFixed(2)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 line-through">
                            ${(parseFloat(producto.precio_base) * 1.2).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">4.7</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>







      {/* Servicios Compactos */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-xs font-bold shadow-lg">
              <FaTools className="w-3 h-3" />
              SERVICIOS PROFESIONALES
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Asistencia <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Técnica</span>
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Servicios técnicos especializados para tu equipo
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 px-2">
            {servicios.map((servicio, i) => (
              <motion.div
                key={servicio.id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.01 }}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="flex gap-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                  >
                    <FaTools className="text-xl text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {servicio.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{servicio.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500">Desde</span>
                        <span className="text-xl font-bold text-blue-600 ml-1">
                          ${parseFloat(servicio.precio).toFixed(2)}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all text-xs"
                      >
                        Solicitar
                      </motion.button>
                    </div>
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
    </div >
  );
};

export default Home;
