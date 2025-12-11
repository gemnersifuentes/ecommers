import { useState, useEffect } from 'react';
import { usuariosService } from '../../services';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState(null);
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
    try {
      const data = await usuariosService.getAll();
      setUsuarios(data);
    } catch (error) {
      console.error('Error:', error);
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
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
      try {
        await usuariosService.delete(id);
        Swal.fire('Eliminado', 'Usuario eliminado', 'success');
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
        Swal.fire('Actualizado', 'Usuario actualizado', 'success');
      } else {
        await usuariosService.create(formData);
        Swal.fire('Creado', 'Usuario creado', 'success');
      }
      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      Swal.fire('Error', 'Error al guardar', 'error');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Usuarios</h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona usuarios del sistema</p>
        </div>
        <button onClick={handleNuevo} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl">
          <i className="fas fa-plus mr-2"></i>Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Usuario</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Correo</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rol</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {usuarios.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.rol === 'admin' ? 'bg-purple-50' : 'bg-blue-50'}`}>
                      <i className={`fas fa-user ${u.rol === 'admin' ? 'text-purple-600' : 'text-blue-600'}`}></i>
                    </div>
                    <p className="font-medium text-gray-900">{u.nombre}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.correo}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.rol === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                    {u.rol}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEditar(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2"><i className="fas fa-edit"></i></button>
                  <button onClick={() => handleEliminar(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {mostrarModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold">{usuarioEdit ? 'Editar' : 'Nuevo'} Usuario</h3>
                <button onClick={() => setMostrarModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><i className="fas fa-times"></i></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre</label>
                  <input type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} required className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Correo</label>
                  <input type="email" value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})} required className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contraseña {usuarioEdit && '(dejar vacío para no cambiar)'}</label>
                  <input type="password" value={formData.clave} onChange={(e) => setFormData({...formData, clave: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rol</label>
                  <select value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500">
                    <option value="cliente">Cliente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setMostrarModal(false)} className="flex-1 px-4 py-2.5 border rounded-xl hover:bg-gray-50">Cancelar</button>
                  <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700">{usuarioEdit ? 'Actualizar' : 'Crear'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsuarios;
