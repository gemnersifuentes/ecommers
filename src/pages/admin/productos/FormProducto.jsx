import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { categoriasService, marcasService, productosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';
import GestionVariantes from '../../../components/GestionVariantes';
import GestionEspecificaciones from '../../../components/GestionEspecificaciones';

const FormProducto = ({ initialData, onSubmit, titulo, subtitulo, buttonText = 'Guardar', breadcrumbItems }) => {
    const [formData, setFormData] = useState({
        // Campos básicos
        nombre: '',
        descripcion: '',
        imagen: '',
        categoria_id: '',
        marca_id: '',
        precio_base: '',
        precio_compra: '',
        stock: '',

        // SEO & Marketing
        meta_titulo: '',
        meta_descripcion: '',
        palabras_clave: '',
        slug: '',
        destacado: false,
        nuevo: false,
        activo: true,
        etiquetas: '',

        // Logística
        sku: '',
        peso: '',
        largo: '',
        ancho: '',
        alto: '',
        envio_gratis: false,
        stock_minimo: 5,

        // Info Producto
        condicion: 'nuevo',
        garantia_meses: 12,
        marca_fabricante: '',
        modelo: '',
        video_url: '',

        // Otros
        politica_devolucion_dias: 30
    });

    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [imagenPreview, setImagenPreview] = useState('');
    const [imagenesGaleria, setImagenesGaleria] = useState([]);
    const [nuevasVariantes, setNuevasVariantes] = useState([]);
    const [nuevasEspecificaciones, setNuevasEspecificaciones] = useState([]);
    const [loading, setLoading] = useState(false);

    // Validation State
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Update form when initialData changes (for edit mode)
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                nombre: initialData.nombre || '',
                descripcion: initialData.descripcion || '',
                imagen: initialData.imagen || '',
                categoria_id: initialData.categoria_id || '',
                marca_id: initialData.marca_id || '',
                precio_base: initialData.precio_base || '',
                precio_compra: initialData.precio_compra || '',
                stock: initialData.stock !== undefined ? initialData.stock : '',
                // SEO
                meta_titulo: initialData.meta_titulo || '',
                meta_descripcion: initialData.meta_descripcion || '',
                palabras_clave: initialData.palabras_clave || '',
                slug: initialData.slug || '',
                destacado: initialData.destacado === 1 || initialData.destacado === true,
                nuevo: initialData.nuevo === 1 || initialData.nuevo === true,
                activo: initialData.activo === 1 || initialData.activo === true,
                etiquetas: initialData.etiquetas || '',
                // Logística
                sku: initialData.sku || '',
                peso: initialData.peso || '',
                largo: initialData.largo || '',
                ancho: initialData.ancho || '',
                alto: initialData.alto || '',
                envio_gratis: initialData.envio_gratis === 1 || initialData.envio_gratis === true,
                stock_minimo: initialData.stock_minimo || 5,
                // Info
                condicion: initialData.condicion || 'nuevo',
                garantia_meses: initialData.garantia_meses || 12,
                marca_fabricante: initialData.marca_fabricante || '',
                modelo: initialData.modelo || '',
                video_url: initialData.video_url || '',
                politica_devolucion_dias: initialData.politica_devolucion_dias || 30
            }));
            if (initialData.imagen) {
                setImagenPreview(initialData.imagen);
            }
            if (initialData.galeria_imagenes) {
                try {
                    const galeria = typeof initialData.galeria_imagenes === 'string'
                        ? JSON.parse(initialData.galeria_imagenes)
                        : initialData.galeria_imagenes;
                    setImagenesGaleria(Array.isArray(galeria) ? galeria : []);
                } catch (error) {
                    console.error('Error parsing galeria_imagenes:', error);
                    setImagenesGaleria([]);
                }
            }
        }
    }, [initialData]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [cats, brands] = await Promise.all([
                    categoriasService.getAll(),
                    marcasService.getAll()
                ]);
                setCategorias(Array.isArray(cats) ? cats : []);
                setMarcas(Array.isArray(brands) ? brands : []);
            } catch (error) {
                console.error('Error loading data:', error);
                Swal.fire('Error', 'Error al cargar datos necesarios', 'error');
            }
        };
        loadData();
    }, []);

    const validateField = (name, value) => {
        let error = '';

        // Solo validar campos requeridos - sin async, sin validaciones numéricas
        if (['nombre', 'categoria_id', 'marca_id', 'precio_base', 'stock', 'descripcion'].includes(name)) {
            if (!value || value.toString().trim() === '') {
                switch (name) {
                    case 'nombre':
                        error = 'El nombre es requerido';
                        break;
                    case 'categoria_id':
                        error = 'La categoría es requerida';
                        break;
                    case 'marca_id':
                        error = 'La marca es requerida';
                        break;
                    case 'precio_base':
                        error = 'El precio base es requerido';
                        break;
                    case 'stock':
                        error = 'El stock inicial es requerido';
                        break;
                    case 'descripcion':
                        error = 'La descripción es requerida';
                        break;
                    default:
                        error = 'Este campo es obligatorio';
                }
            }
        }

        return error;
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Clear error on change if field was touched
        if (touched[name] && errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImagenChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            Swal.fire('Error', 'Solo se permiten archivos de imagen', 'error');
            return;
        }

        const formDataImg = new FormData();
        formDataImg.append('imagen', file);

        try {
            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formDataImg
            });
            const data = await response.json();

            if (data.success && data.url) {
                setFormData(prev => ({ ...prev, imagen: data.url }));
                setImagenPreview(data.url);
            } else {
                Swal.fire('Error', data.message || 'Error al subir imagen', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'Error al subir la imagen', 'error');
        }
    };

    const handleVideoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar que sea video
        if (!file.type.startsWith('video/')) {
            Swal.fire('Error', 'Solo se permiten archivos de video', 'error');
            return;
        }

        // Validar tamaño (ej: max 500MB)
        if (file.size > 500 * 1024 * 1024) {
            Swal.fire('Error', 'El video no puede pesar más de 500MB', 'error');
            return;
        }

        const formDataVideo = new FormData();
        // Usamos 'imagen' porque el backend php actual (upload.php) espera $_FILES['imagen']
        formDataVideo.append('imagen', file);

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formDataVideo
            });
            const data = await response.json();

            if (data.success && data.url) {
                setFormData(prev => ({ ...prev, video_url: data.url }));
                Swal.fire('Éxito', 'Video subido correctamente', 'success');
            } else {
                Swal.fire('Error', data.message || 'Error al subir video', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'Error al subir el video', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleImagenesGaleriaChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const nuevasImagenesUrls = [];

        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;

            const formDataImg = new FormData();
            formDataImg.append('imagen', file);

            try {
                const response = await fetch('http://localhost:8000/upload', {
                    method: 'POST',
                    body: formDataImg
                });
                const data = await response.json();

                if (data.success && data.url) {
                    nuevasImagenesUrls.push(data.url);
                }
            } catch (error) {
                console.error('Error uploading gallery image:', error);
            }
        }

        if (nuevasImagenesUrls.length > 0) {
            setImagenesGaleria(prev => [...prev, ...nuevasImagenesUrls]);
        }
    };

    const eliminarImagenGaleria = (index) => {
        setImagenesGaleria(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all required fields
        const requiredFields = ['nombre', 'categoria_id', 'marca_id', 'precio_base', 'stock', 'descripcion'];
        const newErrors = {};
        let isValid = true;

        requiredFields.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        if (!isValid) {
            setErrors(newErrors);
            setTouched(requiredFields.reduce((acc, curr) => ({ ...acc, [curr]: true }), {}));
            return;
        }

        setLoading(true);
        try {
            await onSubmit({
                ...formData,
                galeria_imagenes: JSON.stringify(imagenesGaleria),
                variantes: nuevasVariantes,
                especificaciones: nuevasEspecificaciones
            });
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{titulo}</h1>
                {breadcrumbItems && <Breadcrumb items={breadcrumbItems} />}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white dark:bg-[#111c44] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-white/5">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-white/5">
                                Información Básica
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nombre del producto <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full px-3 py-2.5 text-sm rounded-lg border ${errors.nombre ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-white/10 focus:ring-blue-500 focus:border-blue-500'} outline-none transition-all bg-white dark:bg-white/5 dark:text-white`}
                                        placeholder="Introduzca el nombre del producto"
                                    />
                                    {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Categoría <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="categoria_id"
                                            value={formData.categoria_id}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-3 py-2.5 text-sm rounded-lg border ${errors.categoria_id ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-white/10 focus:ring-blue-500 focus:border-blue-500'} outline-none transition-all bg-white dark:bg-[#111c44] dark:text-white`}
                                        >
                                            <option value="">Elija categoría</option>
                                            {categorias.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                            ))}
                                        </select>
                                        {errors.categoria_id && <p className="text-red-500 text-xs mt-1">{errors.categoria_id}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Marca <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="marca_id"
                                            value={formData.marca_id}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-3 py-2.5 text-sm rounded-lg border ${errors.marca_id ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-white/10 focus:ring-blue-500 focus:border-blue-500'} outline-none transition-all bg-white dark:bg-[#111c44] dark:text-white`}
                                        >
                                            <option value="">Elija marca</option>
                                            {marcas.map(marca => (
                                                <option key={marca.id} value={marca.id}>{marca.nombre}</option>
                                            ))}
                                        </select>
                                        {errors.marca_id && <p className="text-red-500 text-xs mt-1">{errors.marca_id}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Venta (S/) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="precio_base"
                                            value={formData.precio_base}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            step="0.01"
                                            className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.precio_base ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} outline-none transition-all bg-white dark:bg-white/5 dark:text-white`}
                                            placeholder="0.00"
                                        />
                                        {errors.precio_base && <p className="text-red-500 text-[10px] mt-0.5">{errors.precio_base}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Compra (S/)
                                        </label>
                                        <input
                                            type="number"
                                            name="precio_compra"
                                            value={formData.precio_compra}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            step="0.01"
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 outline-none transition-all bg-white dark:bg-white/5 dark:text-white"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Stock <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.stock ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} outline-none transition-all bg-white dark:bg-white/5 dark:text-white`}
                                            placeholder="0"
                                        />
                                        {errors.stock && <p className="text-red-500 text-[10px] mt-0.5">{errors.stock}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Descripción <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        rows="4"
                                        className={`w-full px-3 py-2.5 text-sm rounded-lg border ${errors.descripcion ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-white/10 focus:ring-blue-500 focus:border-blue-500'} outline-none transition-all resize-none bg-white dark:bg-white/5 dark:text-white`}
                                        placeholder="Descripción del producto..."
                                    ></textarea>
                                    {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
                                </div>
                            </div>
                        </div>

                        {/* SEO & Marketing */}
                        <div className="bg-white dark:bg-[#111c44] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-white/5">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-white/5 flex items-center gap-2">
                                <i className="fas fa-search text-blue-600 dark:text-blue-400"></i> SEO & Marketing
                            </h3>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Meta Título</label>
                                        <input
                                            type="text"
                                            name="meta_titulo"
                                            value={formData.meta_titulo}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-white/5 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Slug</label>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-white/5 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Meta Descripción</label>
                                    <textarea
                                        name="meta_descripcion"
                                        value={formData.meta_descripcion}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none bg-white dark:bg-white/5 dark:text-white"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Palabras Clave</label>
                                    <input
                                        type="text"
                                        name="palabras_clave"
                                        value={formData.palabras_clave}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-white/5 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Etiquetas</label>
                                    <input
                                        type="text"
                                        name="etiquetas"
                                        value={formData.etiquetas}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-white/5 dark:text-white"
                                    />
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="activo"
                                            checked={formData.activo}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 dark:text-blue-500 rounded border-gray-300 dark:border-white/10 focus:ring-blue-500 bg-white dark:bg-white/5"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Visible en tienda</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="destacado"
                                            checked={formData.destacado}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 dark:text-blue-500 rounded border-gray-300 dark:border-white/10 focus:ring-blue-500 bg-white dark:bg-white/5"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Destacado</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="nuevo"
                                            checked={formData.nuevo}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 dark:text-blue-500 rounded border-gray-300 dark:border-white/10 focus:ring-blue-500 bg-white dark:bg-white/5"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Nuevo</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Logistics */}
                        <div className="bg-white dark:bg-[#111c44] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-white/5">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-white/5 flex items-center gap-2">
                                <i className="fas fa-truck text-blue-600 dark:text-blue-400"></i> Logística
                            </h3>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">SKU</label>
                                        <input
                                            type="text"
                                            name="sku"
                                            value={formData.sku}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-white/5 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Peso (kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="peso"
                                            value={formData.peso}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-white/5 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Stock Mín.</label>
                                        <input
                                            type="number"
                                            name="stock_minimo"
                                            value={formData.stock_minimo}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-white/5 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Largo (cm)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="largo"
                                            value={formData.largo}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-white/5 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Ancho (cm)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="ancho"
                                            value={formData.ancho}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-white/5 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Alto (cm)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="alto"
                                            value={formData.alto}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-white/5 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer pt-2">
                                    <input
                                        type="checkbox"
                                        name="envio_gratis"
                                        checked={formData.envio_gratis}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 dark:text-blue-500 rounded border-gray-300 dark:border-white/10 focus:ring-blue-500 bg-white dark:bg-white/5"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Envío Gratis</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Images and Additional Info */}
                    <div className="space-y-6">
                        {/* Main Image */}
                        <div className="bg-white dark:bg-[#111c44] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-white/5">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Imagen Principal</h3>
                            <div className="relative border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-white/5">
                                {imagenPreview ? (
                                    <div className="relative">
                                        <img src={imagenPreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagenPreview('');
                                                setFormData(prev => ({ ...prev, imagen: '' }));
                                            }}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
                                        >
                                            <i className="fas fa-times text-xs"></i>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-12">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center">
                                            <i className="fas fa-cloud-upload-alt text-blue-600 dark:text-blue-400 text-2xl"></i>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">Suelta tu imagen aquí</p>
                                        <p className="text-blue-600 dark:text-blue-400 font-semibold">o haz clic para buscar</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/avif,image/svg+xml,image/bmp"
                                    onChange={handleImagenChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Gallery */}
                        <div className="bg-white dark:bg-[#111c44] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-white/5">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Galería de Imágenes</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {imagenesGaleria.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square bg-gray-100 dark:bg-white/5 rounded-lg overflow-hidden group">
                                        <img src={img} alt={`Galería ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => eliminarImagenGaleria(idx)}
                                            className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <i className="fas fa-times text-xs"></i>
                                        </button>
                                        {idx === 0 && (
                                            <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                                                +{imagenesGaleria.length}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <label className="aspect-square bg-gray-50 dark:bg-white/5 rounded-lg border-2 border-dashed border-gray-300 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all">
                                    <i className="fas fa-plus text-xl text-gray-400 dark:text-gray-500 mb-1"></i>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Agregar</span>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/avif,image/svg+xml,image/bmp"
                                        multiple
                                        onChange={handleImagenesGaleriaChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="bg-white dark:bg-[#111c44] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-white/5">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-white/5 flex items-center gap-2">
                                <i className="fas fa-info-circle text-blue-600 dark:text-blue-400"></i> Información Adicional
                            </h3>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Condición</label>
                                        <select
                                            name="condicion"
                                            value={formData.condicion}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-[#111c44] dark:text-white"
                                        >
                                            <option value="nuevo">Nuevo</option>
                                            <option value="usado">Usado</option>
                                            <option value="reacondicionado">Reacondicionado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Garantía (meses)</label>
                                        <input
                                            type="number"
                                            name="garantia_meses"
                                            value={formData.garantia_meses}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-white/5 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Modelo</label>
                                        <input
                                            type="text"
                                            name="modelo"
                                            value={formData.modelo}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-white/5 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Política Devolución (días)</label>
                                        <input
                                            type="number"
                                            name="politica_devolucion_dias"
                                            value={formData.politica_devolucion_dias}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-white/5 dark:text-white"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Video del Producto</label>
                                        <div className="relative border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl p-4 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-white/5">
                                            {formData.video_url ? (
                                                <div className="relative w-full bg-black rounded-lg overflow-hidden">
                                                    <video
                                                        key={formData.video_url}
                                                        src={formData.video_url}
                                                        controls
                                                        preload="metadata"
                                                        className="w-full max-h-64 object-contain mx-auto"
                                                    >
                                                        Tu navegador no soporta el elemento de video.
                                                    </video>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, video_url: '' }))}
                                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 z-10 shadow-md"
                                                    >
                                                        <i className="fas fa-times text-xs"></i>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="py-6">
                                                    <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center">
                                                        <i className="fas fa-video text-blue-600 dark:text-blue-400 text-xl"></i>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Suelta tu video aquí</p>
                                                    <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold">o haz clic para buscar</p>
                                                </div>
                                            )}
                                            {!formData.video_url && (
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={handleVideoChange}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                            )}
                                        </div>
                                    </div>

                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Fabricante</label>
                                    <input
                                        type="text"
                                        name="marca_fabricante"
                                        value={formData.marca_fabricante}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-white/5 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gestión de Variantes y Especificaciones */}
                <div className="mt-8 space-y-8">
                    <GestionVariantes
                        productoId={initialData?.id || null}
                        embedded={true}
                        onChange={setNuevasVariantes}
                        onSave={() => { }}
                    />

                    <GestionEspecificaciones
                        productoId={initialData?.id || null}
                        onChange={setNuevasEspecificaciones}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-white/5">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-white/10 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-200"
                    >
                        <i className="fas fa-times"></i>
                        <span>Cancelar</span>
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white border-2 border-blue-600 dark:border-blue-500 font-semibold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 hover:border-blue-700 dark:hover:border-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                <span>Guardando...</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save"></i>
                                <span>{buttonText}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormProducto;
