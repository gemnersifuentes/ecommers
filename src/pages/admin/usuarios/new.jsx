import Breadcrumb from '../../../components/Breadcrumb';
import FormUsuario from './FormUsuario';

const UsuariosNew = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Nuevo Usuario</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Usuarios', link: '/admin/usuarios' },
                    { label: 'Nuevo' }
                ]} />
            </div>
            <FormUsuario />
        </div>
    );
};

export default UsuariosNew;
