import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag,
    Search,
    Plus,
    Eye,
    Pencil,
    Trash2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Filter,
    ArrowUpRight,
    ClipboardList,
    AlertCircle,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { comprasService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';
import Swal from 'sweetalert2';

const ComprasIndex = () => {
    const [compras, setCompras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('all');

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const data = await comprasService.getAll();
            setCompras(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudieron cargar las compras', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const comprasFiltradas = compras.filter(c => {
        const matchesSearch =
            (c.numero_comprobante && c.numero_comprobante.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (c.proveedor_nombre && c.proveedor_nombre.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || c.estado === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(comprasFiltradas.length / itemsPerPage);
    const currentItems = comprasFiltradas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusStyle = (estado) => {
        switch (estado) {
            case 'Completado': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400';
            case 'Pendiente': return 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400';
            case 'Cancelado': return 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400';
            default: return 'bg-gray-50 text-gray-500';
        }
    };

    const getStatusIcon = (estado) => {
        switch (estado) {
            case 'Completado': return <CheckCircle2 size={12} />;
            case 'Pendiente': return <Clock size={12} />;
            case 'Cancelado': return <AlertCircle size={12} />;
            default: return null;
        }
    };

    const handleDelete = async (id, estado) => {
        if (estado === 'Completado') {
            Swal.fire('Atención', 'No se pueden eliminar compras completadas para mantener la integridad del stock.', 'warning');
            return;
        }

        const result = await Swal.fire({
            title: '¿Eliminar registro?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ea580c',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await comprasService.delete(id);
                Swal.fire('Eliminado', 'La compra ha sido eliminada.', 'success');
                cargarDatos();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
            }
        }
    };

    return (
        <div className="p-4 space-y-6 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                        <ShoppingBag size={16} className="text-orange-500" />
                        Registro de Compras
                    </h1>
                    <Breadcrumb items={[
                        { label: 'Admin', link: '/admin', isHome: true },
                        { label: 'Abastecimiento', link: '#' },
                        { label: 'Compras' }
                    ]} />
                </div>

                <Link
                    to="/admin/compras/nuevo"
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-200 dark:shadow-none transition-all hover:bg-orange-700 w-fit"
                >
                    <Plus size={14} />
                    Registrar Compra
                </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-80">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar por comprobante o proveedor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 outline-none transition-all dark:text-white shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 shadow-sm">
                        <Filter size={12} className="text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent border-none text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest focus:ring-0 outline-none cursor-pointer"
                        >
                            <option value="all">TODOS LOS ESTADOS</option>
                            <option value="Pendiente">PENDIENTES</option>
                            <option value="Completado">COMPLETADOS</option>
                            <option value="Cancelado">CANCELADOS</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">Cargar:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 outline-none shadow-sm cursor-pointer"
                    >
                        <option value={10}>10 filas</option>
                        <option value={25}>25 filas</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111c44] rounded-2xl border border-gray-200 dark:border-white/5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-[#f8fafc]/80 dark:bg-[#0b1437]/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 whitespace-nowrap">DOCUMENTO</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 whitespace-nowrap">PROVEEDOR</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 text-center whitespace-nowrap">FECHA</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 text-center whitespace-nowrap">ESTADO</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 text-right whitespace-nowrap">TOTAL</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 text-right whitespace-nowrap">GESTIÓN</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {loading ? (
                                <tr><td colSpan="6" className="py-20 text-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                            ) : currentItems.length === 0 ? (
                                <tr><td colSpan="6" className="py-20 text-center text-gray-400"><ClipboardList size={40} className="mb-4 opacity-10 mx-auto" /><p className="text-[10px] font-black uppercase tracking-widest">No se detectaron movimientos</p></td></tr>
                            ) : (
                                <AnimatePresence>
                                    {currentItems.map((compra, idx) => (
                                        <motion.tr
                                            key={compra.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-orange-50/30 dark:hover:bg-orange-500/5"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">{compra.numero_comprobante || 'S/N'}</span>
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase">{compra.tipo_comprobante}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase">
                                                        {compra.proveedor_nombre?.charAt(0) || 'P'}
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{compra.proveedor_nombre || 'Proveedor Desconocido'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-gray-100 dark:border-white/5">
                                                    <Calendar size={10} />
                                                    {new Date(compra.fecha_compra).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyle(compra.estado)}`}>
                                                    {getStatusIcon(compra.estado)}
                                                    {compra.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xs font-black text-gray-900 dark:text-white">S/ {parseFloat(compra.total).toFixed(2)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        to={`/admin/compras/ver/${compra.id}`}
                                                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-all"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye size={14} />
                                                    </Link>
                                                    <Link
                                                        to={`/admin/compras/editar/${compra.id}`}
                                                        className={`p-2 rounded-lg transition-all ${compra.estado === 'Completado' ? 'text-gray-200 cursor-not-allowed dark:text-gray-800' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10'}`}
                                                        title="Editar"
                                                        onClick={(e) => compra.estado === 'Completado' && e.preventDefault()}
                                                    >
                                                        <Pencil size={14} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(compra.id, compra.estado)}
                                                        className={`p-2 rounded-lg transition-all ${compra.estado === 'Completado' ? 'text-gray-200 cursor-not-allowed dark:text-gray-800' : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10'}`}
                                                        title="Eliminar"
                                                        disabled={compra.estado === 'Completado'}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="border-t border-gray-100 dark:border-white/5 p-4 flex items-center justify-between">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                            Mostrando <span className="text-gray-900 dark:text-white">{currentItems.length}</span> de <span className="text-gray-900 dark:text-white">{comprasFiltradas.length}</span>
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-30 text-gray-500"><ChevronsLeft size={14} /></button>
                            <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-30 text-gray-500"><ChevronLeft size={14} /></button>
                            <div className="flex items-center gap-1 mx-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-orange-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-30 text-gray-500"><ChevronRight size={14} /></button>
                            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-30 text-gray-500"><ChevronsRight size={14} /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComprasIndex;
