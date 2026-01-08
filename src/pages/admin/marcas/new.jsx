import Breadcrumb from '../../../components/Breadcrumb';
import FormMarca from './FormMarca';

const MarcasNew = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nueva Marca</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Marcas', link: '/admin/marcas' },
                    { label: 'Nueva' }
                ]} />
            </div>
            <FormMarca />
        </div>
    );
};

export default MarcasNew;
