import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { useLoader } from '../context/LoaderContext';
import {
  User,
  Mail,
  Lock,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    clave: '',
    confirmarClave: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.clave !== formData.confirmarClave) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Validación',
        text: 'Las contraseñas no coinciden',
        confirmButtonColor: '#f97316',
        background: '#ffffff',
        color: '#1f2937'
      });
      return;
    }

    setLoading(true);
    showLoader();

    try {
      await register(formData.nombre, formData.correo, formData.clave);

      Swal.fire({
        icon: 'success',
        title: '¡Cuenta Creada!',
        text: 'Tu registro ha sido exitoso. Ya puedes iniciar sesión.',
        timer: 2000,
        showConfirmButton: false,
        background: '#ffffff',
        color: '#1f2937',
        iconColor: '#f97316'
      });

      navigate('/login');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Registro',
        text: error.response?.data?.message || 'No se pudo completar el registro.',
        confirmButtonColor: '#f97316',
        background: '#ffffff',
        color: '#1f2937'
      });
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] py-12 px-6 relative overflow-hidden font-inter">
      {/* Dynamic Glass Background */}
      <div
        className="absolute inset-0 z-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage: `url('/src/assets/login_glamour_bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px)'
        }}
      ></div>

      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-orange-600/20 rounded-full blur-[120px] animate-pulse-soft"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[540px] relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-orange-500 to-orange-700 shadow-2xl shadow-orange-600/30 mb-6"
          >
            <Cpu className="text-white w-8 h-8" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-black text-white tracking-tight"
          >
            RedHard<span className="text-orange-500">.Net</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2 brightness-125"
          >
            Tu Pasaporte al Alto Rendimiento
          </motion.p>
        </div>

        {/* Main Register Card */}
        <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400"></div>

          <div className="p-8 sm:p-12">
            <h2 className="text-xl font-bold text-white mb-10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <UserPlus size={18} className="text-orange-500" />
              </div>
              <span className="uppercase tracking-widest text-sm">Alta de Usuario</span>
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre y Apellidos</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors duration-300">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-sm font-medium text-white outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-orange-500/5 placeholder:text-slate-600"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors duration-300">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="correo"
                    required
                    value={formData.correo}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-sm font-medium text-white outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-orange-500/5 placeholder:text-slate-600"
                    placeholder="personal@servidor.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors duration-300">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    name="clave"
                    required
                    minLength="6"
                    value={formData.clave}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-sm font-medium text-white outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-orange-500/5 placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Validación</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors duration-300">
                    <ShieldCheck size={18} />
                  </div>
                  <input
                    type="password"
                    name="confirmarClave"
                    required
                    minLength="6"
                    value={formData.confirmarClave}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-sm font-medium text-white outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-orange-500/5 placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="md:col-span-2 w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black text-xs uppercase tracking-[0.25em] py-5 rounded-2xl transition-all duration-300 shadow-xl shadow-orange-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group relative overflow-hidden mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="relative z-10">Generar Cuenta</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform relative z-10" />
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-5 text-center">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                ¿Ya formas parte del equipo?
              </p>
              <Link
                to="/login"
                className="text-white text-[11px] font-black uppercase tracking-[0.2em] hover:text-orange-500 transition-all duration-300 py-3 px-10 border border-white/10 rounded-full hover:border-orange-500/50 bg-white/5 shadow-inner"
              >
                Volver al Despliegue
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-slate-600 text-[9px] font-bold uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} REDHARD.NET INFRASTRUCTURE
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
