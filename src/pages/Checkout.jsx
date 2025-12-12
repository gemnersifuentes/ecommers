import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Check, CreditCard, MapPin, Truck, Store, Home, Plus, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { tiendaService, direccionesService } from '../services';
import { ubigeoPeru } from '../data/ubigeo_peru';
import { DireccionForm } from '../components/DireccionForm';
import Swal from 'sweetalert2';
import { useLoader } from '../context/LoaderContext';

const Checkout = () => {
    const { items: cart, getTotal, clearCart } = useCart();
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Envío, 2: Pago, 3: Éxito
    const [loading, setLoading] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const { showLoader, hideLoader } = useLoader();

    // Delivery method and addresses
    const [metodoEnvio, setMetodoEnvio] = useState('domicilio');
    const [direcciones, setDirecciones] = useState([]);
    const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);
    const [usarOtraDireccion, setUsarOtraDireccion] = useState(false);
    const [guardarDireccion, setGuardarDireccion] = useState(false);
    const [mostrarFormDireccion, setMostrarFormDireccion] = useState(false);

    // Initial state from user data
    const [formData, setFormData] = useState({
        nombre: usuario?.nombre || '',
        direccion: usuario?.direccion || '',
        departamento: '',
        provincia: '',
        distrito: '',
        ciudad: usuario?.ciudad || '', // Keeping for fallback
        cp: usuario?.cp || '',
        telefono: usuario?.telefono || '',
        tarjetaNumero: '',
        tarjetaExpiracion: '',
        tarjetaCvv: '',
        dni: '' // Added DNI
    });

    // Update form data when user data is available
    useEffect(() => {
        if (usuario) {
            setFormData(prev => ({
                ...prev,
                nombre: usuario.nombre || prev.nombre,
                direccion: usuario.direccion || prev.direccion,
                ciudad: usuario.ciudad || prev.ciudad,
                estado: usuario.estado || prev.estado,
                cp: usuario.cp || prev.cp,
                telefono: usuario.telefono || prev.telefono
            }));
        }
    }, [usuario]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUbicacionChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updates = { [name]: value };
            if (name === 'departamento') {
                updates.provincia = '';
                updates.distrito = '';
            } else if (name === 'provincia') {
                updates.distrito = '';
            }
            return { ...prev, ...updates };
        });
    };

    const getProvincias = (depId) => ubigeoPeru.provincias[depId] || [];
    const getDistritos = (provId) => {
        if (!provId) return [];
        if (ubigeoPeru.distritos[provId]) return ubigeoPeru.distritos[provId];

        // Fallback: Si no hay distritos definidos, usar el nombre de la provincia como distrito único
        const provincias = Object.values(ubigeoPeru.provincias).flat();
        const provincia = provincias.find(p => p.id === provId);

        if (provincia) {
            return [{ id: `${provId}01`, name: provincia.name }];
        }
        return [];
    };

    // Load user addresses on mount
    useEffect(() => {
        if (usuario?.id) {
            fetchDirecciones();
        }
    }, [usuario]);

    const fetchDirecciones = async () => {
        try {
            const data = await direccionesService.getAll(usuario.id);
            setDirecciones(data);

            // Pre-select default address
            const predeterminada = data.find(d => d.es_predeterminada);
            if (predeterminada) {
                setDireccionSeleccionada(predeterminada.id);
            } else if (data.length > 0) {
                setDireccionSeleccionada(data[0].id);
            }
        } catch (error) {
            console.error('Error loading addresses:', error);
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
            setMostrarFormDireccion(false);
        } catch (error) {
            Swal.fire('Error', error.response?.data?.error || 'No se pudo guardar la dirección', 'error');
        }
    };

    const handleNextStep = () => {
        setStep(step + 1);
    };

    const handleBackStep = () => {
        setStep(step - 1);
    };

    const handlePayment = async () => {
        setLoading(true);
        showLoader();
        try {
            const orderData = {
                usuario_id: usuario ? usuario.id : 0,
                total: getTotal(),
                metodo_envio: metodoEnvio,
                items: cart.map(item => ({
                    id: item.producto.id,
                    variacion_id: item.variacion ? item.variacion.id : null,
                    cantidad: item.cantidad,
                    precio: item.precio
                }))
            };

            // Handle shipping based on delivery method
            if (metodoEnvio === 'domicilio') {
                if (direccionSeleccionada && !usarOtraDireccion && direcciones.length > 0) {
                    // Using saved address
                    orderData.direccion_id = direccionSeleccionada;

                    // Copy address data for backup
                    const dir = direcciones.find(d => d.id === direccionSeleccionada);
                    if (dir) {
                        orderData.shipping = {
                            nombre: dir.nombre_destinatario,
                            telefono: dir.telefono,
                            direccion: dir.direccion,
                            departamento: dir.departamento,
                            provincia: dir.provincia,
                            distrito: dir.distrito,
                            cp: dir.codigo_postal,
                            referencia: dir.referencia
                        };
                    }
                } else {
                    // Using new address from form
                    orderData.shipping = {
                        nombre: formData.nombre,
                        telefono: formData.telefono,
                        direccion: formData.direccion,
                        departamento: ubigeoPeru.departamentos.find(d => d.id === formData.departamento)?.name || formData.departamento,
                        provincia: getProvincias(formData.departamento).find(p => p.id === formData.provincia)?.name || formData.provincia,
                        distrito: getDistritos(formData.provincia).find(d => d.id === formData.distrito)?.name || formData.distrito,
                        cp: formData.cp,
                        referencia: formData.referencia
                    };
                    orderData.guardar_direccion = guardarDireccion;
                }
            } else {
                // Store pickup - only contact info
                orderData.shipping = {
                    nombre: formData.nombre,
                    dni: formData.dni
                };
            }

            const response = await tiendaService.crearPedido(orderData);

            if (response.success) {
                setOrderNumber(response.numero_pedido);
                setStep(3);
                clearCart();
                clearCart();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'Error desconocido al procesar el pedido',
                    confirmButtonColor: '#ea580c'
                });
            }
        } catch (error) {
            console.error('Error al crear pedido:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de Conexión',
                text: 'Hubo un problema al conectar con el servidor. Por favor intenta de nuevo.',
                confirmButtonColor: '#ea580c'
            });
        } finally {
            setLoading(false);
            hideLoader();
        }
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-10 w-full max-w-3xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors duration-300 ${step >= 1 ? 'bg-orange-500' : 'bg-gray-300'}`}>
                    1
                </div>
                <span className={`text-xs font-medium mt-2 ${step >= 1 ? 'text-orange-500' : 'text-gray-400'}`}>Envío</span>
            </div>

            {/* Line 1-2 */}
            <div className={`flex-1 h-1 mx-2 -mt-6 transition-colors duration-300 ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />

            {/* Step 2 */}
            <div className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors duration-300 ${step >= 2 ? 'bg-orange-500' : 'bg-gray-300'}`}>
                    2
                </div>
                <span className={`text-xs font-medium mt-2 ${step >= 2 ? 'text-orange-500' : 'text-gray-400'}`}>Pago</span>
            </div>

            {/* Line 2-3 */}
            <div className={`flex-1 h-1 mx-2 -mt-6 transition-colors duration-300 ${step >= 3 ? 'bg-orange-500' : 'bg-gray-200'}`} />

            {/* Step 3 */}
            <div className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors duration-300 ${step >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}>
                    3
                </div>
                <span className={`text-xs font-medium mt-2 ${step >= 3 ? 'text-green-500' : 'text-gray-400'}`}>Éxito</span>
            </div>
        </div>
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(amount);
    };

    const getSubtotal = () => {
        if (!cart) return 0;
        return cart.reduce((acc, item) => {
            const precioRegular = item.precio_regular || item.precio;
            return acc + (parseFloat(precioRegular) * item.cantidad);
        }, 0);
    };

    const getTotalDiscount = () => {
        if (!cart) return 0;
        return cart.reduce((acc, item) => {
            if (item.descuento && item.descuento.ahorro) {
                return acc + parseFloat(item.descuento.ahorro);
            }
            if (item.precio_regular && item.precio) {
                const ahorroUnitario = parseFloat(item.precio_regular) - parseFloat(item.precio);
                if (ahorroUnitario > 0) {
                    return acc + (ahorroUnitario * item.cantidad);
                }
            }
            return acc;
        }, 0);
    };

    if (!cart || (cart.length === 0 && step !== 3)) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h2>
                <button
                    onClick={() => { showLoader(); navigate('/'); setTimeout(hideLoader, 500); }}
                    className="px-6 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
                >
                    Volver a la tienda
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-44 pb-12 md:pt-60">
            <div className="container mx-auto px-4 max-w-6xl">

                {renderStepIndicator()}

                {step === 3 ? (
                    // Success View
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-lg p-12 text-center max-w-2xl mx-auto"
                    >
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-12 h-12 text-green-500" strokeWidth={3} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Pedido Confirmado!</h1>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Gracias por tu compra. Hemos recibido tu pedido y comenzaremos a procesarlo de inmediato. Recibirás un correo de confirmación pronto.
                        </p>

                        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left max-w-sm mx-auto border border-gray-100">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-500">Número de Pedido</span>
                                <span className="text-sm font-bold text-gray-900">#{orderNumber || 'PENDING'}</span>
                            </div>
                            <div className="flex justify-between mb-4">
                                <span className="text-sm text-gray-500">Fecha</span>
                                <span className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                    <Truck size={16} className="text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Preparando Envío</p>
                                    <p className="text-[10px] text-gray-500">Entrega esperada: 3-5 Días Hábiles</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => { showLoader(); navigate('/'); setTimeout(hideLoader, 500); }}
                            className="px-8 py-3 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition-colors flex items-center gap-2 mx-auto"
                        >
                            Continuar Comprando <span>→</span>
                        </button>
                    </motion.div>
                ) : (
                    // Grid Layout for Step 1 & 2
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Main Column */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Step 1: Shipping */}
                            {step === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8"
                                >
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <Truck className="text-orange-500" /> Método de Entrega
                                    </h2>

                                    {/* Selector de Método de Envío */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                        <div
                                            onClick={() => setMetodoEnvio('domicilio')}
                                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${metodoEnvio === 'domicilio'
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-gray-200 hover:border-orange-200'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${metodoEnvio === 'domicilio' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                <Home size={20} />
                                            </div>
                                            <div>
                                                <p className={`font-bold ${metodoEnvio === 'domicilio' ? 'text-orange-800' : 'text-gray-700'}`}>Envío a Domicilio</p>
                                                <p className="text-xs text-gray-500">Recíbelo en tu casa</p>
                                            </div>
                                            {metodoEnvio === 'domicilio' && <div className="ml-auto text-orange-500"><Check size={20} /></div>}
                                        </div>

                                        <div
                                            onClick={() => setMetodoEnvio('tienda')}
                                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${metodoEnvio === 'tienda'
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-gray-200 hover:border-orange-200'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${metodoEnvio === 'tienda' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                <Store size={20} />
                                            </div>
                                            <div>
                                                <p className={`font-bold ${metodoEnvio === 'tienda' ? 'text-orange-800' : 'text-gray-700'}`}>Retiro en Tienda</p>
                                                <p className="text-xs text-gray-500">Recógelo gratis</p>
                                            </div>
                                            {metodoEnvio === 'tienda' && <div className="ml-auto text-orange-500"><Check size={20} /></div>}
                                        </div>
                                    </div>

                                    {/* Contenido según método */}
                                    {metodoEnvio === 'domicilio' ? (
                                        <div className="space-y-6">
                                            {direcciones.length > 0 && !usarOtraDireccion ? (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="font-bold text-gray-800">Tus Direcciones Guardadas</h3>
                                                        <button
                                                            onClick={() => { setUsarOtraDireccion(true); setFormData({ nombre: '', direccion: '', departamento: '', provincia: '', distrito: '', cp: '', telefono: '', referencia: '' }); }}
                                                            className="text-sm text-orange-500 font-medium hover:underline flex items-center gap-1"
                                                        >
                                                            <Plus size={16} /> Nueva Dirección
                                                        </button>
                                                    </div>

                                                    <div className="grid gap-4">
                                                        {direcciones.map(dir => (
                                                            <div
                                                                key={dir.id}
                                                                onClick={() => setDireccionSeleccionada(dir.id)}
                                                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative ${direccionSeleccionada === dir.id
                                                                    ? 'border-orange-500 bg-orange-50/50'
                                                                    : 'border-gray-200 hover:border-orange-200'
                                                                    }`}
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="font-bold text-gray-900">{dir.nombre_destinatario}</span>
                                                                            {dir.es_predeterminada === 1 && (
                                                                                <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Principal</span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-sm text-gray-600">{dir.direccion}</p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {dir.distrito}, {dir.provincia}, {dir.departamento}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {direccionSeleccionada === dir.id && (
                                                                    <div className="absolute top-4 right-4 text-orange-500">
                                                                        <Check size={20} className="bg-orange-500 text-white rounded-full p-0.5" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h3 className="font-bold text-gray-800">
                                                            {usarOtraDireccion ? 'Nueva Dirección de Envío' : 'Ingresa tu Dirección'}
                                                        </h3>
                                                        {direcciones.length > 0 && (
                                                            <button
                                                                onClick={() => setUsarOtraDireccion(false)}
                                                                className="text-sm text-gray-500 hover:text-gray-800"
                                                            >
                                                                Cancelar y usar guardada
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Formulario Manual (On the fly) */}
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo</label>
                                                            <input
                                                                type="text"
                                                                name="nombre"
                                                                value={formData.nombre}
                                                                onChange={handleInputChange}
                                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                                            />
                                                        </div>

                                                        {/* Selectores de Ubicación Perú */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-700 mb-1">Departamento</label>
                                                                <select
                                                                    name="departamento"
                                                                    value={formData.departamento}
                                                                    onChange={handleUbicacionChange}
                                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors appearance-none"
                                                                >
                                                                    <option value="">Seleccionar</option>
                                                                    {ubigeoPeru.departamentos.map(d => (
                                                                        <option key={d.id} value={d.id}>{d.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-700 mb-1">Provincia</label>
                                                                <select
                                                                    name="provincia"
                                                                    value={formData.provincia}
                                                                    onChange={handleUbicacionChange}
                                                                    disabled={!formData.departamento}
                                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors appearance-none disabled:opacity-50"
                                                                >
                                                                    <option value="">Seleccionar</option>
                                                                    {getProvincias(formData.departamento).map(p => (
                                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-700 mb-1">Distrito</label>
                                                                <select
                                                                    name="distrito"
                                                                    value={formData.distrito}
                                                                    onChange={handleUbicacionChange}
                                                                    disabled={!formData.provincia}
                                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors appearance-none disabled:opacity-50"
                                                                >
                                                                    <option value="">Seleccionar</option>
                                                                    {getDistritos(formData.provincia).map(d => (
                                                                        <option key={d.id} value={d.id}>{d.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-700 mb-1">Dirección (Calle y Número)</label>
                                                            <input
                                                                type="text"
                                                                name="direccion"
                                                                value={formData.direccion}
                                                                onChange={handleInputChange}
                                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-700 mb-1">Referencia (Opcional)</label>
                                                            <input
                                                                type="text"
                                                                name="referencia"
                                                                placeholder="Ej: Frente al parque, puerta azul"
                                                                value={formData.referencia}
                                                                onChange={handleInputChange}
                                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-700 mb-1">Código Postal</label>
                                                                <input
                                                                    type="text"
                                                                    name="cp"
                                                                    value={formData.cp}
                                                                    onChange={handleInputChange}
                                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono</label>
                                                                <input
                                                                    type="text"
                                                                    name="telefono"
                                                                    value={formData.telefono}
                                                                    onChange={handleInputChange}
                                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 pt-2">
                                                            <input
                                                                type="checkbox"
                                                                id="guardarDireccion"
                                                                checked={guardarDireccion}
                                                                onChange={(e) => setGuardarDireccion(e.target.checked)}
                                                                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                                            />
                                                            <label htmlFor="guardarDireccion" className="text-sm text-gray-700 cursor-pointer">
                                                                Guardar esta dirección para futuros pedidos
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        // Store Pickup Content
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                <MapPin className="text-orange-500" size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">Tienda Central - Lima</h3>
                                            <p className="text-gray-600 mb-4">Av. Wilson 1234, Cercado de Lima<br />Horario: Lunes a Sábado 10:00am - 8:00pm</p>

                                            <div className="text-left border-t border-gray-200 pt-4 mt-4">
                                                <label className="block text-xs font-bold text-gray-700 mb-1">Persona que recoge</label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        name="nombre"
                                                        placeholder="Nombre completo"
                                                        value={formData.nombre}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                                    />
                                                    <input
                                                        type="text"
                                                        name="dni"
                                                        placeholder="DNI (Obligatorio)"
                                                        value={formData.dni}
                                                        onChange={handleInputChange}
                                                        maxLength={8}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                                    />
                                                </div>
                                                <p className="text-xs text-orange-600 mt-2">* Debes mostrar tu DNI al momento de recoger. El DNI ingresado aquí será verificado.</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-8">
                                        <button
                                            onClick={() => { showLoader(); handleNextStep(); setTimeout(hideLoader, 300); }}
                                            className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
                                        >
                                            Continuar al Pago
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Payment */}
                            {step === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Shipping Review */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Enviar a:</p>
                                            <p className="text-sm font-bold text-gray-800">{formData.nombre}</p>
                                            <p className="text-xs text-gray-600 line-clamp-1">
                                                {formData.direccion}
                                                {formData.distrito && `, ${getDistritos(formData.provincia).find(d => d.id === formData.distrito)?.name}`}
                                                {formData.departamento && `, ${ubigeoPeru.departamentos.find(d => d.id === formData.departamento)?.name}`}
                                            </p>
                                        </div>
                                        <button onClick={handleBackStep} className="text-xs text-blue-600 font-medium hover:underline">
                                            Editar Envío
                                        </button>
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                            <Check size={14} className="text-green-600" />
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                <CreditCard className="text-orange-500" /> Método de Pago
                                            </h2>
                                            <button onClick={handleBackStep} className="text-sm text-gray-400 hover:text-gray-600">Editar Envío</button>
                                        </div>

                                        <div className="mb-6 p-4 border border-orange-200 bg-orange-50 rounded-lg flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-full border-[5px] border-orange-500 bg-white"></div>
                                                <span className="font-bold text-gray-800">Tarjeta de Crédito / Débito</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="w-8 h-5 bg-gray-200 rounded"></div>
                                                <div className="w-8 h-5 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 border-t border-gray-100 pt-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">Número de Tarjeta</label>
                                                <div className="relative">
                                                    <CreditCard className="absolute left-3 top-3 text-gray-400" size={20} />
                                                    <input
                                                        type="text"
                                                        placeholder="0000 0000 0000 0000"
                                                        className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                                                        defaultValue=""
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">Expiración</label>
                                                    <input
                                                        type="text"
                                                        placeholder="MM/YY"
                                                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                                                        defaultValue=""
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">CVV</label>
                                                    <input
                                                        type="text"
                                                        placeholder="123"
                                                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                                                        defaultValue=""
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8">
                                            <button
                                                onClick={handlePayment}
                                                disabled={loading}
                                                className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-md hover:shadow-lg active:scale-[0.99] flex justify-center items-center gap-2"
                                            >
                                                {loading ? (
                                                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                                ) : (
                                                    `Pagar ${formatCurrency(getTotal())}`
                                                )}
                                            </button>
                                            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                                                <Check size={12} className="text-green-500" /> Pago seguro encriptado
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Resumen del Pedido</h3>
                                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-1">
                                    {cart.map((item) => (
                                        <div key={`${item.id}-${JSON.stringify(item.variacion)}`} className="flex gap-3">
                                            <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                                <img
                                                    src={item.producto?.imagen}
                                                    alt={item.producto?.nombre}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-gray-800 line-clamp-2 mb-1">{item.producto?.nombre}</p>
                                                {item.variacion && (
                                                    <p className="text-xs text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded mb-2">
                                                        {item.variacion.atributos?.map(a => a.valor).join(' - ')}
                                                    </p>
                                                )}
                                                <div className="flex justify-between items-end">
                                                    <span className="text-xs text-gray-500">Cant: {item.cantidad}</span>
                                                    <div className="text-right">
                                                        {(item.precio_regular && parseFloat(item.precio) < parseFloat(item.precio_regular)) && (
                                                            <span className="text-xs text-gray-400 line-through block">
                                                                {formatCurrency(parseFloat(item.precio_regular) * item.cantidad)}
                                                            </span>
                                                        )}
                                                        <span className={`text-sm font-bold ${item.precio_regular && parseFloat(item.precio) < parseFloat(item.precio_regular) ? 'text-orange-600' : 'text-gray-900'}`}>
                                                            {formatCurrency(parseFloat(item.precio) * item.cantidad)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 pt-6 border-t border-gray-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(getSubtotal())}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Envío</span>
                                        <span className="font-bold text-green-600">GRATIS</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 text-red-500">Descuento</span>
                                        <span className="font-medium text-red-500">-{formatCurrency(getTotalDiscount())}</span>
                                    </div>

                                    <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-100">
                                        <span className="text-gray-900">Total</span>
                                        <span className="text-orange-500">{formatCurrency(getTotal())}</span>
                                    </div>
                                </div>

                                <div className="mt-6 bg-orange-50 rounded-lg p-3 flex gap-3 items-start border border-orange-100">
                                    <Truck className="text-orange-500 shrink-0 mt-0.5" size={16} />
                                    <div>
                                        <p className="text-xs font-bold text-orange-800">¡Envío Express Gratis aplicado!</p>
                                        <p className="text-[10px] text-orange-700">Entrega estimada: 3-5 días</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal para agregar dirección */}
            {usuario && (
                <DireccionForm
                    isOpen={mostrarFormDireccion}
                    onClose={() => setMostrarFormDireccion(false)}
                    onSubmit={handleSaveDireccion}
                    direccion={null}
                    usuarioId={usuario.id}
                />
            )}
        </div >
    );
};

export default Checkout;
