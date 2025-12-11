import ProductCard from './ProductCard';

const ProductGrid = ({ productos, loading, onClearFilters }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
                        <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg mb-4" />
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
                    </div>
                ))}
            </div>
        );
    }

    if (!productos || productos.length === 0) {
        return (
            <div className="bg-white rounded-lg p-16 text-center shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron productos</h3>
                <p className="text-gray-500 mb-8">Intenta ajustar tus filtros de búsqueda.</p>
                <button
                    onClick={onClearFilters}
                    className="px-6 py-2 bg-orange-500 text-white font-bold rounded-[20px] hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
                >
                    Limpiar Filtros
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {productos.map(producto => (
                <ProductCard key={producto.id} producto={producto} />
            ))}
        </div>
    );
};

export default ProductGrid;
