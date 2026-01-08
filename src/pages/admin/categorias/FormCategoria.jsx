import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, X, ShieldCheck, Save, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { categoriasService } from '../../../services';

const FormCategoria = ({ id = null }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        imagen: null,
        activo: 1
    });

    useEffect(() => {
        if (id) {
            cargarCategoria();
        }
    }, [id]);

    const cargarCategoria = async () => {
        setLoading(true);
        try {
            const data = await categoriasService.getById(id);
            setFormData({
                nombre: data.nombre,
                descripcion: data.descripcion || '',
                imagen: null,
                activo: parseInt(data.activo)
            });
            if (data.imagen) {
                setPreview(`http://localhost:8000${data.imagen}`);
            }
        } catch (error) {
            console.error('Error al cargar categoría:', error);
            Swal.fire('Error', 'No se pudo cargar la categoría', 'error');
            navigate('/admin/categorias');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire('Error', 'La imagen no debe pesar más de 2MB', 'error');
                return;
            }
            setFormData({ ...formData, imagen: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData({ ...formData, imagen: null });
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('nombre', formData.nombre);
        data.append('descripcion', formData.descripcion);
        data.append('activo', formData.activo);
        if (formData.imagen) {
            data.append('imagen', formData.imagen);
        }

        try {
            if (id) {
                await categoriasService.update(id, data);
                Swal.fire({
                    title: '¡Actualizado!',
                    text: 'Categoría actualizada exitosamente',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                await categoriasService.create(data);
                Swal.fire({
                    title: '¡Creado!',
                    text: 'Categoría creada exitosamente',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            navigate('/admin/categorias');
        } catch (error) {
            console.error(error);
            Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading && id && !formData.nombre) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111c44] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Información básica */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">Nombre de la Categoría <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            className="w-full px-5 py-3 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                            placeholder="Ej: Procesadores, Laptops, Periféricos..."
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">Descripción del Segmento</label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows="5"
                            className="w-full px-5 py-4 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600 leading-relaxed"
                            placeholder="Describe qué productos engloba esta categoría..."
                        ></textarea>
                    </div>

                    {/* Toggle de Estado - Diseño Refinado */}
                    <div className="p-6 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-3xl flex items-center justify-between group/status transition-all hover:bg-gray-100 dark:hover:bg-[#0d173d]">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${formData.activo
                                    ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                                    : 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                                }`}>
                                {formData.activo ? <ShieldCheck size={22} /> : <X size={22} />}
                            </div>
                            <div>
                                <span className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">Visibilidad Operativa</span>
                                <span className={`text-xs font-black uppercase tracking-tight transition-colors ${formData.activo ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    {formData.activo ? 'Segmento Activo' : 'Segmento Suspendido'}
                                </span>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="activo"
                                checked={formData.activo === 1}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            {/* Custom Switch Component matching user request */}
                            <div className="w-16 h-9 bg-gray-200 dark:bg-[#111c44] rounded-full peer transition-all duration-500 peer-checked:bg-[#00AF50] relative shadow-inner border border-transparent dark:border-white/5 overflow-hidden">
                                <div className={`absolute top-2 bottom-2 w-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-500 ease-in-out transform ${formData.activo ? 'left-[48px]' : 'left-3'
                                    }`}></div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Subida de Imagen de Categoría */}
                <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">Imagen Representativa</label>
                    <div className="relative group">
                        {preview ? (
                            <div className="relative aspect-video w-full overflow-hidden rounded-3xl border-4 border-gray-100 dark:border-white/5 shadow-inner bg-gray-50 dark:bg-[#0b1437] flex items-center justify-center">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-video w-full border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-50/10 dark:hover:bg-indigo-500/5 transition-all group/upload"
                            >
                                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover/upload:text-indigo-500 group-hover/upload:scale-110 transition-all">
                                    <Upload size={32} />
                                </div>
                                <div className="text-center">
                                    <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Seleccionar Imagen</span>
                                    <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase">Sugerido: 1200x600px (Máx. 2MB)</span>
                                </div>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-100 dark:border-white/5">
                <Link
                    to="/admin/categorias"
                    className="w-full sm:w-auto px-8 py-3 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={14} />
                    Regresar al Listado
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/20 border-t-white"></div>
                    ) : (
                        <>
                            <Save size={14} className="group-hover:translate-y-[-1px] transition-transform" />
                            {id ? 'Actualizar Categoría' : 'Consolidar Registro'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default FormCategoria;
