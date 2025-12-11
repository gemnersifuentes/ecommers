import { useParams } from 'react-router-dom';
import Breadcrumb from '../../../components/Breadcrumb';
import FormUsuario from './FormUsuario';

const UsuariosEdit = () => {
    const { id } = useParams();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Editar Usuario</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Usuarios', link: '/admin/usuarios' },
                    { label: 'Editar' }
                ]} />
            </div>
            <FormUsuario id={id} />
        </div>
    );
};

export default UsuariosEdit;
