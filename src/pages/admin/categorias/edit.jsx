import { useParams } from 'react-router-dom';
import Breadcrumb from '../../../components/Breadcrumb';
import FormCategoria from './FormCategoria';

const CategoriasEdit = () => {
    const { id } = useParams();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Editar Categoría</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Categorías', link: '/admin/categorias' },
                    { label: 'Editar' }
                ]} />
            </div>
            <FormCategoria id={id} />
        </div>
    );
};

export default CategoriasEdit;
