import { useState } from 'react';
import { Truck, ChevronUp, MapPin } from 'lucide-react';
import { formatDeliveryEstimate, getDeliveryLabel } from '../utils/dateUtils';
import { Loader } from './Loader';
import { FullScreenLoader } from './FullScreenLoader';

export const OrderCard = ({ pedido }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [loadingReorder, setLoadingReorder] = useState(false);
    const [loadingReview, setLoadingReview] = useState(false);

    // Robust checking: If method is 'tienda' OR if the status itself implies pickup
    const rawMethod = pedido.metodo_envio ? pedido.metodo_envio.toLowerCase().trim() : 'domicilio';
    const isPickup = rawMethod.includes('tienda') || pedido.estado.toLowerCase() === 'listo_recoger' || pedido.estado.toLowerCase() === 'recogido';

    return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 mb-4 overflow-hidden">
            {/* Header Section - Amazon Style: Gray Background */}
            <div className="px-3 py-2 flex items-center justify-between bg-gray-50 border-b border-gray-200 md:px-6">
                <div className="flex gap-4 md:gap-16">
                    <div>
                        <p className="text-[10px] text-gray-600 font-bold uppercase mb-1 tracking-wider">Fecha Pedido</p>
                        <p className="text-xs text-black">
                            <span className="md:hidden">
                                {new Date(pedido.fecha_creacion).toLocaleDateString('es-PE')}
                            </span>
                            <span className="hidden md:inline">
                                {new Date(pedido.fecha_creacion).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-600 font-bold uppercase mb-1 tracking-wider">Total</p>
                        <p className="text-xs text-black">S/ {parseFloat(pedido.total).toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-600 font-bold uppercase mb-1 tracking-wider">Pedido #</p>
                        <p className="text-xs text-black whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] md:max-w-none">{pedido.numero_pedido}</p>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <button className="text-xs text-orange-500 font-bold  hover:text-orange-700 transition-colors font-medium hidden md:block">
                        Factura
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 md:px-6 md:py-1.5 text-xs font-medium text-black bg-white border border-gray-300 rounded-lg md:rounded-[35px] hover:bg-gray-50 transition shadow-sm flex items-center justify-center"
                        aria-label={isExpanded ? "Ocultar detalles" : "Ver detalles"}
                    >
                        {isPickup ? (
                            <MapPin size={16} className={`md:hidden text-orange-500 transition-transform ${isExpanded ? 'scale-x-[-1]' : ''}`} />
                        ) : (
                            <Truck size={16} className={`md:hidden text-orange-500 transition-transform ${isExpanded ? 'scale-x-[-1]' : ''}`} />
                        )}
                        <span className="hidden md:inline">{isExpanded ? 'Ocultar' : 'Ver detalles'}</span>
                    </button>
                </div>
            </div>

            {/* Expandable Content */}
            {isExpanded && (
                <>
                    {/* Timeline Section */}
                    <div className="px-3 py-6 border-b border-gray-100 bg-white md:px-6">
                        {/* ... Timeline code kept mostly same but ensure clean background ... */}
                        <div className="flex items-center gap-2 mb-6">
                            {isPickup ? (
                                <MapPin size={20} className="text-orange-500" />
                            ) : (
                                <Truck size={20} className="text-orange-500" />
                            )}
                            <h4 className="text-sm font-bold text-gray-900">{isPickup ? 'Estado del Recojo' : 'Estado del Envío'}</h4>
                        </div>

                        {(() => {
                            const steps = isPickup
                                ? ['Pedido Realizado', 'Confirmado', 'Preparando', 'Listo para Recoger', 'Recogido']
                                : ['Pedido Realizado', 'Confirmado', 'Preparando', 'Enviado', 'Entregado'];

                            const statusMap = {
                                'pendiente': 0,
                                'pendiente_verificacion': 1,
                                'pagado': 1,
                                'en_preparacion': 2,
                                'enviado': 3,
                                'listo_recoger': 3,
                                'entregado': 4,
                                'completado': 4,
                                'recogido': 4,
                                'devuelto': 0,
                                'cancelado': 4
                            };

                            const currentStepIndex = statusMap[pedido.estado.toLowerCase()] ?? 0;
                            const progressPercentage = (currentStepIndex / (steps.length - 1)) * 100;

                            return (
                                <div className="relative mb-4">
                                    <div className="absolute top-2 md:top-3 left-0 right-0 h-[2px] bg-gray-200">
                                        <div
                                            className="h-full bg-green-500 transition-all duration-300"
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                    <div className="relative flex justify-between text-center">
                                        {steps.map((status, idx) => (
                                            <div key={status} className="flex flex-col items-center w-14 md:w-20">
                                                <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center z-10 transition-colors duration-300
                                                    ${idx <= currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}`}>
                                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>
                                                </div>
                                                <p className={`text-[8px] md:text-[10px] mt-2 font-medium leading-tight ${idx <= currentStepIndex ? 'text-gray-900' : 'text-gray-500'}`}>
                                                    {status}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Products Section - White Background */}
                    <div className="px-3 py-3 bg-white md:px-6">
                        <div className="mb-2">
                            {(() => {
                                const statusConfigs = {
                                    'pendiente': { label: 'Pendiente de pago', color: '#EAB308', icon: Truck },
                                    'pendiente_verificacion': { label: 'Pendiente de Verificación', color: '#F97316', icon: Truck },
                                    'pagado': { label: 'Pagado', color: '#22C55E', icon: Truck },
                                    'en_preparacion': { label: 'En Preparación', color: '#6366F1', icon: Truck },
                                    'enviado': {
                                        label: isPickup ? '¡Listo para recoger!' : 'Enviado',
                                        color: isPickup ? '#F59E0B' : '#A855F7',
                                        icon: isPickup ? MapPin : Truck
                                    },
                                    'listo_recoger': { label: '¡Listo para recoger!', color: '#F59E0B', icon: MapPin },
                                    'entregado': {
                                        label: isPickup ? 'Recogido en Tienda' : 'Entregado',
                                        color: '#10B981',
                                        icon: isPickup ? MapPin : Truck
                                    },
                                    'completado': {
                                        label: isPickup ? 'Recogido en Tienda' : 'Completado',
                                        color: '#10B981',
                                        icon: isPickup ? MapPin : Truck
                                    },
                                    'recogido': { label: 'Recogido en Tienda', color: '#10B981', icon: MapPin },
                                    'cancelado': { label: 'Cancelado', color: '#EF4444', icon: Truck },
                                    'devuelto': { label: 'Devuelto', color: '#6B7280', icon: Truck }
                                };
                                const state = pedido.estado.toLowerCase();
                                const config = statusConfigs[state] || { label: pedido.estado, color: '#22C55E', icon: isPickup ? MapPin : Truck };
                                const StatusIcon = config.icon;

                                return (
                                    <h3 className="text-[12px] font-medium mb-1 capitalize flex items-center gap-1" style={{ color: config.color }}>
                                        <StatusIcon size={14} className="mr-0.5" />
                                        {config.label}

                                        <span className="text-[10px] text-gray-500 ml-1"> {(() => {
                                            const estimate = formatDeliveryEstimate(pedido.fecha_creacion, pedido.datos_envio, isPickup);
                                            return `${getDeliveryLabel(state, isPickup, estimate)} ${estimate}`;
                                        })()}
                                        </span>
                                    </h3>
                                );
                            })()}
                        </div>

                        <div className="flex gap-6">
                            {/* Lista de productos - Izquierda */}
                            <div className="flex-1 space-y-6">
                                {pedido.items && pedido.items.map((item, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="w-14 h-14 flex-shrink-0 border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
                                            <img
                                                src={item.imagen}
                                                alt={item.nombre}
                                                className="w-full h-full object-contain p-2"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0 py-1">
                                            <h4 className="hidden md:block text-xs font-medium text-gray-900 hover:text-orange-500 cursor-pointer line-clamp-2 mb-1">
                                                {item.nombre}
                                            </h4>
                                            {item.variacion_nombre && (
                                                <p className="text-[10px] text-gray-500 mt-1">{item.variacion_nombre}</p>
                                            )}

                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-xs font-bold text-gray-900">S/ {parseFloat(item.subtotal / item.cantidad).toFixed(2)}</span>
                                                    <span className="text-xs text-gray-500">x {item.cantidad}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Botones de acción - Derecha */}
                            <div className="flex flex-col gap-2 min-w-[140px]">
                                <button
                                    onClick={() => {
                                        setLoadingReorder(true);
                                        // Simular acción - aquí iría tu lógica real
                                        setTimeout(() => setLoadingReorder(false), 1500);
                                    }}
                                    disabled={loadingReorder}
                                    className="w-full py-1.5 bg-white text-gray-700 border border-orange-500 hover:bg-orange-500 hover:text-white text-[10px] md:text-xs font-medium rounded-[25px] shadow-sm transition-colors text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Comprar de nuevo
                                </button>

                                <button
                                    onClick={() => {
                                        setLoadingReview(true);
                                        // Simular acción - aquí iría tu lógica real
                                        setTimeout(() => setLoadingReview(false), 1500);
                                    }}
                                    disabled={loadingReview}
                                    className="w-full py-1.5 bg-white hover:border-gray-700 text-gray-700 border border-gray-500 text-[10px] md:text-xs font-medium rounded-[25px] shadow-sm transition-colors text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Opinar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Loader de pantalla completa */}
            {(loadingReorder || loadingReview) && <FullScreenLoader />}
        </div>
    );
};
