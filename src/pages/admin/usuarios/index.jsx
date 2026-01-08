import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
    Users,
    UserPlus,
    Search,
    Shield,
    Edit,
    Trash2,
    Mail,
    UserCheck,
    List,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import { usuariosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const UsuariosIndex = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const data = await usuariosService.getAll();
            // Filtrar para excluir clientes - solo mostrar usuarios del sistema
            setUsuarios(Array.isArray(data) ? data.filter(u => u.rol !== 'cliente') : []);
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error de Sistema',
                text: 'No se pudo sincronizar la nómina de staff.',
                icon: 'error',
                confirmButtonColor: '#f97316'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Revocar acceso?',
            text: 'Esta acción desactivará permanentemente al colaborador.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, revocar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            customClass: {
                popup: 'rounded-xl',
                title: 'text-sm font-bold',
                htmlContainer: 'text-xs'
            }
        });

        if (result.isConfirmed) {
            try {
                await usuariosService.delete(id);
                Swal.fire({
                    title: 'Acceso Revocado',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                cargarDatos();
            } catch (error) {
                Swal.fire('Error', 'Operación fallida.', 'error');
            }
        }
    };

    const usuariosFiltrados = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.rol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(usuariosFiltrados.length / itemsPerPage);
    const currentItems = usuariosFiltrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading && usuarios.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-[10px] text-gray-400 font-medium uppercase tracking-widest">Sincronizando Staff...</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 min-h-screen">
            {/* Header Mirroring Products */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                        <Users size={16} className="text-orange-500" />
                        Gestión de Usuarios
                    </h1>
                    <Breadcrumb items={[
                        { label: 'Admin', link: '/admin', isHome: true },
                        { label: 'Staff de Sistema' }
                    ]} />
                </div>

                <Link
                    to="/admin/usuarios/nuevo"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 dark:bg-orange-600 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 dark:hover:bg-orange-500 transition-colors shadow-sm uppercase tracking-wider"
                >
                    <UserPlus size={14} />
                    Nuevo Colaborador
                </Link>
            </div>

            {/* Middle Bar: Search & Items Per Page */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-80">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Filtrar por nombre, correo o rango..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                        />
                    </div>

                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 outline-none hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-pointer shadow-sm"
                    >
                        <option value={10}>10 Staff</option>
                        <option value={25}>25 Staff</option>
                    </select>
                </div>

                <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-white/5">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    {usuariosFiltrados.length} Usuarios Activos
                </div>
            </div>

            {/* Industrial Table Area */}
            <div className="bg-white dark:bg-[#111c44] rounded-2xl border border-gray-200 dark:border-white/5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-[#f8fafc]/80 dark:bg-[#0b1437]/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        IDENTIDAD
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 whitespace-nowrap">CORREO / ACCESO</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 text-center whitespace-nowrap">RANGO CORPORATIVO</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 text-center whitespace-nowrap">ESTADO</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 text-right whitespace-nowrap">OPERACIONES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            <AnimatePresence>
                                {currentItems.map((u, idx) => (
                                    <motion.tr
                                        key={u.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        whileHover={{
                                            backgroundColor: "rgba(249, 115, 22, 0.04)",
                                            transition: { duration: 0.2, ease: "easeOut" }
                                        }}
                                        transition={{
                                            opacity: { duration: 0.5, delay: idx * 0.045 },
                                            x: { duration: 0.5, delay: idx * 0.045, ease: [0.16, 1, 0.3, 1] }
                                        }}
                                        className="relative group cursor-default"
                                    >
                                        <td className="px-6 py-4 relative">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-orange-500 dark:text-orange-400 font-black text-xs group-hover:border-orange-200 dark:group-hover:border-orange-500 transition-all duration-300">
                                                    {u.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-[#1e293b] dark:text-gray-200 uppercase tracking-tight">
                                                        {u.nombre}
                                                    </p>
                                                    <p className="text-[9px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-tight">Staff ID #{u.id.toString().padStart(4, '0')}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                                                <Mail size={12} className="text-gray-300 dark:text-gray-600" />
                                                {u.correo}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded font-black text-[10px] tracking-wider border whitespace-nowrap uppercase ${u.rol === 'admin' ? 'bg-slate-900 text-white border-slate-900 shadow-sm dark:bg-[#0b1437] dark:border-white/20' :
                                                'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20'
                                                }`}>
                                                <Shield size={10} strokeWidth={3} />
                                                {u.rol}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm font-black text-[10px] tracking-[0.05em] border-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-500/20 uppercase whitespace-nowrap">
                                                <UserCheck size={10} />
                                                activo
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {[
                                                    { to: `/admin/usuarios/editar/${u.id}`, icon: Edit, label: 'Editar Staff', color: 'hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/5' },
                                                    { onClick: () => handleEliminar(u.id), icon: Trash2, label: 'Baja de Sistema', color: 'hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5' }
                                                ].map((action, i) => (
                                                    <Link
                                                        key={i}
                                                        to={action.to}
                                                        onClick={action.onClick}
                                                        className={`p-1.5 transition-all duration-300 rounded-lg border-2 border-transparent bg-gray-50 dark:bg-white/5 text-[#1e293b] dark:text-gray-400 hover:border-[#1e293b]/10 dark:hover:border-white/20 hover:shadow-md ${action.color}`}
                                                        title={action.label}
                                                    >
                                                        <action.icon size={14} strokeWidth={2.5} />
                                                    </Link>
                                                ))}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {usuariosFiltrados.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Users size={40} className="mb-4 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Sin coincidencias de Staff</p>
                    </div>
                )}
            </div>

            {/* Pagination Standard */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                        Página <span className="text-gray-900 dark:text-white">{currentPage}</span> de <span className="text-gray-900 dark:text-white">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="p-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-50 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm"
                        >
                            <ChevronsLeft size={14} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-50 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm"
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
                                        : 'bg-white dark:bg-[#111c44] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-50 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm"
                        >
                            <ChevronRight size={14} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="p-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-50 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm"
                        >
                            <ChevronsRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsuariosIndex;
