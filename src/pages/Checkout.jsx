import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
    Check,
    CreditCard,
    MapPin,
    Truck,
    Store,
    Home,
    Plus,
    Edit2,
    Phone,
    Copy,
    ExternalLink,
    AlertCircle,
    Package,
    ArrowLeft,
    ChevronRight,
    User,
    Mail
} from 'lucide-react';
import { motion } from 'framer-motion';
import { tiendaService, direccionesService } from '../services';
import { ubigeoPeru } from '../data/ubigeo_peru';
import { DireccionForm } from '../components/DireccionForm';
import Swal from 'sweetalert2';
import { useLoader } from '../context/LoaderContext';
import { formatDeliveryEstimate, getDeliveryLabel } from '../utils/dateUtils';

const Checkout = () => {
    const { items: fullCart, clearCart, removeItem } = useCart();
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [step, setStep] = useState(1); // 1: Envío, 2: Pago, 3: Éxito
    const [loading, setLoading] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [finalOrderData, setFinalOrderData] = useState(null);
    const [metodoPago, setMetodoPago] = useState('tarjeta');
    const [comprobante, setComprobante] = useState(null);
    const [mpPreferenceId, setMpPreferenceId] = useState(null);
    const { showLoader, hideLoader } = useLoader();

    // Filtramos los items basándonos en la selección previa en el Carrito (si existe)
    const selectedItemsIds = location.state?.selectedItems;
    const cart = selectedItemsIds
        ? (fullCart || []).filter(item => selectedItemsIds.includes(item.id))
        : (fullCart || []);

    const getCartTotal = (items = cart) => {
        if (!items) return 0;
        return items.reduce((acc, item) => acc + (parseFloat(item.precio) * item.cantidad), 0);
    };

    const getSubtotal = (items = cart) => {
        if (!items) return 0;
        return items.reduce((acc, item) => {
            const precioRegular = item.precio_regular || item.precio;
            return acc + (parseFloat(precioRegular) * item.cantidad);
        }, 0);
    };

    const getTotalDiscount = (items = cart) => {
        if (!items) return 0;
        return items.reduce((acc, item) => {
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(amount);
    };

    useEffect(() => {
        // Cargar SDK de Mercado Pago
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Delivery method and addresses
    const [metodoEnvio, setMetodoEnvio] = useState('domicilio');
    const [direcciones, setDirecciones] = useState([]);
    const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);
    const [usarOtraDireccion, setUsarOtraDireccion] = useState(false);
    const [guardarDireccion, setGuardarDireccion] = useState(false);
    const [mostrarFormDireccion, setMostrarFormDireccion] = useState(false);
    const [errors, setErrors] = useState({});

    // Initial state from user data
    const [formData, setFormData] = useState({
        nombre: usuario?.nombre || '',
        correo: usuario?.correo || '',
        direccion: usuario?.direccion || '',
        departamento: '',
        provincia: '',
        distrito: '',
        ciudad: usuario?.ciudad || '',
        cp: usuario?.cp || '',
        telefono: usuario?.telefono || '',
        tarjetaNumero: '',
        tarjetaExpiracion: '',
        tarjetaCvv: '',
        dni: '',
        referencia: ''
    });

    // Update form data when user data is available
    useEffect(() => {
        if (usuario) {
            setFormData(prev => ({
                ...prev,
                nombre: usuario.nombre || prev.nombre,
                correo: usuario.correo || prev.correo,
                direccion: usuario.direccion || prev.direccion,
                ciudad: usuario.ciudad || prev.ciudad,
                estado: usuario.estado || prev.estado,
                cp: usuario.cp || prev.cp,
                telefono: usuario.telefono || prev.telefono
            }));
        }
    }, [usuario]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Restricción de entrada para teléfono y DNI
        if (name === 'telefono') {
            const digits = value.replace(/\D/g, '').slice(0, 9);
            setFormData(prev => ({ ...prev, [name]: digits }));
        } else if (name === 'dni' || name === 'cp') {
            const maxLength = name === 'dni' ? 8 : 10;
            const digits = value.replace(/\D/g, '').slice(0, maxLength);
            setFormData(prev => ({ ...prev, [name]: digits }));
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }

        // Limpiar error al escribir
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
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

        // Limpiar errores de ubicación
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            if (name === 'departamento') {
                delete newErrors.provincia;
                delete newErrors.distrito;
            } else if (name === 'provincia') {
                delete newErrors.distrito;
            }
            return newErrors;
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

    const validateStep1 = () => {
        const newErrors = {};

        if (metodoEnvio === 'domicilio') {
            if (direcciones.length > 0 && !usarOtraDireccion) {
                if (!direccionSeleccionada) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Dirección requerida',
                        text: 'Por favor selecciona una dirección de envío o agrega una nueva.',
                        confirmButtonColor: '#f97316'
                    });
                    return false;
                }
            } else {
                // Validación Formulario Manual
                if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
                if (!usuario && !formData.correo.trim()) {
                    newErrors.correo = 'El correo es obligatorio';
                } else if (!usuario && !/\S+@\S+\.\S+/.test(formData.correo)) {
                    newErrors.correo = 'Formato de correo inválido';
                }
                if (!formData.departamento) newErrors.departamento = 'Selecciona un departamento';
                if (!formData.provincia) newErrors.provincia = 'Selecciona una provincia';
                if (!formData.distrito) newErrors.distrito = 'Selecciona un distrito';
                if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es obligatoria';

                // Validación Teléfono
                if (!formData.telefono.trim()) {
                    newErrors.telefono = 'El teléfono es obligatorio';
                } else if (!/^9\d{8}$/.test(formData.telefono.trim())) {
                    newErrors.telefono = 'Número de celular inválido (debe empezar con 9 y tener 9 dígitos)';
                }
            }
        } else {
            // Retiro en Tienda
            if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
            if (!formData.dni.trim()) {
                newErrors.dni = 'El DNI es obligatorio';
            } else if (!/^\d{8}$/.test(formData.dni.trim())) {
                newErrors.dni = 'El DNI debe tener 8 dígitos';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (step === 1 && !validateStep1()) {
            return;
        }
        setStep(step + 1);
    };

    const handleBackStep = () => {
        setStep(step - 1);
    };

    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text);
        Swal.fire({
            title: '¡Copiado!',
            text: `${label} copiado al portapapeles`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    const handleMercadoPago = async (orderData) => {
        try {
            const response = await tiendaService.createMPPreference(orderData);
            if (response.success && response.init_point) {
                window.location.href = response.init_point;
            } else {
                throw new Exception("Error al generar el link de pago");
            }
        } catch (error) {
            hideLoader();
            setLoading(false);
            Swal.fire('Error', 'No se pudo conectar con Mercado Pago: ' + error.message, 'error');
        }
    };

    const handlePayment = async () => {
        setLoading(true);
        showLoader();
        try {
            // Validation for manual methods
            if (['yape_manual', 'plin', 'transferencia'].includes(metodoPago) && !comprobante) {
                hideLoader();
                setLoading(false);
                Swal.fire({
                    icon: 'warning',
                    title: 'Comprobante requerido',
                    text: 'Por favor adjunta una captura de tu pago para continuar.',
                    confirmButtonColor: '#f97316'
                });
                return;
            }

            const shippingData = {};
            // Build base data for shipment
            if (metodoEnvio === 'domicilio') {
                const dir = direcciones.find(d => d.id === direccionSeleccionada) || {};
                Object.assign(shippingData, {
                    nombre: dir.nombre_destinatario || formData.nombre,
                    telefono: dir.telefono || formData.telefono,
                    direccion: dir.direccion || formData.direccion,
                    departamento: dir.departamento || (ubigeoPeru.departamentos.find(d => d.id === formData.departamento)?.name || formData.departamento),
                    provincia: dir.provincia || (getProvincias(formData.departamento).find(p => p.id === formData.provincia)?.name || formData.provincia),
                    distrito: dir.distrito || (getDistritos(formData.provincia).find(d => d.id === formData.distrito)?.name || formData.distrito),
                    cp: dir.codigo_postal || formData.cp,
                    referencia: dir.referencia || formData.referencia
                });
            } else {
                Object.assign(shippingData, {
                    nombre: formData.nombre,
                    dni: formData.dni
                });
            }

            const baseOrderData = {
                usuario_id: usuario ? usuario.id : '',
                correo: formData.correo,
                total: getCartTotal() * 1.18,
                metodo_envio: metodoEnvio,
                metodo_pago: metodoPago,
                items: cart.map(item => ({
                    id: item.producto.id,
                    nombre: item.producto.nombre,
                    cantidad: item.cantidad,
                    precio: item.precio, // Enviar precio base (sin IGV adicional aquí, el email calculará o mostrará base)
                    precio_regular: item.precio_regular || item.precio,
                    variacion_id: item.variacion ? item.variacion.id : null,
                    variacion_nombre: item.variacion?.atributos?.map(a => `${a.atributo_nombre}: ${a.valor}`).join(' / ') || null,
                })),
                shipping: shippingData,
                direccion_id: (metodoEnvio === 'domicilio' && direccionSeleccionada && !usarOtraDireccion) ? direccionSeleccionada : null,
                guardar_direccion: guardarDireccion
            };

            // CASE 1: GATEWAYS (MERCADO PAGO / PAYPAL) - Create order first, then redirect
            if (['mercadopago', 'paypal'].includes(metodoPago)) {
                // Prepare FormData for Backend (to support any future file if needed)
                const formDataToSubmit = new FormData();
                Object.keys(baseOrderData).forEach(key => {
                    const value = baseOrderData[key];
                    if (value === null || value === undefined) {
                        formDataToSubmit.append(key, '');
                    } else if (typeof value === 'object') {
                        formDataToSubmit.append(key, JSON.stringify(value));
                    } else {
                        formDataToSubmit.append(key, value);
                    }
                });

                // Create the order in standard system first
                const response = await tiendaService.crearPedido(formDataToSubmit);

                if (response.success) {
                    // If DB record created, proceed to payment gateway
                    setOrderNumber(response.numero_pedido);
                    if (metodoPago === 'mercadopago') {
                        // Pass the generated order number to MP for reference
                        const mpData = { ...baseOrderData, numero_pedido: response.numero_pedido };
                        await handleMercadoPago(mpData);
                    } else {
                        // Handle PayPal or others...
                        setStep(3);
                        clearCart();
                    }
                } else {
                    throw new Error(response.message || 'Error al pre-registrar el pedido');
                }
                return;
            }

            // CASE 2: MANUAL METHODS (YAPE, PLIN, TRANSFERENCIA) - Using FormData
            const formDataToSubmit = new FormData();
            Object.keys(baseOrderData).forEach(key => {
                const value = baseOrderData[key];
                if (value === null || value === undefined) {
                    formDataToSubmit.append(key, '');
                } else if (typeof value === 'object') {
                    formDataToSubmit.append(key, JSON.stringify(value));
                } else {
                    formDataToSubmit.append(key, value);
                }
            });

            if (comprobante) {
                formDataToSubmit.append('comprobante', comprobante);
            }

            const response = await tiendaService.crearPedido(formDataToSubmit);

            if (response.success) {
                const selectedAddr = direcciones.find(d => d.id === direccionSeleccionada);
                const provinceName = getProvincias(formData.departamento).find(p => p.id === formData.provincia)?.name || '';
                const districtName = getDistritos(formData.provincia).find(d => d.id === formData.distrito)?.name || '';
                const departmentName = ubigeoPeru.departamentos.find(d => d.id === formData.departamento)?.name || '';

                setFinalOrderData({
                    items: [...cart],
                    cliente: {
                        ...formData,
                        telefono: formData.telefono || selectedAddr?.telefono || usuario?.telefono || ''
                    },
                    envío: {
                        metodo: metodoEnvio,
                        direccion: selectedAddr || {
                            direccion: formData.direccion,
                            referencia: formData.referencia,
                            distrito: districtName,
                            provincia: provinceName,
                            departamento: departmentName,
                            nombre_destinatario: formData.nombre,
                            telefono: formData.telefono
                        },
                        ubigeo: {
                            departamento: departmentName || selectedAddr?.departamento || '',
                            provincia: provinceName || selectedAddr?.provincia || '',
                            distrito: districtName || selectedAddr?.distrito || ''
                        }
                    },
                    pago: {
                        metodo: metodoPago,
                        subtotal: getSubtotal(),
                        descuento: getTotalDiscount(),
                        total: getCartTotal() * 1.18
                    },
                    orderNumber: response.numero_pedido
                });

                setOrderNumber(response.numero_pedido);
                // Limpiar solo los items comprados
                if (selectedItemsIds) {
                    for (const id of selectedItemsIds) {
                        await removeItem(id);
                    }
                } else {
                    clearCart();
                }
                setStep(3);
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
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors duration-300 ${step >= 3 ? 'bg-orange-500' : 'bg-gray-300'}`}>
                    3
                </div>
                <span className={`text-xs font-medium mt-2 ${step >= 3 ? 'text-orange-500' : 'text-gray-400'}`}>Éxito</span>
            </div>
        </div>
    );

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
        <div className="min-h-screen bg-gray-50 pt-36 pb-12 md:pt-48">
            <div className="container mx-auto px-4 max-w-6xl">

                {renderStepIndicator()}

                {step === 3 ? (
                    // Success View Redesigned
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-5xl mx-auto"
                    >
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8">
                            {/* Success Header Redesigned to Brand Orange */}
                            <div className="bg-orange-600 p-8 text-center text-white">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 10, stiffness: 100 }}
                                    className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4"
                                >
                                    <Check className="w-8 h-8 text-white" strokeWidth={3} />
                                </motion.div>
                                <h1 className="text-3xl font-extrabold mb-2">¡Pedido Confirmado!</h1>
                                <p className="text-orange-50 opacity-90">
                                    Gracias por tu compra. Tu pedido <span className="font-bold underline">#{orderNumber}</span> ha sido registrado con éxito.
                                </p>
                            </div>

                            <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {/* Details Column (Left) */}
                                <div className="lg:col-span-2 space-y-8">
                                    {/* Order Metadata */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-6 border-b border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Fecha</span>
                                            <span className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString('es-PE')}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Método de Pago</span>
                                            <span className="text-sm font-bold text-gray-900 capitalize">{finalOrderData?.pago.metodo.replace(/_/g, ' ')}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Estado</span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 w-fit">Recibido</span>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Package className="text-orange-500" size={20} />
                                            Productos del Pedido
                                        </h3>
                                        <div className="space-y-4">
                                            {finalOrderData?.items.map((item, idx) => (
                                                <div key={idx} className="flex gap-4 p-3 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                                    <div className="w-20 h-20 bg-white rounded-lg overflow-hidden border border-gray-100 shrink-0">
                                                        <img src={item.producto?.imagen} alt={item.producto?.nombre} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.producto?.nombre}</h4>
                                                        {item.variacion && (
                                                            <p className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm inline-block mt-1">
                                                                {item.variacion.atributos?.map(a => `${a.atributo_nombre}: ${a.valor}`).join(' / ')}
                                                            </p>
                                                        )}
                                                        <div className="flex justify-between items-center mt-2">
                                                            <span className="text-xs text-gray-500 font-medium">Cant: {item.cantidad}</span>
                                                            <span className="text-sm font-bold text-gray-900">{formatCurrency(parseFloat(item.precio) * item.cantidad)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Shipping info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
                                        <div>
                                            <h4 className="text-xs font-bold text-orange-900 flex items-center gap-2 mb-3">
                                                <MapPin size={16} /> Datos de Entrega
                                            </h4>
                                            <div className="space-y-2">
                                                <p className="text-sm font-bold text-gray-900 capitalize">{finalOrderData?.envío.metodo === 'tienda' ? 'Retiro en Tienda' : 'Envio a Domicilio'}</p>
                                                <div className="text-sm text-gray-600 space-y-0.5">
                                                    <p className="font-bold text-gray-800">{finalOrderData?.envío.direccion.direccion}</p>
                                                    {finalOrderData?.envío.direccion.referencia && (
                                                        <p className="text-xs italic">{finalOrderData?.envío.direccion.referencia}</p>
                                                    )}
                                                    <p>{finalOrderData?.envío.ubigeo.distrito || finalOrderData?.envío.direccion.distrito}, {finalOrderData?.envío.ubigeo.provincia || finalOrderData?.envío.direccion.provincia}, {finalOrderData?.envío.ubigeo.departamento || finalOrderData?.envío.direccion.departamento}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <div className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm border border-orange-100">
                                                <Truck size={24} className="text-orange-500 shrink-0" />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900">Tiempo Estimado</p>
                                                    <p className="text-sm text-orange-600 font-bold">
                                                        {(() => {
                                                            const locStr = `${finalOrderData?.envío.ubigeo.distrito} ${finalOrderData?.envío.ubigeo.provincia} ${finalOrderData?.envío.ubigeo.departamento}`;
                                                            const estimate = formatDeliveryEstimate(new Date(), locStr, finalOrderData?.envío.metodo === 'tienda');
                                                            const label = getDeliveryLabel('pendiente', finalOrderData?.envío.metodo === 'tienda', estimate);
                                                            return `${label} ${estimate}`;
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Column (Right) */}
                                <div className="space-y-6">
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Datos de Contacto</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                    <User size={14} className="text-gray-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Nombre</p>
                                                    <p className="text-xs font-bold text-gray-900 truncate">{finalOrderData?.cliente.nombre}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                    <Mail size={14} className="text-gray-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Correo</p>
                                                    <p className="text-xs font-bold text-gray-900 truncate">{finalOrderData?.cliente.correo || usuario?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                    <Phone size={14} className="text-gray-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Teléfono</p>
                                                    <p className="text-xs font-bold text-gray-900">
                                                        {finalOrderData?.cliente.telefono || finalOrderData?.envío.direccion.telefono || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-50 shadow-sm">
                                        <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Resumen Económico</h3>
                                        <div className="space-y-3">
                                            <div className="pt-3 border-t border-gray-100 mt-3 space-y-2">
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>Base Imponible (Neto)</span>
                                                    <span className="font-bold">{formatCurrency(finalOrderData?.pago.total / 1.18)}</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-orange-600">
                                                    <span>IGV (18%)</span>
                                                    <span className="font-bold">+{formatCurrency(finalOrderData?.pago.total - (finalOrderData?.pago.total / 1.18))}</span>
                                                </div>
                                                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                                    <span className="text-sm font-extrabold text-gray-900">Total Pagado</span>
                                                    <span className="text-xl font-extrabold text-orange-500">{formatCurrency(finalOrderData?.pago.total)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => { showLoader(); navigate('/'); setTimeout(hideLoader, 500); }}
                                        className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                                    >
                                        Continuar Comprando <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    // Grid Layout for Step 1 & 2
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Main Column */}
                        <div className="lg:col-span-2 space-y-8">

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
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo</label>
                                                                <input
                                                                    type="text"
                                                                    name="nombre"
                                                                    value={formData.nombre}
                                                                    onChange={handleInputChange}
                                                                    placeholder="Ej: Juan Pérez"
                                                                    className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${errors.nombre ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500'}`}
                                                                />
                                                                {errors.nombre && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.nombre}</p>}
                                                            </div>
                                                            {!usuario && (
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
                                                                    <input
                                                                        type="email"
                                                                        name="correo"
                                                                        value={formData.correo}
                                                                        onChange={handleInputChange}
                                                                        placeholder="tu@email.com"
                                                                        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${errors.correo ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500'}`}
                                                                        required
                                                                    />
                                                                    {errors.correo && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.correo}</p>}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Selectores de Ubicación Perú */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-700 mb-1">Departamento</label>
                                                                <select
                                                                    name="departamento"
                                                                    value={formData.departamento}
                                                                    onChange={handleUbicacionChange}
                                                                    className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 transition-colors appearance-none ${errors.departamento ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500'}`}
                                                                >
                                                                    <option value="">Seleccionar</option>
                                                                    {ubigeoPeru.departamentos.map(d => (
                                                                        <option key={d.id} value={d.id}>{d.name}</option>
                                                                    ))}
                                                                </select>
                                                                {errors.departamento && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.departamento}</p>}
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-700 mb-1">Provincia</label>
                                                                <select
                                                                    name="provincia"
                                                                    value={formData.provincia}
                                                                    onChange={handleUbicacionChange}
                                                                    disabled={!formData.departamento}
                                                                    className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 transition-colors appearance-none disabled:opacity-50 ${errors.provincia ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500'}`}
                                                                >
                                                                    <option value="">Seleccionar</option>
                                                                    {getProvincias(formData.departamento).map(p => (
                                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                                    ))}
                                                                </select>
                                                                {errors.provincia && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.provincia}</p>}
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-700 mb-1">Distrito</label>
                                                                <select
                                                                    name="distrito"
                                                                    value={formData.distrito}
                                                                    onChange={handleUbicacionChange}
                                                                    disabled={!formData.provincia}
                                                                    className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 transition-colors appearance-none disabled:opacity-50 ${errors.distrito ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500'}`}
                                                                >
                                                                    <option value="">Seleccionar</option>
                                                                    {getDistritos(formData.provincia).map(d => (
                                                                        <option key={d.id} value={d.id}>{d.name}</option>
                                                                    ))}
                                                                </select>
                                                                {errors.distrito && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.distrito}</p>}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-700 mb-1">Dirección (Calle y Número)</label>
                                                            <input
                                                                type="text"
                                                                name="direccion"
                                                                value={formData.direccion}
                                                                onChange={handleInputChange}
                                                                className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${errors.direccion ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500'}`}
                                                            />
                                                            {errors.direccion && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.direccion}</p>}
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-700 mb-1">Referencia (Opcional)</label>
                                                            <input
                                                                type="text"
                                                                name="referencia"
                                                                placeholder="Ej: Frente al parque, puerta azul"
                                                                value={formData.referencia}
                                                                onChange={handleInputChange}
                                                                className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${errors.referencia ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500'}`}
                                                            />
                                                            {errors.referencia && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.referencia}</p>}
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
                                                                    className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${errors.telefono ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500'}`}
                                                                />
                                                                {errors.telefono && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.telefono}</p>}
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
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">Tienda Central - Chachapoyas</h3>
                                            <p className="text-gray-600 mb-4">Jr. Amazonas 720, Chachapoyas<br />Horario: Lunes a Sábado 10:00am - 8:00pm</p>

                                            <div className="text-left border-t border-gray-200 pt-4 mt-4">
                                                <label className="block text-xs font-bold text-gray-700 mb-1">Persona que recoge</label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-1 w-full">
                                                        <input
                                                            type="text"
                                                            name="nombre"
                                                            placeholder="Nombre completo"
                                                            value={formData.nombre}
                                                            onChange={handleInputChange}
                                                            className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-1 transition-colors ${errors.nombre ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500'}`}
                                                        />
                                                        {errors.nombre && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.nombre}</p>}
                                                    </div>
                                                    <div className="flex flex-col gap-1 w-full">
                                                        <input
                                                            type="text"
                                                            name="dni"
                                                            placeholder="DNI (Obligatorio)"
                                                            value={formData.dni}
                                                            onChange={handleInputChange}
                                                            maxLength={8}
                                                            className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-1 transition-colors ${errors.dni ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500'}`}
                                                        />
                                                        {errors.dni && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.dni}</p>}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-orange-600 mt-2">* Debes mostrar tu DNI al momento de recoger. El DNI ingresado aquí será verificado.</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-8">
                                        <button
                                            onClick={() => {
                                                if (step === 1 && !validateStep1()) return;
                                                showLoader();
                                                setTimeout(() => {
                                                    handleNextStep();
                                                    hideLoader();
                                                }, 300);
                                            }}
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

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                                            {[
                                                { id: 'mercadopago', label: 'Mercado Pago', icon: <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[8px] text-white font-bold">MP</div> },
                                                { id: 'tarjeta', label: 'Tarjeta (Directa)', icon: <CreditCard size={20} /> },
                                                { id: 'yape_manual', label: 'Yape Manual', icon: <div className="w-5 h-5 bg-purple-600 rounded-full" /> },
                                                { id: 'plin', label: 'Plin', icon: <div className="w-5 h-5 bg-blue-400 rounded-full" /> },
                                                { id: 'transferencia', label: 'Banco', icon: <Store size={20} /> },
                                                { id: 'pagoefectivo', label: 'Agentes', icon: <Truck size={20} /> },
                                                { id: 'contraentrega', label: 'Efectivo', icon: <Home size={20} /> },
                                                { id: 'paypal', label: 'PayPal', icon: <CreditCard size={20} className="text-blue-600" /> },
                                            ].map((method) => (
                                                <div
                                                    key={method.id}
                                                    onClick={() => setMetodoPago(method.id)}
                                                    className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${metodoPago === method.id
                                                        ? 'border-orange-500 bg-orange-50'
                                                        : 'border-gray-100 hover:border-orange-100'
                                                        }`}
                                                >
                                                    <div className={`p-2 rounded-lg ${metodoPago === method.id ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-500'}`}>
                                                        {method.icon}
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-tighter ${metodoPago === method.id ? 'text-orange-800' : 'text-gray-500'}`}>
                                                        {method.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {metodoPago === 'mercadopago' && (
                                            <div className="mb-6 p-6 border border-blue-200 bg-blue-50 rounded-2xl animate-in fade-in slide-in-from-top-2">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-blue-100">
                                                        <CreditCard className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-blue-900 text-sm italic">MERCADO PAGO (RECOMENDADO)</h3>
                                                        <p className="text-[10px] text-blue-500">Paga con Yape, Tarjetas de Crédito/Débito o Efectivo de forma segura.</p>
                                                    </div>
                                                </div>
                                                <div className="bg-white/60 p-4 rounded-xl border border-blue-100">
                                                    <p className="text-[11px] text-blue-700 font-bold mb-2">• Pago inmediato y automático.</p>
                                                    <p className="text-[11px] text-blue-700 font-bold">• No necesitas subir comprobantes.</p>
                                                    <p className="text-[11px] text-blue-700 font-bold">• Tu pedido se procesa al instante.</p>
                                                </div>
                                            </div>
                                        )}

                                        {metodoPago === 'tarjeta' && (
                                            <div className="mb-6 p-4 border border-orange-200 bg-orange-50 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-4 h-4 rounded-full border-[5px] border-orange-500 bg-white"></div>
                                                    <span className="font-bold text-gray-800">Tarjeta de Crédito / Débito</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                                                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                                                </div>
                                            </div>
                                        )}

                                        {metodoPago === 'yape_manual' && (
                                            <div className="mb-6 p-6 border border-purple-200 bg-purple-50 rounded-2xl animate-in fade-in slide-in-from-top-2">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="p-2 bg-white rounded-2xl shadow-sm border border-purple-100">
                                                        <img
                                                            src="file:///C:/Users/ASUS/.gemini/antigravity/brain/054a8fe8-b84a-447c-a318-3634bef565df/yape_qr_placeholder_1766357309904.png"
                                                            alt="Yape QR"
                                                            className="w-48 h-48 object-contain"
                                                        />
                                                    </div>

                                                    <div className="w-full space-y-3">
                                                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-purple-100 shadow-sm">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600">
                                                                    <Phone size={14} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Número</p>
                                                                    <p className="text-sm font-black text-purple-900">999 888 777</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleCopy('999888777', 'Número Yape')}
                                                                className="p-2 hover:bg-purple-50 rounded-lg text-purple-400 hover:text-purple-600 transition-colors"
                                                            >
                                                                <Copy size={16} />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-purple-100 shadow-sm">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600">
                                                                    <Check size={14} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Monto a pagar</p>
                                                                    <p className="text-sm font-black text-purple-900">{formatCurrency(getCartTotal(cart))}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleCopy(getCartTotal(cart), 'Monto')}
                                                                className="p-2 hover:bg-purple-50 rounded-lg text-purple-400 hover:text-purple-600 transition-colors"
                                                            >
                                                                <Copy size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="w-full space-y-4 pt-4 border-t border-purple-100">
                                                        <div className="text-center">
                                                            <p className="text-[10px] font-black text-purple-900 uppercase tracking-widest mb-1">Paso Final: Adjunta tu Comprobante</p>
                                                            <p className="text-[9px] text-purple-400">Captura la pantalla de tu Yape exitoso y súbela aquí.</p>
                                                        </div>

                                                        <label className="relative group cursor-pointer block">
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => setComprobante(e.target.files[0])}
                                                            />
                                                            <div className={`w-full py-4 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center gap-2 ${comprobante ? 'border-purple-500 bg-purple-100/50' : 'border-purple-200 bg-white hover:border-purple-400'}`}>
                                                                {comprobante ? (
                                                                    <>
                                                                        <Check size={24} className="text-purple-600" />
                                                                        <span className="text-[10px] font-bold text-purple-700">{comprobante.name}</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Plus size={24} className="text-purple-300 group-hover:text-purple-500 transition-colors" />
                                                                        <span className="text-[10px] font-bold text-purple-400 group-hover:text-purple-600 transition-colors">SUBIR CAPTURA / FOTO</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {metodoPago === 'plin' && (
                                            <div className="mb-6 p-6 border border-blue-200 bg-blue-50 rounded-2xl animate-in fade-in slide-in-from-top-2">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="p-2 bg-white rounded-2xl shadow-sm border border-blue-100">
                                                        <img
                                                            src="file:///C:/Users/ASUS/.gemini/antigravity/brain/054a8fe8-b84a-447c-a318-3634bef565df/plin_qr_placeholder_1766357330298.png"
                                                            alt="Plin QR"
                                                            className="w-48 h-48 object-contain"
                                                        />
                                                    </div>

                                                    <div className="w-full space-y-3">
                                                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                                                                    <Phone size={14} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Número</p>
                                                                    <p className="text-sm font-black text-blue-900">999 888 777</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleCopy('999888777', 'Número Plin')}
                                                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-400 hover:text-blue-600 transition-colors"
                                                            >
                                                                <Copy size={16} />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                                                                    <Check size={14} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Monto a pagar</p>
                                                                    <p className="text-sm font-black text-blue-900">{formatCurrency(getCartTotal(cart))}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleCopy(getCartTotal(cart), 'Monto')}
                                                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-400 hover:text-blue-600 transition-colors"
                                                            >
                                                                <Copy size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="w-full space-y-4 pt-4 border-t border-blue-100">
                                                        <div className="text-center">
                                                            <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">Adjunta tu Comprobante de Plin</p>
                                                        </div>
                                                        <label className="relative group cursor-pointer block">
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => setComprobante(e.target.files[0])}
                                                            />
                                                            <div className={`w-full py-4 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center gap-2 ${comprobante ? 'border-blue-500 bg-blue-100/50' : 'border-blue-200 bg-white hover:border-blue-400'}`}>
                                                                {comprobante ? (
                                                                    <>
                                                                        <Check size={24} className="text-blue-600" />
                                                                        <span className="text-[10px] font-bold text-blue-700">{comprobante.name}</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Plus size={24} className="text-blue-300 group-hover:text-blue-500 transition-colors" />
                                                                        <span className="text-[10px] font-bold text-blue-400 group-hover:text-blue-600 transition-colors">SUBIR CAPTURA PLIN</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {metodoPago === 'transferencia' && (
                                            <div className="mb-6 p-6 border border-indigo-200 bg-indigo-50 rounded-2xl animate-in fade-in slide-in-from-top-2">
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-indigo-100 text-indigo-600">
                                                            <Store size={20} />
                                                        </div>
                                                        <h3 className="text-xs font-black text-indigo-900 uppercase tracking-widest">Cuentas Bancarias</h3>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm space-y-3">
                                                            <div>
                                                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">Banco de Crédito (BCP)</p>
                                                                <div className="flex items-center justify-between mt-1">
                                                                    <p className="text-[11px] font-black text-indigo-900">191-22334455-0-99</p>
                                                                    <button onClick={() => handleCopy('19122334455099', 'Cuenta BCP')} className="text-indigo-400 hover:text-indigo-600"><Copy size={12} /></button>
                                                                </div>
                                                                <div className="flex items-center justify-between mt-1 pt-1 border-t border-indigo-50">
                                                                    <p className="text-[9px] text-indigo-500 font-bold">CCI: 002-191-22334455099-52</p>
                                                                    <button onClick={() => handleCopy('0021912233445509952', 'CCI BCP')} className="text-indigo-400 hover:text-indigo-600"><Copy size={12} /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm space-y-3">
                                                            <div>
                                                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">BBVA Perú</p>
                                                                <div className="flex items-center justify-between mt-1">
                                                                    <p className="text-[11px] font-black text-indigo-900">0011-0422-0100033445</p>
                                                                    <button onClick={() => handleCopy('001104220100033445', 'Cuenta BBVA')} className="text-indigo-400 hover:text-indigo-600"><Copy size={12} /></button>
                                                                </div>
                                                                <div className="flex items-center justify-between mt-1 pt-1 border-t border-indigo-50">
                                                                    <p className="text-[9px] text-indigo-500 font-bold">CCI: 011-422-000100033445-55</p>
                                                                    <button onClick={() => handleCopy('01142200010003344555', 'CCI BBVA')} className="text-indigo-400 hover:text-indigo-600"><Copy size={12} /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-3 bg-white/50 rounded-xl border border-indigo-100 flex items-center justify-between group">
                                                        <div>
                                                            <p className="text-[10px] text-indigo-700 font-bold">Titular: RED HARD SAC</p>
                                                            <p className="text-[9px] text-indigo-400 mt-1 uppercase tracking-tighter italic">Envía tu comprobante a pagos@redhard.com.pe</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-indigo-100 shadow-inner">
                                                            <p className="text-xs font-black text-indigo-900">{formatCurrency(getCartTotal(cart))}</p>
                                                            <button onClick={() => handleCopy(getCartTotal(cart), 'Monto')} className="text-indigo-400 hover:text-indigo-600"><Copy size={12} /></button>
                                                        </div>
                                                    </div>

                                                    <div className="w-full space-y-4 pt-4 border-t border-indigo-100">
                                                        <div className="text-center">
                                                            <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1">Adjunta Comprobante de Transferencia</p>
                                                        </div>
                                                        <label className="relative group cursor-pointer block">
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => setComprobante(e.target.files[0])}
                                                            />
                                                            <div className={`w-full py-4 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center gap-2 ${comprobante ? 'border-indigo-500 bg-indigo-100/50' : 'border-indigo-200 bg-white hover:border-indigo-400'}`}>
                                                                {comprobante ? (
                                                                    <>
                                                                        <Check size={24} className="text-indigo-600" />
                                                                        <span className="text-[10px] font-bold text-indigo-700">{comprobante.name}</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Plus size={24} className="text-indigo-300 group-hover:text-indigo-500 transition-colors" />
                                                                        <span className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-600 transition-colors">SUBIR VOUCHER</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {metodoPago === 'pagoefectivo' && (
                                            <div className="mb-6 p-6 border border-yellow-200 bg-yellow-50 rounded-2xl animate-in fade-in slide-in-from-top-2 text-center">
                                                <div className="mb-4">
                                                    <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto flex items-center justify-center shadow-lg border-4 border-white">
                                                        <Truck size={32} className="text-white" />
                                                    </div>
                                                </div>
                                                <h3 className="text-sm font-black text-yellow-900 uppercase tracking-widest mb-2">Pago en Agentes</h3>
                                                <p className="text-[10px] text-yellow-700 font-medium mb-6 px-4">
                                                    Generaremos un código <span className="font-bold">CIP de PagoEfectivo</span> que podrás pagar en cualquier agente o banca por internet.
                                                </p>
                                                <div className="grid grid-cols-4 gap-2 opacity-60">
                                                    {['BCP', 'BBVA', 'Interbank', 'Scotiabank'].map(b => (
                                                        <div key={b} className="bg-white py-1.5 rounded-lg border border-yellow-100 text-[8px] font-black text-yellow-600 uppercase italic">{b}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {metodoPago === 'contraentrega' && (
                                            <div className="mb-6 p-6 border border-emerald-200 bg-emerald-50 rounded-2xl animate-in fade-in slide-in-from-top-2 text-center">
                                                <div className="mb-4">
                                                    <div className="w-16 h-16 bg-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-lg border-4 border-white">
                                                        <Home size={32} className="text-white" />
                                                    </div>
                                                </div>
                                                <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-2">Pago Contra Entrega</h3>
                                                <p className="text-[10px] text-emerald-700 font-medium px-4">
                                                    ¡Perfecto! Paga en <span className="font-bold">efectivo o con tarjeta</span> directamente al repartidor cuando recibas tus productos en casa.
                                                </p>
                                                <div className="mt-6 inline-flex items-center gap-2 py-2 px-4 bg-white rounded-full border border-emerald-100 shadow-sm">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Disponible para Lima</span>
                                                </div>
                                            </div>
                                        )}

                                        {metodoPago === 'tarjeta' && (
                                            <div className="space-y-4 border-t border-gray-100 pt-6 animate-in fade-in slide-in-from-top-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">Número de Tarjeta</label>
                                                    <div className="relative">
                                                        <CreditCard className="absolute left-3 top-3 text-gray-400" size={20} />
                                                        <input
                                                            type="text"
                                                            name="tarjetaNumero"
                                                            value={formData.tarjetaNumero}
                                                            onChange={handleInputChange}
                                                            placeholder="0000 0000 0000 0000"
                                                            className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-700 mb-1">Expiración</label>
                                                        <input
                                                            type="text"
                                                            name="tarjetaExpiracion"
                                                            value={formData.tarjetaExpiracion}
                                                            onChange={handleInputChange}
                                                            placeholder="MM/YY"
                                                            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-700 mb-1">CVV</label>
                                                        <input
                                                            type="text"
                                                            name="tarjetaCvv"
                                                            value={formData.tarjetaCvv}
                                                            onChange={handleInputChange}
                                                            placeholder="123"
                                                            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {metodoPago === 'paypal' && (
                                            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl text-center animate-in zoom-in-95">
                                                <div className="mb-4">
                                                    <CreditCard size={40} className="text-blue-600 mx-auto" strokeWidth={1} />
                                                </div>
                                                <h3 className="text-sm font-bold text-blue-900 mb-2">PayPal Checkout</h3>
                                                <p className="text-[10px] text-blue-700 mb-6">Paga de forma rápida y segura con tu cuenta PayPal o tarjeta vinculada.</p>
                                                <button className="w-full py-3 bg-[#FFC439] hover:bg-[#F2BA36] rounded-full flex items-center justify-center gap-2 shadow-sm transition-all group">
                                                    <span className="font-black italic text-blue-800 text-lg">PayPal</span>
                                                    <span className="text-xs font-bold text-blue-900 group-hover:underline">Pagar ahora</span>
                                                </button>
                                            </div>
                                        )}

                                        <div className="mt-8">
                                            <button
                                                onClick={handlePayment}
                                                disabled={loading}
                                                className={`w-full py-4 text-white font-black rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${metodoPago === 'mercadopago' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-100'}`}
                                            >
                                                {loading ? (
                                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <>
                                                        {metodoPago === 'mercadopago' ? <CreditCard size={20} /> : <Check size={20} />}
                                                        {metodoPago === 'mercadopago' ? 'PAGAR AHORA CON MERCADO PAGO' : (['yape_manual', 'plin', 'transferencia', 'pagoefectivo'].includes(metodoPago)
                                                            ? 'YA PAGUÉ, CONFIRMAR PEDIDO'
                                                            : 'PAGAR AHORA')}
                                                    </>
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
                                <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-50 pb-4">Resumen del Pedido</h3>

                                <div className="space-y-4 mb-6">
                                    {cart.map((item) => (
                                        <div key={`${item.id}-${JSON.stringify(item.variacion)}`} className="flex gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                            <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                                <img
                                                    src={item.producto?.imagen}
                                                    alt={item.producto?.nombre}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-bold text-gray-900 line-clamp-1 mb-0.5">{item.producto?.nombre}</p>
                                                {item.variacion && (
                                                    <p className="text-[9px] text-blue-600 bg-blue-50 inline-block px-1.5 py-0.5 rounded mb-1 font-medium">
                                                        {item.variacion.atributos?.map(a => `${a.atributo_nombre}: ${a.valor}`).join(' / ')}
                                                    </p>
                                                )}
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] text-gray-500">Cant: {item.cantidad}</span>
                                                    <div className="text-right">
                                                        {(item.precio_regular && parseFloat(item.precio) < parseFloat(item.precio_regular)) && (
                                                            <p className="text-[9px] text-gray-400 line-through">
                                                                {formatCurrency(parseFloat(item.precio_regular) * item.cantidad)}
                                                            </p>
                                                        )}
                                                        <span className="text-xs font-black text-gray-900">
                                                            {formatCurrency(parseFloat(item.precio) * item.cantidad)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2.5 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(getSubtotal())}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Envío</span>
                                        <span className="font-bold text-green-600">GRATIS</span>
                                    </div>
                                    {getTotalDiscount() > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 text-red-500">Descuento</span>
                                            <span className="font-medium text-red-500">-{formatCurrency(getTotalDiscount())}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-sm text-gray-900 font-bold border-t border-gray-100 pt-2">
                                        <span>Neto (Base Imponible)</span>
                                        <span>{formatCurrency(getCartTotal())}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-orange-600">
                                        <span>IGV (18%)</span>
                                        <span className="font-medium">+{formatCurrency(getCartTotal() * 0.18)}</span>
                                    </div>

                                    <div className="flex justify-between text-xl font-bold pt-3 border-t-2 border-orange-100">
                                        <div className="w-full">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-900">Total a Pagar</span>
                                                <span className="text-orange-500">{formatCurrency(getCartTotal() * 1.18)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 bg-orange-50 rounded-lg p-3 flex gap-3 items-start border border-orange-100">
                                    <Truck className="text-orange-500 shrink-0 mt-0.5" size={16} />
                                    <div>
                                        <p className="text-xs font-bold text-orange-800">
                                            {metodoEnvio === 'tienda' ? '¡Recojo en Tienda!' : '¡Envío Express Gratis aplicado!'}
                                        </p>
                                        <p className="text-[10px] text-orange-700">
                                            {(() => {
                                                const dir = direcciones.find(d => d.id === direccionSeleccionada);
                                                const locationStr = dir
                                                    ? `${dir.distrito} ${dir.provincia} ${dir.departamento}`
                                                    : (() => {
                                                        const depName = ubigeoPeru.departamentos.find(d => d.id === formData.departamento)?.name || formData.departamento;
                                                        const provName = getProvincias(formData.departamento).find(p => p.id === formData.provincia)?.name || '';
                                                        const distName = getDistritos(formData.provincia).find(d => d.id === formData.distrito)?.name || formData.distrito;
                                                        return `${distName} ${provName} ${depName}`;
                                                    })();
                                                const estimate = formatDeliveryEstimate(new Date(), locationStr, metodoEnvio === 'tienda');
                                                const label = getDeliveryLabel('pendiente', metodoEnvio === 'tienda', estimate);
                                                return `${label} ${estimate}`;
                                            })()}
                                        </p>
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
