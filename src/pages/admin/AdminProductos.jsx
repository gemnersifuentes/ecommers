import { useState, useEffect } from 'react';
import { productosService, categoriasService, marcasService } from '../../services';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import GestionVariantes from '../../components/GestionVariantes';


const AdminProductos = () => {
  // Estilos CSS personalizados para el color principal
  const customStyles = `
    .btn-primary {
      background-color: rgb(97,64,220);
    }
    .btn-primary:hover {
      background-color: rgb(107,74,230);
    }
    .text-primary {
      color: rgb(97,64,220);
    }
    .bg-primary-light {
      background-color: rgba(97,64,220,0.1);
    }
    .border-primary {
      border-color: rgb(97,64,220);
    }
    .hover-primary:hover {
      background-color: rgba(97,64,220,0.05);
      border-color: rgb(97,64,220);
      color: rgb(97,64,220);
    }
    .pagination-btn:not(:disabled):hover {
      background-color: rgba(97,64,220,0.05) !important;
      border-color: rgb(97,64,220) !important;
      color: rgb(97,64,220) !important;
    }
    .modal-header-gradient {
      background: linear-gradient(to right, rgb(97,64,220), rgb(107,74,230)) !important;
    }
    .focus-primary:focus {
      outline: none;
      border-color: rgb(97,64,220);
      ring: 2px;
      ring-color: rgba(97,64,220,0.5);
    }
    
    /* Custom scrollbar styles */
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(97,64,220,0.05);
      border-radius: 10px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgb(97,64,220);
      border-radius: 10px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgb(107,74,230);
    }
    
    /* For Firefox */
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgb(97,64,220) rgba(97,64,220,0.05);
    }
  `;

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarViewModal, setMostrarViewModal] = useState(false);
  const [productoEdit, setProductoEdit] = useState(null);
  const [productoView, setProductoView] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenesGaleria, setImagenesGaleria] = useState([]);
  const [eliminandoImagen, setEliminandoImagen] = useState(false);

  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [mostrarGestionVariantes, setMostrarGestionVariantes] = useState(false);
  const [productoParaVariantes, setProductoParaVariantes] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    imagen: '',
    categoria_id: '',
    marca_id: '',
    precio_base: '',
    stock: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar productos y categorías (siempre)
      const productosData = await productosService.getAll();
      const categoriasData = await categoriasService.getAll();

      // La API ahora devuelve {data: [...], total: ...}
      setProductos(Array.isArray(productosData) ? productosData : (productosData.data || []));
      setCategorias(categoriasData);

      // Intentar cargar marcas (opcional, no falla si no existe la tabla)
      try {
        const marcasData = await marcasService.getAll();
        setMarcas(marcasData);
      } catch (error) {
        console.warn('Marcas no disponibles por API, intentando cargar directamente:', error);
        // Cargar marcas de ejemplo si el API falla

      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevo = () => {
    setProductoEdit(null);
    setImagenPreview(null);
    setImagenFile(null);
    setImagenesGaleria([]);

    setFormData({
      // Campos básicos
      nombre: '',
      descripcion: '',
      imagen: '',
      categoria_id: '',
      marca_id: '',
      precio_base: '',
      stock: '',

      // SEO & Marketing
      meta_titulo: '',
      meta_descripcion: '',
      palabras_clave: '',
      slug: '',
      destacado: false,
      nuevo: false,
      etiquetas: '',

      // Logística
      sku: '',
      peso: '',
      largo: '',
      ancho: '',
      alto: '',
      envio_gratis: false,
      stock_minimo: 5,

      // Info Producto
      condicion: 'nuevo',
      garantia_meses: 12,
      marca_fabricante: '',
      modelo: '',
      video_url: '',

      // Otros
      politica_devolucion_dias: 30
    });
    console.log('Form reset to:', {
      nombre: '',
      descripcion: '',
      imagen: '',
      categoria_id: '',
      marca_id: '',
      precio_base: '',
      stock: ''
    });
    setMostrarModal(true);
  };

  const handleEditar = async (producto) => {
    setProductoEdit(producto);
    setImagenPreview(producto.imagen || null);
    setImagenFile(null);

    // Cargar galería de imágenes si existe
    if (producto.galeria_imagenes) {
      try {
        const galeria = JSON.parse(producto.galeria_imagenes);
        setImagenesGaleria(galeria);
      } catch (e) {
        setImagenesGaleria(producto.imagen ? [producto.imagen] : []);
      }
    } else {
      setImagenesGaleria(producto.imagen ? [producto.imagen] : []);
    }



    setFormData({
      // Campos básicos
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      imagen: producto.imagen || '',
      categoria_id: producto.categoria_id || '',
      marca_id: producto.marca_id || '',
      precio_base: producto.precio_base,
      stock: producto.stock,

      // SEO & Marketing
      meta_titulo: producto.meta_titulo || '',
      meta_descripcion: producto.meta_descripcion || '',
      palabras_clave: producto.palabras_clave || '',
      slug: producto.slug || '',
      destacado: producto.destacado || false,
      nuevo: producto.nuevo || false,
      etiquetas: producto.etiquetas || '',

      // Logística
      sku: producto.sku || '',
      peso: producto.peso || '',
      largo: producto.largo || '',
      ancho: producto.ancho || '',
      alto: producto.alto || '',
      envio_gratis: producto.envio_gratis || false,
      stock_minimo: producto.stock_minimo || 5,

      // Info Producto
      condicion: producto.condicion || 'nuevo',
      garantia_meses: producto.garantia_meses || 12,
      marca_fabricante: producto.marca_fabricante || '',
      modelo: producto.modelo || '',
      video_url: producto.video_url || '',

      // Otros
      politica_devolucion_dias: producto.politica_devolucion_dias || 30
    });
    console.log('Form loaded with:', {
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      imagen: producto.imagen || '',
      categoria_id: producto.categoria_id || '',
      marca_id: producto.marca_id || '',
      precio_base: producto.precio_base,
      stock: producto.stock
    });
    setMostrarModal(true);
  };

  const handleVer = async (producto) => {
    setProductoView(producto);



    setMostrarViewModal(true);
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
      try {
        await productosService.delete(id);
        Swal.fire('Eliminado', 'Producto eliminado exitosamente', 'success');
        cargarDatos();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
      }
    }
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Error', 'La imagen es demasiado grande. Máximo 5MB', 'error');
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        Swal.fire('Error', 'Solo se permiten archivos de imagen', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('imagen', file);

      // Subir imagen al servidor
      fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          if (data.success && data.url) {
            setImagenFile(file);
            setImagenPreview(data.url);
            setFormData({ ...formData, imagen: data.url });
          } else {
            Swal.fire('Error', data.message || 'Error al subir imagen', 'error');
          }
        })
        .catch(error => {
          console.error('Error al subir imagen:', error);
          Swal.fire('Error', 'Error al subir la imagen al servidor', 'error');
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let dataToSend = { ...formData };

      // Debug log
      console.log('Datos a enviar:', dataToSend);

      // Agregar galería de imágenes si hay
      if (imagenesGaleria.length > 0) {
        dataToSend.galeria_imagenes = JSON.stringify(imagenesGaleria);
        dataToSend.imagen = imagenesGaleria[0]; // La primera imagen es la principal
      } else {
        // Si no hay imágenes, limpiar los campos
        dataToSend.galeria_imagenes = JSON.stringify([]);
        dataToSend.imagen = '';
      }

      let productoId;
      if (productoEdit) {
        await productosService.update(productoEdit.id, dataToSend);
        productoId = productoEdit.id;
        Swal.fire('Actualizado', 'Producto actualizado exitosamente', 'success');
      } else {
        const response = await productosService.create(dataToSend);
        productoId = response.id;
        Swal.fire('Creado', 'Producto creado exitosamente', 'success');
      }



      setMostrarModal(false);
      setImagenPreview(null);
      setImagenFile(null);
      setImagenesGaleria([]);

      cargarDatos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      Swal.fire('Error', error.response?.data?.message || error.message || 'Error al guardar', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convertir marca_id a número si es el campo de marca
    const finalValue = name === 'marca_id' ? (value ? parseInt(value) : '') : value;

    setFormData({
      ...formData,
      [name]: finalValue
    });
  };

  // Funciones para múltiples imágenes
  const handleImagenesGaleriaChange = async (e) => {
    const files = Array.from(e.target.files);
    console.log('Archivos seleccionados:', files.length);

    if (files.length === 0) return;

    try {
      const nuevasImagenesUrls = [];

      // Subir cada imagen al servidor
      for (const file of files) {
        // Validar tamaño (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
          Swal.fire('Error', 'La imagen es demasiado grande. Máximo 5MB', 'error');
          continue;
        }

        // Validar tipo
        if (!file.type.startsWith('image/')) {
          Swal.fire('Error', 'Solo se permiten archivos de imagen', 'error');
          continue;
        }

        const formData = new FormData();
        formData.append('imagen', file);

        try {
          const response = await fetch('http://localhost:8000/upload', {
            method: 'POST',
            body: formData
          });

          const data = await response.json();

          if (data.success && data.url) {
            nuevasImagenesUrls.push(data.url);
            console.log('Imagen subida:', data.url);
          } else {
            console.error('Error al subir imagen:', data.message);
            Swal.fire('Error', data.message || 'Error al subir imagen', 'error');
          }
        } catch (error) {
          console.error('Error al subir archivo:', error);
          Swal.fire('Error', 'Error al subir la imagen al servidor', 'error');
        }
      }

      if (nuevasImagenesUrls.length > 0) {
        // Agregar las nuevas URLs a la galería existente
        setImagenesGaleria(prev => [...prev, ...nuevasImagenesUrls]);
        console.log('Total imágenes en galería:', imagenesGaleria.length + nuevasImagenesUrls.length);
        Swal.fire('Éxito', `${nuevasImagenesUrls.length} imagen(es) subida(s) correctamente`, 'success');
      }
    } catch (error) {
      console.error('Error al procesar imágenes:', error);
      Swal.fire('Error', 'Error al procesar las imágenes', 'error');
    }
  };

  const eliminarImagenGaleria = (index) => {
    setImagenesGaleria(prev => prev.filter((_, i) => i !== index));
  };

  // Funciones para variantes


  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.categoria_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const productosActuales = productosFiltrados.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'rgb(97,64,220)' }}></div>
      </div>
    );
  }

  return (
    <>
      <style>{customStyles}</style>
      <div className="max-w-7xl mx-auto space-y-6 px-4">
        {/* Título */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
          <p className="text-gray-600 mt-1 text-sm">Gestiona tu inventario de productos</p>
        </div>

        {/* Search Bar y Botón */}
        <div className="flex items-center gap-4">
          <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-100 px-3 py-2">
            <div className="relative">
              <i className="fas fa-search absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-6 text-sm border-none focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          <motion.button
            onClick={handleNuevo}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ml-auto inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
            style={{ backgroundColor: 'rgb(97,64,220)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(107,74,230)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(97,64,220)'}
          >
            <i className="fas fa-plus"></i>
            Nuevo Producto
          </motion.button>
        </div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Table Header */}
          <div className="px-8 py-6" style={{ background: 'linear-gradient(to bottom right, rgb(97,64,220), rgb(107,74,230), rgb(117,84,240))' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <i className="fas fa-box-open text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Productos</h3>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {productosFiltrados.length} productos encontrados
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl">
                  <i className="fas fa-layer-group text-white text-sm"></i>
                  <span className="text-sm text-white font-semibold">Mostrar:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white/90 backdrop-blur-sm text-sm font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer hover:bg-white transition-all"
                    style={{ color: 'rgb(97,64,220)' }}
                  >
                    <option value={4}>4</option>
                    <option value={8}>8</option>
                    <option value={12}>12</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
                  <th className="px-8 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(97,64,220)' }}></div>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Producto</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Categoría</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Marca</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Precio</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Stock</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Variantes</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {productosActuales.map((producto, index) => (
                    <motion.tr
                      key={producto.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="transition-all duration-200 group"
                      style={{ '--hover-bg': 'rgba(97,64,220,0.05)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(97,64,220,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {producto.imagen && !producto.imagen.startsWith('data:image') ? (
                              <img
                                src={producto.imagen}
                                alt={producto.nombre}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <i className="fas fa-box text-gray-400 text-xs"></i>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">{producto.nombre}</p>
                            <p className="text-[10px] text-gray-500">ID: {producto.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: 'rgba(97,64,220,0.1)', color: 'rgb(97,64,220)' }}>
                          {producto.categoria_nombre || 'Sin categoría'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                          {producto.marca_nombre || 'Sin marca'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="text-xs text-center font-bold text-gray-900">${parseFloat(producto.precio_base).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${producto.stock > 10 ? 'bg-green-500' :
                            producto.stock > 0 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}></div>
                          <span className="text-xs font-semibold text-gray-900">{producto.stock}</span>
                          <span className="text-[10px] text-gray-500">unid.</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700">
                          {producto.variaciones?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleVer(producto)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: 'rgb(97,64,220)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(97,64,220,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Ver"
                          >
                            <i className="fas fa-eye text-xs"></i>
                          </button>
                          <button
                            onClick={() => handleEditar(producto)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: 'rgb(97,64,220)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(97,64,220,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Editar"
                          >
                            <i className="fas fa-edit text-xs"></i>
                          </button>
                          <button
                            onClick={() => {
                              setProductoParaVariantes(producto);
                              setMostrarGestionVariantes(true);
                            }}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: 'rgb(147,51,234)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(147,51,234,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Gestionar Variantes"
                          >
                            <i className="fas fa-boxes text-xs"></i>
                          </button>
                          <button
                            onClick={() => handleEliminar(producto.id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <i className="fas fa-trash text-xs"></i>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {productosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-box-open text-gray-300 text-5xl mb-4"></i>
              <p className="text-gray-500 font-medium text-xs">No se encontraron productos</p>
            </div>
          )}

          {/* Paginación Mejorada */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                {/* Info de Página - Izquierda */}
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-600 font-medium">
                    Mostrando <span className="font-bold text-gray-900">{startIndex + 1}</span> - <span className="font-bold text-gray-900">{Math.min(endIndex, productosFiltrados.length)}</span> de <span className="font-bold text-gray-900">{productosFiltrados.length}</span> productos
                  </p>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <p className="text-[10px] text-gray-500 font-medium">
                    Página <span className="font-bold" style={{ color: 'rgb(97,64,220)' }}>{currentPage}</span> de <span className="font-bold text-gray-700">{totalPages}</span>
                  </p>
                </div>

                {/* Controles de Paginación - Derecha */}
                <div className="flex items-center gap-2">
                  {/* Botón Primera Página */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.backgroundColor = 'rgba(97,64,220,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(97,64,220,0.3)';
                        e.currentTarget.style.color = 'rgb(97,64,220)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = 'rgb(209,213,219)';
                        e.currentTarget.style.color = 'rgb(55,65,81)';
                      }
                    }}
                    title="Primera página"
                  >
                    <i className="fas fa-angle-double-left text-xs"></i>
                  </button>

                  {/* Botón Anterior */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.backgroundColor = 'rgba(97,64,220,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(97,64,220,0.3)';
                        e.currentTarget.style.color = 'rgb(97,64,220)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = 'rgb(209,213,219)';
                        e.currentTarget.style.color = 'rgb(55,65,81)';
                      }
                    }}
                    title="Página anterior"
                  >
                    <i className="fas fa-chevron-left text-xs"></i>
                  </button>

                  {/* Números de Página */}
                  <div className="flex items-center gap-1 px-2">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`min-w-[36px] h-9 px-3 text-xs font-bold rounded-lg transition-all shadow-sm ${currentPage === pageNumber
                              ? 'text-white scale-105'
                              : 'bg-white text-gray-700 border border-gray-300'
                              }`}
                            style={currentPage === pageNumber ? {
                              background: 'linear-gradient(to right, rgb(97,64,220), rgb(107,74,230))',
                              boxShadow: '0 4px 6px rgba(97,64,220,0.2)',
                              color: 'white',
                              border: 'none'
                            } : {
                              backgroundColor: 'white',
                              borderColor: 'rgb(209,213,219)',
                              color: 'rgb(55,65,81)'
                            }}
                            onMouseEnter={(e) => {
                              if (currentPage !== pageNumber) {
                                e.currentTarget.style.backgroundColor = 'rgba(97,64,220,0.05)';
                                e.currentTarget.style.borderColor = 'rgb(97,64,220)';
                                e.currentTarget.style.color = 'rgb(97,64,220)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (currentPage !== pageNumber) {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = 'rgb(209,213,219)';
                                e.currentTarget.style.color = 'rgb(55,65,81)';
                              }
                            }}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return (
                          <span key={pageNumber} className="text-gray-400 text-xs px-1 font-bold">
                            •••
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {/* Botón Siguiente */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.backgroundColor = 'rgba(97,64,220,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(97,64,220,0.3)';
                        e.currentTarget.style.color = 'rgb(97,64,220)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = 'rgb(209,213,219)';
                        e.currentTarget.style.color = 'rgb(55,65,81)';
                      }
                    }}
                    title="Página siguiente"
                  >
                    <i className="fas fa-chevron-right text-xs"></i>
                  </button>

                  {/* Botón Última Página */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.backgroundColor = 'rgba(97,64,220,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(97,64,220,0.3)';
                        e.currentTarget.style.color = 'rgb(97,64,220)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = 'rgb(209,213,219)';
                        e.currentTarget.style.color = 'rgb(55,65,81)';
                      }
                    }}
                    title="Última página"
                  >
                    <i className="fas fa-angle-double-right text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* View Modal */}
        <AnimatePresence>
          {mostrarViewModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.3, type: "spring", damping: 25 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              >
                {/* Header del Modal */}
                <div className="sticky top-0 px-6 py-4 flex items-center justify-between z-10 border-b border-gray-200 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <i className="fas fa-eye text-indigo-600 text-lg"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Detalles del Producto</h3>
                      <p className="text-sm text-gray-500">Información completa del producto</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMostrarViewModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar">
                  {productoView && (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Imagen principal */}
                        <div className="lg:col-span-1">
                          <div className="bg-gray-50 rounded-2xl overflow-hidden aspect-square flex items-center justify-center border border-gray-200">
                            {productoView.imagen && !productoView.imagen.startsWith('data:image') ? (
                              <img
                                src={productoView.imagen}
                                alt={productoView.nombre}
                                className="w-full h-full object-contain p-6"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="text-center">
                                <i className="fas fa-box-open text-gray-300 text-4xl mb-2"></i>
                                <p className="text-gray-400 text-sm">Sin imagen</p>
                              </div>
                            )}
                          </div>

                          {/* Información básica en tarjeta */}
                          <div className="mt-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                              <h4 className="font-bold text-gray-800 text-sm">Información del Producto</h4>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">ID:</span>
                                <span className="text-xs font-medium text-gray-900">#{productoView.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">Categoría:</span>
                                <span className="text-xs font-medium text-gray-900">
                                  {productoView.categoria_nombre || 'Sin categoría'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">Marca:</span>
                                <span className="text-xs font-medium text-gray-900">
                                  {productoView.marca_nombre || 'Sin marca'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">Stock:</span>
                                <span className="text-xs font-medium text-gray-900">
                                  {productoView.stock} unidades
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Detalles del producto */}
                        <div className="lg:col-span-2 space-y-5">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">{productoView.nombre}</h2>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {productoView.categoria_nombre || 'Sin categoría'}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {productoView.marca_nombre || 'Sin marca'}
                              </span>
                            </div>
                          </div>

                          {/* Precio */}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Precio Base</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                  ${parseFloat(productoView.precio_base).toFixed(2)}
                                </p>
                              </div>
                              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                                <i className="fas fa-tag text-white text-lg"></i>
                              </div>
                            </div>
                          </div>

                          {/* Detalles Adicionales */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* SEO & Marketing */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                                <i className="fas fa-search text-purple-500"></i> SEO & Marketing
                              </h4>
                              <div className="space-y-2 text-sm">
                                {productoView.meta_titulo && (
                                  <div><span className="text-gray-500 text-xs block">Meta Título</span><span className="text-gray-900">{productoView.meta_titulo}</span></div>
                                )}
                                {productoView.slug && (
                                  <div><span className="text-gray-500 text-xs block">Slug</span><span className="text-gray-900 font-mono text-xs">{productoView.slug}</span></div>
                                )}
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {Number(productoView.destacado) === 1 && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold flex items-center gap-1">
                                      <i className="fas fa-star"></i> Destacado
                                    </span>
                                  )}
                                  {Number(productoView.nuevo) === 1 && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold flex items-center gap-1">
                                      <i className="fas fa-certificate"></i> Nuevo
                                    </span>
                                  )}
                                  {Number(productoView.envio_gratis) === 1 && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold flex items-center gap-1">
                                      <i className="fas fa-truck"></i> Envío Gratis
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Logística */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                                <i className="fas fa-box text-blue-500"></i> Logística
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between border-b border-gray-100 pb-1">
                                  <span className="text-gray-500">SKU:</span>
                                  <span className="font-medium text-gray-900">{productoView.sku || '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-1">
                                  <span className="text-gray-500">Peso:</span>
                                  <span className="font-medium text-gray-900">{productoView.peso ? `${productoView.peso} kg` : '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-1">
                                  <span className="text-gray-500">Dimensiones:</span>
                                  <span className="font-medium text-gray-900">
                                    {productoView.largo && productoView.ancho && productoView.alto
                                      ? `${productoView.largo}x${productoView.ancho}x${productoView.alto} cm`
                                      : '-'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Stock Mínimo:</span>
                                  <span className="font-medium text-gray-900">{productoView.stock_minimo || 5}</span>
                                </div>
                              </div>
                            </div>

                            {/* Info Adicional */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 md:col-span-2">
                              <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                                <i className="fas fa-info-circle text-indigo-500"></i> Información Adicional
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500 text-xs block">Condición</span>
                                  <span className="font-medium text-gray-900 capitalize">{productoView.condicion || 'Nuevo'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 text-xs block">Garantía</span>
                                  <span className="font-medium text-gray-900">{productoView.garantia_meses ? `${productoView.garantia_meses} meses` : '-'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 text-xs block">Modelo</span>
                                  <span className="font-medium text-gray-900">{productoView.modelo || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 text-xs block">Fabricante</span>
                                  <span className="font-medium text-gray-900">{productoView.marca_fabricante || '-'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Descripción */}
                          {productoView.descripcion && (
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <i className="fas fa-align-left text-indigo-500"></i>
                                Descripción
                              </h4>
                              <p className="text-gray-700 bg-gray-50 p-4 rounded-xl text-sm leading-relaxed">
                                {productoView.descripcion}
                              </p>
                            </div>
                          )}

                          {/* Galería de imágenes */}
                          {productoView.galeria_imagenes && (
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <i className="fas fa-images text-indigo-500"></i>
                                Galería de Imágenes
                              </h4>
                              <div className="grid grid-cols-4 gap-3">
                                {(() => {
                                  try {
                                    const galeria = JSON.parse(productoView.galeria_imagenes);
                                    return galeria.map((img, index) => (
                                      <div key={index} className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                        {img && !img.startsWith('data:image') ? (
                                          <img
                                            src={img}
                                            alt={`Imagen ${index + 1}`}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                            }}
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <i className="fas fa-ban text-gray-300"></i>
                                          </div>
                                        )}
                                      </div>
                                    ));
                                  } catch (e) {
                                    return (
                                      <div className="col-span-4 text-center text-gray-500 text-sm py-4">
                                        <i className="fas fa-exclamation-circle mr-2"></i>
                                        No se pudieron cargar las imágenes de la galería
                                      </div>
                                    );
                                  }
                                })()}
                              </div>
                            </div>
                          )}


                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal */}
        <AnimatePresence>
          {mostrarModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.3, type: "spring", damping: 25 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
              >
                {/* Header del Modal */}
                <div className="sticky top-0 modal-header-gradient px-8 py-5 flex items-center justify-between z-10">
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <i className={`fas fa-${productoEdit ? 'edit' : 'plus-circle'}`}></i>
                      {productoEdit ? 'Editar Producto' : 'Nuevo Producto'}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.9)' }}>
                      {productoEdit ? 'Modifica la información del producto' : 'Completa los datos del nuevo producto'}
                    </p>
                  </div>
                  <button
                    onClick={() => setMostrarModal(false)}
                    className="p-2.5 hover:bg-white/20 rounded-xl transition-colors text-white"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {productoEdit ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      {productoEdit ? 'Modifica la información del producto' : 'Completa los datos del nuevo producto'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Imagen principal y detalles básicos */}
                    <div className="lg:col-span-1 space-y-4">
                      {/* Imagen principal */}
                      <div className="bg-gray-50 rounded-2xl overflow-hidden aspect-square flex items-center justify-center border border-gray-200">
                        {imagenPreview && !imagenPreview.startsWith('data:image') ? (
                          <img
                            src={imagenPreview}
                            alt="Vista previa"
                            className="w-full h-full object-contain p-6"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="text-center">
                            <i className="fas fa-box-open text-gray-300 text-4xl mb-2"></i>
                            <p className="text-gray-400 text-sm">Sin imagen</p>
                          </div>
                        )}
                      </div>

                      {/* Información básica en tarjeta */}
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                          <h4 className="font-bold text-gray-800 text-sm">Información Básica</h4>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-600">Categoría:</span>
                            <span className="text-xs font-medium text-gray-900">
                              {categorias.find(cat => cat.id == formData.categoria_id)?.nombre || 'Sin categoría'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-600">Marca:</span>
                            <span className="text-xs font-medium text-gray-900">
                              {marcas.find(marca => marca.id == formData.marca_id)?.nombre || 'Sin marca'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-600">Stock:</span>
                            <span className="text-xs font-medium text-gray-900">
                              {formData.stock || 0} unidades
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Formulario de detalles */}
                    <div className="lg:col-span-2 space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <i className="fas fa-box mr-2 text-indigo-500"></i>
                          Nombre del Producto
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          placeholder="Ej: Laptop HP Pavilion"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <i className="fas fa-align-left text-indigo-500 mr-2"></i>
                          Descripción
                        </label>
                        <textarea
                          name="descripcion"
                          value={formData.descripcion}
                          onChange={handleChange}
                          rows="4"
                          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
                          placeholder="Describe las características del producto..."
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <i className="fas fa-tag text-indigo-500 mr-2"></i>
                            Categoría
                          </label>
                          <div className="relative">
                            <select
                              name="categoria_id"
                              value={formData.categoria_id}
                              onChange={handleChange}
                              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none bg-white"
                            >
                              <option value="">Seleccionar categoría...</option>
                              {categorias.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <i className="fas fa-chevron-down text-xs"></i>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <i className="fas fa-copyright text-indigo-500 mr-2"></i>
                            Marca
                          </label>
                          <div className="relative">
                            <select
                              name="marca_id"
                              value={formData.marca_id}
                              onChange={handleChange}
                              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none bg-white"
                            >
                              <option value="">Seleccionar marca...</option>
                              {marcas.map(marca => (
                                <option key={marca.id} value={marca.id}>{marca.nombre}</option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <i className="fas fa-chevron-down text-xs"></i>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <i className="fas fa-dollar-sign text-green-500 mr-2"></i>
                            Precio Base
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">$</span>
                            <input
                              type="number"
                              name="precio_base"
                              value={formData.precio_base}
                              onChange={handleChange}
                              step="0.01"
                              required
                              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <i className="fas fa-boxes text-orange-500 mr-2"></i>
                            Stock
                          </label>
                          <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 1: SEO & Marketing */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                      <i className="fas fa-search text-purple-500"></i>
                      SEO & Marketing
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Meta Título */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Meta Título (SEO)
                        </label>
                        <input
                          type="text"
                          name="meta_titulo"
                          value={formData.meta_titulo}
                          onChange={handleChange}
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                          placeholder="Título optimizado para SEO"
                          maxLength="255"
                        />
                      </div>

                      {/* Slug */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Slug (URL amigable)
                        </label>
                        <input
                          type="text"
                          name="slug"
                          value={formData.slug}
                          onChange={handleChange}
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                          placeholder="producto-ejemplo"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-generado si se deja vacío</p>
                      </div>

                      {/* Meta Descripción */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Meta Descripción (SEO)
                        </label>
                        <textarea
                          name="meta_descripcion"
                          value={formData.meta_descripcion}
                          onChange={handleChange}
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all"
                          rows="2"
                          placeholder="Descripción para motores de búsqueda (160 caracteres max)"
                          maxLength="160"
                        />
                      </div>

                      {/* Palabras Clave */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Palabras Clave
                        </label>
                        <input
                          type="text"
                          name="palabras_clave"
                          value={formData.palabras_clave}
                          onChange={handleChange}
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                          placeholder="laptop, gaming, asus, rgb"
                        />
                      </div>

                      {/* Etiquetas */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Etiquetas
                        </label>
                        <input
                          type="text"
                          name="etiquetas"
                          value={formData.etiquetas}
                          onChange={handleChange}
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                          placeholder="oferta, premium, exclusivo"
                        />
                      </div>

                      {/* Destacado y Nuevo */}
                      <div className="flex gap-6 mt-2">
                        <label className="flex items-center gap-3 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              name="destacado"
                              checked={formData.destacado}
                              onChange={(e) => handleChange({ target: { name: 'destacado', value: e.target.checked } })}
                              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                            />
                          </div>
                          <span className="font-medium text-gray-700 text-sm">Producto Destacado</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              name="nuevo"
                              checked={formData.nuevo}
                              onChange={(e) => handleChange({ target: { name: 'nuevo', value: e.target.checked } })}
                              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                            />
                          </div>
                          <span className="font-medium text-gray-700 text-sm">Producto Nuevo</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 2: Logística & Envío */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                      <i className="fas fa-truck text-blue-500"></i>
                      Logística & Envío
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* SKU */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          SKU
                        </label>
                        <input
                          type="text"
                          name="sku"
                          value={formData.sku}
                          onChange={handleChange}
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          placeholder="PROD-000001"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-generado si vacío</p>
                      </div>

                      {/* Peso */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Peso (kg)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="peso"
                          value={formData.peso}
                          onChange={handleChange}
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          placeholder="2.5"
                        />
                      </div>

                      {/* Stock Mínimo */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Stock Mínimo
                        </label>
                        <input
                          type="number"
                          name="stock_minimo"
                          value={formData.stock_minimo}
                          onChange={handleChange}
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          placeholder="5"
                        />
                      </div>

                      {/* Dimensiones */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Largo (cm)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="largo"
                          value={formData.largo}
                          onChange={handleChange}
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          placeholder="35.5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ancho (cm)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="ancho"
                          value={formData.ancho}
                          onChange={handleChange}
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          placeholder="24.0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Alto (cm)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="alto"
                          value={formData.alto}
                          onChange={handleChange}
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          placeholder="2.0"
                        />
                      </div>

                      {/* Envío Gratis */}
                      <div className="md:col-span-3 mt-2">
                        <label className="flex items-center gap-3 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors w-fit">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              name="envio_gratis"
                              checked={formData.envio_gratis}
                              onChange={(e) => handleChange({ target: { name: 'envio_gratis', value: e.target.checked } })}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                            />
                          </div>
                          <span className="font-medium text-gray-700 text-sm">Envío Gratis</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 3: Información del Producto */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                      <i className="fas fa-info-circle text-indigo-500"></i>
                      Información Adicional
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Condición */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Condición
                        </label>
                        <div className="relative">
                          <select
                            name="condicion"
                            value={formData.condicion}
                            onChange={handleChange}
                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none bg-white"
                          >
                            <option value="nuevo">Nuevo</option>
                            <option value="usado">Usado</option>
                            <option value="reacondicionado">Reacondicionado</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <i className="fas fa-chevron-down text-xs"></i>
                          </div>
                        </div>
                      </div>

                      {/* Garantía */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Garantía (meses)
                        </label>
                        <input
                          type="number"
                          name="garantia_meses"
                          value={formData.garantia_meses}
                          onChange={handleChange}
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          placeholder="12"
                        />
                      </div>

                      {/* Marca Fabricante */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Marca Fabricante
                        </label>
                        <input
                          type="text"
                          name="marca_fabricante"
                          value={formData.marca_fabricante}
                          onChange={handleChange}
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          placeholder="Intel, AMD, etc."
                        />
                      </div>

                      {/* Modelo */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Modelo
                        </label>
                        <input
                          type="text"
                          name="modelo"
                          value={formData.modelo}
                          onChange={handleChange}
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          placeholder="ROG Strix G15"
                        />
                      </div>

                      {/* Video URL */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Video URL (YouTube)
                        </label>
                        <input
                          type="url"
                          name="video_url"
                          value={formData.video_url}
                          onChange={handleChange}
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>

                      {/* Política de Devolución */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Política de Devolución (días)
                        </label>
                        <input
                          type="number"
                          name="politica_devolucion_dias"
                          value={formData.politica_devolucion_dias}
                          onChange={handleChange}
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          placeholder="30"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Galería de imágenes */}
                  <div key={`gallery-section-${imagenesGaleria.length}`}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="fas fa-images text-indigo-500 mr-2"></i>
                      Galería de Imágenes {imagenesGaleria.length > 0 && `(${imagenesGaleria.length})`}
                    </label>
                    <div className="space-y-3">
                      {/* Grid de previews */}
                      {imagenesGaleria.length > 0 ? (
                        <div className="grid grid-cols-4 gap-3">
                          {imagenesGaleria.map((preview, index) => (
                            <div
                              key={`img-${index}-${preview ? preview.substring(preview.length - 10) : 'new'}`}
                              className="relative group"
                            >
                              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                {preview && !preview.startsWith('data:image') ? (
                                  <img
                                    src={preview}
                                    alt={`Imagen ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/150?text=Error';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <i className="fas fa-ban text-gray-300"></i>
                                  </div>
                                )}
                              </div>
                              {index === 0 && (
                                <div className="absolute top-1 left-1 px-2 py-1 bg-indigo-500 text-white text-xs font-bold rounded">
                                  Principal
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => eliminarImagenGaleria(index)}
                                className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <i className="fas fa-times text-xs"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                          <i className="fas fa-images text-gray-300 text-3xl mb-2"></i>
                          <p className="text-sm text-gray-500">No hay imágenes adicionales</p>
                        </div>
                      )}

                      {/* Botón grande para seleccionar archivos */}
                      <input
                        ref={(input) => {
                          if (input) {
                            input.onclick = () => {
                              console.log('Click en input de archivos');
                              input.value = null; // Reset para poder seleccionar los mismos archivos
                            };
                          }
                        }}
                        id="file-input-galeria"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagenesGaleriaChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="file-input-galeria"
                        className="block w-full cursor-pointer"
                      >
                        <div className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-indigo-300 bg-indigo-50 rounded-xl hover:border-indigo-500 hover:bg-indigo-100 transition-colors">
                          <i className="fas fa-cloud-upload-alt text-indigo-500 text-3xl"></i>
                          <div>
                            <p className="text-base font-bold text-indigo-700">
                              {imagenesGaleria.length > 0
                                ? 'Agregar más imágenes'
                                : 'Seleccionar imágenes (múltiples)'}
                            </p>
                            <p className="text-xs text-indigo-600 mt-1">
                              Usa Ctrl+Clic para seleccionar varias imágenes a la vez
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>



                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setMostrarModal(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg"
                    >
                      {productoEdit ? 'Actualizar Producto' : 'Crear Producto'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Gestión de Variantes */}
        {mostrarGestionVariantes && productoParaVariantes && (
          <GestionVariantes
            productoId={productoParaVariantes.id}
            onClose={() => {
              setMostrarGestionVariantes(false);
              setProductoParaVariantes(null);
            }}
            onSave={() => {
              cargarDatos(); // Recargar productos después de gestionar variantes
            }}
          />
        )}
      </div >
    </>
  );
};

export default AdminProductos;
