import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { productosService } from '../../../services';
import FormProducto from './FormProducto';

const ProductosEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducto = async () => {
            try {
                const data = await productosService.getById(id);
                setProducto(data);
            } catch (error) {
                console.error('Error loading product:', error);
                Swal.fire('Error', 'No se pudo cargar el producto', 'error');
                navigate('/admin/productos');
            } finally {
                setLoading(false);
            }
        };
        loadProducto();
    }, [id, navigate]);

    const handleSubmit = async (formData) => {
        try {
            await productosService.update(id, formData);
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Producto actualizado correctamente',
                timer: 1500,
                showConfirmButton: false
            });
            navigate('/admin/productos');
        } catch (error) {
            console.error('Error updating product:', error);
            Swal.fire('Error', 'No se pudo actualizar el producto', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {producto && (
                <FormProducto
                    initialData={producto}
                    onSubmit={handleSubmit}
                    titulo="Editar Producto"
                    subtitulo={`Modificando: ${producto.nombre}`}
                    buttonText="Actualizar Producto"
                    breadcrumbItems={[
                        { label: 'Inicio', link: '/admin', isHome: true },
                        { label: 'Gestión de Productos', link: '/admin/productos' },
                        { label: 'Editar', link: `/admin/productos/editar/${producto.id}` },
                        { label: producto.nombre }
                    ]}
                />
            )}
        </div>
    );
};

export default ProductosEdit;
