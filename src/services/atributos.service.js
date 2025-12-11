import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Obtener atributos de un producto
export const getAtributos = async (productoId) => {
    const response = await axios.get(`${API_URL}/productos/${productoId}/atributos`);
    return response.data;
};

// Crear un atributo
export const createAtributo = async (productoId, data) => {
    const response = await axios.post(`${API_URL}/productos/${productoId}/atributos`, data);
    return response.data;
};

// Actualizar un atributo
export const updateAtributo = async (atributoId, data) => {
    const response = await axios.put(`${API_URL}/atributos/${atributoId}`, data);
    return response.data;
};

// Eliminar un atributo
export const deleteAtributo = async (atributoId) => {
    const response = await axios.delete(`${API_URL}/atributos/${atributoId}`);
    return response.data;
};
