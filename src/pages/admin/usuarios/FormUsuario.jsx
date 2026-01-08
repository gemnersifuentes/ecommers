import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { usuariosService } from '../../../services';

const FormUsuario = ({ id = null }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        clave: '',
        rol: 'cliente'
    });

    useEffect(() => {
        if (id) {
            cargarUsuario();
        }
    }, [id]);

    const cargarUsuario = async () => {
        setLoading(true);
        try {
            const data = await usuariosService.getById(id);
            setFormData({
                nombre: data.nombre,
                correo: data.correo,
                clave: '',
                rol: data.rol
            });
        } catch (error) {
            console.error('Error al cargar usuario:', error);
            Swal.fire('Error', 'No se pudo cargar el usuario', 'error');
            navigate('/admin/usuarios');
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
                await usuariosService.update(id, formData);
                Swal.fire('Actualizado', 'Usuario actualizado exitosamente', 'success');
            } else {
                await usuariosService.create(formData);
                Swal.fire('Creado', 'Usuario creado exitosamente', 'success');
            }
            navigate('/admin/usuarios');
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
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111c44] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-white/5 dark:text-white"
                        placeholder="Nombre completo"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Correo <span className="text-red-500">*</span></label>
                    <input
                        type="email"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-white/5 dark:text-white"
                        placeholder="correo@ejemplo.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contraseña {id && '(dejar vacío para no cambiar)'}
                        {!id && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="password"
                        name="clave"
                        value={formData.clave}
                        onChange={handleChange}
                        required={!id}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-white/5 dark:text-white"
                        placeholder="••••••••"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rol <span className="text-red-500">*</span></label>
                    <select
                        name="rol"
                        value={formData.rol}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#111c44] dark:text-white"
                    >
                        <option value="cliente">Cliente</option>
                        <option value="admin">Administrador</option>
                        <option value="vendedor">Vendedor</option>
                        <option value="almacen">Almacén</option>
                        <option value="soporte">Soporte</option>
                        <option value="marketing">Marketing</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <Link
                    to="/admin/usuarios"
                    className="px-6 py-2.5 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-400 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                    Cancelar
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : (id ? 'Actualizar Usuario' : 'Crear Usuario')}
                </button>
            </div>
        </form>
    );
};

export default FormUsuario;
