import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Search,
    Plus,
    Minus,
    Package,
    CheckCircle2,
    Layers,
    ShoppingCart,
    Filter
} from 'lucide-react';

const BulkAddModal = ({ isOpen, onClose, productos, onAdd, categorias = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [quantities, setQuantities] = useState({}); // { uniqueId: quantity }

    const filteredItems = useMemo(() => {
        const results = [];
        productos.forEach(prod => {
            if (selectedCategory !== 'Todas' && prod.categoria_nombre !== selectedCategory) return;

            const matchesSearch = prod.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (prod.sku && prod.sku.toLowerCase().includes(searchTerm.toLowerCase()));

            if (matchesSearch) {
                results.push({
                    ...prod,
                    uniqueId: `p-${prod.id}`,
                    displayName: prod.nombre,
                    isVariant: false,
                    parentProd: prod
                });
            }

            if (prod.variaciones && prod.variaciones.length > 0) {
                prod.variaciones.forEach(v => {
                    const variantMatches = matchesSearch ||
                        (v.atributo && v.atributo.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (v.sku && v.sku.toLowerCase().includes(searchTerm.toLowerCase()));

                    if (variantMatches) {
                        results.push({
                            ...v,
                            uniqueId: `v-${v.id}`,
                            displayName: `${prod.nombre} - ${v.atributo}`,
                            isVariant: true,
                            parentProd: prod
                        });
                    }
                });
            }
        });
        return results;
    }, [productos, searchTerm, selectedCategory]);

    const handleQuantityChange = (uniqueId, value) => {
        const qty = parseInt(value) || 0;
        setQuantities(prev => ({
            ...prev,
            [uniqueId]: Math.max(0, qty)
        }));
    };

    const handleConfirm = () => {
        const itemsToAdd = [];
        filteredItems.forEach(item => {
            const qty = quantities[item.uniqueId];
            if (qty > 0) {
                itemsToAdd.push({
                    item: item,
                    variant: item.isVariant ? item : null,
                    parent: item.parentProd,
                    cantidad: qty
                });
            }
        });

        if (itemsToAdd.length > 0) {
            onAdd(itemsToAdd);
            setQuantities({});
            onClose();
        }
    };

    const totalSelected = Object.values(quantities).reduce((acc, curr) => acc + curr, 0);
    const itemsCount = Object.values(quantities).filter(q => q > 0).length;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-2 md:p-6 bg-black/70 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="bg-white dark:bg-[#111c44] w-full max-w-[96vw] xl:max-w-7xl h-[94vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/10"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                <Plus className="text-orange-500" size={20} />
                                Carga Masiva de Productos
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">Selecciona múltiples artículos y define cantidades rápidamente</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Filters Bar */}
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#111c44] flex flex-col gap-6">
                        {/* Search Row */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search size={20} className="text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar por nombre, SKU o atributo del producto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#0b1437] border-2 border-gray-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all dark:text-white placeholder:text-gray-400 placeholder:font-medium"
                            />
                        </div>

                        {/* Categories Row */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Filter size={14} className="text-gray-400" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Filtrar por Categoría</span>
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                                {['Todas', ...new Set(productos.map(p => p.categoria_nombre))].filter(Boolean).map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border-2 ${selectedCategory === cat
                                            ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30'
                                            : 'bg-white dark:bg-[#0b1437] border-gray-100 dark:border-white/5 text-gray-500 hover:border-orange-200 dark:hover:border-orange-500/30'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content Table */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 main-scrollbar bg-gray-50/30 dark:bg-black/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                            {filteredItems.map(item => {
                                const isSelected = (quantities[item.uniqueId] || 0) > 0;
                                return (
                                    <div
                                        key={item.uniqueId}
                                        onClick={() => !isSelected && handleQuantityChange(item.uniqueId, 1)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer group ${isSelected
                                            ? 'border-orange-500 bg-orange-50/30 dark:bg-orange-500/5 shadow-md scale-[1.02]'
                                            : 'border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/10'}`}
                                    >
                                        <div className="flex gap-3 mb-4">
                                            <div className="flex items-start pt-1">
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleQuantityChange(item.uniqueId, isSelected ? 0 : 1);
                                                    }}
                                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected
                                                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30'
                                                        : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 group-hover:border-orange-200'}`}
                                                >
                                                    {isSelected && <CheckCircle2 size={16} />}
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-100 dark:border-white/5">
                                                {item.parentProd.imagen || item.imagen ? (
                                                    <img src={item.imagen || item.parentProd.imagen} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package size={20} className="text-gray-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-gray-800 dark:text-white uppercase leading-tight line-clamp-2 mb-1" title={item.displayName}>{item.displayName}</p>
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{item.sku || 'SIN SKU'}</span>
                                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${item.stock <= 5 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                        {item.stock} STOCK
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-white/5" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Costo Prev.</span>
                                                <span className="text-sm font-black text-gray-800 dark:text-gray-200">S/ {parseFloat(item.precio_compra || 0).toFixed(2)}</span>
                                            </div>

                                            <div className={`flex items-center transition-opacity ${isSelected ? 'opacity-100' : 'opacity-30 group-hover:opacity-60'}`}>
                                                <div className="flex items-center bg-gray-100 dark:bg-[#0b1437] rounded-xl p-1 shadow-inner">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.uniqueId, (quantities[item.uniqueId] || 0) - 1)}
                                                        className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg text-gray-500 transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={quantities[item.uniqueId] || ''}
                                                        onChange={(e) => handleQuantityChange(item.uniqueId, e.target.value)}
                                                        placeholder="0"
                                                        className="w-12 bg-transparent text-center text-xs font-black outline-none border-none dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                    <button
                                                        onClick={() => handleQuantityChange(item.uniqueId, (quantities[item.uniqueId] || 0) + 1)}
                                                        className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg text-orange-500 transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredItems.length === 0 && (
                            <div className="py-24 text-center">
                                <Package size={48} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">No se encontraron productos</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Artículos</span>
                                <span className="text-xl font-black text-gray-800 dark:text-white">{itemsCount}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Unidades</span>
                                <span className="text-xl font-black text-orange-500">{totalSelected}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={itemsCount === 0}
                                className="px-8 py-3 bg-orange-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                            >
                                <ShoppingCart size={16} />
                                Confirmar y Agregar
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BulkAddModal;
