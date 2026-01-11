import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Save,
    X,
    ArrowLeft,
    DollarSign,
    Tag,
    FileText,
    CreditCard,
    CheckCircle2,
    Clock,
    Info,
    User
} from 'lucide-react';
import { gastosService, usuariosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';
import Swal from 'sweetalert2';
import DatePicker from '../../../components/ui/DatePicker';

const FormGasto = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [usuarios, setUsuarios] = useState([]);
    const [selectedEmpleadoId, setSelectedEmpleadoId] = useState('');

    const [formData, setFormData] = useState({
        fecha: new Date().toISOString().split('T')[0],
        concepto: '',
        monto: '',
        categoria: 'Otros',
        metodo_pago: 'Efectivo',
        referencia: '',
        notas: '',
        estado: 'Pagado'
    });

    const categorias = ['Alquiler', 'Servicios', 'Sueldos', 'Marketing', 'Mantenimiento', 'Suministros', 'Transporte', 'Otros'];
    const metodosPago = ['Efectivo', 'Transferencia', 'Yape/Plin', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'Otro'];

    useEffect(() => {
        const loadUsuarios = async () => {
            try {
                const data = await usuariosService.getAll();
                setUsuarios(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        loadUsuarios();
    }, []);

    useEffect(() => {
        if (isEdit) {
            const loadGasto = async () => {
                try {
                    const data = await gastosService.getById(id);
                    if (data) {
                        setFormData({
                            fecha: data.fecha,
                            concepto: data.concepto,
                            monto: data.monto,
                            categoria: data.categoria || 'Otros',
                            metodo_pago: data.metodo_pago || 'Efectivo',
                            referencia: data.referencia || '',
                            notas: data.notas || '',
                            estado: data.estado || 'Pagado'
                        });
                    }
                } catch (error) {
                    console.error('Error loading gasto:', error);
                    Swal.fire('Error', 'No se pudo cargar la información del gasto', 'error');
                    navigate('/admin/gastos');
                } finally {
                    setFetching(false);
                }
            };
            loadGasto();
        }
    }, [id, isEdit, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEmpleadoChange = (e) => {
        const userId = e.target.value;
        setSelectedEmpleadoId(userId);
        const user = usuarios.find(u => u.id.toString() === userId.toString());
        if (user) {
            setFormData(prev => ({
                ...prev,
                concepto: `Sueldo de: ${user.nombre}`
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await gastosService.update(id, formData);
            } else {
                await gastosService.create(formData);
            }

            await Swal.fire({
                icon: 'success',
                title: isEdit ? 'Gasto actualizado' : 'Gasto registrado',
                text: 'La información se guardó correctamente.',
                confirmButtonColor: '#3b82f6'
            });
            navigate('/admin/gastos');
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudo guardar el gasto', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                        <DollarSign size={16} className="text-blue-500" />
                        {isEdit ? 'Editar Gasto Operativo' : 'Registro de Nuevo Gasto'}
                    </h1>
                    <Breadcrumb items={[
                        { label: 'Admin', link: '/admin', isHome: true },
                        { label: 'Gastos', link: '/admin/gastos' },
                        { label: isEdit ? `Editando #${id}` : 'Nuevo Registro' }
                    ]} />
                </div>

                <button
                    onClick={() => navigate('/admin/gastos')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all w-fit"
                >
                    <ArrowLeft size={14} />
                    Volver al Listado
                </button>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-[#111c44] rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-sm">
                        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 border-b border-gray-50 dark:border-white/5 pb-2">Información del Gasto</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">Categoría del Gasto *</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {categorias.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                categoria: cat,
                                                concepto: cat !== 'Otros' ? cat : (prev.categoria !== 'Otros' ? '' : prev.concepto)
                                            }))}
                                            className={`py-2.5 px-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${formData.categoria === cat ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-500/10' : 'bg-gray-50 border-gray-100/50 dark:border-white/5 text-gray-400 dark:bg-white/5 hover:border-gray-200'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.categoria === 'Sueldos' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="md:col-span-2"
                                >
                                    <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">Seleccionar Empleado / Usuario *</label>
                                    <div className="relative">
                                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <select
                                            required
                                            value={selectedEmpleadoId}
                                            onChange={handleEmpleadoChange}
                                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                        >
                                            <option value="">-- Seleccionar Persona --</option>
                                            {usuarios
                                                .filter(u => u.rol !== 'cliente')
                                                .map(u => (
                                                    <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>
                                                ))}
                                        </select>
                                    </div>
                                </motion.div>
                            )}

                            {formData.categoria === 'Otros' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="md:col-span-2"
                                >
                                    <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">Especificar Concepto (¿De qué es el gasto?) *</label>
                                    <div className="relative">
                                        <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <input
                                            required
                                            type="text"
                                            name="concepto"
                                            value={formData.concepto === 'Otros' ? '' : formData.concepto}
                                            onChange={handleInputChange}
                                            placeholder="Ej: Multa municipal, Reparación imprevista..."
                                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            <div>
                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">Monto (S/) *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">S/</span>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        name="monto"
                                        value={formData.monto}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                    />
                                </div>
                            </div>

                            <DatePicker
                                label="Fecha de Emisión *"
                                value={formData.fecha}
                                onChange={(val) => setFormData(prev => ({ ...prev, fecha: val }))}
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#111c44] rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-sm">
                        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 border-b border-gray-50 dark:border-white/5 pb-2">Detalles de Pago</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">Método de Pago</label>
                                <div className="relative">
                                    <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <select
                                        name="metodo_pago"
                                        value={formData.metodo_pago}
                                        onChange={handleInputChange}
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all dark:text-white appearance-none"
                                    >
                                        {metodosPago.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">N° Operación / Referencia</label>
                                <div className="relative">
                                    <Info size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input
                                        type="text"
                                        name="referencia"
                                        value={formData.referencia}
                                        onChange={handleInputChange}
                                        placeholder="Opcional"
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">Notas / Observaciones</label>
                                <textarea
                                    name="notas"
                                    value={formData.notas}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Detalles adicionales sobre el gasto..."
                                    className="w-full p-4 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-2xl text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all dark:text-white resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#111c44] rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-sm">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 block border-b border-gray-50 dark:border-white/5 pb-2">Estado del Registro</label>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">Estado de Gasto</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, estado: 'Pagado' }))}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-[9px] font-black uppercase ${formData.estado === 'Pagado' ? 'bg-emerald-50 border-emerald-500 text-emerald-600 dark:bg-emerald-500/10' : 'bg-gray-50 border-gray-100/50 dark:border-white/5 text-gray-400 dark:bg-white/5 hover:border-gray-200'}`}
                                    >
                                        <CheckCircle2 size={14} />
                                        Pagado
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, estado: 'Pendiente' }))}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-[9px] font-black uppercase ${formData.estado === 'Pendiente' ? 'bg-amber-50 border-amber-500 text-amber-600 dark:bg-amber-500/10' : 'bg-gray-50 border-gray-100/50 dark:border-white/5 text-gray-400 dark:bg-white/5 hover:border-gray-200'}`}
                                    >
                                        <Clock size={14} />
                                        Pendiente
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-gray-50 dark:border-white/5">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 shadow-xl shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    {isEdit ? 'Actualizar Gasto' : 'Registrar Gasto'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-500/5 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/10">
                        <div className="flex gap-3">
                            <Info className="text-blue-500 flex-shrink-0" size={16} />
                            <p className="text-[10px] text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                                Los gastos operativos se deducen automáticamente de los reportes de utilidad neta. Asegúrate de categorizarlos correctamente para un mejor análisis financiero.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default FormGasto;
