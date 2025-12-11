import { useState } from 'react';

const AdminReportes = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
        <p className="text-sm text-gray-500 mt-1">Genera reportes y estadísticas</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-bold text-gray-900 mb-4">Filtros de Fecha</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl">
              <i className="fas fa-search mr-2"></i>Generar Reporte
            </button>
          </div>
        </div>
      </div>

      {/* Tipos de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
            <i className="fas fa-chart-line text-blue-600 text-xl"></i>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Reporte de Ventas</h3>
          <p className="text-sm text-gray-500 mb-4">Ventas por período, productos más vendidos</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Generar <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
            <i className="fas fa-box text-green-600 text-xl"></i>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Reporte de Inventario</h3>
          <p className="text-sm text-gray-500 mb-4">Stock actual, productos bajo stock</p>
          <button className="text-green-600 hover:text-green-700 font-medium text-sm">
            Generar <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
            <i className="fas fa-users text-purple-600 text-xl"></i>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Reporte de Clientes</h3>
          <p className="text-sm text-gray-500 mb-4">Clientes nuevos, clientes frecuentes</p>
          <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
            Generar <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mb-4">
            <i className="fas fa-shopping-cart text-yellow-600 text-xl"></i>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Reporte de Pedidos</h3>
          <p className="text-sm text-gray-500 mb-4">Pedidos por estado, tiempos de entrega</p>
          <button className="text-yellow-600 hover:text-yellow-700 font-medium text-sm">
            Generar <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
            <i className="fas fa-dollar-sign text-red-600 text-xl"></i>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Reporte Financiero</h3>
          <p className="text-sm text-gray-500 mb-4">Ingresos, gastos, utilidades</p>
          <button className="text-red-600 hover:text-red-700 font-medium text-sm">
            Generar <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
            <i className="fas fa-wrench text-indigo-600 text-xl"></i>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Reporte de Servicios</h3>
          <p className="text-sm text-gray-500 mb-4">Servicios realizados, ingresos por servicio</p>
          <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
            Generar <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminReportes;
