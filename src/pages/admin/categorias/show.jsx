import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Hash, Tag, Edit, Info, ArrowLeft } from 'lucide-react';
import { categoriasService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const CategoriasShow = () => {
    const { id } = useParams();
    const [categoria, setCategoria] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarCategoria();
    }, [id]);

    const cargarCategoria = async () => {
        setLoading(true);
        try {
            const data = await categoriasService.getById(id);
            setCategoria(data);
        } catch (error) {
            console.error('Error al cargar categoría:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
        );
    }

    if (!categoria) {
        return (
            <div className="text-center py-20 bg-white dark:bg-[#111c44] rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                <div className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Categoría no encontrada</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Detalle de Categoría</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Categorías', link: '/admin/categorias' },
                    { label: categoria.nombre }
                ]} />
            </div>

            <div className="bg-white dark:bg-[#111c44] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-8">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 overflow-hidden shadow-inner">
                            {categoria.imagen ? (
                                <img
                                    src={`http://localhost:8000${categoria.imagen}`}
                                    alt={categoria.nombre}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Tag size={40} className="text-indigo-600 dark:text-indigo-400" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-2">{categoria.nombre}</h1>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Identificador</span>
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-[#0b1437] rounded text-[10px] font-black text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5 flex items-center gap-1">
                                        <Hash size={8} /> {categoria.id}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Estado</span>
                                    <span className="px-2 py-0.5 bg-green-50 dark:bg-green-500/10 rounded text-[10px] font-black text-green-600 dark:text-green-400 border border-green-100 dark:border-green-500/20 uppercase tracking-tight">Activo</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-end lg:self-start">
                        <Link
                            to={`/admin/categorias/editar/${categoria.id}`}
                            className="px-6 py-2.5 bg-indigo-600 dark:bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 group"
                        >
                            <Edit size={12} className="group-hover:rotate-12 transition-transform" />
                            Editar Categoría
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                <Info size={10} /> Descripción Operativa
                            </h3>
                            <div className="text-xs font-bold text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-[#0b1437] p-6 rounded-2xl border border-gray-100 dark:border-white/5 leading-relaxed uppercase tracking-tight min-h-[120px]">
                                {categoria.descripcion || 'Sin descripción corporativa registrada.'}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Stat Card: Total Productos */}
                        <div className="bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-500/10 flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-500/20 transition-all shadow-sm">
                            <div>
                                <h4 className="text-[8px] font-black text-indigo-900/60 dark:text-indigo-400/60 uppercase tracking-widest mb-1">Stock de Catálogo</h4>
                                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                                    {categoria.total_productos || 0}
                                </div>
                                <p className="text-[9px] font-black text-indigo-900/40 dark:text-indigo-400/30 uppercase tracking-tight mt-1">Productos Vinculados</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                <Package size={24} />
                            </div>
                        </div>

                        <div className="bg-indigo-50/30 dark:bg-indigo-500/5 rounded-2xl p-6 border border-indigo-100/50 dark:border-indigo-500/10 h-fit">
                            <div className="flex items-center gap-3 mb-4">
                                <Info size={14} className="text-indigo-600 dark:text-indigo-400" />
                                <h4 className="text-[10px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest">Nota de Gestión</h4>
                            </div>
                            <p className="text-[10px] font-bold text-indigo-700/70 dark:text-indigo-400/60 uppercase leading-snug tracking-tight">
                                Esta categoría organiza los productos en la tienda virtual. Cualquier cambio en el nombre afectará las URL de búsqueda y el SEO del sitio.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoriasShow;
