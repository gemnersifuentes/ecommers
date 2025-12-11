import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaTrash, FaShoppingBag } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Loading from './ui/Loading';

const CartSidebar = ({ isOpen, onClose }) => {
    const { items, removeItem, updateQuantity, getTotal, syncing } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const cartItems = Array.isArray(items) ? items : [];

    const handleViewCart = () => {
        onClose();
        navigate('/carrito');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-white to-gray-50 shadow-2xl z-50 flex flex-col"
                    >
                        {/* LOADER */}
                        {syncing && <Loading message="Actualizando..." />}

                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                        <FaShoppingBag className="text-2xl" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Mi Carrito</h2>
                                        <p className="text-blue-100 text-sm">
                                            {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition backdrop-blur-sm"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>

                            {/* Sync indicator */}
                            {isAuthenticated && (
                                <div className="mt-3 flex items-center gap-2 text-sm">
                                    <div className={`w-2 h-2 rounded-full ${syncing ? 'bg-yellow-300 animate-pulse' : 'bg-green-300'}`} />
                                    <span className="text-blue-100">
                                        {syncing ? 'Sincronizando...' : 'Sincronizado con tu cuenta'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">
                                        <FaShoppingBag className="text-4xl text-blue-600" />
                                    </div>
                                    <p className="text-xl font-semibold text-gray-700 mb-2">Tu carrito está vacío</p>
                                    <p className="text-sm text-gray-500">Agrega productos para comenzar tu compra</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {cartItems.map((item) => {
                                        const producto = item.producto;
                                        const variacion = item.variacion;
                                        const imagen = producto?.imagen || null;
                                        const nombre = producto?.nombre || 'Producto';

                                        return (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                className="group relative bg-white p-4 border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-lg transition-all duration-200"
                                            >
                                                <div className="flex gap-4">
                                                    {/* Image */}
                                                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                        {imagen ? (
                                                            <img
                                                                src={imagen}
                                                                alt={nombre}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <FaShoppingBag className="text-3xl text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{nombre}</h3>
                                                        {variacion && (
                                                            <p className="text-xs text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded mb-2">
                                                                {variacion.atributos?.map(a => a.valor).join(' - ')}
                                                            </p>
                                                        )}
                                                        {item.precio_regular && parseFloat(item.precio) < parseFloat(item.precio_regular) && (
                                                            <p className="text-xs text-gray-500 line-through mb-0.5">
                                                                ${item.precio_regular.toFixed(2)}
                                                            </p>
                                                        )}
                                                        <p className={`text-sm font-medium ${item.precio_regular && parseFloat(item.precio) < parseFloat(item.precio_regular) ? 'text-orange-600' : 'text-gray-600'} mb-3`}>
                                                            ${item.precio.toFixed(2)} c/u
                                                        </p>

                                                        {/* Quantity controls */}
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                                                                disabled={syncing}
                                                                className="w-8 h-8 flex items-center justify-center border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition font-semibold disabled:opacity-50"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="w-10 text-center font-bold text-gray-900">{item.cantidad}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                                                                disabled={syncing}
                                                                className="w-8 h-8 flex items-center justify-center border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition font-semibold disabled:opacity-50"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Price & Delete */}
                                                    <div className="flex flex-col items-end justify-between">
                                                        <p className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                                            ${item.subtotal.toFixed(2)}
                                                        </p>
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            disabled={syncing}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                            title="Eliminar"
                                                        >
                                                            <FaTrash className="text-sm" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <div className="border-t-2 border-gray-100 bg-white p-6 space-y-4">
                                {/* Total */}
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-gray-700">Total:</span>
                                        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                            ${getTotal().toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="space-y-2">
                                    <button
                                        onClick={handleViewCart}
                                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300"
                                    >
                                        Ver Carrito Completo
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
                                    >
                                        Continuar Comprando
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartSidebar;
