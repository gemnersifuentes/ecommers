import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Package, Heart, Box, User, Loader2, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { favoritosService, tiendaService, direccionesService } from '../services';
import ProductCard from '../components/products/ProductCard';
import { OrderCard } from '../components/OrderCard';
import { DireccionCard } from '../components/DireccionCard';
import { DireccionForm } from '../components/DireccionForm';
import Swal from 'sweetalert2';

const MiCuenta = () => {
    const { usuario } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Determine active tab based on URL or default
    const [activeTab, setActiveTab] = useState('perfil');
    const [favoritos, setFavoritos] = useState([]);
    const [loadingFavoritos, setLoadingFavoritos] = useState(false);
    const [pedidos, setPedidos] = useState([]);
    const [loadingPedidos, setLoadingPedidos] = useState(false);
    const [direcciones, setDirecciones] = useState([]);
    const [loadingDirecciones, setLoadingDirecciones] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDireccion, setSelectedDireccion] = useState(null);

    useEffect(() => {
        if (location.pathname.includes('lista-deseos')) {
            setActiveTab('deseos');
            inputFetchFavoritos();
        } else if (location.pathname.includes('mis-pedidos')) {
            setActiveTab('pedidos');
            fetchPedidos();
        } else {
            setActiveTab('perfil');
        }
    }, [location]);

    const inputFetchFavoritos = async () => {
        try {
            setLoadingFavoritos(true);
            const data = await favoritosService.getAll();
            setFavoritos(data);
        } catch (error) {
            console.error("Error fetching favoritos:", error);
        } finally {
            setLoadingFavoritos(false);
        }
    };

    const fetchPedidos = async () => {
        if (!usuario?.id) {
            console.log('No usuario ID available');
            return;
        }
        try {
            setLoadingPedidos(true);
            const data = await tiendaService.getPedidos(usuario.id);
            setPedidos(data);
        } catch (error) {
            console.error("Error fetching pedidos:", error);
            setPedidos([]);
        } finally {
            setLoadingPedidos(false);
        }
    };


    // Fetch pedidos when tab changes to pedidos
    useEffect(() => {
        if (activeTab === 'pedidos' && usuario?.id) {
            fetchPedidos();
        }
        if (activeTab === 'perfil' && usuario?.id) {
            fetchDirecciones();
        }
    }, [activeTab, usuario?.id]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'perfil') navigate('/perfil');
        if (tab === 'pedidos') {
            navigate('/mis-pedidos');
            fetchPedidos();
        }
        if (tab === 'deseos') {
            navigate('/lista-deseos');
            inputFetchFavoritos();
        }
        if (tab === 'direcciones') {
            // No navigate, solo cambiar tab
            fetchDirecciones();
        }
    };

    // Direcciones functions
    const fetchDirecciones = async () => {
        if (!usuario?.id) return;
        try {
            setLoadingDirecciones(true);
            const data = await direccionesService.getAll(usuario.id);
            setDirecciones(data);
        } catch (error) {
            console.error('Error fetching direcciones:', error);
        } finally {
            setLoadingDirecciones(false);
        }
    };

    const handleSaveDireccion = async (data, id) => {
        try {
            if (id) {
                await direccionesService.update(id, data);
                Swal.fire('Actualizado', 'Dirección actualizada exitosamente', 'success');
            } else {
                await direccionesService.create(data);
                Swal.fire('Creado', 'Dirección agregada exitosamente', 'success');
            }
            fetchDirecciones();
            setIsFormOpen(false);
            setSelectedDireccion(null);
        } catch (error) {
            Swal.fire('Error', error.response?.data?.error || 'No se pudo guardar la dirección', 'error');
        }
    };

    const handleEditDireccion = (direccion) => {
        setSelectedDireccion(direccion);
        setIsFormOpen(true);
    };

    const handleDeleteDireccion = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar dirección?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await direccionesService.delete(id);
                Swal.fire('Eliminado', 'Dirección eliminada exitosamente', 'success');
                fetchDirecciones();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.error || 'No se pudo eliminar la dirección', 'error');
            }
        }
    };

    const handleSetDefaultDireccion = async (id) => {
        try {
            await direccionesService.setDefault(id);
            Swal.fire('Actualizado', 'Dirección marcada como predeterminada', 'success');
            fetchDirecciones();
        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar la dirección', 'error');
        }
    };

    return (
        <div className="container mx-auto px-4 pb-8 min-h-screen max-w-5xl pt-44 md:pt-60">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Mi Cuenta</h1>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-4 md:gap-8 border-b border-gray-200 mb-4 md:mb-6 overflow-x-auto hide-scrollbar pb-1">
                <button
                    onClick={() => handleTabChange('perfil')}
                    className={`flex items-center gap-2 pb-2 md:pb-3 text-xs md:text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'perfil'
                        ? 'text-orange-500'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <User size={18} />
                    Mi Perfil
                    {activeTab === 'perfil' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-t-full" />
                    )}
                </button>

                <button
                    onClick={() => handleTabChange('pedidos')}
                    className={`flex items-center gap-2 pb-2 md:pb-3 text-xs md:text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'pedidos'
                        ? 'text-orange-500'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Package size={18} />
                    Mis Pedidos
                    {activeTab === 'pedidos' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-t-full" />
                    )}
                </button>

                <button
                    onClick={() => handleTabChange('deseos')}
                    className={`flex items-center gap-2 pb-2 md:pb-3 text-xs md:text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'deseos'
                        ? 'text-orange-500'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Heart size={18} />
                    Lista de Deseos (0)
                    {activeTab === 'deseos' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-t-full" />
                    )}
                </button>

            </div>

            {/* Content Area */}
            <div className="md:rounded-xl md:shadow-sm md:min-h-[400px] md:p-8">

                {/* Profile Tab Content */}
                {activeTab === 'perfil' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                <User size={48} />
                            </div>
                            <h2 className="text-base md:text-xl font-bold text-gray-900">{usuario?.nombre}</h2>
                            <p className="text-gray-500 text-xs md:text-base">{usuario?.email}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-3 md:p-4 border border-gray-100 rounded-lg">
                                <label className="block text-[10px] md:text-xs text-gray-500 mb-1">Nombre Completo</label>
                                <p className="font-medium text-xs md:text-base text-gray-900">{usuario?.nombre}</p>
                            </div>
                            <div className="p-3 md:p-4 border border-gray-100 rounded-lg">
                                <label className="block text-[10px] md:text-xs text-gray-500 mb-1">Correo Electrónico</label>
                                <p className="font-medium text-xs md:text-base text-gray-900">{usuario?.email}</p>
                            </div>
                            <div className="p-3 md:p-4 border border-gray-100 rounded-lg">
                                <label className="block text-[10px] md:text-xs text-gray-500 mb-1">Rol de Cuenta</label>
                                <p className="font-medium text-xs md:text-base text-gray-900 capitalize">{usuario?.rol}</p>
                            </div>
                            <div className="p-3 md:p-4 border border-gray-100 rounded-lg">
                                <label className="block text-[10px] md:text-xs text-gray-500 mb-1">Estado</label>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Activo
                                </span>
                            </div>
                        </div>
                        {/* Integrated Addresses Section */}
                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <h2 className="text-base md:text-xl font-bold text-gray-900">Mis Direcciones</h2>
                                <button
                                    onClick={() => {
                                        setSelectedDireccion(null);
                                        setIsFormOpen(true);
                                    }}
                                    className="px-3 py-1.5 md:px-4 md:py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs md:text-sm rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <MapPin size={16} />
                                    Agregar Dirección
                                </button>
                            </div>

                            {loadingDirecciones ? (
                                <div className="flex justify-center items-center py-10">
                                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                </div>
                            ) : direcciones.length > 0 ? (
                                <div className="space-y-4">
                                    {direcciones.map(direccion => (
                                        <DireccionCard
                                            key={direccion.id}
                                            direccion={direccion}
                                            onEdit={handleEditDireccion}
                                            onDelete={handleDeleteDireccion}
                                            onSetDefault={handleSetDefaultDireccion}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                        <MapPin size={24} className="text-gray-400" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-1">No tienes direcciones</h3>
                                    <p className="text-gray-500 text-xs mb-4 max-w-xs mx-auto">
                                        Agrega una dirección para facilitar tus compras.
                                    </p>
                                    <button
                                        onClick={() => setIsFormOpen(true)}
                                        className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-xs rounded-lg transition-colors"
                                    >
                                        Agregar Dirección
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
                }

                {/* Orders Tab Content */}
                {
                    activeTab === 'pedidos' && (
                        <div className="w-full space-y-6">
                            {loadingPedidos ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                </div>
                            ) : pedidos.length > 0 ? (
                                pedidos.map((pedido) => (
                                    <OrderCard key={pedido.id} pedido={pedido} />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center min-h-[336px] text-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Box size={40} className="text-gray-300" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay pedidos aún</h3>
                                    <p className="text-gray-500 text-sm mb-6">
                                        Empieza a comprar para ver tus pedidos aquí.
                                    </p>
                                </div>
                            )}
                        </div>
                    )
                }

                {/* Wishlist Tab Content */}
                {
                    activeTab === 'deseos' && (
                        <div className={favoritos.length > 0 ? "" : "flex flex-col items-center justify-center min-h-[336px] text-center"}>
                            {loadingFavoritos ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                </div>
                            ) : favoritos.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {favoritos.map((producto) => (
                                        <ProductCard key={producto.id} producto={{ ...producto, es_favorito: true }} />
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Heart size={40} className="text-gray-300" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tu lista de deseos está vacía</h3>
                                    <p className="text-gray-500 text-sm mb-6">
                                        Guarda los productos que más te gusten para comprarlos después.
                                    </p>
                                </div>
                            )}
                        </div>
                    )
                }

                {/* Direcciones Tab Content */}


            </div >

            {/* Modal Form */}
            < DireccionForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedDireccion(null);
                }}
                onSubmit={handleSaveDireccion}
                direccion={selectedDireccion}
                usuarioId={usuario?.id}
            />
        </div >
    );
};

export default MiCuenta;
