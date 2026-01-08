import { useParams } from 'react-router-dom';
import Breadcrumb from '../../../components/Breadcrumb';
import FormMarca from './FormMarca';

const MarcasEdit = () => {
    const { id } = useParams();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Marca</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Marcas', link: '/admin/marcas' },
                    { label: 'Editar' }
                ]} />
            </div>
            <FormMarca id={id} />
        </div>
    );
};

export default MarcasEdit;
