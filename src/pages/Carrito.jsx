import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, Minus, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { useLoader } from '../context/LoaderContext';

const Carrito = () => {
  const { items, updateQuantity, removeItem, getTotal } = useCart();
  const navigate = useNavigate();
  const [seleccionados, setSeleccionados] = useState([]);
  const [todosSeleccionados, setTodosSeleccionados] = useState(true);
  const { showLoader, hideLoader } = useLoader();

  // Asegurar que items sea siempre un array
  const cartItems = Array.isArray(items) ? items : [];

  // Auto-seleccionar todos los items cuando cambia el carrito
  useEffect(() => {
    setSeleccionados(cartItems.map(item => item.id));
    setTodosSeleccionados(cartItems.length > 0);
  }, [cartItems.length]);

  const handleCantidadChange = async (itemId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    showLoader();
    await updateQuantity(itemId, nuevaCantidad);
    setTimeout(hideLoader, 500);
  };

  const handleEliminar = (itemId) => {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Se quitará este producto del carrito',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ea580c', // orange-600
      cancelButtonColor: '#9ca3af'
    }).then(async (result) => {
      if (result.isConfirmed) {
        showLoader();
        await removeItem(itemId);
        setTimeout(hideLoader, 500);
        // El useEffect se encargará de actualizar la selección
        Swal.fire({
          title: 'Eliminado',
          text: 'Producto eliminado del carrito',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          confirmButtonColor: '#ea580c'
        });
      }
    });
  };

  const toggleSeleccion = (itemId) => {
    if (seleccionados.includes(itemId)) {
      setSeleccionados(seleccionados.filter(id => id !== itemId));
      setTodosSeleccionados(false);
    } else {
      const nuevosSeleccionados = [...seleccionados, itemId];
      setSeleccionados(nuevosSeleccionados);
      if (nuevosSeleccionados.length === cartItems.length) {
        setTodosSeleccionados(true);
      }
    }
  };

  const toggleTodos = () => {
    if (todosSeleccionados) {
      setSeleccionados([]);
      setTodosSeleccionados(false);
    } else {
      setSeleccionados(cartItems.map(item => item.id));
      setTodosSeleccionados(true);
    }
  };

  const getTotalSeleccionados = () => {
    return cartItems
      .filter(item => seleccionados.includes(item.id))
      .reduce((total, item) => total + item.subtotal, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="container mx-auto px-4 max-w-md text-center">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="text-orange-500" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-8">¡Explora nuestro catálogo y encuentra lo que buscas!</p>
          <button
            onClick={() => { showLoader(); navigate('/productos'); setTimeout(hideLoader, 500); }}
            className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            Ver Productos <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-44 pb-12 md:pt-60">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-2 mb-8">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-orange-500 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Carrito de Compras</h1>
          <span className="text-sm font-medium text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna Izquierda - Lista de Productos */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header de Selección */}
            <div className={`rounded-xl p-4 flex items-center justify-between border-2 transition-all duration-200 ${todosSeleccionados ? 'border-orange-500 bg-orange-50/50' : 'bg-white border-gray-100 shadow-sm'}`}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${todosSeleccionados ? 'bg-orange-500 border-orange-500' : 'border-gray-300 group-hover:border-orange-400'}`}>
                  <input
                    type="checkbox"
                    checked={todosSeleccionados}
                    onChange={toggleTodos}
                    className="hidden"
                  />
                  {todosSeleccionados && <ArrowRight className="text-white rotate-[-45deg] translate-y-[-1px] translate-x-[-1px]" size={12} strokeWidth={4} />}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Seleccionar todos ({cartItems.length})</span>
              </label>
              <button
                onClick={() => setSeleccionados([])}
                className="text-xs text-gray-500 hover:text-red-500 font-medium transition-colors"
              >
                Deseleccionar todo
              </button>
            </div>

            {/* Lista de Items */}
            <div className="space-y-4">
              {cartItems.map((item) => {
                const producto = item.producto;
                const variacion = item.variacion;
                const imagen = producto?.imagen || null;
                const nombre = producto?.nombre || 'Producto';
                const isSelected = seleccionados.includes(item.id);
                // Calculate max allowed quantity with proper fallback
                const stockProp = variacion ? variacion.stock : producto?.stock;
                // If stock information is missing, default to 10 so we don't block, but still cap at 10
                const stockActual = (stockProp !== undefined && stockProp !== null) ? Number(stockProp) : 10;
                const maxQty = Math.min(10, stockActual);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-5 border-2 transition-all duration-200 relative ${isSelected ? 'border-orange-500 bg-orange-50/50' : 'border-gray-100 shadow-sm bg-white hover:border-orange-200'}`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4 text-orange-500 z-10">
                        <div className="bg-orange-500 text-white rounded-full p-0.5">
                          <ArrowRight size={14} className="rotate-[-45deg] translate-x-[-1px]" strokeWidth={3} />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 sm:gap-6">
                      {/* Checkbox Individual (Visible + Clickable) */}
                      <div className="pt-2 relative z-20">
                        <label className="cursor-pointer group" onClick={(e) => { e.stopPropagation(); toggleSeleccion(item.id); }}>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300 group-hover:border-orange-400 bg-white'}`}>
                            {isSelected && <ArrowRight className="text-white rotate-[-45deg] translate-y-[-1px] translate-x-[-1px]" size={12} strokeWidth={4} />}
                          </div>
                        </label>
                      </div>

                      {/* Hidden Input for Card Click Logic (keeps the rest of the card clickable) */}
                      <label className="absolute inset-0 cursor-pointer z-0" onClick={() => toggleSeleccion(item.id)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="hidden"
                        />
                      </label>

                      {/* Imagen */}
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100 relative z-10 pointer-events-none">
                        {imagen ? (
                          <img
                            src={imagen}
                            alt={nombre}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="text-gray-300" size={32} />
                          </div>
                        )}
                      </div>

                      {/* Detalles */}
                      <div className="flex-1 min-w-0 relative z-10">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 hover:text-orange-600 transition-colors cursor-pointer" onClick={() => navigate(`/producto/${producto.id}`)}>
                              {nombre}
                            </h3>
                            {variacion && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {variacion.atributos?.map((a, idx) => (
                                  <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                                    {a.valor}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              En stock
                            </div>
                          </div>
                          <button
                            onClick={() => handleEliminar(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                          {/* Selector de Cantidad */}
                          <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 w-fit">
                            <button
                              onClick={() => handleCantidadChange(item.id, item.cantidad - 1)}
                              disabled={item.cantidad <= 1}
                              className="p-2 hover:bg-white hover:text-orange-500 transition-colors rounded-l-lg disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400 text-gray-600"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-gray-900 bg-white h-full flex items-center justify-center border-x border-gray-200 py-1">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => {
                                if (item.cantidad >= maxQty) return;
                                handleCantidadChange(item.id, item.cantidad + 1);
                              }}
                              disabled={item.cantidad >= maxQty}
                              className="p-2 hover:bg-white hover:text-orange-500 transition-colors rounded-r-lg text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Precio */}
                          <div className="text-right">
                            {item.precio_regular && parseFloat(item.precio) < parseFloat(item.precio_regular) && (
                              <p className="text-xs text-gray-400 line-through">
                                {formatCurrency(parseFloat(item.precio_regular) * item.cantidad)}
                              </p>
                            )}
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha - Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Resumen del Pedido</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal (Base)</span>
                  <span>{formatCurrency(getTotalSeleccionados() / 1.18)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>IGV (18%)</span>
                  <span>{formatCurrency(getTotalSeleccionados() - (getTotalSeleccionados() / 1.18))}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Envío estimado</span>
                  <span className="text-green-600 font-medium">Gratis</span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between items-end">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <div className="text-right">
                    <span className="block text-2xl font-bold text-orange-500">{formatCurrency(getTotalSeleccionados())}</span>
                    <span className="text-xs text-gray-500 font-normal">Incluye impuestos</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { showLoader(); navigate('/checkout'); setTimeout(hideLoader, 500); }}
                disabled={seleccionados.length === 0}
                className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center gap-2"
              >
                Continuar Compra <ArrowRight size={18} />
              </button>

              <button
                onClick={() => { showLoader(); navigate('/productos'); setTimeout(hideLoader, 500); }}
                className="w-full py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                Seguir comprando
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShoppingBag size={14} />
                <span>Compra 100% segura y protegida</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito;
