import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usuariosService } from '../../services';

const AdminClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const data = await usuariosService.getAll();
      setClientes(Array.isArray(data) ? data.filter(u => u.rol === 'cliente') : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'rgb(59,130,246)' }}></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1e293b] tracking-tight uppercase">Clientes</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Directorio de usuarios registrados</p>
        </div>

        <div className="relative group">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs transition-colors group-focus-within:text-blue-500"></i>
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 bg-white border-2 border-transparent focus:border-blue-500/20 rounded-2xl text-xs font-bold shadow-sm focus:outline-none transition-all w-80"
          />
        </div>
      </div>

      {/* Stats Quick View (Optional but premium) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <i className="fas fa-users"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase">Total Clientes</p>
            <h4 className="text-xl font-black text-[#1e293b]">{clientes.length}</h4>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <i className="fas fa-user-check"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase">Activos Hoy</p>
            <h4 className="text-xl font-black text-[#1e293b]">{clientes.length}</h4>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 text-blue-600 bg-blue-600/5 border-blue-100/50">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <i className="fas fa-star"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Nuevos (Mes)</p>
            <h4 className="text-xl font-black text-blue-900">+{clientes.length}</h4>
          </div>
        </motion.div>
      </div>

      {/* Main Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-500/5 overflow-hidden border border-gray-100"
      >
        <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 border-b border-white/5">
          <div className="flex items-center gap-4 text-white">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl items-center justify-center flex">
              <i className="fas fa-address-book text-xl"></i>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest tracking-widest">Gestión de Audiencia</h3>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-tight">Viendo {clientesFiltrados.length} clientes filtrados</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 text-left border-b border-gray-100">
                <th className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Información Cliente</span>
                  </div>
                </th>
                <th className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Email Corporativo</span>
                  </div>
                </th>
                <th className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Registro</span>
                  </div>
                </th>
                <th className="px-8 py-5 text-center">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Estatus</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {clientesFiltrados.map((cliente, index) => (
                  <motion.tr
                    key={cliente.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                            {cliente.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-xs font-black text-[#1e293b] uppercase tracking-tight">{cliente.nombre}</p>
                          <p className="text-[9px] text-gray-400 font-bold">CLIENTE #ID-{cliente.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-gray-600">{cliente.correo}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <i className="far fa-calendar-alt text-gray-300 text-[10px]"></i>
                        <span className="text-xs font-bold text-gray-500">{new Date(cliente.fecha_registro).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="inline-flex px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                        Activo
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {clientesFiltrados.length === 0 && (
            <div className="py-24 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-users-slash text-3xl text-gray-200"></i>
              </div>
              <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest">Sin resultados</h5>
              <p className="text-[10px] text-gray-300 font-bold uppercase mt-2">Intente con otros términos de búsqueda</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminClientes;
