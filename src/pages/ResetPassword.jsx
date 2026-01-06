import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services';
import Swal from 'sweetalert2';
import { useLoader } from '../context/LoaderContext';
import {
    Lock,
    ArrowRight,
    ShieldCheck,
    Cpu,
    RefreshCw,
    Eye,
    EyeOff
} from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams();
    const [formData, setFormData] = useState({
        clave: '',
        confirmarClave: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showLoader, hideLoader } = useLoader();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.clave !== formData.confirmarClave) {
            Swal.fire({
                icon: 'warning',
                title: 'Error de Validación',
                text: 'Las contraseñas no coinciden.',
                confirmButtonColor: '#f97316'
            });
            return;
        }

        setLoading(true);
        showLoader();

        try {
            const response = await authService.resetPassword(token, formData.clave);

            Swal.fire({
                icon: 'success',
                title: '¡Clave Actualizada!',
                text: response.message || 'Tu contraseña ha sido restablecida exitosamente.',
                confirmButtonColor: '#f97316',
                customClass: {
                    popup: 'rounded-[2rem] border-none shadow-2xl',
                    confirmButton: 'rounded-xl px-12 py-3 font-black uppercase tracking-widest text-xs'
                }
            }).then(() => {
                navigate('/login');
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Token Inválido',
                text: error.response?.data?.message || 'El enlace ha expirado o no es válido. Solicita uno nuevo.',
                confirmButtonColor: '#ef4444',
                customClass: {
                    popup: 'rounded-[2rem]'
                }
            });
        } finally {
            setLoading(false);
            hideLoader();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] py-12 px-6 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-50 to-transparent z-0"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl z-0"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl z-0"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[420px] relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-600 shadow-lg shadow-orange-600/20 mb-4">
                        <Cpu className="text-white w-7 h-7" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                        RedHard<span className="text-orange-600">.Net</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Soporte Técnico de Confianza</p>
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden relative">
                    <div className="h-2 w-full bg-orange-600"></div>

                    <div className="p-8 md:p-10">
                        <h2 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-2 uppercase tracking-tight">
                            <RefreshCw size={20} className="text-orange-600" /> Nueva Contraseña
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nueva Clave</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="clave"
                                        required
                                        value={formData.clave}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-12 text-sm font-medium text-gray-700 outline-none transition-all focus:border-orange-600/50 focus:bg-white focus:ring-4 focus:ring-orange-600/5"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Confirmar Nueva Clave</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmarClave"
                                        required
                                        value={formData.confirmarClave}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-gray-700 outline-none transition-all focus:border-orange-600/50 focus:bg-white focus:ring-4 focus:ring-orange-600/5"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-2xl transition-all shadow-lg shadow-orange-600/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Restablecer Acceso
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex gap-3">
                            <ShieldCheck className="text-blue-500 flex-shrink-0" size={16} />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Canal Seguro</p>
                                <p className="text-[10px] text-blue-800/70 font-bold uppercase tracking-tight leading-tight">Cifrado de extremo a extremo activo.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="mt-10 text-center text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                    &copy; {new Date().getFullYear()} RedHard.Net.
                </p>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
