import { useParams } from 'react-router-dom';
import Breadcrumb from '../../../components/Breadcrumb';
import FormServicio from './FormServicio';

const ServiciosEdit = () => {
    const { id } = useParams();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Editar Servicio</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Servicios', link: '/admin/servicios' },
                    { label: 'Editar' }
                ]} />
            </div>
            <FormServicio id={id} />
        </div>
    );
};

export default ServiciosEdit;
