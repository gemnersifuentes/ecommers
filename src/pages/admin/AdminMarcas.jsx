import { useState, useEffect } from 'react';
import { marcasService } from '../../services';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

const AdminMarcas = () => {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [marcaEdit, setMarcaEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    cargarMarcas();
  }, []);

  const cargarMarcas = async () => {
    setLoading(true);
    try {
      const data = await marcasService.getAll();
      setMarcas(data);
    } catch (error) {
      console.error('Error al cargar marcas:', error);
      Swal.fire('Error', 'No se pudieron cargar las marcas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevo = () => {
    setMarcaEdit(null);
    setFormData({ nombre: '', descripcion: '' });
    setMostrarModal(true);
  };

  const handleEditar = (marca) => {
    setMarcaEdit(marca);
    setFormData({
      nombre: marca.nombre,
      descripcion: marca.descripcion || ''
    });
    setMostrarModal(true);
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
        await marcasService.delete(id);
        Swal.fire('Eliminado', 'Marca eliminada exitosamente', 'success');
        cargarMarcas();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar la marca', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (marcaEdit) {
        await marcasService.update(marcaEdit.id, formData);
        Swal.fire('Actualizado', 'Marca actualizada exitosamente', 'success');
      } else {
        await marcasService.create(formData);
        Swal.fire('Creado', 'Marca creada exitosamente', 'success');
      }
      setMostrarModal(false);
      cargarMarcas();
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la marca', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const marcasFiltradas = marcas.filter(marca =>
    marca.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Marcas</h2>
          <p className="text-xs text-gray-500 mt-1">Gestiona las marcas de productos</p>
        </div>
        <button 
          onClick={handleNuevo}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
        >
          <i className="fas fa-plus"></i>
          Nueva Marca
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input
            type="text"
            placeholder="Buscar marcas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Marcas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {marcasFiltradas.map((marca, index) => (
            <motion.div
              key={marca.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <i className="fas fa-copyright text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{marca.nombre}</h3>
                    <p className="text-[10px] text-gray-500">ID: {marca.id}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditar(marca)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <i className="fas fa-edit text-xs"></i>
                  </button>
                  <button
                    onClick={() => handleEliminar(marca.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <i className="fas fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
              
              {marca.descripcion && (
                <p className="text-xs text-gray-600 line-clamp-2">{marca.descripcion}</p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {marcasFiltradas.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <i className="fas fa-copyright text-gray-300 text-5xl mb-4"></i>
          <p className="text-gray-500 font-medium text-xs">No se encontraron marcas</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {mostrarModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <i className={`fas fa-${marcaEdit ? 'edit' : 'plus-circle'}`}></i>
                  {marcaEdit ? 'Editar Marca' : 'Nueva Marca'}
                </h3>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    <i className="fas fa-copyright text-purple-600 mr-2"></i>
                    Nombre de la Marca
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ej: Samsung, Kingston, Intel..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    <i className="fas fa-align-left text-purple-600 mr-2"></i>
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Descripción de la marca (opcional)..."
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    {marcaEdit ? 'Actualizar' : 'Crear Marca'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMarcas;
