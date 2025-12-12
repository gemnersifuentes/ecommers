import { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaStar } from 'react-icons/fa';
import { Zap } from 'lucide-react';
import { marcasService } from '../../services';
import { useLoader } from '../../context/LoaderContext';

const ProductFilters = ({
    filters,
    onFilterChange,
    totalResultados = 0,
    // Optional props for initial data, but we will fetch if missing/empty to be safe
    marcas: initialMarcas = [],
    condiciones: initialCondiciones = [],
    categorias: initialCategorias = [],
    atributosDisponibles: initialAtributos = []
}) => {
    const [marcas, setMarcas] = useState(initialMarcas);
    const [condiciones, setCondiciones] = useState(initialCondiciones);
    const [categorias, setCategorias] = useState(initialCategorias);
    const [atributosDisponibles, setAtributosDisponibles] = useState(initialAtributos);

    const [expandedSections, setExpandedSections] = useState({
        categoria: true,
        marca: true,
        precio: true,
        condicion: true
    });
    const { showLoader, hideLoader } = useLoader();

    // Update state if props change (for Mobile sharing case)
    useEffect(() => {
        if (initialMarcas.length > 0) setMarcas(initialMarcas);
        if (initialCondiciones.length > 0) setCondiciones(initialCondiciones);
        if (initialCategorias.length > 0) setCategorias(initialCategorias);
        if (initialAtributos.length > 0) setAtributosDisponibles(initialAtributos);
    }, [initialMarcas, initialCondiciones, initialCategorias, initialAtributos]);

    const loadFiltersData = async () => {
        try {
            let url = 'http://localhost:8000/api/tienda/filtros.php';
            if (filters.categoria_id) {
                url += `?categoria_id=${filters.categoria_id}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data) {
                if (data.marcas) setMarcas(data.marcas);
                if (data.condiciones) setCondiciones(data.condiciones);
                if (data.atributos) setAtributosDisponibles(data.atributos);

                // Auto-expandir
                if (data.atributos && data.atributos.length > 0) {
                    setExpandedSections(prev => {
                        const newState = { ...prev };
                        data.atributos.forEach(attr => {
                            newState[attr.nombre] = true;
                        });
                        return newState;
                    });
                }
            }
        } catch (error) {
            console.error('Error al cargar filtros de tienda:', error);
        }
    };

    // Cargar filtros cuando cambia la categoría (y si no tenemos datos iniciales o queremos refrescar)
    useEffect(() => {
        // Only fetch if we don't have robust data or if we want to ensure freshness.
        // Given the bug report, we'll force fetch to be safe, mimicking original behavior.
        loadFiltersData();
    }, [filters.categoria_id]);

    // Cargar categorías (separado)
    const loadCategorias = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/categorias.php');
            const data = await response.json();
            setCategorias(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            setCategorias([]);
        }
    };
    // Cargar categorías siempre al montar
    useEffect(() => {
        if (categorias.length === 0) loadCategorias();
    }, []);

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <div className="bg-white rounded-lg p-4 shadow-sm">
            {/* Categorías */}
            <div className="mb-8">
                <button
                    onClick={() => toggleSection('categoria')}
                    className="w-full flex items-center justify-between mb-4"
                >
                    <h3 className="font-bold text-gray-900 text-sm">Categorías</h3>
                    {expandedSections.categoria ? <FaChevronUp className="text-xs text-gray-500" /> : <FaChevronDown className="text-xs text-gray-500" />}
                </button>

                {expandedSections.categoria && (
                    <div className="space-y-3">
                        {/* Opción 'Todo' */}
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${!filters.categoria_id ? 'border-orange-500' : 'border-gray-300 group-hover:border-orange-400'}`}>
                                {!filters.categoria_id && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                            </div>
                            <input
                                type="radio"
                                name="categoria"
                                checked={!filters.categoria_id}
                                onChange={() => { showLoader(); onFilterChange({ categoria_id: null }); setTimeout(hideLoader, 600); }}
                                className="hidden"
                            />
                            <span className={`text-xs ${!filters.categoria_id ? 'font-bold text-orange-500' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                Todo
                            </span>
                        </label>

                        {/* Lista de categorías */}
                        {categorias.map(categoria => (
                            <label key={categoria.id} className="flex items-center gap-3 cursor-pointer group text-xs">
                                <div className={`w-5 h-5 rounded-full border flex items-center text-xs justify-center transition-colors ${filters.categoria_id === parseInt(categoria.id) ? 'border-orange-500' : 'border-gray-300 group-hover:border-orange-400'}`}>
                                    {filters.categoria_id === parseInt(categoria.id) && <div className="w-2.5 h-2.5 text-xs rounded-full bg-orange-500" />}
                                </div>
                                <input
                                    type="radio"
                                    name="categoria"
                                    checked={filters.categoria_id === parseInt(categoria.id)}
                                    onChange={() => { showLoader(); onFilterChange({ categoria_id: parseInt(categoria.id) }); setTimeout(hideLoader, 600); }}
                                    className="hidden"
                                />
                                <span className={`text-xs ${filters.categoria_id === parseInt(categoria.id) ? 'font-bold text-orange-500' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                    {categoria.nombre}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Precio */}
            <div className="mb-8">
                <button
                    onClick={() => toggleSection('precio')}
                    className="w-full flex items-center justify-between mb-4"
                >
                    <h3 className="font-bold text-gray-900 text-sm">Precio</h3>
                    {expandedSections.precio ? (
                        <FaChevronUp className="text-xs text-gray-500" />
                    ) : (
                        <FaChevronDown className="text-xs text-gray-500" />
                    )}
                </button>

                {expandedSections.precio && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            {/* Input mínimo */}
                            <div className="relative w-20">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={filters.precio_min || ''}
                                    onChange={(e) => onFilterChange({ precio_min: e.target.value })}
                                    className="w-full pl-5 pr-2 py-1.5 text-xs text-gray-900 rounded-lg     
                       border-2 border-gray-100
                       hover:border-orange-500 focus:border-orange-500 focus:outline-none
                       bg-white placeholder-gray-400 transition-colors "
                                />
                            </div>

                            <span className="text-gray-400 text-xs">–</span>

                            {/* Input máximo */}
                            <div className="relative w-20">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                <input
                                    type="number"
                                    placeholder="3000"
                                    value={filters.precio_max || ''}
                                    onChange={(e) => onFilterChange({ precio_max: e.target.value })}
                                    className="w-full pl-5 pr-2 py-1.5 text-xs text-gray-900 rounded-lg 
                       border-2 border-gray-100 
                       hover:border-orange-500 focus:border-orange-500 focus:outline-none
                       bg-white placeholder-gray-400 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Tags de rango rápido */}
                        <div className="flex flex-wrap gap-1.5">
                            {['< $100', '< $500', '< $1000'].map((tag, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        showLoader();
                                        const max = tag.replace(/\D/g, '');
                                        onFilterChange({ precio_min: '', precio_max: max });
                                        setTimeout(hideLoader, 600);
                                    }}
                                    className="px-2 py-1 text-[10px] bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Marcas */}
            <div className="mb-8">
                <button
                    onClick={() => toggleSection('marca')}
                    className="w-full flex text-xs items-center justify-between mb-4"
                >
                    <h3 className="font-bold text-gray-900 text-sm">Marcas</h3>
                    {expandedSections.marca ? <FaChevronUp className="text-xs text-gray-500" /> : <FaChevronDown className="text-xs text-gray-500" />}
                </button>

                {expandedSections.marca && (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {marcas.map(marca => (
                            <label key={marca.id} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center text-xs transition-colors ${filters.marcas?.includes(parseInt(marca.id)) ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                                    {filters.marcas?.includes(parseInt(marca.id)) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={filters.marcas?.includes(parseInt(marca.id))}
                                    onChange={(e) => {
                                        showLoader();
                                        const marcaId = parseInt(marca.id);
                                        const currentMarcas = filters.marcas || [];
                                        const newMarcas = e.target.checked
                                            ? [...currentMarcas, marcaId]
                                            : currentMarcas.filter(id => parseInt(id) !== marcaId);
                                        onFilterChange({ marcas: newMarcas });
                                        setTimeout(hideLoader, 600);
                                    }}
                                    className="hidden"
                                />
                                <span className={`text-xs ${filters.marcas?.includes(parseInt(marca.id)) ? 'font-medium text-gray-900' : 'text-gray-600 group-hover:text-gray-800'}`}>
                                    {marca.nombre}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Atributos Dinámicos (Color, Almacenamiento, RAM, etc.) */}
            {
                atributosDisponibles.map(atributo => (
                    <div key={atributo.nombre} className="mb-8">
                        <button
                            onClick={() => toggleSection(atributo.nombre)}
                            className="w-full flex items-center justify-between mb-4"
                        >
                            <h3 className="font-bold text-gray-900 text-sm">{atributo.nombre}</h3>
                            {expandedSections[atributo.nombre] ? <FaChevronUp className="text-xs text-gray-500" /> : <FaChevronDown className="text-xs text-gray-500" />}
                        </button>

                        {expandedSections[atributo.nombre] && (
                            <>
                                {atributo.nombre.toLowerCase() === 'color' ? (
                                    <div className="grid grid-cols-6 gap-1">
                                        {atributo.valores.map(valor => {
                                            const isSelected = filters.atributos?.[atributo.nombre]?.includes(parseInt(valor.id));
                                            return (
                                                <button
                                                    key={valor.id}
                                                    onClick={() => {
                                                        showLoader();
                                                        const currentAttr = filters.atributos?.[atributo.nombre] || [];
                                                        const valId = parseInt(valor.id);
                                                        const newValues = isSelected
                                                            ? currentAttr.filter(v => v !== valId)
                                                            : [...currentAttr, valId];

                                                        onFilterChange({
                                                            atributos: {
                                                                ...filters.atributos,
                                                                [atributo.nombre]: newValues
                                                            }
                                                        });
                                                        setTimeout(hideLoader, 600);
                                                    }}
                                                    className={`w-6  h-6 rounded-full border-2 transition-all ${isSelected
                                                        ? 'border-orange-500 ring-2 ring-orange-200 scale-110'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    style={{ backgroundColor: valor.color_hex || '#ccc' }}
                                                    title={valor.valor}
                                                />
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* Pill Buttons for Text Attributes (RAM, Storage, etc.) */
                                    <div className="flex flex-wrap gap-2">
                                        {atributo.valores.map(valor => {
                                            const isSelected = filters.atributos?.[atributo.nombre]?.includes(parseInt(valor.id));
                                            return (
                                                <button
                                                    key={valor.id}
                                                    onClick={() => {
                                                        showLoader();
                                                        const currentAttr = filters.atributos?.[atributo.nombre] || [];
                                                        const valId = parseInt(valor.id);
                                                        const newValues = isSelected
                                                            ? currentAttr.filter(v => v !== valId)
                                                            : [...currentAttr, valId];

                                                        onFilterChange({
                                                            atributos: {
                                                                ...filters.atributos,
                                                                [atributo.nombre]: newValues
                                                            }
                                                        });
                                                        setTimeout(hideLoader, 600);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isSelected
                                                        ? 'bg-orange-100 text-orange-500 border-orange-500'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    {valor.valor}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))

            }

            {/* Condición */}
            <div className="mb-8">
                <button
                    onClick={() => toggleSection('condicion')}
                    className="w-full flex items-center justify-between mb-4"
                >
                    <h3 className="font-bold text-gray-900 text-sm">Condición</h3>
                    {expandedSections.condicion ? <FaChevronUp className="text-xs text-gray-500" /> : <FaChevronDown className="text-xs text-gray-500" />}
                </button>

                {expandedSections.condicion && (
                    <div className="space-y-2">
                        {condiciones.length > 0 ? (
                            condiciones.map((cond) => (
                                <label key={cond} className="flex items-center gap-3 text-xs cursor-pointer group">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.condicion?.includes(cond) ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                                        {filters.condicion?.includes(cond) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={filters.condicion?.includes(cond)}
                                        onChange={(e) => {
                                            const currentConditions = filters.condicion || [];
                                            const newConditions = e.target.checked
                                                ? [...currentConditions, cond]
                                                : currentConditions.filter(c => c !== cond);
                                            onFilterChange({ condicion: newConditions });
                                        }}
                                        className="hidden"
                                    />
                                    <span className={`text-xs ${filters.condicion?.includes(cond) ? 'font-medium text-gray-900' : 'text-gray-600 group-hover:text-gray-800'}`}>
                                        {cond}
                                    </span>
                                </label>
                            ))
                        ) : (
                            <p className="text-xs text-gray-400 italic">No hay condiciones disponibles.</p>
                        )}
                    </div>
                )}
            </div>
            <div className="mb-8">
                <button
                    onClick={() => toggleSection('ofertas')}
                    className="w-full flex items-center justify-between mb-4"
                >
                    <h3 className="font-bold text-sm text-gray-900">Ofertas y Estado</h3>
                    {expandedSections.ofertas ? <FaChevronUp className="text-xs text-gray-500" /> : <FaChevronDown className="text-xs text-gray-500" />}
                </button>

                {
                    expandedSections.ofertas && (
                        <div className="space-y-4">
                            {/* Ofertas Flash Toggle */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <span className="text-xs text-gray-700">Ofertas Flash</span>
                                    <Zap className="w-4 h-4 text-orange-500 fill-current" />
                                </label>
                                <button
                                    onClick={() => onFilterChange({ ofertas_flash: !filters.ofertas_flash })}
                                    className={`w-8 h-4 rounded-full transition-colors relative ${filters.ofertas_flash ? 'bg-orange-500' : 'bg-gray-300'}`}
                                >
                                    <span className={`absolute top-1 left-0 bg-white w-2 h-2  rounded-full transition-transform ${filters.ofertas_flash ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {/* Envío Gratis Checkbox */}
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.envio_gratis ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                                    {filters.envio_gratis && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={!!filters.envio_gratis}
                                    onChange={() => onFilterChange({ envio_gratis: !filters.envio_gratis })}
                                    className="hidden"
                                />
                                <span className="text-xs text-gray-700 group-hover:text-gray-900">Envío Gratis</span>
                            </label>
                        </div>
                    )
                }
            </div>

            {/* Calificación */}
            <div className="mb-8">
                <button
                    onClick={() => toggleSection('calificacion')}
                    className="w-full flex items-center justify-between mb-4"
                >
                    <h3 className="font-bold text-gray-900 text-sm">Calificación</h3>
                    {expandedSections.calificacion ? <FaChevronUp className="text-xs text-gray-500" /> : <FaChevronDown className="text-xs text-gray-500" />}
                </button>

                {expandedSections.calificacion && (
                    <div className="space-y-3">
                        {[5, 4, 3, 2].map((stars) => (
                            <label key={stars} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${parseInt(filters.calificacion) === stars ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                                    {parseInt(filters.calificacion) === stars && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <input
                                    type="radio"
                                    name="calificacion"
                                    checked={parseInt(filters.calificacion) === stars}
                                    onChange={() => onFilterChange({ calificacion: stars })}
                                    className="hidden"
                                />
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className={`text-xs ${i < stars ? 'text-yellow-400' : 'text-gray-200'}`} />
                                    ))}
                                    <span className="text-xs text-gray-500 ml-1">& más</span>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Botón limpiar filtros */}
            {
                (filters.categoria_id || filters.marcas?.length > 0 || filters.precio_min || filters.precio_max || (filters.atributos && Object.keys(filters.atributos).length > 0) || filters.ofertas_flash || filters.envio_gratis || filters.calificacion) && (
                    <button
                        onClick={() => {
                            showLoader();
                            onFilterChange({
                                categoria_id: null,
                                marcas: [],
                                precio_min: '',
                                precio_max: '',
                                atributos: {},
                                condicion: null,
                                ofertas_flash: false,
                                envio_gratis: false,
                                calificacion: null
                            });
                            setTimeout(hideLoader, 600);
                        }}
                        className="w-full py-3 mt-4 text-sm bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Limpiar Filtros
                    </button>
                )
            }
        </div >
    );
};

export default ProductFilters;
