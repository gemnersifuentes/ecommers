import api from './api';

export const carritoService = {
    // Obtener carrito del usuario autenticado
    getCarrito: async () => {
        const response = await api.get('/api/carrito');
        return response.data;
    },

    // Agregar item al carrito
    addItem: async (itemData) => {
        const response = await api.post('/api/carrito', itemData);
        return response.data;
    },

    // Actualizar cantidad de un item
    updateItem: async (itemId, cantidad) => {
        // Asegurar que itemId es string y cantidad es número
        const cleanItemId = String(itemId);
        const cleanCantidad = Number(cantidad);

        console.log('[carritoService] updateItem:', { cleanItemId, cleanCantidad });

        const url = `/api/carrito/${cleanItemId}`;
        console.log('[carritoService] URL:', url);
        console.log('[carritoService] Body:', { cantidad: cleanCantidad });

        const response = await api.put(url, { cantidad: cleanCantidad });
        return response.data;
    },

    // Eliminar item del carrito
    removeItem: async (itemId) => {
        const cleanItemId = String(itemId);
        console.log('[carritoService] removeItem:', cleanItemId);

        const url = `/api/carrito/${cleanItemId}`;
        console.log('[carritoService] DELETE URL:', url);

        const response = await api.delete(url);
        return response.data;
    },

    // Limpiar todo el carrito
    clearCart: async () => {
        const response = await api.delete('/api/carrito');
        return response.data;
    }
};

export default carritoService;
