import Breadcrumb from '../../../components/Breadcrumb';
import FormCategoria from './FormCategoria';

const CategoriasNew = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Nueva Categoría</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Categorías', link: '/admin/categorias' },
                    { label: 'Nueva' }
                ]} />
            </div>
            <FormCategoria />
        </div>
    );
};

export default CategoriasNew;
