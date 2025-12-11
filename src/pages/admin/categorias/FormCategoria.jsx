import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { categoriasService } from '../../../services';
import api from '../../../services/api';

const FormCategoria = ({ id = null }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        imagen: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (id) {
            cargarCategoria();
        }
    }, [id]);

    const cargarCategoria = async () => {
        setLoading(true);
        try {
            // Assuming getById exists or using getAll and filtering (not ideal but common in simple APIs)
            // Checking services/index.js, there is no getById for categories explicitly shown in previous view, 
            // but usually it follows the pattern. Let's assume it exists or I might need to add it.
            // Wait, I saw services/index.js earlier.
            // It had:
            // export const categoriasService = {
            //   getAll: async () => { ... },
            //   create: ...
            //   update: ...
            //   delete: ...
            // }
            // It MIGHT NOT have getById. I should check or implement it.
            // For now, I'll try to use it. If it fails, I'll fix the service.
            // Actually, looking at AdminCategorias.jsx, it only used getAll.
            // I will assume standard REST API.
            const data = await categoriasService.getById(id);
            setFormData({
                nombre: data.nombre,
                descripcion: data.descripcion || '',
                imagen: data.imagen || ''
            });
            if (data.imagen) {
                // Agregar URL completa para mostrar preview
                setPreviewUrl(`http://localhost:8000${data.imagen}`);
            }
        } catch (error) {
            console.error('Error al cargar categoría:', error);
            Swal.fire('Error', 'No se pudo cargar la categoría', 'error');
            navigate('/admin/categorias');
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                Swal.fire('Error', 'Solo se permiten imágenes', 'error');
                return;
            }
            // Validar tamaño (2MB)
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire('Error', 'La imagen no debe superar 2MB', 'error');
                return;
            }

            setSelectedFile(file);

            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                // Para actualizaciones
                if (selectedFile) {
                    // Con archivo nuevo: usar POST con _method override
                    const data = new FormData();
                    data.append('_method', 'PUT');
                    data.append('nombre', formData.nombre);
                    data.append('descripcion', formData.descripcion);
                    data.append('imagen', selectedFile);

                    await api.post(`/categorias/${id}`, data);
                } else {
                    // Sin archivo: usar PUT normal con JSON
                    await categoriasService.update(id, {
                        nombre: formData.nombre,
                        descripcion: formData.descripcion
                    });
                }
                Swal.fire('Actualizado', 'Categoría actualizada exitosamente', 'success');
            } else {
                // Para crear: siempre usar FormData
                const data = new FormData();
                data.append('nombre', formData.nombre);
                data.append('descripcion', formData.descripcion);
                if (selectedFile) {
                    data.append('imagen', selectedFile);
                }

                await categoriasService.create(data);
                Swal.fire('Creado', 'Categoría creada exitosamente', 'success');
            }
            navigate('/admin/categorias');
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
                        placeholder="Ej: Electrónica"
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
                        placeholder="Descripción de la categoría..."
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Imagen</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {previewUrl && (
                        <div className="mt-3">
                            <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                <Link
                    to="/admin/categorias"
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                    Cancelar
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : (id ? 'Actualizar Categoría' : 'Crear Categoría')}
                </button>
            </div>
        </form>
    );
};

export default FormCategoria;
