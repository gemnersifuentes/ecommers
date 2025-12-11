import { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaStar } from 'react-icons/fa';
import { Zap } from 'lucide-react';
import { marcasService } from '../../services';

const ProductFilters = ({ filters, onFilterChange, totalResultados = 0 }) => {
    const [marcas, setMarcas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [atributosDisponibles, setAtributosDisponibles] = useState([]);
    const [expandedSections, setExpandedSections] = useState({
        categoria: true,
        marca: true,
        precio: true,
        condicion: true
    });

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

    // Cargar filtros cuando cambia la categoría
    useEffect(() => {
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
        loadCategorias();
    }, []);

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
            {/* Categorías */}
            <div className="mb-8">
                <button
                    onClick={() => toggleSection('categoria')}
                    className="w-full flex items-center justify-between mb-4"
                >
                    <h3 className="font-bold text-gray-900 text-lg">Categorías</h3>
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
                                onChange={() => onFilterChange({ categoria_id: null })}
                                className="hidden"
                            />
                            <span className={`text-sm ${!filters.categoria_id ? 'font-bold text-orange-500' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                Todo
                            </span>
                        </label>

                        {/* Lista de categorías */}
                        {categorias.map(categoria => (
                            <label key={categoria.id} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${filters.categoria_id === categoria.id ? 'border-orange-500' : 'border-gray-300 group-hover:border-orange-400'}`}>
                                    {filters.categoria_id === categoria.id && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                                </div>
                                <input
                                    type="radio"
                                    name="categoria"
                                    checked={filters.categoria_id === categoria.id}
                                    onChange={() => onFilterChange({ categoria_id: categoria.id })}
                                    className="hidden"
                                />
                                <span className={`text-sm ${filters.categoria_id === categoria.id ? 'font-bold text-orange-500' : 'text-gray-600 group-hover:text-gray-900'}`}>
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
                    <h3 className="font-bold text-gray-900 text-lg">Precio</h3>
                    {expandedSections.precio ? <FaChevronUp className="text-xs text-gray-500" /> : <FaChevronDown className="text-xs text-gray-500" />}
                </button>

                {expandedSections.precio && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={filters.precio_min || ''}
                                    onChange={(e) => onFilterChange({ precio_min: e.target.value })}
                                    className="w-full pl-6 pr-3 py-2 bg-gray-800 text-white rounded text-sm border-none focus:ring-1 focus:ring-gray-600 placeholder-gray-500"
                                />
                            </div>
                            <span className="text-gray-400">-</span>
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                <input
                                    type="number"
                                    placeholder="3000"
                                    value={filters.precio_max || ''}
                                    onChange={(e) => onFilterChange({ precio_max: e.target.value })}
                                    className="w-full pl-6 pr-3 py-2 bg-gray-800 text-white rounded text-sm border-none focus:ring-1 focus:ring-gray-600 placeholder-gray-500"
                                />
                            </div>
                        </div>
                        {/* Tags de rango rápido */}
                        <div className="flex flex-wrap gap-2">
                            {['< $100', '< $500', '< $1000'].map((tag, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        const max = tag.replace(/\D/g, '');
                                        onFilterChange({ precio_min: '', precio_max: max });
                                    }}
                                    className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded hover:bg-gray-200 transition-colors"
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
                    className="w-full flex items-center justify-between mb-4"
                >
                    <h3 className="font-bold text-gray-900 text-lg">Marcas</h3>
                    {expandedSections.marca ? <FaChevronUp className="text-xs text-gray-500" /> : <FaChevronDown className="text-xs text-gray-500" />}
                </button>

                {expandedSections.marca && (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {marcas.map(marca => (
                            <label key={marca.id} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.marcas?.includes(marca.id) ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                                    {filters.marcas?.includes(marca.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={filters.marcas?.includes(marca.id)}
                                    onChange={(e) => {
                                        const newMarcas = e.target.checked
                                            ? [...(filters.marcas || []), marca.id]
                                            : (filters.marcas || []).filter(id => id !== marca.id);
                                        onFilterChange({ marcas: newMarcas });
                                    }}
                                    className="hidden"
                                />
                                <span className={`text-sm ${filters.marcas?.includes(marca.id) ? 'font-medium text-gray-900' : 'text-gray-600 group-hover:text-gray-800'}`}>
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
                            <h3 className="font-bold text-gray-900 text-lg">{atributo.nombre}</h3>
                            {expandedSections[atributo.nombre] ? <FaChevronUp className="text-xs text-gray-500" /> : <FaChevronDown className="text-xs text-gray-500" />}
                        </button>

                        {expandedSections[atributo.nombre] && (
                            <>
                                {atributo.nombre.toLowerCase() === 'color' ? (
                                    <div className="grid grid-cols-5 gap-2">
                                        {atributo.valores.map(valor => {
                                            const isSelected = filters.atributos?.[atributo.nombre]?.includes(valor.id);
                                            return (
                                                <button
                                                    key={valor.id}
                                                    onClick={() => {
                                                        const currentAttr = filters.atributos?.[atributo.nombre] || [];
                                                        const newValues = isSelected
                                                            ? currentAttr.filter(v => v !== valor.id)
                                                            : [...currentAttr, valor.id];

                                                        onFilterChange({
                                                            atributos: {
                                                                ...filters.atributos,
                                                                [atributo.nombre]: newValues
                                                            }
                                                        });
                                                    }}
                                                    className={`w-8 h-8 rounded-full border-2 transition-all ${isSelected
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
                                            const isSelected = filters.atributos?.[atributo.nombre]?.includes(valor.id);
                                            return (
                                                <button
                                                    key={valor.id}
                                                    onClick={() => {
                                                        const currentAttr = filters.atributos?.[atributo.nombre] || [];
                                                        const newValues = isSelected
                                                            ? currentAttr.filter(v => v !== valor.id)
                                                            : [...currentAttr, valor.id];

                                                        onFilterChange({
                                                            atributos: {
                                                                ...filters.atributos,
                                                                [atributo.nombre]: newValues
                                                            }
                                                        });
                                                    }}
                                                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${isSelected
                                                        ? 'bg-gray-900 text-white border-gray-900'
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
                    <h3 className="font-bold text-gray-900 text-lg">Condición</h3>
                    {expandedSections.condicion ? <FaChevronUp className="text-xs text-gray-500" /> : <FaChevronDown className="text-xs text-gray-500" />}
                </button>

                {expandedSections.condicion && (
                    <div className="space-y-2">
                        {['Nuevo', 'Reacondicionado', 'Open Box'].map((cond) => (
                            <label key={cond} className="flex items-center gap-3 cursor-pointer group">
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
                                <span className={`text-sm ${filters.condicion?.includes(cond) ? 'font-medium text-gray-900' : 'text-gray-600 group-hover:text-gray-800'}`}>
                                    {cond}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
            <div className="mb-8">
                <button
                    onClick={() => toggleSection('ofertas')}
                    className="w-full flex items-center justify-between mb-4"
                >
                    <h3 className="font-bold text-gray-900 text-lg">Ofertas y Estado</h3>
                    {expandedSections.ofertas ? <FaChevronUp className="text-xs text-gray-500" /> : <FaChevronDown className="text-xs text-gray-500" />}
                </button>

                {
                    expandedSections.ofertas && (
                        <div className="space-y-4">
                            {/* Ofertas Flash Toggle */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <span className="text-sm text-gray-700">Ofertas Flash</span>
                                    <Zap className="w-4 h-4 text-orange-500 fill-current" />
                                </label>
                                <button
                                    onClick={() => onFilterChange({ ofertas_flash: !filters.ofertas_flash })}
                                    className={`w-11 h-6 rounded-full transition-colors relative ${filters.ofertas_flash ? 'bg-orange-500' : 'bg-gray-300'}`}
                                >
                                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${filters.ofertas_flash ? 'translate-x-5' : 'translate-x-0'}`} />
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
                                <span className="text-sm text-gray-700 group-hover:text-gray-900">Envío Gratis</span>
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
                    <h3 className="font-bold text-gray-900 text-lg">Calificación</h3>
                    {expandedSections.calificacion ? <FaChevronUp className="text-xs text-gray-500" /> : <FaChevronDown className="text-xs text-gray-500" />}
                </button>

                {expandedSections.calificacion && (
                    <div className="space-y-3">
                        {[5, 4, 3, 2].map((stars) => (
                            <label key={stars} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.calificacion === stars ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                                    {filters.calificacion === stars && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <input
                                    type="radio"
                                    name="calificacion"
                                    checked={filters.calificacion === stars}
                                    onChange={() => onFilterChange({ calificacion: stars })}
                                    className="hidden"
                                />
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className={`text-sm ${i < stars ? 'text-yellow-400' : 'text-gray-200'}`} />
                                    ))}
                                    <span className="text-sm text-gray-500 ml-1">& Más</span>
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
                        onClick={() => onFilterChange({
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
