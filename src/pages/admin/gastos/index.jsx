import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Trash2,
    Edit3,
    DollarSign,
    Filter,
    Calendar,
    ChevronRight,
    Tag,
    CreditCard,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { gastosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';
import DatePicker from '../../../components/ui/DatePicker';
import { X } from 'lucide-react';

const GastosIndex = () => {
    const navigate = useNavigate();
    const [gastos, setGastos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('Todas');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const categorias = ['Todas', 'Alquiler', 'Servicios', 'Sueldos', 'Marketing', 'Mantenimiento', 'Suministros', 'Transporte', 'Otros'];

    useEffect(() => {
        loadGastos();
    }, []);

    const loadGastos = async () => {
        try {
            setLoading(true);
            const data = await gastosService.getAll();
            setGastos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading gastos:', error);
            Swal.fire('Error', 'No se pudieron cargar los gastos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await gastosService.delete(id);
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    toast: true,
                    position: 'top-end',
                    timer: 2000,
                    showConfirmButton: false
                });
                loadGastos();
            } catch (error) {
                console.error('Error deleting gasto:', error);
                Swal.fire('Error', 'No se pudo eliminar el gasto', 'error');
            }
        }
    };

    const filteredGastos = gastos.filter(g => {
        const matchesSearch = g.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (g.referencia && g.referencia.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory === 'Todas' || g.categoria === filterCategory;

        let matchesDate = true;
        if (startDate && g.fecha < startDate) matchesDate = false;
        if (endDate && g.fecha > endDate) matchesDate = false;

        return matchesSearch && matchesCategory && matchesDate;
    });

    const clearFilters = () => {
        setSearchTerm('');
        setFilterCategory('Todas');
        setStartDate('');
        setEndDate('');
    };

    const totalGastos = filteredGastos.reduce((acc, g) => acc + parseFloat(g.monto), 0);
    const totalPendiente = filteredGastos.filter(g => g.estado === 'Pendiente').reduce((acc, g) => acc + parseFloat(g.monto), 0);

    return (
        <div className="p-4 space-y-6 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                        <DollarSign size={16} className="text-blue-500" />
                        Control de Gastos Operativos
                    </h1>
                    <Breadcrumb items={[
                        { label: 'Admin', link: '/admin', isHome: true },
                        { label: 'Gastos' }
                    ]} />
                </div>

                <button
                    onClick={() => navigate('/admin/gastos/nuevo')}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 shadow-xl shadow-blue-200 dark:shadow-none transition-all w-fit"
                >
                    <Plus size={18} />
                    Registrar Nuevo Gasto
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#111c44] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Gasto Total (Filtro)</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">S/ {totalGastos.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-[#111c44] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Total Pendiente</p>
                    <p className="text-2xl font-black text-amber-500 leading-none">S/ {totalPendiente.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-[#111c44] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Registros</p>
                    <p className="text-2xl font-black text-blue-500 leading-none">{filteredGastos.length}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111c44] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-50 dark:border-white/5">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por concepto o referencia..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#0b1437] border border-gray-100 dark:border-white/5 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500/10 outline-none transition-all dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-[2]">
                            <div className="flex items-center gap-2">
                                <Filter size={14} className="text-gray-400 hidden sm:block" />
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1437] border border-gray-100 dark:border-white/5 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500/10 outline-none transition-all dark:text-white appearance-none"
                                >
                                    {categorias.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <DatePicker
                                placeholder="Desde"
                                value={startDate}
                                onChange={setStartDate}
                            />

                            <DatePicker
                                placeholder="Hasta"
                                value={endDate}
                                onChange={setEndDate}
                            />

                            {(searchTerm || filterCategory !== 'Todas' || startDate || endDate) && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-all border border-dashed border-gray-200 dark:border-white/10 rounded-2xl px-4"
                                    title="Limpiar filtros"
                                >
                                    <X size={14} />
                                    Limpiar
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-gray-50/80 dark:bg-black/20 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 dark:border-white/5">
                            <tr>
                                <th className="pl-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha / Categoría</th>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Concepto</th>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Pago / Ref</th>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Estado</th>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Monto</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            <AnimatePresence>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Cargando transacciones...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredGastos.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-20">
                                                <DollarSign size={40} className="text-gray-400" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Sin registros encontrados</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredGastos.map((gasto) => (
                                        <motion.tr
                                            key={gasto.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <td className="pl-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-900 dark:text-white flex items-center gap-1.5 uppercase">
                                                        <Calendar size={10} className="text-gray-400" />
                                                        {new Date(gasto.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[9px] text-blue-600 font-bold uppercase mt-1 inline-flex items-center gap-1">
                                                        <Tag size={10} />
                                                        {gasto.categoria}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase leading-snug block max-w-xs">{gasto.concepto}</span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
                                                        <CreditCard size={10} />
                                                        {gasto.metodo_pago}
                                                    </span>
                                                    {gasto.referencia && (
                                                        <span className="text-[9px] font-medium text-gray-400 uppercase mt-0.5">Ref: {gasto.referencia}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${gasto.estado === 'Pagado'
                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20'
                                                    : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20'
                                                    }`}>
                                                    {gasto.estado === 'Pagado' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                                    {gasto.estado}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="text-sm font-black text-red-500">- S/ {parseFloat(gasto.monto).toFixed(2)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => navigate(`/admin/gastos/editar/${gasto.id}`)}
                                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                                                        title="Editar gasto"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(gasto.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                                        title="Eliminar registro"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {!loading && filteredGastos.length > 0 && (
                    <div className="p-6 bg-gray-50/50 dark:bg-black/20 border-t border-gray-50 dark:border-white/5">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Mostrando {filteredGastos.length} de {gastos.length} registros totales
                            </p>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Total Gastos Seleccionados</p>
                                    <p className="text-2xl font-black text-red-500 leading-none">S/ {totalGastos.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GastosIndex;
