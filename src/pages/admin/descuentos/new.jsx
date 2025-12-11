import Breadcrumb from '../../../components/Breadcrumb';
import FormDescuento from './FormDescuento';

const DescuentosNew = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Nuevo Descuento</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Descuentos', link: '/admin/descuentos' },
                    { label: 'Nuevo' }
                ]} />
            </div>
            <FormDescuento />
        </div>
    );
};

export default DescuentosNew;
