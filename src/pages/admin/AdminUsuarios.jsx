import { useState, useEffect } from 'react';
import { usuariosService } from '../../services';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

const AdminUsuarios = () => {
  // Estilos CSS personalizados (Consistentes con AdminProductos)
  const customStyles = `
    .btn-primary { background-color: rgb(97,64,220); }
    .btn-primary:hover { background-color: rgb(107,74,230); }
    .text-primary { color: rgb(97,64,220); }
    .bg-primary-light { background-color: rgba(97,64,220,0.1); }
    .modal-header-gradient {
      background: linear-gradient(to right, rgb(97,64,220), rgb(107,74,230)) !important;
    }
  `;

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    clave: '',
    rol: 'cliente'
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const data = await usuariosService.getAll();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevo = () => {
    setUsuarioEdit(null);
    setFormData({ nombre: '', correo: '', clave: '', rol: 'cliente' });
    setMostrarModal(true);
  };

  const handleEditar = (usuario) => {
    setUsuarioEdit(usuario);
    setFormData({ nombre: usuario.nombre, correo: usuario.correo, clave: '', rol: usuario.rol });
    setMostrarModal(true);
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción desactivará al usuario",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
      try {
        await usuariosService.delete(id);
        Swal.fire('Eliminado', 'Usuario eliminado exitosamente', 'success');
        cargarDatos();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (usuarioEdit) {
        await usuariosService.update(usuarioEdit.id, formData);
        Swal.fire('¡Actualizado!', 'El usuario ha sido modificado', 'success');
      } else {
        await usuariosService.create(formData);
        Swal.fire('¡Creado!', 'Nuevo usuario registrado', 'success');
      }
      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      Swal.fire('Error', 'Error al guardar los cambios', 'error');
    }
  };

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="max-w-7xl mx-auto space-y-6 px-4 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-[#1e293b] tracking-tight uppercase">Usuarios</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Gestión administrativa de accesos</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs transition-colors group-focus-within:text-purple-500"></i>
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border-2 border-transparent focus:border-purple-500/20 rounded-2xl text-xs font-bold shadow-sm focus:outline-none transition-all w-64"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNuevo}
              className="px-6 py-2.5 bg-[#1e293b] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg hover:bg-purple-600 transition-all flex items-center gap-2"
            >
              <i className="fas fa-user-plus text-[10px]"></i>
              Nuevo Usuario
            </motion.button>
          </div>
        </div>

        {/* Users Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl shadow-purple-500/5 overflow-hidden border border-gray-100"
        >
          {/* Table Header Accent */}
          <div className="px-8 py-6 bg-gradient-to-r from-[#1e293b] to-[#334155] border-b border-white/5">
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl items-center justify-center flex">
                <i className="fas fa-users text-xl"></i>
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest">Listado de Personal</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Total: {usuariosFiltrados.length} Registros</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Identidad</span>
                    </div>
                  </th>
                  <th className="px-6 py-5 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Contacto / Email</span>
                    </div>
                  </th>
                  <th className="px-6 py-5 text-left text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Privilegios</span>
                    </div>
                  </th>
                  <th className="px-8 py-5 text-right">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-4">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence>
                  {usuariosFiltrados.map((u, index) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-purple-500/[0.02] transition-colors"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm shadow-sm ${u.rol === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            <i className={`fas ${u.rol === 'admin' ? 'fa-user-shield' : 'fa-user-tie'}`}></i>
                          </div>
                          <div>
                            <p className="text-xs font-black text-[#1e293b] uppercase tracking-tight">{u.nombre}</p>
                            <p className="text-[9px] text-gray-400 font-bold">USUARIO ID #{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-600">{u.correo}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${u.rol === 'admin' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-gray-100 text-gray-600'}`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditar(u)}
                            className="w-9 h-9 flex items-center justify-center bg-gray-50 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                          >
                            <i className="fas fa-edit text-xs"></i>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEliminar(u.id)}
                            className="w-9 h-9 flex items-center justify-center bg-gray-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          >
                            <i className="fas fa-trash-alt text-xs"></i>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {usuariosFiltrados.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-user-slash text-2xl text-gray-200"></i>
                </div>
                <p className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">No se encontron registros</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* User Modal */}
        <AnimatePresence>
          {mostrarModal && (
            <div className="fixed inset-0 bg-[#1e293b]/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden"
              >
                <div className="px-10 py-8 modal-header-gradient flex justify-between items-center text-white">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-widest">{usuarioEdit ? 'Editar' : 'Nuevo'} Usuario</h3>
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-tight">Complete la información del perfil</p>
                  </div>
                  <button onClick={() => setMostrarModal(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/20 hover:bg-white/30 transition-all">
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nombre Completo</label>
                      <div className="relative">
                        <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                        <input
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          required
                          className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500/20 rounded-[1.25rem] text-xs font-bold text-[#1e293b] focus:outline-none focus:bg-white transition-all"
                          placeholder="Ej: Juan Pérez"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Correo Electrónico</label>
                      <div className="relative">
                        <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                        <input
                          type="email"
                          value={formData.correo}
                          onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                          required
                          className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500/20 rounded-[1.25rem] text-xs font-bold text-[#1e293b] focus:outline-none focus:bg-white transition-all"
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Contraseña {usuarioEdit && '(Opcional)'}</label>
                      <div className="relative">
                        <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                        <input
                          type="password"
                          value={formData.clave}
                          onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
                          className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500/20 rounded-[1.25rem] text-xs font-bold text-[#1e293b] focus:outline-none focus:bg-white transition-all tracking-widest"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nivel de Acceso (Rol)</label>
                      <div className="relative">
                        <i className="fas fa-user-tag absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                        <select
                          value={formData.rol}
                          onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                          className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500/20 rounded-[1.25rem] text-xs font-black text-[#1e293b] focus:outline-none focus:bg-white appearance-none cursor-pointer transition-all"
                        >
                          <option value="cliente">CLIENTE (ESTÁNDAR)</option>
                          <option value="admin">ADMINISTRADOR (TOTAL)</option>
                        </select>
                        <i className="fas fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[10px]"></i>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setMostrarModal(false)}
                      className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-[#1e293b] bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-[#1e293b] rounded-2xl shadow-xl shadow-purple-500/20 hover:bg-purple-600 transition-all transition-all"
                    >
                      {usuarioEdit ? 'Guardar Cambios' : 'Confirmar Registro'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AdminUsuarios;
