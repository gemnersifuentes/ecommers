import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { serviciosService } from '../../../services';

const FormServicio = ({ id = null }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        duracion: ''
    });

    useEffect(() => {
        if (id) {
            cargarServicio();
        }
    }, [id]);

    const cargarServicio = async () => {
        setLoading(true);
        try {
            const data = await serviciosService.getById(id);
            setFormData({
                nombre: data.nombre,
                descripcion: data.descripcion || '',
                precio: data.precio,
                duracion: data.duracion || ''
            });
        } catch (error) {
            console.error('Error al cargar servicio:', error);
            Swal.fire('Error', 'No se pudo cargar el servicio', 'error');
            navigate('/admin/servicios');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await serviciosService.update(id, formData);
                Swal.fire('Actualizado', 'Servicio actualizado exitosamente', 'success');
            } else {
                await serviciosService.create(formData);
                Swal.fire('Creado', 'Servicio creado exitosamente', 'success');
            }
            navigate('/admin/servicios');
        } catch (error) {
            console.error(error);
            Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading && id && !formData.nombre) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Mantenimiento Preventivo"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Descripción del servicio..."
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Precio <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            name="precio"
                            value={formData.precio}
                            onChange={handleChange}
                            step="0.01"
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duración</label>
                        <input
                            type="text"
                            name="duracion"
                            value={formData.duracion}
                            onChange={handleChange}
                            placeholder="Ej: 2 horas"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                <Link
                    to="/admin/servicios"
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                    Cancelar
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : (id ? 'Actualizar Servicio' : 'Crear Servicio')}
                </button>
            </div>
        </form>
    );
};

export default FormServicio;
