import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
    Wrench,
    Info,
    Clock,
    DollarSign,
    Upload,
    Save,
    X,
    LayoutGrid,
    Image as ImageIcon
} from 'lucide-react';
import { serviciosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const FormServicio = ({ id = null }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        duracion: ''
    });
    const [imagenFile, setImagenFile] = useState(null);
    const [imagenPreview, setImagenPreview] = useState('');

    useEffect(() => {
        if (id) {
            cargarServicio();
        }
    }, [id]);

    const cargarServicio = async () => {
        setLoading(true);
        try {
            const data = await serviciosService.getById(id);
            setFormData({
                nombre: data.nombre,
                descripcion: data.descripcion || '',
                precio: data.precio,
                duracion: data.duracion || ''
            });
            if (data.imagen) {
                setImagenPreview(data.imagen.startsWith('http') ? data.imagen : `http://localhost:8000${data.imagen}`);
            }
        } catch (error) {
            console.error('Error al cargar servicio:', error);
            Swal.fire('Error', 'No se pudo cargar el servicio', 'error');
            navigate('/admin/servicios');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagenFile(file);
            setImagenPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            data.append('nombre', formData.nombre);
            data.append('descripcion', formData.descripcion);
            data.append('precio', formData.precio);
            data.append('duracion', formData.duracion);
            if (imagenFile) {
                data.append('imagen', imagenFile);
            }

            if (id) {
                await serviciosService.update(id, data);
                Swal.fire({ title: '¡Actualizado!', text: 'Servicio actualizado correctamente', icon: 'success', timer: 2000, showConfirmButton: false });
            } else {
                await serviciosService.create(data);
                Swal.fire({ title: '¡Creado!', text: 'Servicio creado correctamente', icon: 'success', timer: 2000, showConfirmButton: false });
            }
            navigate('/admin/servicios');
        } catch (error) {
            console.error(error);
            Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading && id && !formData.nombre) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
                <p className="text-xs text-gray-500 font-medium font-black uppercase tracking-widest">Cargando datos...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-sm font-bold text-gray-900 dark:text-white">{id ? 'Editar Servicio' : 'Nuevo Servicio de Soporte'}</h1>
                    <Breadcrumb items={[
                        { label: 'Admin', link: '/admin', isHome: true },
                        { label: 'Servicios', link: '/admin/servicios' },
                        { label: id ? 'Editar' : 'Nuevo' }
                    ]} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                {/* Lado Izquierdo: Información del Servicio */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#111c44] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-white/5">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-white/5 flex items-center gap-2">
                            <Info size={16} className="text-blue-600 dark:text-blue-400" /> Información Principal
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Nombre del Servicio <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white dark:bg-white/5 dark:text-white"
                                    placeholder="Ej: Mantenimiento Preventivo PC"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Descripción Detallada</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none bg-white dark:bg-white/5 dark:text-white"
                                    placeholder="Detalla en qué consiste el servicio..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#111c44] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-white/5">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-white/5 flex items-center gap-2">
                            <ImageIcon size={16} className="text-blue-600 dark:text-blue-400" /> Imagen del Servicio
                        </h3>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="relative group w-32 h-32 flex-shrink-0">
                                <div className="w-full h-full rounded-2xl bg-gray-50 dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-orange-300">
                                    {imagenPreview ? (
                                        <img src={imagenPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Upload size={24} className="text-gray-300 dark:text-gray-600" />
                                    )}
                                </div>
                                {imagenPreview && (
                                    <button
                                        type="button"
                                        onClick={() => { setImagenFile(null); setImagenPreview(''); }}
                                        className="absolute -top-2 -right-2 p-1 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-full text-gray-400 dark:text-gray-500 hover:text-red-500 hover:shadow-md transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-black rounded-lg border border-orange-100 dark:border-orange-500/20 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all uppercase tracking-widest whitespace-nowrap">
                                    <Upload size={14} />
                                    Subir nueva imagen
                                    <input type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                                </label>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tight leading-relaxed">
                                    Formatos: PNG, JPG, WEBP. <br />
                                    Tamaño recomendado: 600x600px.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lado Derecho: Precio y Tiempos */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#111c44] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-white/5">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-white/5 flex items-center gap-2">
                            <LayoutGrid size={16} className="text-blue-600 dark:text-blue-400" /> Costos y Logística
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Precio Final <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="precio"
                                        value={formData.precio}
                                        onChange={handleChange}
                                        required
                                        step="0.01"
                                        className="w-full pl-8 pr-3 py-2 text-sm font-bold rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white dark:bg-white/5 dark:text-white placeholder:font-normal"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold text-xs">$</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Duración Estimada</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="duracion"
                                        value={formData.duracion}
                                        onChange={handleChange}
                                        className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/10 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white dark:bg-white/5 dark:text-white font-medium"
                                        placeholder="Ej: 2 horas, 1 día..."
                                    />
                                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                </div>
                                <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Esto ayudará al cliente a planificar su visita.</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Tips Card */}
                    <div className="bg-blue-50/50 dark:bg-blue-500/5 rounded-xl p-6 border border-blue-100/50 dark:border-blue-500/10">
                        <div className="flex gap-3">
                            <Wrench size={20} className="text-blue-500 flex-shrink-0" />
                            <div className="space-y-2">
                                <h4 className="text-xs font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest">Consejo de Ventas</h4>
                                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                                    Asegúrate de detallar los repuestos incluidos o si el diagnóstico tiene un costo base. Los servicios claros generan más confianza.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Flotante de Acciones */}
                <div className="fixed bottom-0 right-0 w-[calc(100%-250px)] bg-white/90 dark:bg-[#111c44]/90 backdrop-blur-md border-t border-gray-200 dark:border-white/10 p-4 transition-all z-40 flex justify-end">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/admin/servicios"
                            className="text-xs font-black text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-2 bg-orange-500 dark:bg-orange-600 text-white text-xs font-black rounded-lg hover:bg-orange-600 dark:hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                        >
                            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save size={14} />}
                            {id ? 'Actualizar' : 'Guardar Servicio'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default FormServicio;
