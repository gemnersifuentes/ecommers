import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tiendaService } from '../services';
import ProductFilters from '../components/products/ProductFilters';
import ProductGrid from '../components/products/ProductGrid';

const Productos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProductos, setTotalProductos] = useState(0);
  const [filters, setFilters] = useState({
    categoria_id: searchParams.get('categoria') ? parseInt(searchParams.get('categoria')) : null,
    marcas: searchParams.get('marca') ? [parseInt(searchParams.get('marca'))] : [],
    precio_min: searchParams.get('min') || '',
    precio_max: searchParams.get('max') || '',
    atributos: {},
    busqueda: searchParams.get('busqueda') || '',
    ofertas_flash: searchParams.get('ofertas') === '1',
    envio_gratis: searchParams.get('envio_gratis') === '1',
    condicion: [], // Por ahora simple
    calificacion: null,
    totalResultados: 0
  });
  const [ordenamiento, setOrdenamiento] = useState('recomendados');
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 32;

  useEffect(() => {
    cargarProductos();
  }, [
    filters.categoria_id,
    filters.marcas,
    filters.precio_min,
    filters.precio_max,
    filters.atributos,
    filters.busqueda,
    filters.condicion,
    filters.ofertas_flash,
    filters.envio_gratis,
    filters.calificacion,
    ordenamiento,
    paginaActual
  ]);

  useEffect(() => {
    const categoriaId = searchParams.get('categoria');
    const marcaId = searchParams.get('marca');
    const busqueda = searchParams.get('busqueda');

    setFilters(prev => ({
      ...prev,
      categoria_id: categoriaId ? parseInt(categoriaId) : null,
      marcas: marcaId ? [parseInt(marcaId)] : [],
      busqueda: busqueda || ''
    }));
  }, [searchParams]);

  useEffect(() => {
    setFilters(prev => ({ ...prev, totalResultados: totalProductos }));
  }, [totalProductos]);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const params = {};

      if (filters.categoria_id) params.categoria = filters.categoria_id;
      if (filters.marcas?.length > 0) params.marcas = filters.marcas.join(',');
      if (filters.precio_min) params.precio_min = filters.precio_min;
      if (filters.precio_max) params.precio_max = filters.precio_max;
      if (filters.busqueda) params.busqueda = filters.busqueda;
      if (filters.condicion && filters.condicion.length > 0) params.condicion = filters.condicion.join(',');
      if (filters.ofertas_flash) params.ofertas_flash = 1;
      if (ordenamiento !== 'recomendados') params.orden = ordenamiento;

      // Añadir atributos dinámicos a los parámetros
      if (filters.atributos && Object.keys(filters.atributos).length > 0) {
        Object.entries(filters.atributos).forEach(([key, values]) => {
          if (values && values.length > 0) {
            params[`attr_${key}`] = values.join(',');
          }
        });
      }

      const data = await tiendaService.getProductos({
        ...params,
        page: paginaActual,
        limit: productosPorPagina
      });

      if (data && Array.isArray(data.data)) {
        setProductos(data.data);
        setTotalProductos(data.total || 0);
      } else {
        setProductos([]);
        setTotalProductos(0);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => {
      const updatedFilters = { ...prev, ...newFilters };

      // Actualizar URL con TODOS los filtros
      const params = new URLSearchParams(searchParams);

      // 1. Categoria
      if (updatedFilters.categoria_id) params.set('categoria', updatedFilters.categoria_id);
      else params.delete('categoria');

      // 2. Marcas
      if (updatedFilters.marcas && updatedFilters.marcas.length > 0) params.set('marca', updatedFilters.marcas[0]); // Simplificado a una marca por URL por ahora
      else params.delete('marca');

      // 3. Ofertas Flash
      if (updatedFilters.ofertas_flash) params.set('ofertas', '1');
      else params.delete('ofertas');

      // 4. Envio Gratis
      if (updatedFilters.envio_gratis) params.set('envio_gratis', '1');
      else params.delete('envio_gratis');

      // 5. Precios
      if (updatedFilters.precio_min) params.set('min', updatedFilters.precio_min);
      else params.delete('min');

      if (updatedFilters.precio_max) params.set('max', updatedFilters.precio_max);
      else params.delete('max');

      setSearchParams(params);

      return updatedFilters;
    });
    setPaginaActual(1);
  };

  const totalPaginas = Math.ceil(totalProductos / productosPorPagina);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filtros */}
          <div className="lg:col-span-1">
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              totalResultados={totalProductos}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header / Banner moved here */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Todo El Catálogo</h1>
                <p className="text-gray-500 text-sm mt-1">{totalProductos} productos encontrados</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Ordenar:</span>
                <select
                  value={ordenamiento}
                  onChange={(e) => setOrdenamiento(e.target.value)}
                  className="px-4 py-2 bg-gray-100 border-none rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-gray-200 cursor-pointer"
                >
                  <option value="recomendados">Destacados</option>
                  <option value="precio_asc">Precio: Menor a Mayor</option>
                  <option value="precio_desc">Precio: Mayor a Menor</option>
                  <option value="mas_vendidos">Más Vendidos</option>
                  <option value="mejor_calificados">Mejor Calificados</option>
                </select>
              </div>
            </div>
            {/* Grid de productos */}
            <ProductGrid
              productos={productos}
              loading={loading}
              onClearFilters={() => handleFilterChange({
                categoria_id: null,
                marcas: [],
                precio_min: '',
                precio_max: '',
                atributos: {},
                condicion: null,
                ofertas_flash: false,
                envio_gratis: false,
                calificacion: null
              })}
            />

            {/* Paginación inferior */}
            {totalPaginas > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                  disabled={paginaActual === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={() => setPaginaActual(1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-all ${paginaActual === 1 ? 'bg-orange-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  1
                </button>

                {paginaActual > 3 && <span className="text-gray-400 px-1">...</span>}

                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                  .filter(page => page !== 1 && page !== totalPaginas && Math.abs(page - paginaActual) <= 1)
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => setPaginaActual(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-all ${paginaActual === page ? 'bg-orange-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                {paginaActual < totalPaginas - 2 && <span className="text-gray-400 px-1">...</span>}

                {totalPaginas > 1 && (
                  <button
                    onClick={() => setPaginaActual(totalPaginas)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-all ${paginaActual === totalPaginas ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                  >
                    {totalPaginas}
                  </button>
                )}

                <button
                  onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Productos;
