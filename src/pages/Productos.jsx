import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tiendaService, tiendaCategoriasService } from '../services'; // Importamos el servicio de categorías
import api from '../services/api'; // Necesitamos api para llamar a filtros.php directamente si no hay servicio
import ProductFilters from '../components/products/ProductFilters';
import MobileProductFilters from '../components/products/MobileProductFilters';
import ProductGrid from '../components/products/ProductGrid';

// Componente Interno de Paginación (Estilo Clean/Dark)
const PaginationComponent = ({ paginaActual, totalPaginas, onPageChange }) => {
  if (totalPaginas <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    // Siempre mostrar la primera
    pages.push(1);

    let start = Math.max(2, paginaActual - 1);
    let end = Math.min(totalPaginas - 1, paginaActual + 1);

    // Ajustar si estamos cerca de los extremos para mostrar siempre 3 números si es posible
    if (paginaActual <= 3) {
      end = Math.min(totalPaginas - 1, 4);
    }
    if (paginaActual >= totalPaginas - 2) {
      start = Math.max(2, totalPaginas - 3);
    }

    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPaginas) {
        pages.push(i);
      }
    }

    if (end < totalPaginas - 1) {
      pages.push('...');
    }

    // Siempre mostrar la última si es mayor a 1
    if (totalPaginas > 1) {
      pages.push(totalPaginas);
    }

    return [...new Set(pages)];
  };

  return (
    <div className="flex items-center gap-1 md:gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, paginaActual - 1))}
        disabled={paginaActual === 1}
        className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {getPageNumbers().map((page, idx) => (
        typeof page === 'number' ? (
          <button
            key={idx}
            onClick={() => onPageChange(page)}
            className={`w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full text-xs md:text-sm font-medium transition-all
              ${paginaActual === page
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                : 'text-gray-500 hover:bg-gray-100'
              }`}
          >
            {page}
          </button>
        ) : (
          <span key={idx} className="text-gray-400 px-0.5 md:px-1 pb-1 md:pb-2 text-xs md:text-sm">...</span>
        )
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPaginas, paginaActual + 1))}
        disabled={paginaActual === totalPaginas}
        className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};
import { FullScreenLoader } from '../components/FullScreenLoader';
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
  const [relevantCategories, setRelevantCategories] = useState([]);
  const [relevantBrands, setRelevantBrands] = useState([]);

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
    envio_domicilio: searchParams.get('envio_domicilio') === '1',
    retiro_punto: searchParams.get('retiro_punto') === '1',
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

    // NUCLEAR OPTION: Kill smooth scroll globally while loading
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';

    // Scroll inmediato al tope (con pequeño timeout para asegurar que el render ocurra)
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);
  }, [
    filters.categoria_id,
    filters.marcas,
    filters.precio_min,
    filters.precio_max,
    filters.atributos,
    filters.busqueda,
    filters.condicion,
    filters.ofertas_flash,
    filters.ofertas_flash,
    filters.envio_gratis,
    filters.envio_domicilio,
    filters.retiro_punto,
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
      envio_domicilio: searchParams.get('envio_domicilio') === '1',
      retiro_punto: searchParams.get('retiro_punto') === '1',
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
      if (filters.envio_domicilio) params.envio_domicilio = 1;
      if (filters.retiro_punto) params.retiro_punto = 1;
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
        let finalProducts = data.data;

        // Ensure final state update uses the processed list
        setProductos(data.data || []);
        setTotalProductos(data.total || 0);

        // Identify Relevant Categories and Brands from results for filters
        if (filters.busqueda && data.data?.length > 0) {
          const catsInResults = new Set(data.data.map(p => p.categoria_id).filter(Boolean));
          setRelevantCategories(Array.from(catsInResults).map(id => parseInt(id)));

          const brandsInResults = new Set(data.data.map(p => p.marca_id).filter(Boolean));
          setRelevantBrands(Array.from(brandsInResults).map(id => parseInt(id)));
        } else {
          setRelevantCategories([]);
          setRelevantBrands([]);
        }

      } else {
        setProductos([]);
        setTotalProductos(0);
        setRelevantCategories([]);
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

    // 4. Envio Gratis y Tipos de Entrega
    if (updatedFilters.envio_gratis) params.set('envio_gratis', '1');
    else params.delete('envio_gratis');

    if (updatedFilters.envio_domicilio) params.set('envio_domicilio', '1');
    else params.delete('envio_domicilio');

    if (updatedFilters.retiro_punto) params.set('retiro_punto', '1');
    else params.delete('retiro_punto');

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
            relevantCategories={relevantCategories}
            relevantBrands={relevantBrands}
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
              relevantCategories={relevantCategories}
              relevantBrands={relevantBrands}
              title={`${categoriaActual ? categoriaActual : 'Todo El Catálogo'}${marcaActual ? ' - ' + marcaActual : ''}`}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className={loading ? 'hidden' : 'block'}>
              {/* Header / Banner moved here - Simplified for Sort only */}
              <div className="bg-white rounded-xl p-3 md:p-4 mb-4 md:mb-6 shadow-sm flex flex-row items-center justify-between gap-2">

                {/* Sort Dropdown aligned to left */}
                <div className="flex flex-col md:flex-row md:items-center items-start gap-0.5 md:gap-2 relative z-30">
                  <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap pl-1 md:pl-0">Ordenar por:</span>

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

                {/* Paginación Superior (Diseño Premium) */}
                {/* Paginación Superior (Unified Premium) */}
                {totalPaginas > 1 && (
                  <div className="flex justify-end">
                    <PaginationComponent paginaActual={paginaActual} totalPaginas={totalPaginas} onPageChange={setPaginaActual} />
                  </div>
                )}
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
                  envio_domicilio: false,
                  retiro_punto: false,
                  calificacion: null
                })}
              />


              {/* Paginación inferior (Unified Premium Design) */}
              {/* Paginación inferior (Unified Premium) */}
              {totalPaginas > 1 && (
                <div className="mt-12 flex justify-center">
                  <PaginationComponent paginaActual={paginaActual} totalPaginas={totalPaginas} onPageChange={setPaginaActual} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {loading && (
        <div className="loader-override-white">
          <FullScreenLoader />
        </div>
      )}
    </div >
  );
};

export default Productos;
