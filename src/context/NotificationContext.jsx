import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { usuario } = useAuth();
    const [notifications, setNotifications] = useState({
        counts: {
            pedidos: 0,
            mensajes: 0,
            servicios: 0,
            stock_bajo: 0,
            total_alertas: 0
        },
        recent: {
            pedidos: [],
            mensajes: [],
            servicios: [],
            stock: []
        }
    });
    const [loading, setLoading] = useState(false);
    const [hasNew, setHasNew] = useState(false);
    const [latestToast, setLatestToast] = useState(null);
    const prevCountRef = useRef(0);
    const prevCountsRef = useRef({ pedidos: 0, mensajes: 0, servicios: 0, stock_bajo: 0 });

    const playNotificationSound = () => {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play();
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    const fetchNotifications = useCallback(async (isManual = false) => {
        if (!usuario || usuario.rol !== 'admin') return;

        try {
            const response = await api.get('/api/notificaciones.php');
            if (response.data.success) {
                const newCounts = response.data.counts;
                const recent = response.data.recent;

                // Si hay alertas, manejar el estado visual
                if (newCounts.total_alertas > 0 || (newCounts.mensajes > prevCountsRef.current.mensajes)) {
                    // Si el conteo aumentó, sonar y parpadear
                    if (newCounts.total_alertas > prevCountRef.current || newCounts.mensajes > prevCountsRef.current.mensajes) {
                        if (!isManual) {
                            playNotificationSound();

                            // Determinar qué tipo de notificación mostrar en el toast
                            let toastData = null;
                            if (newCounts.pedidos > prevCountsRef.current.pedidos && recent.pedidos.length > 0) {
                                const item = recent.pedidos[0];
                                toastData = {
                                    type: 'pedido',
                                    title: 'Nuevo Pedido',
                                    subtitle: item.numero_pedido || item.id,
                                    extra: `S/ ${item.total}`,
                                    link: `/admin/pedidos/ver/${item.id}`
                                };
                            } else if (newCounts.mensajes > prevCountsRef.current.mensajes && recent.mensajes.length > 0) {
                                const item = recent.mensajes[0];
                                toastData = {
                                    type: 'mensaje',
                                    title: 'Nuevo Mensaje',
                                    subtitle: item.nombre,
                                    extra: item.asunto,
                                    link: `/admin/mensajes/ver/${item.id}`
                                };
                            } else if (newCounts.servicios > prevCountsRef.current.servicios && recent.servicios.length > 0) {
                                const item = recent.servicios[0];
                                toastData = {
                                    type: 'servicio',
                                    title: 'Nueva Reservación',
                                    subtitle: item.nombre,
                                    extra: item.servicio,
                                    link: `/admin/servicios/reservaciones` // No specific show for now
                                };
                            } else if (newCounts.stock_bajo > prevCountsRef.current.stock_bajo && recent.stock.length > 0) {
                                const item = recent.stock[0];
                                toastData = {
                                    type: 'stock',
                                    title: 'Stock Bajo',
                                    subtitle: item.nombre,
                                    extra: `Quedan: ${item.stock}`,
                                    link: `/admin/productos/ver/${item.id_producto || item.id}`
                                };
                            }

                            if (toastData) {
                                setLatestToast(toastData);
                                setTimeout(() => setLatestToast(null), 3000);
                            }
                        }
                        setHasNew(true);
                    } else if (isManual) {
                        setHasNew(true);
                    }
                } else {
                    setHasNew(false);
                }

                setNotifications(response.data);
                prevCountRef.current = newCounts.total_alertas;
                prevCountsRef.current = newCounts;
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [usuario]);

    useEffect(() => {
        if (usuario && usuario.rol === 'admin') {
            fetchNotifications(true);
            // Polling cada 30 segundos
            const interval = setInterval(() => fetchNotifications(false), 30000);
            return () => clearInterval(interval);
        }
    }, [usuario, fetchNotifications]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            loading,
            hasNew,
            latestToast,
            setHasNew,
            refreshNotifications: () => fetchNotifications(true)
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
