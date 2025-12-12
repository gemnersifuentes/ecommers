import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tiendaService, tiendaCategoriasService } from '../services'; // Importamos el servicio de categorías
import api from '../services/api'; // Necesitamos api para llamar a filtros.php directamente si no hay servicio
import ProductFilters from '../components/products/ProductFilters';
import MobileProductFilters from '../components/products/MobileProductFilters';
import ProductGrid from '../components/products/ProductGrid';
import { ChevronDown } from 'lucide-react';

const sortOptions = [
  { value: 'recomendados', label: 'Destacados' },
  { value: 'precio_asc', label: 'Precio: Menor a Mayor' },
  { value: 'precio_desc', label: 'Precio: Mayor a Menor' },
  { value: 'mas_vendidos', label: 'Más Vendidos' },
  { value: 'mejor_calificados', label: 'Mejor Calificados' }
];

const Productos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProductos, setTotalProductos] = useState(0);
  const [categoriasList, setCategoriasList] = useState([]);
  const [marcasList, setMarcasList] = useState([]);
  const [condicionesList, setCondicionesList] = useState([]);
  const [atributosList, setAtributosList] = useState([]);

  const [filters, setFilters] = useState({
    categoria_id: searchParams.get('categoria') && !isNaN(searchParams.get('categoria')) ? parseInt(searchParams.get('categoria')) : null,
    marcas: searchParams.get('marca')
      ? searchParams.get('marca').split(',').map(m => parseInt(m)).filter(m => !isNaN(m))
      : [],
    precio_min: searchParams.get('min') || '',
    precio_max: searchParams.get('max') || '',
    atributos: {},
    busqueda: searchParams.get('busqueda') || '',
    ofertas_flash: searchParams.get('ofertas') === '1',
    envio_gratis: searchParams.get('envio_gratis') === '1',
    condicion: [],
    calificacion: null,
    totalResultados: 0
  });
  const [ordenamiento, setOrdenamiento] = useState('recomendados');
  const [showSort, setShowSort] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 32;

  // Cargar metadatos (categorías, marcas, atributos)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Cargar Categorías
        const cats = await tiendaCategoriasService.getAll();
        if (Array.isArray(cats)) setCategoriasList(cats);

        // Cargar Filtros completos (Marcas, Condiciones, Atributos)
        // Pasamos categoria_id si existe para filtrar marcas/atributos relevantes
        let url = '/api/tienda/filtros.php';
        if (filters.categoria_id) {
          url += `?categoria_id=${filters.categoria_id}`;
        }

        const response = await api.get(url);
        if (response.data) {
          if (response.data.marcas) setMarcasList(response.data.marcas);
          if (response.data.condiciones) setCondicionesList(response.data.condiciones);
          if (response.data.atributos) setAtributosList(response.data.atributos);
        }
      } catch (error) {
        console.error("Error loading metadata", error);
      }
    };
    fetchMetadata();
  }, [filters.categoria_id]);

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
      categoria_id: categoriaId && !isNaN(categoriaId) ? parseInt(categoriaId) : null,
      marcas: marcaId ? marcaId.split(',').map(m => parseInt(m)).filter(m => !isNaN(m)) : [],
      atributos: (() => {
        const attrs = {};
        for (const [key, value] of searchParams.entries()) {
          if (key.startsWith('attr_')) {
            attrs[key.replace('attr_', '')] = value.split(',').map(v => !isNaN(v) ? parseInt(v) : v);
          }
        }
        return attrs;
      })(),
      busqueda: busqueda || '',
      precio_min: searchParams.get('min') || '',
      precio_max: searchParams.get('max') || '',
      ofertas_flash: searchParams.get('ofertas') === '1',
      envio_gratis: searchParams.get('envio_gratis') === '1',
      condicion: searchParams.get('condicion') ? searchParams.get('condicion').split(',') : [],
      calificacion: searchParams.get('calificacion') ? parseInt(searchParams.get('calificacion')) : null
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
      if (filters.envio_gratis) params.envio_gratis = 1;
      if (filters.calificacion) params.calificacion = filters.calificacion;
      if (ordenamiento !== 'recomendados') params.ordenar = ordenamiento;

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
    // 1. Calcular nuevos filtros basados en el estado actual
    let updatedFilters = { ...filters, ...newFilters };

    // Si cambió la categoría, resetear marcas y atributos
    if (newFilters.categoria_id !== undefined && newFilters.categoria_id !== filters.categoria_id) {
      updatedFilters.marcas = [];
      updatedFilters.atributos = {};
      // Opcional: También resetear otros filtros si se desea
    }

    // 2. Actualizar URL con TODOS los filtros
    const params = new URLSearchParams(searchParams);

    // 1. Categoria
    if (updatedFilters.categoria_id) params.set('categoria', updatedFilters.categoria_id);
    else params.delete('categoria');

    // 2. Marcas
    if (updatedFilters.marcas && updatedFilters.marcas.length > 0) params.set('marca', updatedFilters.marcas.join(','));
    else params.delete('marca');

    // 3. Ofertas Flash
    if (updatedFilters.ofertas_flash) params.set('ofertas', '1');
    else params.delete('ofertas');

    // 4. Envio Gratis
    if (updatedFilters.envio_gratis) params.set('envio_gratis', '1');
    else params.delete('envio_gratis');

    // 5. Condicion
    if (updatedFilters.condicion && updatedFilters.condicion.length > 0) params.set('condicion', updatedFilters.condicion.join(','));
    else params.delete('condicion');

    // 6. Calificación
    if (updatedFilters.calificacion) params.set('calificacion', updatedFilters.calificacion);
    else params.delete('calificacion');

    // 5. Precios
    if (updatedFilters.precio_min) params.set('min', updatedFilters.precio_min);
    else params.delete('min');

    if (updatedFilters.precio_max) params.set('max', updatedFilters.precio_max);
    else params.delete('max');

    // 6. Atributos Dinámicos (Color, Storage, etc)
    const existingKeys = Array.from(params.keys()).filter(k => k.startsWith('attr_'));
    existingKeys.forEach(k => params.delete(k));

    if (updatedFilters.atributos) {
      Object.entries(updatedFilters.atributos).forEach(([key, values]) => {
        if (values && values.length > 0) {
          params.set(`attr_${key}`, values.join(','));
        }
      });
    }

    // 3. Aplicar cambios a la URL
    // Esto disparará el useEffect que escucha searchParams y actualizará el estado 'filters'
    setSearchParams(params);

    setPaginaActual(1);
  };

  const totalPaginas = Math.ceil(totalProductos / productosPorPagina);

  // Derivar nombres para el título
  const categoriaActual = filters.categoria_id
    ? categoriasList.find(c => parseInt(c.id) === filters.categoria_id)?.nombre
    : '';

  const marcaActual = filters.marcas && filters.marcas.length > 0
    ? marcasList.filter(m => filters.marcas.includes(parseInt(m.id))).map(m => m.nombre).join(', ')
    : '';

  return (
    <div className="min-h-screen bg-gray-50 pt-36 pb-6 md:pt-60 md:pb-8">
      <div className="container mx-auto px-2 md:px-4 max-w-7xl">

        {/* Mobile Filters (Visible only on lg:hidden) */}
        <div className="lg:hidden mb-4">
          <MobileProductFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            totalResultados={totalProductos}
            marcas={marcasList}
            condiciones={condicionesList}
            categorias={categoriasList}
            atributosDisponibles={atributosList}
            ordenamiento={ordenamiento}
            setOrdenamiento={setOrdenamiento}
          />
        </div>

        {/* Header */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filtros (Desktop only) */}
          <div className="hidden lg:block lg:col-span-1">
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              totalResultados={totalProductos}
              marcas={marcasList}
              condiciones={condicionesList}
              categorias={categoriasList}
              atributosDisponibles={atributosList}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header / Banner moved here */}
            <div className="bg-white rounded-xl p-3 md:p-4 mb-4 md:mb-6 shadow-sm flex flex-row items-center justify-between gap-2">
              <div>
                <h1 className="text-sm font-bold text-gray-900">
                  {categoriaActual ? categoriaActual : 'Todo El Catálogo'}
                  {marcaActual ? ' - ' + marcaActual : ''}
                </h1>
                <p className="text-gray-500 text-xs mt-1">{totalProductos} productos encontrados</p>
              </div>

              <div className="flex flex-col items-end gap-1 relative z-30">
                <span className="text-[10px] text-gray-500 font-medium">Ordenar:</span>

                <div className="relative">
                  <button
                    onClick={() => setShowSort(!showSort)}
                    className="flex items-center justify-between gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gray-100 rounded-lg text-xs md:text-xs font-medium text-gray-900 border border-transparent focus:border-orange-500 transition-all min-w-[130px] md:min-w-[180px]"
                  >
                    <span className="truncate">{sortOptions.find(o => o.value === ordenamiento)?.label}</span>
                    <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${showSort ? 'rotate-180' : ''}`} />
                  </button>

                  {showSort && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowSort(false)}
                      />
                      <div className="absolute top-full right-0 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 flex flex-col">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setOrdenamiento(option.value);
                              setShowSort(false);
                            }}
                            className={`px-3 py-2 text-left text-xs hover:bg-orange-50 transition-colors ${ordenamiento === option.value ? 'text-orange-500 font-bold bg-orange-50/50' : 'text-gray-700'
                              }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
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
