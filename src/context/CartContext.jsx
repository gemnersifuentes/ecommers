import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { carritoService } from '../services';
import Swal from 'sweetalert2';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart_selected_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { isAuthenticated, usuario, loading: authLoading } = useAuth();

  // Guardar selección en localStorage
  useEffect(() => {
    localStorage.setItem('cart_selected_items', JSON.stringify(selectedItems));
  }, [selectedItems]);

  // Cargar carrito al iniciar (solo cuando auth está listo)
  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthenticated || !usuario?.id || authLoading) {
        console.log('⏳ Esperando autenticación...');
        setItems([]);
        return;
      }

      setLoading(true);
      try {
        const cartData = await carritoService.getCarrito();
        setItems(cartData || []);
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated, usuario?.id, authLoading]);

  const addItem = async (producto, variacion = null, cantidad = 1) => {
    console.log('🛒 addItem -', producto?.nombre, 'x', cantidad);

    // REQUERIR AUTENTICACIÓN
    if (!isAuthenticated) {
      const result = await Swal.fire({
        icon: 'info',
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para agregar productos al carrito',
        showCancelButton: true,
        confirmButtonText: 'Ir al login',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3b82f6'
      });

      if (result.isConfirmed) {
        window.location.href = '/login';
      }
      throw new Error('Usuario no autenticado');
    }

    setSyncing(true);

    try {
      await carritoService.addItem({
        producto_id: producto.id,
        variacion_id: variacion?.id || null,
        cantidad
      });

      // Recargar carrito desde backend
      const updatedCart = await carritoService.getCarrito();
      setItems(updatedCart || []);

      // Auto-seleccionar el item recién agregado
      if (updatedCart && updatedCart.length > 0) {
        // Buscamos el item que acabamos de agregar (o el más reciente)
        // Normalmente es el que coincide con producto_id y variacion_id
        const newItem = updatedCart.find(it =>
          it.producto_id === producto.id &&
          (!variacion || it.variacion_id === variacion.id)
        );

        if (newItem && !selectedItems.includes(newItem.id)) {
          setSelectedItems(prev => [...prev, newItem.id]);
        }
      }

      console.log('✓ Item agregado y sincronizado con backend');
    } catch (error) {
      console.error('Error al agregar item:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo agregar el producto al carrito. Intenta de nuevo.',
        confirmButtonColor: '#3b82f6'
      });
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const removeItem = async (itemId) => {
    if (!isAuthenticated) return;

    setSyncing(true);
    try {
      console.log('🗑️ Eliminando item con ID:', itemId);
      await carritoService.removeItem(itemId);
      const updatedCart = await carritoService.getCarrito();
      setItems(updatedCart || []);

      // Quitar de seleccionados si estaba
      setSelectedItems(prev => prev.filter(id => id !== itemId));

      console.log('✓ Item eliminado');
    } catch (error) {
      console.error('Error al eliminar item:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'No se pudo eliminar el producto',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setSyncing(false);
    }
  };

  const updateQuantity = async (itemId, cantidad) => {
    if (!isAuthenticated) return;

    console.log('🔄 updateQuantity called with:', { itemId, cantidad, type: typeof cantidad });

    if (cantidad <= 0) {
      console.log('⚠️ Cantidad <= 0, llamando removeItem');
      await removeItem(itemId);
      return;
    }

    setSyncing(true);
    try {
      console.log(`🔄 Calling carritoService.updateItem("${itemId}", ${cantidad})`);
      const result = await carritoService.updateItem(itemId, cantidad);
      console.log('✓ UpdateItem response:', result);

      const updatedCart = await carritoService.getCarrito();
      setItems(updatedCart || []);
      console.log('✓ Cantidad actualizada');
    } catch (error) {
      console.error('❌ Error al actualizar cantidad:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setSyncing(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;

    setSyncing(true);
    try {
      await carritoService.clearCart();
      setItems([]);
      setSelectedItems([]);
      console.log('🗑️ Carrito vaciado');
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
    } finally {
      setSyncing(false);
    }
  };

  const getTotal = () => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.subtotal || 0), 0);
  };

  const getItemsCount = () => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((count, item) => count + (item.cantidad || 0), 0);
  };

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemsCount,
    selectedItems,
    setSelectedItems,
    loading,
    syncing
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
