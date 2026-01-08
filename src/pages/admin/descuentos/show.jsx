import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { descuentosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const DescuentosShow = () => {
    const { id } = useParams();
    const [descuento, setDescuento] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDescuento();
    }, [id]);

    const cargarDescuento = async () => {
        setLoading(true);
        try {
            const data = await descuentosService.getById(id);
            setDescuento(data);
        } catch (error) {
            console.error('Error al cargar descuento:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoBadge = (descuento) => {
        const hoy = new Date();
        const inicio = new Date(descuento.fecha_inicio);
        const fin = new Date(descuento.fecha_fin);

        if (!descuento.activo) {
            return <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-200 dark:border-white/10">Inactivo</span>;
        }
        if (hoy < inicio) {
            return <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-500/20">Próximo</span>;
        }
        if (hoy > fin) {
            return <span className="px-3 py-1 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-200 dark:border-red-500/20">Vencido</span>;
        }
        return <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20">Activo</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
        );
    }

    if (!descuento) {
        return (
            <div className="text-center py-20 bg-white dark:bg-[#111c44] rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                <div className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Descuento no encontrado</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Detalle de Descuento</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Descuentos', link: '/admin/descuentos' },
                    { label: descuento.nombre }
                ]} />
            </div>

            <div className="bg-white dark:bg-[#111c44] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-8">
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                            <i className="fas fa-percent text-indigo-600 dark:text-indigo-400 text-3xl"></i>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{descuento.nombre}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-[#0b1437] rounded text-[10px] font-black text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5">ID: {descuento.id}</span>
                                {getEstadoBadge(descuento)}
                            </div>
                        </div>
                    </div>
                    <Link
                        to={`/admin/descuentos/editar/${descuento.id}`}
                        className="px-6 py-2.5 bg-indigo-600 dark:bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
                    >
                        <i className="fas fa-edit"></i>
                        Editar Estrategia
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Justificación Estratégica</h3>
                        <div className="text-[11px] font-bold text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-[#0b1437] p-5 rounded-2xl border border-gray-100 dark:border-white/5 leading-relaxed uppercase tracking-tight">
                            {descuento.descripcion || 'Sin descripción estratégica registrada.'}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Parámetros de Aplicación</h3>
                        <div className="bg-gray-50 dark:bg-[#0b1437] p-6 rounded-2xl border border-gray-100 dark:border-white/5 space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-2">
                                <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Tipo de Oferta</span>
                                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight capitalize">{descuento.tipo}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-2">
                                <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Valor Nominal</span>
                                <span className="text-[11px] font-black text-gray-900 dark:text-white">
                                    {descuento.tipo === 'porcentaje' ? `${descuento.valor}%` : `$${descuento.valor}`}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-2">
                                <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Segmento Objetivo</span>
                                <span className="text-[10px] font-black text-gray-900 dark:text-gray-300 uppercase tracking-tight capitalize">{descuento.aplica_a}</span>
                            </div>
                            <div className="flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-500/5 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/10">
                                <span className="text-[8px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest">Periodo Vigencia</span>
                                <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-tight">{descuento.fecha_inicio} al {descuento.fecha_fin}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DescuentosShow;
