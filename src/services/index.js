import api from './api';

export const authService = {
  login: async (correo, clave) => {
    const response = await api.post('/api/auth.php?action=login', { correo, clave });
    return response.data;
  },

  register: async (nombre, correo, clave) => {
    const response = await api.post('/api/auth.php?action=register', { nombre, correo, clave });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  forgotPassword: async (correo) => {
    const response = await api.post('/api/auth.php?action=forgot-password', { correo });
    return response.data;
  },

  resetPassword: async (token, clave) => {
    const response = await api.post('/api/auth.php?action=reset-password', { token, clave });
    return response.data;
  },

  googleLogin: async (credential) => {
    const response = await api.post('/api/auth.php?action=google-login', { credential });
    return response.data;
  }
};

export const productosService = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/productos.php', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/productos.php?id=${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/productos.php', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/productos.php?id=${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/productos.php?id=${id}`);
    return response.data;
  }
};

export const categoriasService = {
  getAll: async () => {
    const response = await api.get('/api/categorias.php');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/categorias.php?id=${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/categorias.php', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/categorias.php?id=${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/categorias.php?id=${id}`);
    return response.data;
  }
};


export const serviciosService = {
  getAll: async () => {
    const response = await api.get('/api/servicios.php');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/servicios.php?id=${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/servicios.php', data);
    return response.data;
  },

  update: async (id, data) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      const response = await api.post(`/api/servicios.php?id=${id}`, data);
      return response.data;
    }
    const response = await api.put(`/api/servicios.php?id=${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/servicios.php?id=${id}`);
    return response.data;
  }
};

export const variacionesService = {
  getAll: async (productoId = null) => {
    const params = productoId ? { producto_id: productoId } : {};
    const response = await api.get('/api/variantes.php', { params });
    return response.data;
  },

  getByProducto: async (productoId) => {
    const response = await api.get('/api/variantes.php', { params: { producto_id: productoId } });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post(`/api/variantes.php?producto_id=${data.producto_id}`, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/variantes.php?id=${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/variantes.php?id=${id}`);
    return response.data;
  }
};

export const catalogosService = {
  getAtributos: async () => {
    const response = await api.get('/api/catalogos.php?action=atributos');
    return response.data;
  }
};

export const pedidosService = {
  getAll: async (estado = null) => {
    const params = estado ? { estado } : {};
    const response = await api.get('/api/pedidos', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/pedidos/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/pedidos', data);
    return response.data;
  },

  updateEstado: async (id, estado) => {
    const response = await api.put(`/api/pedidos/${id}`, { estado });
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.delete(`/api/pedidos/${id}`);
    return response.data;
  }
};

export const usuariosService = {
  getAll: async () => {
    const response = await api.get('/api/usuarios');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/usuarios/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/usuarios', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/usuarios/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/usuarios/${id}`);
    return response.data;
  }
};

export const reportesService = {
  getDashboard: async (periodo = '12M') => {
    const response = await api.get(`/api/reportes/dashboard?periodo=${periodo}`);
    return response.data;
  },

  getVentas: async (fechaInicio, fechaFin) => {
    const response = await api.get('/api/reportes/ventas', {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
    });
    return response.data;
  }
};

export const marcasService = {
  getAll: async () => {
    const response = await api.get('/api/marcas');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/marcas/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/marcas', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/marcas/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/marcas/${id}`);
    return response.data;
  }
};

export const descuentosService = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/descuentos', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/descuentos/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/descuentos', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/descuentos/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/descuentos/${id}`);
    return response.data;
  }
};

// La API de atributos es legacy/no usada, pero actualizamos por consistencia
export const atributosService = {
  getByProducto: async (productoId) => {
    const response = await api.get(`/api/productos.php?id=${productoId}&action=atributos`);
    return response.data;
  },

  create: async (productoId, data) => {
    const response = await api.post(`/api/productos.php?id=${productoId}&action=atributos`, data);
    return response.data;
  },

  update: async (atributoId, data) => {
    const response = await api.put(`/api/atributos.php?id=${atributoId}`, data);
    return response.data;
  },

  delete: async (atributoId) => {
    const response = await api.delete(`/api/atributos.php?id=${atributoId}`);
    return response.data;
  }
};

export { default as carritoService } from './carritoService';

export const tiendaService = {
  getProductos: async (params = {}) => {
    const response = await api.get('/api/tienda/productos.php', { params });
    return response.data;
  },

  getProductoById: async (id) => {
    const response = await api.get(`/api/tienda/productos.php?id=${id}`);
    return response.data;
  },

  // Nuevo método para buscar
  search: async (query) => {
    const response = await api.get(`/api/tienda/productos.php?busqueda=${query}`);
    return response.data;
  },

  crearPedido: async (data) => {
    const config = data instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await api.post('/api/tienda/pedidos.php', data, config);
    return response.data;
  },

  getPedidos: async (usuarioId) => {
    const response = await api.get(`/api/tienda/pedidos.php?usuario_id=${usuarioId}`);
    return response.data;
  },

  getPedidoById: async (pedidoId) => {
    const response = await api.get(`/api/tienda/pedidos.php?id=${pedidoId}`);
    return response.data;
  },

  createMPPreference: async (data) => {
    const response = await api.post('/api/tienda/mercado_pago_handler.php?action=create_preference', data);
    return response.data;
  }
};

export const direccionesService = {
  getAll: async (usuarioId) => {
    const response = await api.get(`/api/direcciones.php?usuario_id=${usuarioId}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/direcciones.php/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/direcciones.php', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/direcciones.php/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/direcciones.php/${id}`);
    return response.data;
  },

  setDefault: async (id) => {
    const response = await api.put(`/api/direcciones.php/${id}`, { es_predeterminada: true });
    return response.data;
  }
};

export const tiendaCategoriasService = {
  getAll: async () => {
    const response = await api.get('/api/tienda/categorias.php');
    return response.data;
  }
};

export const resenasService = {
  getByProducto: async (productoId) => {
    const response = await api.get(`/api/tienda/resenas.php?producto_id=${productoId}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/api/tienda/resenas.php', data);
    return response.data;
  }
};

export const favoritosService = {
  getAll: async () => {
    const response = await api.get('/api/tienda/favoritos.php');
    return response.data;
  },
  toggle: async (productoId) => {
    const response = await api.post('/api/tienda/favoritos.php', { producto_id: productoId });
    return response.data;
  }
};

export { default as bannersService } from './bannersService';

export const reservacionesService = {
  getAll: async (usuarioId = null) => {
    const params = usuarioId ? { usuario_id: usuarioId } : {};
    const response = await api.get('/api/reservaciones.php', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/reservaciones.php?id=${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/reservaciones.php', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/reservaciones.php?id=${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/reservaciones.php?id=${id}`);
    return response.data;
  },

  trackTicket: async (id) => {
    const response = await api.get(`/api/reservaciones.php?action=track&id=${id}`);
    return response.data;
  }
};

export const ajustesService = {
  get: async () => {
    const response = await api.get('/api/ajustes.php');
    return response.data;
  },

  update: async (data) => {
    const response = await api.put('/api/ajustes.php', data);
    return response.data;
  }
};

export const mensajesService = {
  getAll: async () => {
    const response = await api.get('/api/mensajes.php');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/api/mensajes.php', data);
    return response.data;
  },
  update: async (data) => {
    const response = await api.put('/api/mensajes.php', data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/api/mensajes.php?id=${id}`);
    return response.data;
  },
  responder: async (data) => {
    const response = await api.post('/api/mensajes.php', data);
    return response.data;
  }
};
