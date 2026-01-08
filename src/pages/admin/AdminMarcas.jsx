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
      title: '¿Eliminar marca?',
      text: 'Esta acción desactivará la marca en toda la tienda',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
      try {
        await marcasService.delete(id);
        Swal.fire('Eliminado', 'La marca ha sido removida', 'success');
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
        Swal.fire('¡Éxito!', 'Marca actualizada', 'success');
      } else {
        await marcasService.create(formData);
        Swal.fire('¡Éxito!', 'Nueva marca registrada', 'success');
      }
      setMostrarModal(false);
      cargarMarcas();
    } catch (error) {
      Swal.fire('Error', 'No se pudo procesar la solicitud', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const marcasFiltradas = marcas.filter(marca =>
    marca.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'rgb(147,51,234)' }}></div></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 pb-12">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#1e293b] dark:text-white tracking-tight uppercase">Marcas</h2>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Identidad de fabricantes y socios</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input
              type="text"
              placeholder="Buscar socios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-[#111c44] border-2 border-transparent focus:border-purple-500/20 rounded-2xl text-xs font-bold text-[#1e293b] dark:text-white shadow-sm focus:outline-none transition-all w-64"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNuevo}
            className="px-8 py-3 bg-[#1e293b] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-purple-600 transition-all flex items-center gap-3"
          >
            <i className="fas fa-certificate text-[10px]"></i>
            Registrar Marca
          </motion.button>
        </div>
      </div>

      {/* Marcas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {marcasFiltradas.map((marca, index) => (
            <motion.div
              key={marca.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white dark:bg-[#111c44] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl shadow-purple-500/5 p-8 flex flex-col items-center text-center relative overflow-hidden hover:border-purple-200 dark:hover:border-purple-500/30 transition-all"
            >
              <div className="absolute top-0 right-0 p-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEditar(marca)} className="w-8 h-8 flex items-center justify-center bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-600 hover:text-white transition-all">
                  <i className="fas fa-edit text-[10px]"></i>
                </button>
                <button onClick={() => handleEliminar(marca.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                  <i className="fas fa-trash-alt text-[10px]"></i>
                </button>
              </div>

              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-purple-500/30 mb-5 group-hover:rotate-6 transition-transform">
                <span className="text-xl font-black">{marca.nombre.charAt(0).toUpperCase()}</span>
              </div>

              <h3 className="text-sm font-black text-[#1e293b] dark:text-white uppercase tracking-tight mb-1">{marca.nombre}</h3>
              <p className="text-[9px] text-[#1e293b]/30 dark:text-white/20 font-black uppercase tracking-widest mb-4">Socio Estratégico #{marca.id}</p>

              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                {marca.descripcion || 'No se ha definido una descripción técnica para este fabricante.'}
              </p>

              <div className="mt-6 pt-4 border-t border-gray-50 dark:border-white/5 w-full">
                <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Ver Productos</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal Marca */}
      <AnimatePresence>
        {mostrarModal && (
          <div className="fixed inset-0 bg-[#1e293b]/60 dark:bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#111c44] rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/5"
            >
              <div className="px-10 py-8 bg-gradient-to-r from-purple-600 to-indigo-700 flex justify-between items-center text-white">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-widest">{marcaEdit ? 'Actualizar' : 'Alta de'} Marca</h3>
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-tight">Registro de proveedores</p>
                </div>
                <button onClick={() => setMostrarModal(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/20 hover:bg-white/30 transition-all">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Razón Social / Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Ej: Sony, Microsoft, Apple..."
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-purple-500/20 rounded-2xl text-xs font-bold text-[#1e293b] dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Información de Marca</label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      placeholder="Historia o detalles del fabricante..."
                      rows="4"
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-purple-500/20 rounded-2xl text-xs font-medium text-[#1e293b] dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setMostrarModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-[#1e293b] rounded-2xl shadow-xl shadow-purple-500/20 hover:bg-purple-600 transition-all">
                    {marcaEdit ? 'Actualizar Marca' : 'Confirmar Registro'}
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

export default AdminMarcas;
