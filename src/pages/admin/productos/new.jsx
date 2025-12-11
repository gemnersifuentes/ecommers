import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { productosService } from '../../../services';
import FormProducto from './FormProducto';

const ProductosNew = () => {
    const navigate = useNavigate();

    const handleSubmit = async (formData) => {
        try {
            await productosService.create(formData);
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Producto creado correctamente',
                timer: 1500,
                showConfirmButton: false
            });
            navigate('/admin/productos');
        } catch (error) {
            console.error('Error creating product:', error);
            Swal.fire('Error', 'No se pudo crear el producto', 'error');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <FormProducto
                onSubmit={handleSubmit}
                titulo="Nuevo Producto"
                subtitulo="Completa la información para agregar un nuevo producto al catálogo"
                buttonText="Crear Producto"
                breadcrumbItems={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Gestión de Productos', link: '/admin/productos' },
                    { label: 'Nuevo Producto' }
                ]}
            />
        </div>
    );
};

export default ProductosNew;
