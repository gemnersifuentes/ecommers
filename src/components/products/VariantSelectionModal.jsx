import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaShoppingCart, FaCheck } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import Swal from 'sweetalert2';

const VariantSelectionModal = ({ producto, isOpen, onClose }) => {
    const { addItem } = useCart();
    const [cantidad, setCantidad] = useState(1);
    const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
    const [seleccionesAtributos, setSeleccionesAtributos] = useState({});

    // Auto-seleccionar primera variante al abrir
    useEffect(() => {
        if (isOpen && producto?.variaciones && producto.variaciones.length > 0) {
            const primeraVariante = producto.variaciones[0];
            const seleccionesIniciales = {};
            primeraVariante.atributos.forEach(attr => {
                seleccionesIniciales[attr.atributo_nombre] = attr.valor_id;
            });
            setSeleccionesAtributos(seleccionesIniciales);
            setVarianteSeleccionada(primeraVariante);
        }
    }, [isOpen, producto]);

    const handleSeleccionAtributo = (nombreAtributo, valorId) => {
        const nuevasSelecciones = {
            ...seleccionesAtributos,
            [nombreAtributo]: valorId
        };

        setSeleccionesAtributos(nuevasSelecciones);

        // Buscar variante que coincida
        const varianteEncontrada = producto.variaciones.find(variante => {
            return Object.entries(nuevasSelecciones).every(([nombreAttr, valorIdSelec]) => {
                return variante.atributos.some(a =>
                    a.atributo_nombre === nombreAttr && String(a.valor_id) === String(valorIdSelec)
                );
            });
        });

        setVarianteSeleccionada(varianteEncontrada || null);
    };

    const handleAgregar = async () => {
        try {
            await addItem(producto, varianteSeleccionada, cantidad);
            Swal.fire({
                icon: 'success',
                title: '¡Agregado!',
                text: `${cantidad} ${producto.nombre} agregado(s) al carrito`,
                timer: 2000,
                showConfirmButton: false
            });
            onClose();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo agregar al carrito',
            });
        }
    };

    if (!isOpen || !producto) return null;

    // Calcular precio
    const precioBase = varianteSeleccionada?.precio
        ? parseFloat(varianteSeleccionada.precio)
        : parseFloat(producto.precio_base);

    let precioFinal = precioBase;
    let tieneDescuento = false;

    if (producto.tiene_descuento === 1 && producto.descuento_tipo && producto.descuento_valor) {
        if (producto.descuento_tipo === 'porcentaje') {
            const descuento = precioBase * (parseFloat(producto.descuento_valor) / 100);
            precioFinal = precioBase - descuento;
            tieneDescuento = true;
        } else if (producto.descuento_tipo === 'monto_fijo') {
            precioFinal = Math.max(0, precioBase - parseFloat(producto.descuento_valor));
            tieneDescuento = true;
        }
    }

    // Agrupar atributos únicos
    const atributosAgrupados = {};
    producto.variaciones?.forEach(variante => {
        variante.atributos?.forEach(attr => {
            if (!atributosAgrupados[attr.atributo_nombre]) {
                atributosAgrupados[attr.atributo_nombre] = { valores: [] };
            }
            if (!atributosAgrupados[attr.atributo_nombre].valores.find(v => v.valor_id === attr.valor_id)) {
                atributosAgrupados[attr.atributo_nombre].valores.push({
                    valor_id: attr.valor_id,
                    valor: attr.valor,
                    color_hex: attr.color_hex
                });
            }
        });
    });

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
                        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white rounded-t-2xl">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold mb-1">Selecciona las opciones</h2>
                                    <p className="text-blue-100 text-sm">{producto.nombre}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition ml-4"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {/* Imagen y Precio */}
                            <div className="flex gap-6 mb-6 pb-6 border-b">
                                <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                    <img
                                        src={producto.imagen}
                                        alt={producto.nombre}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="mb-4">
                                        {tieneDescuento && (
                                            <p className="text-gray-400 line-through text-lg mb-1">
                                                S/ {precioBase.toFixed(2)}
                                            </p>
                                        )}
                                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                            S/ {precioFinal.toFixed(2)}
                                        </p>
                                    </div>
                                    {varianteSeleccionada && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className={`px-3 py-1 rounded-full ${varianteSeleccionada.stock > 0
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {varianteSeleccionada.stock > 0
                                                    ? `${varianteSeleccionada.stock} disponibles`
                                                    : 'Sin stock'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Selección de Variantes */}
                            {Object.entries(atributosAgrupados).map(([nombreAtributo, infoAtributo]) => (
                                <div key={nombreAtributo} className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                                        {nombreAtributo}:
                                        {seleccionesAtributos[nombreAtributo] && (
                                            <span className="ml-2 font-normal text-blue-600">
                                                {infoAtributo.valores.find(v => v.valor_id === seleccionesAtributos[nombreAtributo])?.valor}
                                            </span>
                                        )}
                                    </label>

                                    {nombreAtributo.toLowerCase() === 'color' ? (
                                        <div className="flex gap-3 flex-wrap">
                                            {infoAtributo.valores.map(val => {
                                                const isSelected = seleccionesAtributos[nombreAtributo] === val.valor_id;
                                                return (
                                                    <button
                                                        key={val.valor_id}
                                                        onClick={() => handleSeleccionAtributo(nombreAtributo, val.valor_id)}
                                                        className={`relative w-16 h-16 rounded-xl border-2 transition-all ${isSelected
                                                                ? 'border-blue-600 shadow-lg scale-110'
                                                                : 'border-gray-300 hover:border-gray-400'
                                                            }`}
                                                        style={{ backgroundColor: val.color_hex || '#ccc' }}
                                                        title={val.valor}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <FaCheck className="text-white drop-shadow-lg text-xl" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 flex-wrap">
                                            {infoAtributo.valores.map(val => {
                                                const isSelected = seleccionesAtributos[nombreAtributo] === val.valor_id;
                                                return (
                                                    <button
                                                        key={val.valor_id}
                                                        onClick={() => handleSeleccionAtributo(nombreAtributo, val.valor_id)}
                                                        className={`px-6 py-3 border-2 rounded-xl font-medium transition-all ${isSelected
                                                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
                                                                : 'border-gray-300 hover:border-gray-400 text-gray-700'
                                                            }`}
                                                    >
                                                        {val.valor}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Cantidad */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-900 mb-3">Cantidad:</label>
                                <div className="inline-flex border-2 border-gray-300 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                                        className="px-5 py-3 hover:bg-gray-100 font-semibold text-gray-700 transition"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="text"
                                        value={cantidad}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (!isNaN(val) && val > 0) setCantidad(val);
                                        }}
                                        className="w-20 text-center border-x-2 border-gray-300 py-3 font-semibold text-gray-900 outline-none"
                                    />
                                    <button
                                        onClick={() => setCantidad(cantidad + 1)}
                                        className="px-5 py-3 hover:bg-gray-100 font-semibold text-gray-700 transition"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gray-50 p-6 border-t rounded-b-2xl">
                            <button
                                onClick={handleAgregar}
                                disabled={!varianteSeleccionada || varianteSeleccionada.stock < cantidad}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                            >
                                <FaShoppingCart className="text-xl" />
                                Agregar al Carrito
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default VariantSelectionModal;
