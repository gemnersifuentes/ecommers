import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { usuariosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const UsuariosIndex = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const data = await usuariosService.getAll();
            // Filtrar para excluir clientes - solo mostrar usuarios del sistema
            setUsuarios(data.filter(u => u.rol !== 'cliente'));
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280'
        });

        if (result.isConfirmed) {
            try {
                await usuariosService.delete(id);
                Swal.fire('Eliminado', 'Usuario eliminado exitosamente', 'success');
                cargarDatos();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Usuarios del Sistema</h2>
                    <Breadcrumb items={[
                        { label: 'Inicio', link: '/admin', isHome: true },
                        { label: 'Usuarios' }
                    ]} />
                </div>
                <Link
                    to="/admin/usuarios/nuevo"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                    <i className="fas fa-plus"></i>
                    Nuevo Usuario
                </Link>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Usuario</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Correo</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rol</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        No hay usuarios del sistema registrados
                                    </td>
                                </tr>
                            ) : (
                                usuarios.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.rol === 'admin' ? 'bg-purple-50' :
                                                        u.rol === 'vendedor' ? 'bg-green-50' :
                                                            u.rol === 'almacen' ? 'bg-orange-50' :
                                                                u.rol === 'soporte' ? 'bg-blue-50' :
                                                                    u.rol === 'marketing' ? 'bg-pink-50' :
                                                                        'bg-gray-50'
                                                    }`}>
                                                    <i className={`fas fa-user ${u.rol === 'admin' ? 'text-purple-600' :
                                                            u.rol === 'vendedor' ? 'text-green-600' :
                                                                u.rol === 'almacen' ? 'text-orange-600' :
                                                                    u.rol === 'soporte' ? 'text-blue-600' :
                                                                        u.rol === 'marketing' ? 'text-pink-600' :
                                                                            'text-gray-600'
                                                        }`}></i>
                                                </div>
                                                <p className="font-medium text-gray-900">{u.nombre}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{u.correo}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${u.rol === 'admin' ? 'bg-purple-50 text-purple-700' :
                                                    u.rol === 'vendedor' ? 'bg-green-50 text-green-700' :
                                                        u.rol === 'almacen' ? 'bg-orange-50 text-orange-700' :
                                                            u.rol === 'soporte' ? 'bg-blue-50 text-blue-700' :
                                                                u.rol === 'marketing' ? 'bg-pink-50 text-pink-700' :
                                                                    'bg-gray-50 text-gray-700'
                                                }`}>
                                                {u.rol}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/admin/usuarios/editar/${u.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </Link>
                                                <button
                                                    onClick={() => handleEliminar(u.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsuariosIndex;
