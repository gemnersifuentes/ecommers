import { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaSearch, FaTimes, FaSortAmountDown, FaFilter, FaStar, FaCheck } from 'react-icons/fa';
import { Zap } from 'lucide-react';
import { useLoader } from '../../context/LoaderContext';

const MobileProductFilters = ({
    filters,
    onFilterChange,
    totalResultados = 0,
    marcas = [],
    condiciones = [],
    categorias = [],
    atributosDisponibles = [],
    ordenamiento,
    setOrdenamiento
}) => {
    // Estado para controlar qué modal está abierto
    const [activeModal, setActiveModal] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { showLoader, hideLoader } = useLoader(); // Para búsqueda de marcas

    // Estado para secciones expandibles (Igual que Desktop)
    const [expandedSections, setExpandedSections] = useState({
        ordenar: true,
        categoria: true,
        precio: true,
        marca: true,
        condicion: true,
        ofertas: true,
        calificacion: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (activeModal) {
            document.body.classList.add('overflow-hidden');
            document.documentElement.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
            document.documentElement.classList.remove('overflow-hidden');
        }

        // Cleanup
        return () => {
            document.body.classList.remove('overflow-hidden');
            document.documentElement.classList.remove('overflow-hidden');
        };
    }, [activeModal]);


    // Cerrar modal
    const closeModal = () => {
        setActiveModal(null);
        setSearchTerm('');
    };

    // Helper para verificar si hay filtros activos
    const getActiveCount = () => {
        let count = 0;
        if (filters.categoria_id) count++;
        if (filters.marcas?.length > 0) count += filters.marcas.length;
        if (filters.precio_min || filters.precio_max) count++;
        if (filters.condicion?.length > 0) count += filters.condicion.length;
        if (filters.ofertas_flash) count++;
        if (filters.envio_gratis) count++;
        if (filters.calificacion) count++;
        if (filters.atributos) {
            Object.values(filters.atributos).forEach(arr => count += arr.length);
        }
        return count;
    };

    // ==========================================
    // RENDERIZADO DE MODALES
    // ==========================================

    // 1. MODAL DE ORDENAMIENTO
    const renderSortModal = () => (
        <>
            {/* Backdrop z-55: Encima del Header (z-50) */}
            <div className="fixed inset-0 z-[55] bg-black/60 transition-opacity touch-none" onClick={closeModal} />

            {/* Modal z-60: Encima del Header */}
            <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
                <div className="bg-white w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6 pointer-events-auto shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3 shrink-0">
                        <h3 className="font-bold text-sm text-gray-900">Ordenar por</h3>
                        <button onClick={closeModal} className="p-2 -mr-2 text-gray-400 hover:text-gray-600">
                            <FaTimes size={16} />
                        </button>
                    </div>

                    <div className="space-y-2 overflow-y-auto flex-1 hide-scrollbar-mobile">
                        {[
                            { label: 'Recomendados', value: 'recomendados' },
                            { label: 'Precio: Menor a Mayor', value: 'precio_asc' },
                            { label: 'Precio: Mayor a Menor', value: 'precio_desc' },
                            { label: 'Más Vendidos', value: 'mas_vendidos' },
                            { label: 'Mejor Calificados', value: 'mejor_calificados' },
                            { label: 'Nombre: A-Z', value: 'nombre_asc' },
                            { label: 'Nombre: Z-A', value: 'nombre_desc' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    showLoader();
                                    setOrdenamiento(option.value);
                                    closeModal();
                                    setTimeout(hideLoader, 600);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all text-xs ${ordenamiento === option.value
                                    ? 'bg-orange-50 text-orange-700 font-bold border-orange-100 border'
                                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                                    }`}
                            >
                                {option.label}
                                {ordenamiento === option.value && <FaCheck size={16} className="text-orange-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );

    // 2. MODAL DE MARCAS
    const renderBrandModal = () => {
        const marcasFiltradas = marcas.filter(m =>
            m.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <>
                <div className="fixed inset-0 z-[40] bg-black/60 transition-opacity touch-none" onClick={closeModal} />
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
                    <div className="bg-white w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6 pointer-events-auto max-h-[65vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h3 className="font-bold text-sm text-gray-900">Marca</h3>
                            <button onClick={closeModal} className="p-2 -mr-2 text-gray-400 hover:text-gray-600"><FaTimes size={16} /></button>
                        </div>

                        <div className="relative mb-4 shrink-0">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar marca..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl text-xs border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all focus:outline-none placeholder-gray-400"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-1 p-1 -mx-2 px-2 hide-scrollbar-mobile">
                            {marcasFiltradas.length > 0 ? (
                                marcasFiltradas.map(marca => (
                                    <label key={marca.id} className="flex items-center gap-4 py-3 px-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${filters.marcas?.includes(parseInt(marca.id)) ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                                            {filters.marcas?.includes(parseInt(marca.id)) && <FaCheck className="text-white text-[10px] scale-90" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={filters.marcas?.includes(parseInt(marca.id))}
                                            onChange={(e) => {
                                                const marcaId = parseInt(marca.id);
                                                const currentMarcas = filters.marcas || [];
                                                const newMarcas = e.target.checked
                                                    ? [...currentMarcas, marcaId]
                                                    : currentMarcas.filter(id => parseInt(id) !== marcaId);
                                                onFilterChange({ marcas: newMarcas });
                                            }}
                                            className="hidden"
                                        />
                                        <span className={`text-xs flex-1 ${filters.marcas?.includes(parseInt(marca.id)) ? 'font-medium text-orange-900' : 'text-gray-600'}`}>
                                            {marca.nombre}
                                        </span>
                                    </label>
                                ))
                            ) : (
                                <div className="py-10 text-center text-gray-400 flex flex-col items-center">
                                    <FaSearch size={30} className="mb-2 opacity-20" />
                                    <p>No se encontraron marcas</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3 shrink-0">
                            <button
                                onClick={() => onFilterChange({ marcas: [] })}
                                className="px-4 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                Limpiar
                            </button>
                            <button
                                onClick={() => { showLoader(); closeModal(); setTimeout(hideLoader, 600); }}
                                className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-transform active:scale-95"
                            >
                                Aplicar ({filters.marcas?.length || 0})
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // 3. MODAL DE ATRIBUTOS
    const renderAttributeModal = (attrName) => {
        const atributo = atributosDisponibles.find(a => a.nombre === attrName);
        if (!atributo) return null;

        return (
            <>
                <div className="fixed inset-0 z-[40] bg-black/60 transition-opacity touch-none" onClick={closeModal} />
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
                    <div className="bg-white w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6 pointer-events-auto max-h-[65vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4 shrink-0">
                            <h3 className="font-bold text-sm text-gray-900">{attrName}</h3>
                            <button onClick={closeModal} className="p-2 -mr-2 text-gray-400 hover:text-gray-600">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-1 p-1 -mx-2 px-2 hide-scrollbar-mobile">
                            {atributo.valores.map(valor => {
                                const isSelected = filters.atributos?.[attrName]?.includes(parseInt(valor.id));
                                return (
                                    <label key={valor.id} className="flex items-center gap-4 py-3 px-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                                            {isSelected && <FaCheck className="text-white text-[10px] scale-90" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isSelected}
                                            onChange={() => {
                                                const currentAttr = filters.atributos?.[attrName] || [];
                                                const valId = parseInt(valor.id);
                                                const newValues = isSelected
                                                    ? currentAttr.filter(v => v !== valId)
                                                    : [...currentAttr, valId];

                                                onFilterChange({
                                                    atributos: {
                                                        ...filters.atributos,
                                                        [attrName]: newValues
                                                    }
                                                });
                                            }}
                                        />
                                        {attrName.toLowerCase() === 'color' && valor.color_hex && (
                                            <span className="w-6 h-6 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: valor.color_hex }}></span>
                                        )}
                                        <span className={`text-xs flex-1 ${isSelected ? 'font-medium text-orange-900' : 'text-gray-600'}`}>
                                            {valor.valor}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 shrink-0">
                            <button
                                onClick={() => { showLoader(); closeModal(); setTimeout(hideLoader, 600); }}
                                className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-transform active:scale-95"
                            >
                                Aplicar filtros
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // 4. MODAL DE CATEGORÍAS
    const renderCategoryModal = () => (
        <>
            <div className="fixed inset-0 z-[55] bg-black/60 transition-opacity touch-none" onClick={closeModal} />
            <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
                <div className="bg-white w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6 pointer-events-auto max-h-[65vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4 shrink-0">
                        <h3 className="font-bold text-sm text-gray-900">Categoría</h3>
                        <button onClick={closeModal} className="p-2 -mr-2 text-gray-400 hover:text-gray-600">
                            <FaTimes size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1 p-1 -mx-2 px-2 hide-scrollbar-mobile">
                        {/* Opción "Todas" */}
                        <button
                            onClick={() => {
                                showLoader();
                                onFilterChange({ categoria_id: null });
                                closeModal();
                                setTimeout(hideLoader, 600);
                            }}
                            className={`w-full flex items-center gap-4 py-3 px-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${!filters.categoria_id ? 'bg-orange-50' : ''}`}
                        >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${!filters.categoria_id ? 'border-orange-500' : 'border-gray-300 bg-white'}`}>
                                {!filters.categoria_id && <div className="w-3 h-3 rounded-full bg-orange-500" />}
                            </div>
                            <span className={`text-xs flex-1 text-left ${!filters.categoria_id ? 'font-bold text-orange-700' : 'text-gray-700'}`}>
                                Todas las categorías
                            </span>
                        </button>

                        {categorias.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    onFilterChange({ categoria_id: parseInt(cat.id) });
                                    closeModal();
                                }}
                                className={`w-full flex items-center gap-4 py-3 px-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${filters.categoria_id === parseInt(cat.id) ? 'bg-orange-50' : ''}`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${filters.categoria_id === parseInt(cat.id) ? 'border-orange-500' : 'border-gray-300 bg-white'}`}>
                                    {filters.categoria_id === parseInt(cat.id) && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                                </div>
                                <span className={`text-xs flex-1 text-left ${filters.categoria_id === parseInt(cat.id) ? 'font-bold text-orange-700' : 'text-gray-700'}`}>
                                    {cat.nombre}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );

    // 5. MODAL PRINCIPAL (SIDEBAR LATERAL)
    const renderMainFilterModal = () => (
        <>
            {/* Backdrop z-55: Encima del Header. */}
            <div className="fixed inset-0 z-[55] bg-black/60 transition-opacity touch-none" onClick={closeModal} />

            {/* Sidebar z-60: Encima del Header, DESDE LA DERECHA */}
            <div className="fixed inset-0 z-[60] flex justify-end pointer-events-none overflow-hidden overscroll-none">
                <div className="bg-white w-[85vw] sm:w-[400px] h-[100dvh] flex flex-col pointer-events-auto shadow-2xl animate-in slide-in-from-right duration-300 border-l border-gray-100">
                    <div className="p-4 border-b flex justify-between items-center bg-white z-10 shrink-0">
                        <h2 className="text-sm font-bold text-gray-900">Filtrar por</h2>
                        <button onClick={closeModal} className="p-2 -mr-2 text-gray-400 hover:text-gray-600"><FaTimes size={16} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar-mobile pb-20">
                        {/* 1. Ordenar */}
                        <div className="border-b border-gray-100 pb-4">
                            <button onClick={() => toggleSection('ordenar')} className="w-full flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-900 text-xs">Ordenar por</h3>
                                {expandedSections.ordenar ? <FaChevronUp className="text-[10px] text-gray-500" /> : <FaChevronDown className="text-[10px] text-gray-500" />}
                            </button>
                            {expandedSections.ordenar && (
                                <div className="space-y-2">
                                    {[
                                        { label: 'Recomendados', value: 'recomendados' },
                                        { label: 'Precio: Menor a Mayor', value: 'precio_asc' },
                                        { label: 'Precio: Mayor a Menor', value: 'precio_desc' },
                                        { label: 'Más Vendidos', value: 'mas_vendidos' }
                                    ].map((option) => (
                                        <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${ordenamiento === option.value ? 'border-orange-500' : 'border-gray-300'}`}>
                                                {ordenamiento === option.value && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                                            </div>
                                            <input
                                                type="radio"
                                                name="ordenamiento_mobile"
                                                checked={ordenamiento === option.value}
                                                onChange={() => setOrdenamiento(option.value)}
                                                className="hidden"
                                            />
                                            <span className={`text-xs ${ordenamiento === option.value ? 'font-bold text-orange-700' : 'text-gray-600'}`}>{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 2. Categorías */}
                        <div className="border-b border-gray-100 pb-4">
                            <button onClick={() => toggleSection('categoria')} className="w-full flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-900 text-xs">Categorías</h3>
                                {expandedSections.categoria ? <FaChevronUp className="text-[10px] text-gray-500" /> : <FaChevronDown className="text-[10px] text-gray-500" />}
                            </button>
                            {expandedSections.categoria && (
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${!filters.categoria_id ? 'border-orange-500' : 'border-gray-300'}`}>
                                            {!filters.categoria_id && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                                        </div>
                                        <input type="radio" checked={!filters.categoria_id} onChange={() => onFilterChange({ categoria_id: null })} className="hidden" />
                                        <span className={`text-xs ${!filters.categoria_id ? 'font-bold text-orange-500' : 'text-gray-600'}`}>Todo</span>
                                    </label>
                                    {categorias.map(categoria => (
                                        <label key={categoria.id} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${filters.categoria_id === parseInt(categoria.id) ? 'border-orange-500' : 'border-gray-300'}`}>
                                                {filters.categoria_id === parseInt(categoria.id) && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                                            </div>
                                            <input type="radio" checked={filters.categoria_id === parseInt(categoria.id)} onChange={() => onFilterChange({ categoria_id: parseInt(categoria.id) })} className="hidden" />
                                            <span className={`text-xs ${filters.categoria_id === parseInt(categoria.id) ? 'font-bold text-orange-500' : 'text-gray-600'}`}>{categoria.nombre}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 3. Precio */}
                        <div className="border-b border-gray-100 pb-4">
                            <button onClick={() => toggleSection('precio')} className="w-full flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-900 text-xs">Precio</h3>
                                {expandedSections.precio ? <FaChevronUp className="text-[10px] text-gray-500" /> : <FaChevronDown className="text-[10px] text-gray-500" />}
                            </button>
                            {expandedSections.precio && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={filters.precio_min}
                                                onChange={e => onFilterChange({ precio_min: e.target.value })}
                                                className="w-full pl-6 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:border-orange-500 focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                        <span className="text-gray-400">-</span>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={filters.precio_max}
                                                onChange={e => onFilterChange({ precio_max: e.target.value })}
                                                className="w-full pl-6 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:border-orange-500 focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['< $100', '< $500', '< $1000'].map((tag, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => onFilterChange({ precio_min: '', precio_max: tag.replace(/\D/g, '') })}
                                                className="px-3 py-1.5 text-[10px] bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. Marcas */}
                        <div className="border-b border-gray-100 pb-4">
                            <button onClick={() => toggleSection('marca')} className="w-full flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-900 text-xs">Marcas</h3>
                                {expandedSections.marca ? <FaChevronUp className="text-[10px] text-gray-500" /> : <FaChevronDown className="text-[10px] text-gray-500" />}
                            </button>
                            {expandedSections.marca && (
                                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                                    {marcas.map(marca => (
                                        <label key={marca.id} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.marcas?.includes(parseInt(marca.id)) ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                                                {filters.marcas?.includes(parseInt(marca.id)) && <FaCheck className="text-white text-[10px]" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={filters.marcas?.includes(parseInt(marca.id))}
                                                onChange={(e) => {
                                                    const marcaId = parseInt(marca.id);
                                                    const currentMarcas = filters.marcas || [];
                                                    const newMarcas = e.target.checked ? [...currentMarcas, marcaId] : currentMarcas.filter(id => parseInt(id) !== marcaId);
                                                    onFilterChange({ marcas: newMarcas });
                                                }}
                                                className="hidden"
                                            />
                                            <span className={`text-xs ${filters.marcas?.includes(parseInt(marca.id)) ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{marca.nombre}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 5. Atributos Dinámicos */}
                        {atributosDisponibles.map(atributo => (
                            <div key={atributo.nombre} className="border-b border-gray-100 pb-4">
                                <button onClick={() => toggleSection(atributo.nombre)} className="w-full flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-gray-900 text-xs">{atributo.nombre}</h3>
                                    {expandedSections[atributo.nombre] ? <FaChevronUp className="text-[10px] text-gray-500" /> : <FaChevronDown className="text-[10px] text-gray-500" />}
                                </button>
                                {expandedSections[atributo.nombre] && (
                                    <>
                                        {atributo.nombre.toLowerCase() === 'color' ? (
                                            <div className="grid grid-cols-6 gap-2">
                                                {atributo.valores.map(valor => {
                                                    const isSelected = filters.atributos?.[atributo.nombre]?.includes(parseInt(valor.id));
                                                    return (
                                                        <button
                                                            key={valor.id}
                                                            onClick={() => {
                                                                const currentAttr = filters.atributos?.[atributo.nombre] || [];
                                                                const valId = parseInt(valor.id);
                                                                const newValues = isSelected ? currentAttr.filter(v => v !== valId) : [...currentAttr, valId];
                                                                onFilterChange({ atributos: { ...filters.atributos, [atributo.nombre]: newValues } });
                                                            }}
                                                            className={`w-8 h-8 rounded-full border-2 transition-all ${isSelected ? 'border-orange-500 ring-2 ring-orange-200 scale-110' : 'border-gray-200'}`}
                                                            style={{ backgroundColor: valor.color_hex || '#ccc' }}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {atributo.valores.map(valor => {
                                                    const isSelected = filters.atributos?.[atributo.nombre]?.includes(parseInt(valor.id));
                                                    return (
                                                        <button
                                                            key={valor.id}
                                                            onClick={() => {
                                                                const currentAttr = filters.atributos?.[atributo.nombre] || [];
                                                                const valId = parseInt(valor.id);
                                                                const newValues = isSelected ? currentAttr.filter(v => v !== valId) : [...currentAttr, valId];
                                                                onFilterChange({ atributos: { ...filters.atributos, [atributo.nombre]: newValues } });
                                                            }}
                                                            className={`px-3 py-1.5 rounded-full text-[10px] font-medium border transition-all ${isSelected ? 'bg-orange-100 text-orange-700 border-orange-500' : 'bg-white text-gray-700 border-gray-200'}`}
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
                        ))}

                        {/* 6. Condición */}
                        <div className="border-b border-gray-100 pb-4">
                            <button onClick={() => toggleSection('condicion')} className="w-full flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-900 text-xs">Condición</h3>
                                {expandedSections.condicion ? <FaChevronUp className="text-[10px] text-gray-500" /> : <FaChevronDown className="text-[10px] text-gray-500" />}
                            </button>
                            {expandedSections.condicion && (
                                <div className="space-y-2">
                                    {condiciones.map((cond) => (
                                        <label key={cond} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.condicion?.includes(cond) ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                                                {filters.condicion?.includes(cond) && <FaCheck className="text-white text-[10px]" />}
                                            </div>
                                            <input type="checkbox" checked={filters.condicion?.includes(cond)} onChange={(e) => {
                                                const currentConditions = filters.condicion || [];
                                                const newConditions = e.target.checked ? [...currentConditions, cond] : currentConditions.filter(c => c !== cond);
                                                onFilterChange({ condicion: newConditions });
                                            }} className="hidden" />
                                            <span className={`text-xs ${filters.condicion?.includes(cond) ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{cond}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 7. Ofertas */}
                        <div className="border-b border-gray-100 pb-4">
                            <button onClick={() => toggleSection('ofertas')} className="w-full flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-900 text-xs">Ofertas</h3>
                                {expandedSections.ofertas ? <FaChevronUp className="text-[10px] text-gray-500" /> : <FaChevronDown className="text-[10px] text-gray-500" />}
                            </button>
                            {expandedSections.ofertas && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-700 flex items-center gap-2">Ofertas Flash <Zap className="w-4 h-4 text-orange-500 fill-current" /></span>
                                        <button onClick={() => onFilterChange({ ofertas_flash: !filters.ofertas_flash })} className={`w-10 h-5 rounded-full relative transition-colors ${filters.ofertas_flash ? 'bg-orange-500' : 'bg-gray-300'}`}>
                                            <span className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${filters.ofertas_flash ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.envio_gratis ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                                            {filters.envio_gratis && <FaCheck className="text-white text-[10px]" />}
                                        </div>
                                        <input type="checkbox" checked={!!filters.envio_gratis} onChange={() => onFilterChange({ envio_gratis: !filters.envio_gratis })} className="hidden" />
                                        <span className="text-xs text-gray-700">Envío Gratis</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t flex justify-between gap-4 bg-white z-10 pb-6 shrink-0 inset-x-0 bottom-0">
                        <button
                            className="px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors text-sm"
                            onClick={() => onFilterChange({ categoria_id: null, marcas: [], precio_min: '', precio_max: '', atributos: {}, ofertas_flash: false, envio_gratis: false })}
                        >
                            Limpiar todo
                        </button>
                        <button onClick={() => { showLoader(); closeModal(); setTimeout(hideLoader, 600); }} className="bg-orange-500 text-white px-6 py-3 rounded-xl flex-1 font-bold text-xs shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-transform active:scale-95">
                            Ver resultados
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="w-full mb-4">
            {/* Scroll Container */}
            <div className="flex gap-3 overflow-x-auto pb-4 px-1 custom-scrollbar hide-scrollbar-mobile items-center">

                {/* Botón Principal */}
                <button
                    onClick={() => setActiveModal('main')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 rounded-full text-xs text-white whitespace-nowrap shadow-md active:scale-95 transition-transform shrink-0 font-medium"
                >
                    <FaFilter size={12} />
                    <span>Filtros</span>
                    {getActiveCount() > 0 && (
                        <span className="bg-white text-orange-500 text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                            {getActiveCount()}
                        </span>
                    )}
                </button>

                {/* Categoría Chip (New) */}
                <button
                    onClick={() => setActiveModal('categoria')}
                    className={`flex items-center gap-2 px-4 py-2.5 border rounded-full text-xs whitespace-nowrap shadow-sm hover:bg-gray-50 transition-colors shrink-0 ${filters.categoria_id ? 'bg-orange-50 border-orange-200 text-orange-700 font-bold' : 'bg-white border-gray-200 text-gray-700 font-medium'
                        }`}
                >
                    <span>Categoría</span>
                    <FaChevronDown size={10} className="text-gray-400" />
                </button>

                {/* Ordenar Chip */}
                <button
                    onClick={() => setActiveModal('sort')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 font-medium whitespace-nowrap shadow-sm hover:bg-gray-50 transition-colors shrink-0"
                >
                    <span>Ordenar</span>
                    <FaSortAmountDown size={12} className="text-gray-400" />
                </button>

                {/* Marca Chip */}
                <button
                    onClick={() => setActiveModal('marca')}
                    className={`flex items-center gap-2 px-4 py-2.5 border rounded-full text-xs whitespace-nowrap shadow-sm hover:bg-gray-50 transition-colors shrink-0 ${filters.marcas?.length > 0 ? 'bg-orange-50 border-orange-200 text-orange-700 font-bold' : 'bg-white border-gray-200 text-gray-700 font-medium'
                        }`}
                >
                    <span>Marca</span>
                    {filters.marcas?.length > 0 && <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{filters.marcas.length}</span>}
                    <FaChevronDown size={10} className="text-gray-400" />
                </button>

                {/* Chips Atributos */}
                {atributosDisponibles.map(attr => {
                    const hasSelection = filters.atributos?.[attr.nombre]?.length > 0;
                    return (
                        <button
                            key={attr.nombre}
                            onClick={() => setActiveModal(`atributo_${attr.nombre}`)}
                            className={`flex items-center gap-2 px-4 py-2.5 border rounded-full text-xs whitespace-nowrap shadow-sm hover:bg-gray-50 transition-colors shrink-0 ${hasSelection ? 'bg-orange-50 border-orange-200 text-orange-700 font-bold' : 'bg-white border-gray-200 text-gray-700 font-medium'
                                }`}
                        >
                            <span>{attr.nombre}</span>
                            <FaChevronDown size={10} className="text-gray-400" />
                        </button>
                    );
                })}

                <div className="w-px h-6 bg-gray-200 mx-1 shrink-0"></div>

                {/* Booleans */}
                <button
                    onClick={() => onFilterChange({ envio_gratis: !filters.envio_gratis })}
                    className={`px-4 py-2.5 border rounded-full text-xs whitespace-nowrap shadow-sm font-medium transition-all shrink-0 ${filters.envio_gratis ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Envío Gratis
                </button>
                <button
                    onClick={() => onFilterChange({ ofertas_flash: !filters.ofertas_flash })}
                    className={`px-4 py-2.5 border rounded-full text-xs whitespace-nowrap shadow-sm font-medium transition-all shrink-0 ${filters.ofertas_flash ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Ofertas Flash
                </button>

            </div>

            {/* MODALES ACTIVOS */}
            {activeModal === 'main' && renderMainFilterModal()}
            {activeModal === 'sort' && renderSortModal()}
            {activeModal === 'categoria' && renderCategoryModal()}
            {activeModal === 'marca' && renderBrandModal()}
            {activeModal && activeModal.startsWith('atributo_') && renderAttributeModal(activeModal.replace('atributo_', ''))}

        </div>
    );
};

export default MobileProductFilters;
