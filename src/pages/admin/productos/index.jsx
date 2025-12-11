import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { productosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const ProductosIndex = () => {
    // Estilos CSS personalizados para el color principal
    const customStyles = `
    .btn-primary {
      background-color: rgb(97,64,220);
    }
    .btn-primary:hover {
      background-color: rgb(107,74,230);
    }
    .text-primary {
      color: rgb(97,64,220);
    }
    .bg-primary-light {
      background-color: rgba(97,64,220,0.1);
    }
    .border-primary {
      border-color: rgb(97,64,220);
    }
    .hover-primary:hover {
      background-color: rgba(97,64,220,0.05);
      border-color: rgb(97,64,220);
      color: rgb(97,64,220);
    }
    .pagination-btn:not(:disabled):hover {
      background-color: rgba(97,64,220,0.05) !important;
      border-color: rgb(97,64,220) !important;
      color: rgb(97,64,220) !important;
    }
    .modal-header-gradient {
      background: linear-gradient(to right, rgb(97,64,220), rgb(107,74,230)) !important;
    }
    .focus-primary:focus {
      outline: none;
      border-color: rgb(97,64,220);
      ring: 2px;
      ring-color: rgba(97,64,220,0.5);
    }
    
    /* Custom scrollbar styles */
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(97,64,220,0.05);
      border-radius: 10px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgb(97,64,220);
      border-radius: 10px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgb(107,74,230);
    }
    
    /* For Firefox */
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgb(97,64,220) rgba(97,64,220,0.05);
    }
  `;

    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(4); // Default from AdminProductos
    const [totalProductos, setTotalProductos] = useState(0);

    const cargarProductos = async () => {
        setLoading(true);
        try {
            const response = await productosService.getAll({
                page: currentPage,
                limit: itemsPerPage,
                admin_mode: 'true'
            });
            if (response && response.data) {
                setProductos(response.data);
                setTotalProductos(response.total || 0);
            } else if (Array.isArray(response)) {
                setProductos(response);
                setTotalProductos(response.length);
            } else {
                setProductos([]);
                setTotalProductos(0);
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarProductos();
    }, [currentPage, itemsPerPage]);

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await productosService.delete(id);
                Swal.fire('Eliminado!', 'El producto ha sido eliminado.', 'success');
                cargarProductos();
            } catch (error) {
                console.error('Error al eliminar:', error);
                Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
            }
        }
    };

    const productosFiltrados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.categoria_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(totalProductos / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6  min-h-screen font-['Public_Sans'] rounded-xl">
            <style>{customStyles}</style>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Productos</h1>
                    <Breadcrumb items={[
                        { label: 'Inicio', link: '/admin', isHome: true },
                        { label: 'Gestión de Productos' }
                    ]} />
                </div>
                <Link
                    to="/admin/productos/nuevo"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-200"
                >
                    <i className="fas fa-plus"></i>
                    <span>Nuevo Producto</span>
                </Link>
            </div>

            {/* Search Bar & Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 relative w-full">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 
           rounded-xl text-sm text-gray-600 placeholder-gray-400 
           border-2 border-transparent 
           focus:border-blue-600 focus:outline-none 
           transition-colors duration-300 ease-in-out 
           disabled:opacity-50"
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-600 focus:ring-2 focus:ring-[rgb(97,64,220)] cursor-pointer"
                    >
                        <option value={4}>4 por pág</option>
                        <option value={8}>8 por pág</option>
                        <option value={12}>12 por pág</option>
                        <option value={16}>16 por pág</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Marca</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Precio</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Variantes</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence>
                                {productosFiltrados.map((producto, index) => (
                                    <motion.tr
                                        key={producto.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="transition-all duration-200 group"
                                        style={{ '--hover-bg': 'rgba(97,64,220,0.05)' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(97,64,220,0.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {producto.imagen && !producto.imagen.startsWith('data:image') ? (
                                                        <img
                                                            src={producto.imagen}
                                                            alt={producto.nombre}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <i className="fas fa-box text-gray-400 text-xs"></i>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-gray-900 truncate">{producto.nombre}</p>
                                                    <p className="text-[10px] text-gray-500">ID: {producto.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: 'rgba(97,64,220,0.1)', color: 'rgb(97,64,220)' }}>
                                                {producto.categoria_nombre || 'Sin categoría'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                                                {producto.marca_nombre || 'Sin marca'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className="text-xs text-center font-bold text-gray-900">${parseFloat(producto.precio_base).toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${producto.stock > 10 ? 'bg-green-500' :
                                                    producto.stock > 0 ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                    }`}></div>
                                                <span className="text-xs font-semibold text-gray-900">{producto.stock}</span>
                                                <span className="text-[10px] text-gray-500">unid.</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700">
                                                {producto.variaciones?.length || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    to={`/admin/productos/ver/${producto.id}`}
                                                    className="p-1.5 rounded-lg transition-colors inline-block"
                                                    style={{ color: 'rgb(97,64,220)' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(97,64,220,0.1)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                    title="Ver"
                                                >
                                                    <i className="fas fa-eye text-xs"></i>
                                                </Link>
                                                <Link
                                                    to={`/admin/productos/editar/${producto.id}`}
                                                    className="p-1.5 rounded-lg transition-colors inline-block"
                                                    style={{ color: 'rgb(97,64,220)' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(97,64,220,0.1)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                    title="Editar"
                                                >
                                                    <i className="fas fa-edit text-xs"></i>
                                                </Link>
                                                <button
                                                    onClick={() => handleEliminar(producto.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <i className="fas fa-trash text-xs"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {productosFiltrados.length === 0 && (
                    <div className="text-center py-12">
                        <i className="fas fa-box-open text-gray-300 text-5xl mb-4"></i>
                        <p className="text-gray-500 font-medium text-xs">No se encontraron productos</p>
                    </div>
                )}

                {/* Paginación Mejorada */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="flex items-center justify-between">
                            {/* Info de Página - Izquierda */}
                            <div className="flex items-center gap-3">
                                <p className="text-xs text-gray-600 font-medium">
                                    Mostrando <span className="font-bold text-gray-900">{startIndex + 1}</span> - <span className="font-bold text-gray-900">{Math.min(endIndex, productosFiltrados.length)}</span> de <span className="font-bold text-gray-900">{productosFiltrados.length}</span> productos
                                </p>
                                <div className="h-4 w-px bg-gray-300"></div>
                                <p className="text-[10px] text-gray-500 font-medium">
                                    Página <span className="font-bold text-blue-600">{currentPage}</span> de <span className="font-bold text-gray-700">{totalPages}</span>
                                </p>
                            </div>

                            {/* Controles de Paginación - Derecha */}
                            <div className="flex items-center gap-2">
                                {/* Botón Primera Página */}
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="w-9 h-9 flex items-center justify-center text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                    onMouseEnter={(e) => {
                                        if (currentPage !== 1) {
                                            e.currentTarget.style.backgroundColor = 'rgb(37, 99, 235)';
                                            e.currentTarget.style.borderColor = 'rgb(37, 99, 235)';
                                            e.currentTarget.style.color = 'white';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (currentPage !== 1) {
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.borderColor = 'rgb(209,213,219)';
                                            e.currentTarget.style.color = 'rgb(55,65,81)';
                                        }
                                    }}
                                    title="Primera página"
                                >
                                    <i className="fas fa-angle-double-left text-xs"></i>
                                </button>

                                {/* Botón Anterior */}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="w-9 h-9 flex items-center justify-center text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                    onMouseEnter={(e) => {
                                        if (currentPage !== 1) {
                                            e.currentTarget.style.backgroundColor = 'rgb(37, 99, 235)';
                                            e.currentTarget.style.borderColor = 'rgb(37, 99, 235)';
                                            e.currentTarget.style.color = 'white';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (currentPage !== 1) {
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.borderColor = 'rgb(209,213,219)';
                                            e.currentTarget.style.color = 'rgb(55,65,81)';
                                        }
                                    }}
                                    title="Página anterior"
                                >
                                    <i className="fas fa-chevron-left text-xs"></i>
                                </button>

                                {/* Números de Página */}
                                <div className="flex items-center gap-1 px-2">
                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNumber = index + 1;
                                        if (
                                            pageNumber === 1 ||
                                            pageNumber === totalPages ||
                                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => setCurrentPage(pageNumber)}
                                                    className={`min-w-[36px] h-9 px-3 text-xs font-bold rounded-lg transition-all shadow-sm ${currentPage === pageNumber
                                                        ? 'text-white scale-105'
                                                        : 'bg-white text-gray-700 border border-gray-300'
                                                        }`}
                                                    style={currentPage === pageNumber ? {
                                                        background: 'rgb(37, 99, 235)',
                                                        boxShadow: '0 4px 6px rgba(37, 99, 235, 0.3)',
                                                        color: 'white',
                                                        border: 'none'
                                                    } : {
                                                        backgroundColor: 'white',
                                                        borderColor: 'rgb(209,213,219)',
                                                        color: 'rgb(55,65,81)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (currentPage !== pageNumber) {
                                                            e.currentTarget.style.backgroundColor = 'rgb(37, 99, 235)';
                                                            e.currentTarget.style.borderColor = 'rgb(37, 99, 235)';
                                                            e.currentTarget.style.color = 'white';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (currentPage !== pageNumber) {
                                                            e.currentTarget.style.backgroundColor = 'white';
                                                            e.currentTarget.style.borderColor = 'rgb(209,213,219)';
                                                            e.currentTarget.style.color = 'rgb(55,65,81)';
                                                        }
                                                    }}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        } else if (
                                            pageNumber === currentPage - 2 ||
                                            pageNumber === currentPage + 2
                                        ) {
                                            return (
                                                <span key={pageNumber} className="text-gray-400 text-xs px-1 font-bold">
                                                    •••
                                                </span>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>

                                {/* Botón Siguiente */}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="w-9 h-9 flex items-center justify-center text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                    onMouseEnter={(e) => {
                                        if (currentPage !== totalPages) {
                                            e.currentTarget.style.backgroundColor = 'rgb(37, 99, 235)';
                                            e.currentTarget.style.borderColor = 'rgb(37, 99, 235)';
                                            e.currentTarget.style.color = 'white';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (currentPage !== totalPages) {
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.borderColor = 'rgb(209,213,219)';
                                            e.currentTarget.style.color = 'rgb(55,65,81)';
                                        }
                                    }}
                                    title="Página siguiente"
                                >
                                    <i className="fas fa-chevron-right text-xs"></i>
                                </button>

                                {/* Botón Última Página */}
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="w-9 h-9 flex items-center justify-center text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                    onMouseEnter={(e) => {
                                        if (currentPage !== totalPages) {
                                            e.currentTarget.style.backgroundColor = 'rgb(37, 99, 235)';
                                            e.currentTarget.style.borderColor = 'rgb(37, 99, 235)';
                                            e.currentTarget.style.color = 'white';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (currentPage !== totalPages) {
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.borderColor = 'rgb(209,213,219)';
                                            e.currentTarget.style.color = 'rgb(55,65,81)';
                                        }
                                    }}
                                    title="Última página"
                                >
                                    <i className="fas fa-angle-double-right text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                )}
            </div >
        </div >
    );
};

export default ProductosIndex;
