import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import Swal from 'sweetalert2';
import { useLoader } from '../context/LoaderContext';
import {
  Mail,
  Lock,
  LogIn,
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    correo: '',
    clave: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    if (!settings.google_client_id) return;

    const clientId = settings.google_client_id;

    const loadGoogleSDK = () => {
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google) {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleResponse
          });
          google.accounts.id.renderButton(
            document.getElementById("googleBtn"),
            {
              theme: "outline",
              size: "large",
              width: "340",
              text: "continue_with",
              shape: "pill",
              logo_alignment: "center"
            }
          );
        }
      };
      document.body.appendChild(script);
    };

    loadGoogleSDK();
  }, [settings.google_client_id]);

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    showLoader();
    try {
      const res = await googleLogin(response.credential);
      Swal.fire({
        icon: 'success',
        title: '¡Acceso con Google!',
        text: res.message,
        timer: 1500,
        showConfirmButton: false,
        background: '#ffffff',
        color: '#1f2937',
        iconColor: '#f97316'
      });
      if (res.usuario.rol === 'admin') navigate('/admin');
      else navigate('/');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Google',
        text: error.response?.data?.message || 'No se pudo iniciar sesión con Google.',
        confirmButtonColor: '#f97316'
      });
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    showLoader();

    try {
      const response = await login(formData.correo, formData.clave);

      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: response.message,
        timer: 1500,
        showConfirmButton: false,
        background: '#ffffff',
        color: '#1f2937',
        iconColor: '#f97316'
      });

      if (response.usuario.rol === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: error.response?.data?.message || 'Verifica tus credenciales e intenta de nuevo.',
        confirmButtonColor: '#f97316'
      });
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  py-12 px-6 relative overflow-hidden font-inter">
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
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-orange-600/20 rounded-full blur-[120px] animate-pulse-soft"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
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
            Soporte Técnico de Confianza
          </motion.p>
        </div>

        {/* Main Login Card - Light Industrial / Glass Effect */}
        <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[1rem] shadow-lg border border-white/10 overflow-hidden">


          <div className="p-8 sm:p-12">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <LogIn size={18} className="text-orange-500" />
              </div>
              <span className="uppercase tracking-widest text-sm">Identificación</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Corporativo</label>
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
                    className="w-full bg-white/[0.03] border border-gray-300 rounded-2xl py-4 pl-14 pr-4 text-sm font-medium text-gray-900 outline-none  focus:border-orange-500  placeholder:text-slate-600"
                    placeholder="usuario@redhard.net"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Credencial</label>
                  <Link to="/forgot-password" strokeWidth={3} className="text-[10px] font-bold text-orange-500 hover:text-orange-400 transition-colors uppercase tracking-widest">Recuperar Acceso</Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors duration-300">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    name="clave"
                    required
                    value={formData.clave}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-sm font-medium text-white outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-orange-500/5 placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black text-xs uppercase tracking-[0.25em] py-5 rounded-2xl transition-all duration-300 shadow-xl shadow-orange-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group overflow-hidden relative"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="relative z-10">Ingresar al Sistema</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform relative z-10" />
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </>
                )}
              </button>
            </form>

            <div className="relative my-10 text-center">
              <div className="absolute inset-0 flex items-center text-white/5">
                <div className="w-full border-t border-current"></div>
              </div>
              <span className="relative px-6 bg-[#16161d] text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Acceso Seguro</span>
            </div>

            <div className="flex justify-center">
              <div id="googleBtn" className="min-h-[50px] transition-all hover:brightness-110"></div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-5 text-center">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                ¿No dispones de una cuenta?
              </p>
              <Link
                to="/register"
                className="text-white text-[11px] font-black uppercase tracking-[0.2em] hover:text-orange-500 transition-all duration-300 py-3 px-10 border border-white/10 rounded-full hover:border-orange-500/50 bg-white/5 shadow-inner"
              >
                Crear Registro
              </Link>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
            <ShieldCheck className="text-orange-500/60" size={16} />
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Entorno Protegido</p>
              <p className="text-[11px] text-slate-400 font-medium">SSL 256-bit Encryption Active</p>
            </div>
          </div>
          <p className="text-center text-slate-600 text-[9px] font-bold uppercase tracking-[0.4em]">
            &copy; {new Date().getFullYear()} REDHARD.NET INFRASTRUCTURE
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

