import { useState } from 'react';
import { Truck } from 'lucide-react';

export const OrderCard = ({ pedido }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Robust checking: If method is 'tienda' OR if the status itself implies pickup
    const method = pedido.metodo_envio ? pedido.metodo_envio.toLowerCase().trim() : 'domicilio';
    const isPickup = method === 'tienda' || pedido.estado === 'Listo para recoger' || pedido.estado === 'Recogido';

    return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 mb-4 overflow-hidden">
            {/* Header Section - Amazon Style: Gray Background */}
            <div className="px-6 py-2 flex items-center justify-between bg-gray-50 border-b border-gray-200">
                <div className="flex gap-8 md:gap-16">
                    <div>
                        <p className="text-[10px] text-gray-600 font-bold uppercase mb-1 tracking-wider">Fecha Pedido</p>
                        <p className="text-xs text-black">
                            {new Date(pedido.fecha_creacion).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-600 font-bold uppercase mb-1 tracking-wider">Total</p>
                        <p className="text-xs text-black">S/ {parseFloat(pedido.total).toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-600 font-bold uppercase mb-1 tracking-wider">Pedido #</p>
                        <p className="text-xs text-black">{pedido.numero_pedido}</p>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <button className="text-xs text-orange-500 font-bold  hover:text-orange-700 transition-colors font-medium">
                        Factura
                    </button>
                    {isExpanded ? (
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="px-4 py-1.5 text-xs font-medium text-black bg-white border border-gray-300 rounded-[35px] hover:bg-gray-50 transition shadow-sm"
                        >
                            Ocultar
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="px-6 py-1.5 text-xs font-medium text-black bg-white border border-gray-300 rounded-[35px] hover:bg-gray-50 transition shadow-sm"
                        >
                            Rastrear
                        </button>
                    )}
                </div>
            </div>

            {/* Timeline Section */}
            {isExpanded && (
                <div className="px-6 py-6 border-b border-gray-100 bg-white">
                    {/* ... Timeline code kept mostly same but ensure clean background ... */}
                    <div className="flex items-center gap-2 mb-6">
                        <Truck size={20} className="text-orange-500" />
                        <h4 className="text-sm font-bold text-gray-900">Estado del Envío</h4>
                    </div>

                    {(() => {
                        const steps = isPickup
                            ? ['Pedido Realizado', 'Confirmado', 'Preparando', 'Listo para Recoger', 'Recogido']
                            : ['Pedido Realizado', 'Confirmado', 'Preparando', 'Enviado', 'Entregado'];

                        const statusMap = {
                            'Pendiente': 0,
                            'Pagado': 1,
                            'En proceso': 1,
                            'En Preparación': 2,
                            'Enviado': 3,
                            'Listo para recoger': 3,
                            'Entregado': 4,
                            'Completado': 4,
                            'Recogido': 4, // Mapping explicit status if used
                            'Devuelto': 4,
                            'Cancelado': 4
                        };

                        const currentStepIndex = statusMap[pedido.estado] ?? 0;
                        const progressPercentage = (currentStepIndex / (steps.length - 1)) * 100;

                        return (
                            <div className="relative mb-4">
                                <div className="absolute top-3 left-0 right-0 h-[2px] bg-gray-200">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-300"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                                <div className="relative flex justify-between text-center">
                                    {steps.map((status, idx) => (
                                        <div key={status} className="flex flex-col items-center w-20">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors duration-300
                                                    ${idx <= currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}`}>
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                            <p className={`text-[10px] mt-2 font-medium leading-tight ${idx <= currentStepIndex ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {status}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Products Section - White Background */}
            <div className="px-6 py-3 bg-white">
                <div className="mb-2">
                    <h3 className="text-[12px] font-medium text-orange-500 mb-1 capitalize flex items-center gap-1">
                        <svg width="6" height="6" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="4" cy="4" r="4" fill="#22C55E" />
                        </svg>
                        {pedido.estado === 'Pendiente' ? 'Pendiente de pago' : pedido.estado}

                        {!isPickup && (
                            <span className="text-[10px] text-gray-500 ml-1"> {pedido.estado === 'Entregado' ? 'Entregado el ' : ' Llega el '}
                                <span className=" text-gray-500">
                                    {new Date(new Date(pedido.fecha_creacion).setDate(new Date(pedido.fecha_creacion).getDate() + 3)).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </span>
                            </span>
                        )}
                    </h3>

                </div>

                <div className="space-y-6">
                    {pedido.items && pedido.items.map((item, index) => (
                        <div key={index} className="flex gap-4 md:gap-6">
                            <div className="w-14     h-14 flex-shrink-0 border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
                                <img
                                    src={item.imagen}
                                    alt={item.nombre}
                                    className=" w-full h-full object-contain p-2"
                                />
                            </div>

                            <div className="flex-1 min-w-0 py-1">
                                <h4 className="text-xs font-medium text-gray-900 hover:text-orange-500 cursor-pointer line-clamp-2 mb-1">
                                    {item.nombre}
                                </h4>
                                {item.variacion_nombre && (
                                    <p className="text-[10px] text-gray-500 mt-1">{item.variacion_nombre}</p>
                                )}

                                <div className="flex items-baseline gap-2">
                                    <span className="text-xs font-bold text-gray-900">S/ {parseFloat(item.subtotal / item.cantidad).toFixed(2)}</span>
                                    <span className="text-xs text-gray-500">x {item.cantidad}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 min-w-[140px]">
                                <button className="w-full py-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-medium rounded-[5px] shadow-sm transition-colors text-center">
                                    Comprar de nuevo
                                </button>

                                <button className="w-full py-1 bg-gray-100   hover:bg-gray-200 text-gray-700 text-[10px] font-medium rounded-[5px] shadow-sm transition-colors text-center">
                                    Opinar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
