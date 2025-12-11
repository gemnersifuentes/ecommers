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
    const response = await api.get('/servicios');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/servicios/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/servicios', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/servicios/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/servicios/${id}`);
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
    const response = await api.get('/pedidos', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/pedidos/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/pedidos', data);
    return response.data;
  },

  updateEstado: async (id, estado) => {
    const response = await api.put(`/pedidos/${id}`, { estado });
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.delete(`/pedidos/${id}`);
    return response.data;
  }
};

export const usuariosService = {
  getAll: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/usuarios', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  }
};

export const reportesService = {
  getDashboard: async () => {
    const response = await api.get('/reportes/dashboard');
    return response.data;
  },

  getVentas: async (fechaInicio, fechaFin) => {
    const response = await api.get('/reportes/ventas', {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
    });
    return response.data;
  }
};

export const marcasService = {
  getAll: async () => {
    const response = await api.get('/marcas');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/marcas/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/marcas', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/marcas/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/marcas/${id}`);
    return response.data;
  }
};

export const descuentosService = {
  getAll: async (params = {}) => {
    const response = await api.get('/descuentos', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/descuentos/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/descuentos', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/descuentos/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/descuentos/${id}`);
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
    const response = await api.post('/api/tienda/pedidos.php', data);
    return response.data;
  },

  getPedidos: async (usuarioId) => {
    const response = await api.get(`/api/tienda/pedidos.php?usuario_id=${usuarioId}`);
    return response.data;
  },

  getPedidoById: async (pedidoId) => {
    const response = await api.get(`/api/tienda/pedidos.php?id=${pedidoId}`);
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
