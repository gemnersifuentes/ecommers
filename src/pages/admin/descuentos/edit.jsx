import { useParams } from 'react-router-dom';
import Breadcrumb from '../../../components/Breadcrumb';
import FormDescuento from './FormDescuento';

const DescuentosEdit = () => {
    const { id } = useParams();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Editar Descuento</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Descuentos', link: '/admin/descuentos' },
                    { label: 'Editar' }
                ]} />
            </div>
            <FormDescuento id={id} />
        </div>
    );
};

export default DescuentosEdit;
