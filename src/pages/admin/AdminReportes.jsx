import { useState } from 'react';
import DatePicker from '../../components/ui/DatePicker';

const AdminReportes = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Genera reportes y estadísticas</p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-[#111c44] rounded-xl shadow-sm border border-transparent dark:border-white/5 p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Filtros de Fecha</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DatePicker
            label="Fecha Inicio"
            value={fechaInicio}
            onChange={setFechaInicio}
            className="flex-1"
          />
          <DatePicker
            label="Fecha Fin"
            value={fechaFin}
            onChange={setFechaFin}
            className="flex-1"
          />
          <div className="flex items-end">
            <button className="w-full px-4 py-2.5 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl dark:shadow-blue-500/20 transition-all flex items-center justify-center">
              <i className="fas fa-search mr-2"></i>Generar Reporte
            </button>
          </div>
        </div>
      </div>

      {/* Tipos de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#111c44] rounded-xl shadow-sm border border-transparent dark:border-white/5 p-6 hover:shadow-md dark:hover:shadow-blue-500/5 transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fas fa-chart-line text-blue-600 dark:text-blue-400 text-xl"></i>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Reporte de Ventas</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Ventas por período, productos más vendidos</p>
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold text-sm flex items-center">
            Generar <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>

        <div className="bg-white dark:bg-[#111c44] rounded-xl shadow-sm border border-transparent dark:border-white/5 p-6 hover:shadow-md dark:hover:shadow-emerald-500/5 transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-green-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fas fa-box text-green-600 dark:text-emerald-400 text-xl"></i>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Reporte de Inventario</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Stock actual, productos bajo stock</p>
          <button className="text-green-600 dark:text-emerald-400 hover:text-green-700 dark:hover:text-emerald-300 font-bold text-sm flex items-center">
            Generar <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>

        <div className="bg-white dark:bg-[#111c44] rounded-xl shadow-sm border border-transparent dark:border-white/5 p-6 hover:shadow-md dark:hover:shadow-purple-500/5 transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fas fa-users text-purple-600 dark:text-purple-400 text-xl"></i>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Reporte de Clientes</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Clientes nuevos, clientes frecuentes</p>
          <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold text-sm flex items-center">
            Generar <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>

        <div className="bg-white dark:bg-[#111c44] rounded-xl shadow-sm border border-transparent dark:border-white/5 p-6 hover:shadow-md dark:hover:shadow-amber-500/5 transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-yellow-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fas fa-shopping-cart text-yellow-600 dark:text-amber-400 text-xl"></i>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Reporte de Pedidos</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Pedidos por estado, tiempos de entrega</p>
          <button className="text-yellow-600 dark:text-amber-400 hover:text-yellow-700 dark:hover:text-amber-300 font-bold text-sm flex items-center">
            Generar <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>

        <div className="bg-white dark:bg-[#111c44] rounded-xl shadow-sm border border-transparent dark:border-white/5 p-6 hover:shadow-md dark:hover:shadow-red-500/5 transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fas fa-dollar-sign text-red-600 dark:text-red-400 text-xl"></i>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Reporte Financiero</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Ingresos, gastos, utilidades</p>
          <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold text-sm flex items-center">
            Generar <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>

        <div className="bg-white dark:bg-[#111c44] rounded-xl shadow-sm border border-transparent dark:border-white/5 p-6 hover:shadow-md dark:hover:shadow-indigo-500/5 transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fas fa-wrench text-indigo-600 dark:text-indigo-400 text-xl"></i>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Reporte de Servicios</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Servicios realizados, ingresos por servicio</p>
          <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold text-sm flex items-center">
            Generar <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminReportes;
