import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaTrash, FaShoppingBag } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Loading from './ui/Loading';
import { useLoader } from '../context/LoaderContext';
import { ShieldCheck, Truck } from 'lucide-react';

const CartSidebar = ({ isOpen, onClose }) => {
    const { items, removeItem, updateQuantity, getTotal, syncing } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { showLoader, hideLoader } = useLoader();

    const cartItems = Array.isArray(items) ? items : [];

    const handleViewCart = () => {
        showLoader();
        onClose();
        navigate('/carrito');
        setTimeout(hideLoader, 500);
    };

    const handleCheckout = () => {
        showLoader();
        onClose();
        navigate('/checkout');
        setTimeout(hideLoader, 500);
    };

    // Calcular ahorros totales
    const getTotalSavings = () => {
        return cartItems.reduce((total, item) => {
            if (item.precio_regular && parseFloat(item.precio) < parseFloat(item.precio_regular)) {
                const ahorroUnitario = parseFloat(item.precio_regular) - parseFloat(item.precio);
                return total + (ahorroUnitario * item.cantidad);
            }
            return total;
        }, 0);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay - Debe estar SOBRE el Header */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-gray-900/40 z-[55]"
                        style={{
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)'
                        }}
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-96 max-w-md bg-white shadow-2xl z-[60] flex flex-col"
                    >
                        {/* LOADER */}
                        {syncing && <Loading message="Actualizando..." />}

                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FaShoppingBag className="text-orange-500 text-xl" />
                                <h2 className="text-lg font-bold text-gray-900">
                                    Carrito de Compras ({cartItems.length})
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                            >
                                <FaTimes className="text-gray-600" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <FaShoppingBag className="text-4xl text-gray-400" />
                                    </div>
                                    <p className="text-base font-medium text-gray-700 mb-6">Tu carrito está vacío</p>
                                    <button
                                        onClick={() => {
                                            showLoader();
                                            onClose();
                                            navigate('/productos');
                                            setTimeout(hideLoader, 500);
                                        }}
                                        className="w-full py-3 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-colors shadow-md"
                                    >
                                        Empezar a Comprar
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
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
                                                className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow relative"
                                            >
                                                <div className="flex gap-3">
                                                    {/* Image */}
                                                    <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                                        {imagen ? (
                                                            <img
                                                                src={imagen}
                                                                alt={nombre}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <FaShoppingBag className="text-2xl text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content Column: Spans full remaining width */}
                                                    <div className="flex-1 flex flex-col justify-between min-w-0">

                                                        {/* TOP ROW: Name and Delete Button */}
                                                        <div className="flex justify-between items-start gap-2">
                                                            <div className="min-w-0">
                                                                <h3 className="font-bold text-xs text-gray-900 line-clamp-2 leading-tight">{nombre}</h3>
                                                                {variacion && (
                                                                    <p className="text-xs text-gray-500 ">
                                                                        {variacion.atributos?.map(a => a.valor).join(' - ')}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={async () => {
                                                                    showLoader();
                                                                    await removeItem(item.id);
                                                                    setTimeout(hideLoader, 500);
                                                                }}
                                                                disabled={syncing}
                                                                className="text-gray-400 hover:text-red-500 transition-colors p-1 "
                                                                title="Eliminar"
                                                            >
                                                                <FaTrash className="text-sm" />
                                                            </button>
                                                        </div>

                                                        {/* BOTTOM ROW: Price and Quantity */}
                                                        <div className="flex justify-between items-end">
                                                            {/* Price */}
                                                            <div>
                                                                <p className="text-sm font-bold text-orange-500 leading-none">
                                                                    ${parseFloat(item.precio).toFixed(2)}
                                                                </p>
                                                                {item.precio_regular && parseFloat(item.precio) < parseFloat(item.precio_regular) && (
                                                                    <p className="text-xs text-gray-400 line-through mt-0.5">
                                                                        ${parseFloat(item.precio_regular).toFixed(2)}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* Quantity */}
                                                            <div className="flex items-center border border-gray-200 rounded-md">
                                                                <button
                                                                    onClick={async () => {
                                                                        showLoader();
                                                                        await updateQuantity(item.id, item.cantidad - 1);
                                                                        setTimeout(hideLoader, 500);
                                                                    }}
                                                                    disabled={syncing || item.cantidad <= 1}
                                                                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition disabled:opacity-30 border-r border-gray-200"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="w-8 text-center text-sm font-semibold text-gray-700">{item.cantidad}</span>
                                                                <button
                                                                    onClick={async () => {
                                                                        showLoader();
                                                                        await updateQuantity(item.id, item.cantidad + 1);
                                                                        setTimeout(hideLoader, 500);
                                                                    }}
                                                                    disabled={syncing}
                                                                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition disabled:opacity-30 border-l border-gray-200"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
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
                            <div className="border-t border-gray-200 bg-white p-4 space-y-3">
                                {/* Security badges */}
                                <div className="flex items-center justify-center gap-4 py-2 bg-green-50 rounded-lg border border-green-100">
                                    <div className="flex items-center gap-1 text-green-700">
                                        <ShieldCheck size={16} />
                                        <span className="text-xs font-medium">Pago Seguro</span>
                                    </div>
                                    <div className="w-px h-4 bg-green-200"></div>
                                    <div className="flex items-center gap-1 text-green-700">
                                        <Truck size={16} />
                                        <span className="text-xs font-medium">Envío Gratis</span>
                                    </div>
                                </div>

                                {/* Savings */}
                                {getTotalSavings() > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">Ahorros Totales</span>
                                        <span className="text-xs font-bold text-red-500">-${getTotalSavings().toFixed(2)}</span>
                                    </div>
                                )}

                                {/* Total */}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                    <span className="text-sm font-bold text-gray-900">Total</span>
                                    <span className="text-lg font-bold text-orange-500">
                                        ${getTotal().toFixed(2)}
                                    </span>
                                </div>

                                {/* Buttons */}
                                <div className="space-y-2 mt-4">
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full py-3 bg-orange-500 text-sm text-white font-bold rounded-full hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
                                    >
                                        Pagar Ahora
                                    </button>
                                    <button
                                        onClick={handleViewCart}
                                        className="w-full py-3  bg-white text-orange-500 text-sm font-medium rounded-full border-2 border-orange-500 hover:bg-orange-50 transition-colors"
                                    >
                                        Ver Carrito Completo
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
