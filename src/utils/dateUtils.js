/**
 * Determina el tipo de ubicación para el cálculo de entrega
 * @param {string|object} location - Ubicación de entrega
 * @returns {string} - 'chachapoyas', 'amazonas', o 'peru'
 */
export const getLocationZone = (location) => {
    if (!location) return 'peru';

    const locString = typeof location === 'string'
        ? location.toLowerCase()
        : JSON.stringify(location).toLowerCase();

    if (locString.includes('chachapoyas')) {
        return 'chachapoyas';
    }

    if (locString.includes('amazonas')) {
        return 'amazonas';
    }

    return 'peru';
};

/**
 * Formatea un rango de fecha estimada de entrega
 * @param {string|Date} baseDate - Fecha de inicio
 * @param {string|object} location - Ubicación de entrega
 * @param {boolean} isPickup - Si el método es recojo en tienda
 * @returns {string} - Rango formateado
 */
export const formatDeliveryEstimate = (baseDate, location = null, isPickup = false) => {
    if (isPickup) {
        return "hoy mismo";
    }

    const start = new Date(baseDate);
    const end = new Date(baseDate);
    const zone = getLocationZone(location);

    if (zone === 'chachapoyas') {
        const today = new Date();
        const isToday = start.toDateString() === today.toDateString();
        if (isToday) return "hoy mismo o mañana";

        // Para pedidos antiguos
        end.setDate(end.getDate() + 1);
    } else if (zone === 'amazonas') {
        // Otros distritos de Amazonas: Rango de 2 días empezando hoy (ej: 5 al 7)
        // start se queda en hoy
        end.setDate(end.getDate() + 2);
    } else {
        // Resto del país: 3-5 días
        start.setDate(start.getDate() + 3);
        end.setDate(end.getDate() + 5);
    }

    // Si llegamos aquí para Chachapoyas (antiguo), Amazonas o Perú
    const optionsDay = { day: 'numeric' };
    const optionsFull = { day: 'numeric', month: 'long' };

    const startFormatted = start.toLocaleDateString('es-PE', optionsDay);
    const endFormatted = end.toLocaleDateString('es-PE', optionsFull);

    if (start.getMonth() === end.getMonth()) {
        return `el ${startFormatted} - ${endFormatted}`;
    }

    return `el ${start.toLocaleDateString('es-PE', optionsFull)} - ${endFormatted}`;
};

/**
 * Retorna la etiqueta de tiempo según el estado y método
 * @param {string} state - Estado del pedido
 * @param {boolean} isPickup - Si es recojo
 * @param {string} estimateText - El texto de la fecha para ajustar el prefijo
 * @returns {string}
 */
export const getDeliveryLabel = (state, isPickup = false, estimateText = '') => {
    const s = state.toLowerCase();
    const isCompleted = s === 'entregado' || s === 'completado' || s === 'recogido';

    if (isPickup) {
        return isCompleted ? 'Recogido el' : 'Disponible para retirar';
    }

    if (isCompleted) return 'Llegó el';

    // Si el texto empieza con "hoy", no ponemos "entre el"
    if (estimateText.toLowerCase().startsWith('hoy')) {
        return 'Llega';
    }

    return 'Llega entre';
};
