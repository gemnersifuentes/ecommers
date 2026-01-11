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

    const markAsSeen = useCallback(async (type, id) => {
        try {
            const response = await api.post('/api/mark_seen.php', { type, id });
            if (response.data.success) {
                // Actualizar inmediatamente el estado local para un feedback instantáneo
                setNotifications(prev => {
                    const newRecent = { ...prev.recent };
                    const categoryKey = type === 'stock' ? 'stock' :
                        type === 'pedido' ? 'pedidos' :
                            type === 'mensaje' ? 'mensajes' :
                                type === 'servicio' ? 'servicios' : null;

                    if (categoryKey && newRecent[categoryKey]) {
                        newRecent[categoryKey] = newRecent[categoryKey].filter(item =>
                            (item.id === id || item.real_id === id) === false
                        );
                    }

                    // Decrementar los contadores si corresponde
                    const newCounts = { ...prev.counts };
                    if (type === 'pedido') newCounts.pedidos = Math.max(0, newCounts.pedidos - 1);
                    if (type === 'mensaje') newCounts.mensajes = Math.max(0, newCounts.mensajes - 1);
                    if (type === 'servicio') newCounts.servicios = Math.max(0, newCounts.servicios - 1);
                    if (type === 'stock') newCounts.stock_bajo = Math.max(0, newCounts.stock_bajo - 1);

                    newCounts.total_alertas = newCounts.pedidos + newCounts.mensajes + newCounts.servicios + newCounts.stock_bajo;

                    return {
                        ...prev,
                        counts: newCounts,
                        recent: newRecent
                    };
                });
            }
        } catch (error) {
            console.error('Error marking as seen:', error);
        }
    }, []);

    const markAllAsSeen = useCallback(async (type = 'global') => {
        try {
            const response = await api.post('/api/mark_seen.php', { type, id: 'all' });
            if (response.data.success) {
                setNotifications(prev => {
                    const newCounts = { ...prev.counts };
                    const newRecent = { ...prev.recent };

                    if (type === 'global') {
                        newCounts.pedidos = 0;
                        newCounts.mensajes = 0;
                        newCounts.servicios = 0;
                        newCounts.stock_bajo = 0;
                        newCounts.total_alertas = 0;
                        newRecent.pedidos = [];
                        newRecent.mensajes = [];
                        newRecent.servicios = [];
                        newRecent.stock = [];
                    } else if (type === 'pedido') {
                        newCounts.total_alertas -= newCounts.pedidos;
                        newCounts.pedidos = 0;
                        newRecent.pedidos = [];
                    } else if (type === 'mensaje') {
                        newCounts.total_alertas -= newCounts.mensajes;
                        newCounts.mensajes = 0;
                        newRecent.mensajes = [];
                    } else if (type === 'servicio') {
                        newCounts.total_alertas -= newCounts.servicios;
                        newCounts.servicios = 0;
                        newRecent.servicios = [];
                    } else if (type === 'stock') {
                        newCounts.total_alertas -= newCounts.stock_bajo;
                        newCounts.stock_bajo = 0;
                        newRecent.stock = [];
                    }

                    return { ...prev, counts: newCounts, recent: newRecent };
                });
            }
        } catch (error) {
            console.error('Error marking all as seen:', error);
        }
    }, []);

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
            markAsSeen,
            markAllAsSeen,
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
