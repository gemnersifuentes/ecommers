import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token.trim()) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Si no es FormData, establecer Content-Type como JSON
    // Si es FormData, dejar que el navegador establezca el Content-Type automáticamente
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Sesión expirada o inválida. Redirigiendo al login...');
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// API DE DESCUENTOS
// ============================================

export const descuentosAPI = {
  // Obtener todos los descuentos
  getAll: () => api.get('/api/descuentos'),

  // Obtener solo descuentos activos
  getActivos: () => api.get('/api/descuentos?activos=1'),

  // Obtener un descuento por ID
  getById: (id) => api.get(`/api/descuentos/${id}`),

  // Crear nuevo descuento
  create: (data) => api.post('/api/descuentos', data),

  // Actualizar descuento
  update: (id, data) => api.put(`/api/descuentos/${id}`, data),

  // Desactivar descuento
  delete: (id) => api.delete(`/api/descuentos/${id}`)
};

export default api;

