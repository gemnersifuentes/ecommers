import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, Minus, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { useLoader } from '../context/LoaderContext';

const Carrito = () => {
  const { items, updateQuantity, removeItem, getTotal, selectedItems, setSelectedItems } = useCart();
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();

  // Asegurar que items sea siempre un array
  const cartItems = Array.isArray(items) ? items : [];

  const todosSeleccionados = cartItems.length > 0 && selectedItems.length === cartItems.length;

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
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const toggleTodos = () => {
    if (todosSeleccionados) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

  const getTotalSeleccionados = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => total + item.subtotal, 0);
  };

  const getSubtotalSinDescuento = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => {
        const precioBase = item.precio_original || item.precio_regular || item.precio;
        return total + (parseFloat(precioBase) * item.cantidad);
      }, 0);
  };

  const getDescuentoTotal = () => {
    return getSubtotalSinDescuento() - getTotalSeleccionados();
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
    <div className="min-h-screen bg-gray-50 pt-36 pb-12 md:pt-48">
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
            <div className={`rounded-xl p-3 sm:p-4 flex items-center justify-between border-2 transition-all duration-200 ${todosSeleccionados ? 'border-orange-500 bg-orange-50/50' : 'bg-white border-gray-100 shadow-sm'}`}>
              <label className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-1 min-w-0">
                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${todosSeleccionados ? 'bg-orange-500 border-orange-500' : 'border-gray-300 group-hover:border-orange-400'}`}>
                  <input
                    type="checkbox"
                    checked={todosSeleccionados}
                    onChange={toggleTodos}
                    className="hidden"
                  />
                  {todosSeleccionados && <ArrowRight className="text-white rotate-[-45deg] translate-y-[-1px] translate-x-[-1px]" size={12} strokeWidth={4} />}
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">Seleccionar todos ({cartItems.length})</span>
              </label>
              <button
                onClick={() => setSelectedItems([])}
                className="text-[10px] sm:text-xs text-gray-500 hover:text-red-500 font-medium transition-colors ml-2 shrink-0"
              >
                Limpiar selección
              </button>
            </div>

            {/* Lista de Items */}
            <div className="space-y-4">
              {cartItems.map((item) => {
                const producto = item.producto;
                const variacion = item.variacion;
                const imagen = producto?.imagen || null;
                const nombre = producto?.nombre || 'Producto';
                const isSelected = selectedItems.includes(item.id);
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
                    className={`rounded-xl p-3 sm:p-5 border-2 transition-all duration-200 relative ${isSelected ? 'border-orange-500 bg-orange-50/50' : 'border-gray-100 shadow-sm bg-white hover:border-orange-200'}`}
                  >
                    {/* Botón Eliminar - Absolute on mobile, relative on desktop? No, easier if absolute always for consistent spacing on right */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEliminar(item.id); }}
                      className="absolute top-3 right-3 sm:top-5 sm:right-5 text-gray-400 hover:text-red-500 transition-colors p-2 z-30"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="flex gap-3 sm:gap-6">
                      {/* Checkbox Individual */}
                      <div className="pt-2 sm:pt-4 relative z-20 shrink-0">
                        <label className="cursor-pointer group" onClick={(e) => { e.stopPropagation(); toggleSeleccion(item.id); }}>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300 group-hover:border-orange-400 bg-white'}`}>
                            {isSelected && <ArrowRight className="text-white rotate-[-45deg] translate-y-[-1px] translate-x-[-1px]" size={12} strokeWidth={4} />}
                          </div>
                        </label>
                      </div>

                      {/* Card Content Wrapper */}
                      <div className="flex flex-1 gap-3 sm:gap-6 min-w-0" onClick={() => toggleSeleccion(item.id)}>
                        {/* Imagen */}
                        <div className="w-20 h-20 sm:w-32 sm:h-32 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100 relative z-10">
                          {imagen ? (
                            <img
                              src={imagen}
                              alt={nombre}
                              className="w-full h-full object-contain p-1 sm:p-2"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="text-gray-300" size={24} />
                            </div>
                          )}
                        </div>

                        {/* Detalles */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <h3 className="font-bold text-gray-900 text-xs sm:text-base line-clamp-2 pr-10 sm:pr-12 mb-1">
                              {nombre}
                            </h3>
                            {variacion && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {variacion.atributos?.map((a, idx) => (
                                  <span key={idx} className="text-[10px] sm:text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                    {a.atributo_nombre}: {a.valor}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="text-[10px] sm:text-xs text-green-600 font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              En stock
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 mt-3">
                            {/* Selector de Cantidad */}
                            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 w-fit shrink-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleCantidadChange(item.id, item.cantidad - 1)}
                                disabled={item.cantidad <= 1}
                                className="p-1.5 sm:p-2 hover:bg-white hover:text-orange-500 transition-colors disabled:opacity-30 text-gray-600"
                              >
                                <Minus size={12} className="sm:w-[14px] sm:h-[14px]" />
                              </button>
                              <span className="w-7 sm:w-8 text-center text-xs sm:text-sm font-semibold text-gray-900 bg-white h-full flex items-center justify-center border-x border-gray-200 py-0.5 sm:py-1">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() => {
                                  if (item.cantidad >= maxQty) return;
                                  handleCantidadChange(item.id, item.cantidad + 1);
                                }}
                                disabled={item.cantidad >= maxQty}
                                className="p-1.5 sm:p-2 hover:bg-white hover:text-orange-500 transition-colors text-gray-600 disabled:opacity-30"
                              >
                                <Plus size={12} className="sm:w-[14px] sm:h-[14px]" />
                              </button>
                            </div>

                            {/* Precio */}
                            <div className="text-right shrink-0">
                              {item.precio_regular && parseFloat(item.precio) < parseFloat(item.precio_regular) && (
                                <p className="text-[10px] sm:text-xs text-gray-400 line-through">
                                  {formatCurrency(parseFloat(item.precio_regular) * item.cantidad)}
                                </p>
                              )}
                              <p className="text-sm sm:text-lg font-bold text-gray-900">
                                {formatCurrency(item.subtotal)}
                              </p>
                            </div>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Resumen del Pedido</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal (Base)</span>
                  <span>{formatCurrency(getSubtotalSinDescuento())}</span>
                </div>
                {getDescuentoTotal() > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Descuento</span>
                    <span>-{formatCurrency(getDescuentoTotal())}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-900 font-bold border-t border-gray-100 pt-2">
                  <span>Neto (Base Imponible)</span>
                  <span>{formatCurrency(getTotalSeleccionados())}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>IGV (18%)</span>
                  <span className="font-medium text-orange-600">+{formatCurrency(getTotalSeleccionados() * 0.18)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Envío estimado</span>
                  <span className="text-green-600 font-medium">Gratis</span>
                </div>
                <div className="pt-3 border-t-2 border-orange-100">
                  <div className="flex justify-between items-end">
                    <span className="text-base font-bold text-gray-900">Total a Pagar</span>
                    <span className="block text-xl sm:text-2xl font-bold text-orange-500">{formatCurrency(getTotalSeleccionados() * 1.18)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  showLoader();
                  navigate('/checkout', { state: { selectedItems: selectedItems } });
                  setTimeout(hideLoader, 500);
                }}
                disabled={selectedItems.length === 0}
                className="w-full py-3.5 sm:py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center gap-2"
              >
                Continuar Compra <ArrowRight size={18} />
              </button>

              <button
                onClick={() => { showLoader(); navigate('/productos'); setTimeout(hideLoader, 500); }}
                className="w-full py-2.5 sm:py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm sm:text-base"
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
