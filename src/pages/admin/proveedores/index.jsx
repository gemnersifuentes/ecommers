import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck,
    Search,
    Plus,
    Edit2,
    Trash2,
    Mail,
    Phone,
    MapPin,
    FileText,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    X,
    Save,
    AlertCircle
} from 'lucide-react';
import { proveedoresService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';
import Swal from 'sweetalert2';

const ProveedoresIndex = () => {
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProveedor, setEditingProveedor] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        ruc: '',
        telefono: '',
        email: '',
        direccion: '',
        activo: 1
    });

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const data = await proveedoresService.getAll();
            setProveedores(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudieron cargar los proveedores', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const proveedoresFiltrados = proveedores.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.ruc && p.ruc.includes(searchTerm)) ||
        (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPages = Math.ceil(proveedoresFiltrados.length / itemsPerPage);
    const currentItems = proveedoresFiltrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleOpenModal = (proveedor = null) => {
        if (proveedor) {
            setEditingProveedor(proveedor);
            setFormData({
                nombre: proveedor.nombre,
                ruc: proveedor.ruc || '',
                telefono: proveedor.telefono || '',
                email: proveedor.email || '',
                direccion: proveedor.direccion || '',
                activo: parseInt(proveedor.activo)
            });
        } else {
            setEditingProveedor(null);
            setFormData({
                nombre: '',
                ruc: '',
                telefono: '',
                email: '',
                direccion: '',
                activo: 1
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProveedor(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProveedor) {
                await proveedoresService.update(editingProveedor.id, formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Proveedor actualizado',
                    showConfirmButton: false,
                    timer: 1500,
                    toast: true,
                    position: 'top-end'
                });
            } else {
                await proveedoresService.create(formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Proveedor creado',
                    showConfirmButton: false,
                    timer: 1500,
                    toast: true,
                    position: 'top-end'
                });
            }
            handleCloseModal();
            cargarDatos();
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', error.response?.data?.message || 'Error al procesar la solicitud', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto si el proveedor no tiene compras.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ea580c',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await proveedoresService.delete(id);
                Swal.fire('Eliminado', 'El proveedor ha sido eliminado.', 'success');
                cargarDatos();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Error al eliminar', 'error');
            }
        }
    };

    return (
        <div className="p-4 space-y-6 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                        <Truck size={16} className="text-orange-500" />
                        Gestión de Proveedores
                    </h1>
                    <Breadcrumb items={[
                        { label: 'Admin', link: '/admin', isHome: true },
                        { label: 'Abastecimiento', link: '#' },
                        { label: 'Proveedores' }
                    ]} />
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-200 dark:shadow-none transition-all hover:bg-orange-700"
                >
                    <Plus size={14} />
                    Nuevo Proveedor
                </motion.button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative w-full lg:w-96">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, RUC o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">Mostrar:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 outline-none hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-pointer shadow-sm"
                    >
                        <option value={10}>10 registros</option>
                        <option value={25}>25 registros</option>
                        <option value={50}>50 registros</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111c44] rounded-2xl border border-gray-200 dark:border-white/5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-[#f8fafc]/80 dark:bg-[#0b1437]/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 whitespace-nowrap">PROVEEDOR</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 whitespace-nowrap">CONTACTO</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 whitespace-nowrap">ESTADO</th>
                                <th className="px-6 py-4 text-[10px] font-black text-[#64748b] dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 text-right whitespace-nowrap">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center text-gray-400">
                                        <Truck size={40} className="mb-4 opacity-10 mx-auto" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No se encontraron proveedores</p>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {currentItems.map((proveedor, idx) => (
                                        <motion.tr
                                            key={proveedor.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-orange-50/30 dark:hover:bg-orange-500/5"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center font-black text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                                                        {proveedor.nombre.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">{proveedor.nombre}</p>
                                                        <p className="text-[10px] text-gray-400 dark:text-gray-600 font-medium">RUC: {proveedor.ruc || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    {proveedor.email && (
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 lowercase">
                                                            <Mail size={12} className="text-gray-300 dark:text-gray-600" />
                                                            {proveedor.email}
                                                        </div>
                                                    )}
                                                    {proveedor.telefono && (
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                                            <Phone size={12} className="text-gray-300 dark:text-gray-600" />
                                                            {proveedor.telefono}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${proveedor.activo == 1
                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                    : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                                                    }`}>
                                                    {proveedor.activo == 1 ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(proveedor)}
                                                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-all"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(proveedor.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="Eliminar"
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
                            Página <span className="text-gray-900 dark:text-white">{currentPage}</span> de <span className="text-gray-900 dark:text-white">{totalPages}</span>
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="p-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-30 text-gray-500 dark:text-gray-400"
                            >
                                <ChevronsLeft size={14} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-30 text-gray-500 dark:text-gray-400"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-30 text-gray-500 dark:text-gray-400"
                            >
                                <ChevronRight size={14} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-white dark:bg-[#111c44] border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-30 text-gray-500 dark:text-gray-400"
                            >
                                <ChevronsRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Proveedor */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-[#111c44] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                        {editingProveedor ? <Edit2 size={16} className="text-orange-500" /> : <Plus size={16} className="text-orange-500" />}
                                        {editingProveedor ? 'Actualizar Proveedor' : 'Nuevo Proveedor'}
                                    </h3>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">Complete los datos maestros del proveedor</p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">Nombre / Razón Social *</label>
                                        <div className="relative">
                                            <Truck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <input
                                                required
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleInputChange}
                                                placeholder="Ej. Importadora Global S.A.C."
                                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 outline-none transition-all dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">RUC / ID Fiscal</label>
                                        <div className="relative">
                                            <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <input
                                                name="ruc"
                                                value={formData.ruc}
                                                onChange={handleInputChange}
                                                placeholder="10123456789"
                                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 outline-none transition-all dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">Teléfono</label>
                                        <div className="relative">
                                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <input
                                                name="telefono"
                                                value={formData.telefono}
                                                onChange={handleInputChange}
                                                placeholder="+51 999 999 999"
                                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 outline-none transition-all dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">Email de contacto</label>
                                        <div className="relative">
                                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="ventas@proveedor.com"
                                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 outline-none transition-all dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">Dirección Física</label>
                                        <div className="relative">
                                            <MapPin size={14} className="absolute left-3 top-3 text-gray-300" />
                                            <textarea
                                                name="direccion"
                                                value={formData.direccion}
                                                onChange={handleInputChange}
                                                rows="2"
                                                placeholder="Av. Principal 123, Lima..."
                                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#0b1437] border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-orange-500 outline-none transition-all dark:text-white resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 flex items-center gap-2 py-2">
                                        <input
                                            type="checkbox"
                                            id="activo"
                                            name="activo"
                                            checked={formData.activo == 1}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:bg-[#0b1437] dark:border-white/10"
                                        />
                                        <label htmlFor="activo" className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Este proveedor está activo para compras</label>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 shadow-lg shadow-orange-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                                    >
                                        <Save size={14} />
                                        {editingProveedor ? 'Actualizar' : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProveedoresIndex;
