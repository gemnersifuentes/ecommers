import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    Eye,
    Mail,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    IdCard,
    ArrowUpRight
} from 'lucide-react';
import { usuariosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const ClientesIndex = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const data = await usuariosService.getAll();
            setClientes(Array.isArray(data) ? data.filter(u => u.rol === 'cliente') : []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const clientesFiltrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.correo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(clientesFiltrados.length / itemsPerPage);
    const currentItems = clientesFiltrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading && clientes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-[10px] text-gray-400 font-medium uppercase tracking-widest">Sincronizando Directorio...</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 min-h-screen">
            {/* Header Mirroring Products */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-tight">
                        <IdCard size={16} className="text-orange-500" />
                        Directorio de Clientes
                    </h1>
                    <Breadcrumb items={[
                        { label: 'Admin', link: '/admin', isHome: true },
                        { label: 'Clientes Registrados' }
                    ]} />
                </div>

                <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Users size={12} className="text-orange-500" />
                    {clientesFiltrados.length} Registros Activos
                </div>
            </div>

            {/* Middle Bar: Search & Page Limit */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative w-full lg:w-96">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Identificar cliente por nombre o mail..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm"
                    />
                </div>

                <select
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-600 outline-none hover:border-gray-300 transition-all cursor-pointer shadow-sm w-full lg:w-auto"
                >
                    <option value={10}>10 Clientes</option>
                    <option value={25}>25 Clientes</option>
                </select>
            </div>

            {/* Industrial Table Area */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-[#f8fafc]/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        PERFIL CLIENTE
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 whitespace-nowrap">CONTACTO</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 text-center whitespace-nowrap">ANTIGÜEDAD</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-wider border-b border-gray-100 text-right whitespace-nowrap">EXPEDIENTE</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence>
                                {currentItems.map((cliente, idx) => (
                                    <motion.tr
                                        key={cliente.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        whileHover={{
                                            backgroundColor: "rgba(249, 115, 22, 0.02)",
                                            transition: { duration: 0.2, ease: "easeOut" }
                                        }}
                                        transition={{
                                            opacity: { duration: 0.5, delay: idx * 0.04 },
                                            x: { duration: 0.5, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }
                                        }}
                                        className="relative group cursor-default"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center font-black text-xs transition-all duration-300 group-hover:bg-orange-500 group-hover:text-white">
                                                    {cliente.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-[#1e293b] uppercase tracking-tight">
                                                        {cliente.nombre}
                                                    </p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">CUST-ID #{cliente.id.toString().padStart(5, '0')}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                                                <Mail size={12} className="text-gray-300" />
                                                {cliente.correo}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 text-gray-500 rounded font-black text-[10px] tracking-wider border border-gray-100 whitespace-nowrap uppercase">
                                                <Calendar size={10} strokeWidth={3} />
                                                {new Date(cliente.fecha_registro).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end">
                                                <Link
                                                    to={`/admin/clientes/ver/${cliente.id}`}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-[#1e293b] text-[10px] font-black uppercase tracking-widest rounded-lg border-2 border-transparent transition-all duration-300 hover:border-orange-500/10 hover:text-orange-600 hover:bg-orange-50 group/btn"
                                                >
                                                    Ver Historial
                                                    <ArrowUpRight size={12} className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                                </Link>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {clientesFiltrados.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Users size={40} className="mb-4 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Sin registros de clientes</p>
                    </div>
                )}
            </div>

            {/* Pagination Standard */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Página <span className="text-gray-900">{currentPage}</span> de <span className="text-gray-900">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 text-gray-600 hover:border-gray-300 transition-all shadow-sm"
                        >
                            <ChevronsLeft size={14} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 text-gray-600 hover:border-gray-300 transition-all shadow-sm"
                        >
                            <ChevronLeft size={14} />
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 text-gray-600 hover:border-gray-300 transition-all shadow-sm"
                        >
                            <ChevronRight size={14} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 text-gray-600 hover:border-gray-300 transition-all shadow-sm"
                        >
                            <ChevronsRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientesIndex;
