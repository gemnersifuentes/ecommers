import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { marcasService } from '../../../services';

const FormMarca = ({ id = null }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: ''
    });

    useEffect(() => {
        if (id) {
            cargarMarca();
        }
    }, [id]);

    const cargarMarca = async () => {
        setLoading(true);
        try {
            const data = await marcasService.getById(id);
            setFormData({
                nombre: data.nombre,
                descripcion: data.descripcion || ''
            });
        } catch (error) {
            console.error('Error al cargar marca:', error);
            Swal.fire('Error', 'No se pudo cargar la marca', 'error');
            navigate('/admin/marcas');
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
                await marcasService.update(id, formData);
                Swal.fire('Actualizado', 'Marca actualizada exitosamente', 'success');
            } else {
                await marcasService.create(formData);
                Swal.fire('Creado', 'Marca creada exitosamente', 'success');
            }
            navigate('/admin/marcas');
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Ej: Samsung"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        placeholder="Descripción de la marca..."
                    ></textarea>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                <Link
                    to="/admin/marcas"
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                    Cancelar
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : (id ? 'Actualizar Marca' : 'Crear Marca')}
                </button>
            </div>
        </form>
    );
};

export default FormMarca;
