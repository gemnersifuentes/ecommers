import api from './api';

const bannersService = {
    // Obtener todos los banners
    getAll: async (params = {}) => {
        // Agregar timestamp para evitar caché
        const queryParams = { ...params, _t: new Date().getTime() };
        const queryString = new URLSearchParams(queryParams).toString();
        const response = await api.get(`/api/banners${queryString ? '?' + queryString : ''}`);
        return response.data;
    },

    // Obtener solo banners activos (para el frontend público)
    getActive: async (tipo = null) => {
        const params = { activo: 1 };
        if (tipo) params.tipo = tipo;
        return bannersService.getAll(params);
    },

    // Crear banner
    create: async (bannerData) => {
        const response = await api.post('/api/banners', bannerData);
        return response.data;
    },

    // Actualizar banner
    update: async (id, bannerData) => {
        // Si es FormData, usar POST para soportar archivos (PHP tiene problemas con PUT y multipart)
        if (bannerData instanceof FormData) {
            const response = await api.post(`/api/banners/${id}`, bannerData);
            return response.data;
        }
        const response = await api.put(`/api/banners/${id}`, bannerData);
        return response.data;
    },

    // Eliminar banner
    delete: async (id) => {
        const response = await api.delete(`/api/banners/${id}`);
        return response.data;
    }
};

export default bannersService;
