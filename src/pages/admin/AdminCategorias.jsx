import { useState, useEffect } from 'react';
import { categoriasService } from '../../services';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

const AdminCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [categoriaEdit, setCategoriaEdit] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    imagen: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const data = await categoriasService.getAll();
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevo = () => {
    setCategoriaEdit(null);
    setFormData({ nombre: '', descripcion: '', imagen: '' });
    setMostrarModal(true);
  };

  const handleEditar = (categoria) => {
    setCategoriaEdit(categoria);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      imagen: categoria.imagen || ''
    });
    setMostrarModal(true);
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar categoría?',
      text: 'Esta acción no se puede deshacer y afectará a los productos asociados',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
      try {
        await categoriasService.delete(id);
        Swal.fire('Eliminado', 'La categoría ha sido removida', 'success');
        cargarDatos();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar la categoría', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (categoriaEdit) {
        await categoriasService.update(categoriaEdit.id, formData);
        Swal.fire('¡Éxito!', 'Categoría actualizada correctamente', 'success');
      } else {
        await categoriasService.create(formData);
        Swal.fire('¡Éxito!', 'Nueva categoría creada', 'success');
      }
      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la información', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'rgb(249,115,22)' }}></div></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 pb-12">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#1e293b] tracking-tight uppercase">Categorías</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Arquitectura de catálogo y filtros</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNuevo}
          className="px-8 py-3 bg-[#1e293b] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-orange-600 transition-all flex items-center gap-3"
        >
          <i className="fas fa-layer-group text-[10px]"></i>
          Nueva Categoría
        </motion.button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {categorias.map((categoria, index) => (
            <motion.div
              key={categoria.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-orange-500/5 p-6 hover:shadow-orange-500/10 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEditar(categoria)} className="w-8 h-8 flex items-center justify-center bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                  <i className="fas fa-edit text-[10px]"></i>
                </button>
                <button onClick={() => handleEliminar(categoria.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                  <i className="fas fa-trash-alt text-[10px]"></i>
                </button>
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-orange-50 rounded-[1.5rem] flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-orange-200 transition-all">
                  {categoria.imagen ? (
                    <img src={`http://localhost:8000${categoria.imagen}`} alt={categoria.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <i className="fas fa-shapes text-3xl text-orange-500/50"></i>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1e293b] uppercase tracking-tight">{categoria.nombre}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">ID #{categoria.id}</p>
                </div>
                <p className="text-[11px] text-gray-500 font-medium line-clamp-2 min-h-[32px]">
                  {categoria.descripcion || 'Sin descripción detallada disponible.'}
                </p>
                <div className="pt-2 w-full">
                  <div className="h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500/20 w-1/3 group-hover:w-full transition-all duration-700"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {categorias.length === 0 && (
        <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <i className="fas fa-tags text-3xl text-gray-200"></i>
          </div>
          <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest">Estantería vacía</h5>
          <p className="text-[10px] text-gray-300 font-bold uppercase mt-2">Comience creando su primera categoría</p>
        </div>
      )}

      {/* Modal Categoría */}
      <AnimatePresence>
        {mostrarModal && (
          <div className="fixed inset-0 bg-[#1e293b]/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-10 py-8 bg-gradient-to-r from-orange-500 to-amber-600 flex justify-between items-center text-white">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-widest">{categoriaEdit ? 'Editar' : 'Nueva'} Categoría</h3>
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-tight">Estructura de navegación</p>
                </div>
                <button onClick={() => setMostrarModal(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/20 hover:bg-white/30 transition-all">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nombre de Categoría</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Ej: Smartphones, Laptops..."
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/20 rounded-2xl text-xs font-bold text-[#1e293b] focus:outline-none focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Descripción Breve</label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      placeholder="Describa el propósito de esta categoría..."
                      rows="4"
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/20 rounded-2xl text-xs font-medium text-[#1e293b] focus:outline-none focus:bg-white transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setMostrarModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-[#1e293b] rounded-2xl shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all">
                    {categoriaEdit ? 'Actualizar' : 'Crear Categoría'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategorias;
