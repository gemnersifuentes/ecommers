import Breadcrumb from '../../../components/Breadcrumb';
import FormServicio from './FormServicio';

const ServiciosNew = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Nuevo Servicio</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Servicios', link: '/admin/servicios' },
                    { label: 'Nuevo' }
                ]} />
            </div>
            <FormServicio />
        </div>
    );
};

export default ServiciosNew;
