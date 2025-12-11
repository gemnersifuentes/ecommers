import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { resenasService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

// Componente para comentarios expandibles
const ComentarioExpandible = ({ comentario }) => {
    const [expandido, setExpandido] = useState(false);
    const [necesitaExpansion, setNecesitaExpansion] = useState(false);

    useEffect(() => {
        // Verificar si el comentario es lo suficientemente largo (más de ~150 caracteres)
        setNecesitaExpansion(comentario.length > 150);
    }, [comentario]);

    return (
        <div className="relative">
            <p className={`text-sm text-gray-700 leading-relaxed ${!expandido && necesitaExpansion ? 'line-clamp-3' : ''}`}>
                {comentario}
            </p>

            {/* Fade effect when collapsed */}
            {!expandido && necesitaExpansion && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
            )}

            {/* Ver más button */}
            {necesitaExpansion && (
                <button
                    onClick={() => setExpandido(!expandido)}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium mt-1"
                >
                    {expandido ? 'Ver menos' : 'Ver más'}
                </button>
            )}
        </div>
    );
};


const ProductReviews = ({ productoId }) => {
    const { isAuthenticated, usuario } = useAuth();
    const [resenas, setResenas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        promedio: 0,
        verificadas: 0
    });
    const [mostrarTodas, setMostrarTodas] = useState(false);

    // Estado para nueva reseña
    const [nuevaResena, setNuevaResena] = useState({
        calificacion: 5,
        comentario: ''
    });
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        cargarResenas();
    }, [productoId]);

    const cargarResenas = async () => {
        try {
            const data = await resenasService.getByProducto(productoId);
            // Backend returns raw array of reviews
            const resenasData = Array.isArray(data) ? data : (data.resenas || []);

            setResenas(resenasData);

            // Calculate stats on frontend
            const total = resenasData.length;
            const promedio = total > 0
                ? resenasData.reduce((acc, curr) => acc + parseFloat(curr.calificacion), 0) / total
                : 0;
            const verificadas = resenasData.filter(r => r.es_compra_verificada).length; // assuming field exists or is null

            setStats({
                total,
                promedio,
                verificadas
            });

        } catch (error) {
            console.error('Error cargando reseñas:', error);
            setResenas([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitResena = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            Swal.fire('Inicia sesión', 'Debes iniciar sesión para dejar una reseña', 'info');
            return;
        }

        if (nuevaResena.comentario.trim().length < 10) {
            Swal.fire('Comentario muy corto', 'Por favor escribe al menos 10 caracteres', 'warning');
            return;
        }

        try {
            setEnviando(true);
            await resenasService.create({
                producto_id: productoId,
                calificacion: nuevaResena.calificacion,
                comentario: nuevaResena.comentario
            });

            Swal.fire({
                icon: 'success',
                title: '¡Reseña enviada!',
                text: 'Gracias por tu comentario',
                timer: 1500,
                showConfirmButton: false
            });

            setNuevaResena({ calificacion: 5, comentario: '' });
            cargarResenas();
        } catch (error) {
            console.error('Error enviando reseña:', error);

            // Handle specific 409 Conflict (Duplicate review)
            if (error.response && error.response.status === 409) {
                Swal.fire('Ya opinaste', 'Ya has escrito una reseña para este producto anteriormente.', 'warning');
            } else {
                Swal.fire('Error', 'No se pudo enviar la reseña. Inténtalo de nuevo más tarde.', 'error');
            }
        } finally {
            setEnviando(false);
        }
    };

    const renderEstrellas = (calificacion) => {
        const estrellas = [];
        const cal = Math.round(calificacion);
        for (let i = 1; i <= 5; i++) {
            estrellas.push(
                <FaStar key={i} className={i <= cal ? "text-yellow-400" : "text-gray-300"} size={14} />
            );
        }
        return <div className="flex gap-0.5">{estrellas}</div>;
    };

    const renderEstrellasInput = () => {
        const estrellas = [];
        for (let i = 1; i <= 5; i++) {
            estrellas.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => setNuevaResena({ ...nuevaResena, calificacion: i })}
                    className="focus:outline-none transition-transform hover:scale-110"
                >
                    <FaStar
                        className={i <= nuevaResena.calificacion ? "text-yellow-400" : "text-gray-300"}
                        size={14}
                    />
                </button>
            );
        }
        return <div className="flex gap-1">{estrellas}</div>;
    };

    const formatearFecha = (fecha) => {
        const date = new Date(fecha);
        const dia = date.getDate();
        const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const mes = meses[date.getMonth()];
        const año = date.getFullYear();
        return `${dia} ${mes} ${año}`;
    };

    const obtenerIniciales = (nombre) => {
        if (!nombre) return 'U';
        const palabras = nombre.trim().split(' ');
        if (palabras.length === 1) return palabras[0][0].toUpperCase();
        return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase();
    };

    const obtenerColorAvatar = (nombre) => {
        const colores = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-green-500', 'bg-red-500'];
        const index = nombre ? nombre.charCodeAt(0) % colores.length : 0;
        return colores[index];
    };

    const resenasMostradas = mostrarTodas ? resenas : resenas.slice(0, 4);

    return (
        <div className="w-full py-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                {/* Título a la izquierda */}
                <h2 className="text-sm font-bold text-gray-900">
                    Opiniones de clientes
                </h2>

                {/* Calificación + estrellas + reseñas + verificados a la derecha */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* Calificación + estrellas + reseñas */}
                    <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-orange-600">
                            {stats.promedio.toFixed(1).replace(/\.0$/, '')}
                        </div>
                        <div className="flex items-center gap-1">
                            {renderEstrellas(stats.promedio)}
                            <span className="text-xs font-medium text-blue-600">
                                {stats.total} {stats.total === 1 ? 'reseña' : 'reseñas'}
                            </span>
                        </div>
                    </div>

                    {/* Badge de verificados (solo si aplica) */}
                    {stats.verificadas > 0 && (
                        <div className="flex-shrink-0">
                            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-green-200">
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-sm font-semibold text-green-700">
                                    {stats.verificadas} {stats.verificadas === 1 ? 'comprador verificado' : 'compradores verificados'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Formulario de Reseña */}
            <div className="mb-8 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                {isAuthenticated ? (
                    <form onSubmit={handleSubmitResena}>

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 mb-2">Calificación</label>
                            {renderEstrellasInput()}
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 mb-2">Tu comentario</label>
                            <textarea
                                value={nuevaResena.comentario}
                                onChange={(e) => setNuevaResena({ ...nuevaResena, comentario: e.target.value })}
                                className="w-full border border-gray-300 rounded-xl p-4 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                                rows="4"
                                placeholder="Comparte tu experiencia con este producto..."
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Mínimo 10 caracteres</p>
                        </div>
                        <button
                            type="submit"
                            disabled={enviando}
                            className={`px-6 py-2.5 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 transition-all shadow-sm ${enviando ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {enviando ? 'Enviando...' : 'Publicar reseña'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-gray-600 mb-3 text-sm">Inicia sesión para compartir tu opinión</p>
                        <a href="/login" className="inline-block px-6 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 transition-all">
                            Iniciar Sesión
                        </a>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-orange-500"></div>
                    <p className="text-gray-500 mt-3 text-sm">Cargando reseñas...</p>
                </div>
            ) : resenas.length === 0 ? (
                <div className="py-12 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaStar className="text-gray-400" size={24} />
                    </div>
                    <p className="text-gray-600 font-medium mb-1">No hay reseñas todavía</p>
                    <p className="text-gray-500 text-sm">¡Sé el primero en opinar sobre este producto!</p>
                </div>
            ) : (
                <>


                    {/* Reviews List */}
                    <div className="relative">
                        <div className="space-y-6">
                            {resenasMostradas.map((resena) => (
                                <div key={resena.id} className="pb-6 border-b border-gray-100 last:border-0">
                                    <div className="flex gap-3">
                                        <div className={`w-10 h-10 rounded-full ${obtenerColorAvatar(resena.usuario_nombre)} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm`}>
                                            {obtenerIniciales(resena.usuario_nombre)}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {resena.usuario_nombre || 'Usuario'}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {formatearFecha(resena.fecha_creacion)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 mb-2">
                                                {renderEstrellas(resena.calificacion)}
                                                {resena.es_compra_verificada && (
                                                    <span className="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">Compra verificada</span>
                                                )}
                                            </div>

                                            <ComentarioExpandible comentario={resena.comentario} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Fade effect when collapsed */}
                        {!mostrarTodas && resenas.length > 4 && (
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
                        )}
                    </div>

                    {/* View All Button */}
                    {resenas.length > 4 && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={() => setMostrarTodas(!mostrarTodas)}
                                className="px-6 py-2.5 border border-orange-500 rounded-full text-sm font-medium text-orange-500 hover:bg-orange-50 transition-colors"
                            >
                                {mostrarTodas ? 'Ver menos' : 'Ver todas'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductReviews;
