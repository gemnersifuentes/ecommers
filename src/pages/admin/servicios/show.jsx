import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { serviciosService } from '../../../services';
import Breadcrumb from '../../../components/Breadcrumb';

const ServiciosShow = () => {
    const { id } = useParams();
    const [servicio, setServicio] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarServicio();
    }, [id]);

    const cargarServicio = async () => {
        setLoading(true);
        try {
            const data = await serviciosService.getById(id);
            setServicio(data);
        } catch (error) {
            console.error('Error al cargar servicio:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
        );
    }

    if (!servicio) {
        return (
            <div className="text-center py-20 bg-white dark:bg-[#111c44] rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                <div className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Servicio no encontrado</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Detalle de Servicio</h2>
                <Breadcrumb items={[
                    { label: 'Inicio', link: '/admin', isHome: true },
                    { label: 'Servicios', link: '/admin/servicios' },
                    { label: servicio.nombre }
                ]} />
            </div>

            <div className="bg-white dark:bg-[#111c44] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-8">
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-500/20 shadow-lg shadow-blue-500/5">
                            <i className="fas fa-wrench text-blue-600 dark:text-blue-400 text-3xl"></i>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{servicio.nombre}</h1>
                            <div className="flex items-center mt-1">
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-[#0b1437] rounded text-[10px] font-black text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5 uppercase tracking-widest">ID: {servicio.id}</span>
                            </div>
                        </div>
                    </div>
                    <Link
                        to={`/admin/servicios/editar/${servicio.id}`}
                        className="px-6 py-2.5 bg-blue-600 dark:bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center gap-2"
                    >
                        <i className="fas fa-edit"></i>
                        Editar Portafolio
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Descripción Operativa</h3>
                        <div className="text-[11px] font-bold text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-[#0b1437] p-5 rounded-2xl border border-gray-100 dark:border-white/5 leading-relaxed uppercase tracking-tight">
                            {servicio.descripcion || 'Sin descripción técnica registrada.'}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Parámetros del Servicio</h3>
                        <div className="bg-gray-50 dark:bg-[#0b1437] p-6 rounded-2xl border border-gray-100 dark:border-white/5 space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-3">
                                <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Valor Unitario</span>
                                <span className="text-sm font-black text-gray-900 dark:text-white tracking-tighter">${parseFloat(servicio.precio).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-blue-50/50 dark:bg-blue-500/5 p-4 rounded-xl border border-blue-100 dark:border-blue-500/10">
                                <span className="text-[9px] font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest">Tiempo Estimado</span>
                                <span className="text-[11px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-tight">{servicio.duracion || 'No especificada'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiciosShow;
