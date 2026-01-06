import { useState, useEffect } from 'react';
import { serviciosService, reservacionesService } from '../services';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Shield,
  Settings,
  Terminal,
  Cpu,
  Zap,
  Activity,
  Layers,
  Maximize2,
  ChevronRight,
  Search,
  AlertTriangle,
  ClipboardCheck,
  Smartphone,
  Laptop,
  ArrowRight as FiArrowRight,
  MessageCircle,
  MapPin,
  Clock
} from 'lucide-react';
import {
  FaTools,
  FaStar,
  FaSearch,
  FaCommentDots,
  FaWrench
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const Servicios = () => {
  const [servicios, setServicios] = useState([]);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarServicios();
    window.scrollTo(0, 0);
  }, []);

  const cargarServicios = async () => {
    try {
      const data = await serviciosService.getAll();
      const arrayData = Array.isArray(data) ? data : (data.data || []);
      setServicios(arrayData);
      if (arrayData.length > 0) setSelectedServicio(arrayData[0]);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los servicios.',
        confirmButtonText: 'OK',
        customClass: { confirmButton: 'bg-orange-600 hover:bg-orange-700' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitar = (servicio) => {
    Swal.fire({
      title: `<div class="p-3 md:p-4 border-b border-gray-100"><span class="text-orange-600 font-black text-base md:text-lg uppercase tracking-tight">Solicitar Soporte</span></div>`,
      html: `
        <div class="text-start px-4 md:px-6 py-3 md:py-4">
          <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Code_ID: #00${servicio.id}</p>
          <div class="space-y-3">
            <input 
              type="text" 
              id="nombre" 
              class="w-full bg-gray-50 px-4 py-2.5 text-sm border-2 border-transparent rounded-lg focus:border-2 focus:border-orange-600 focus:bg-white transition-all font-bold outline-none"
              placeholder="NOMBRE"
              autocomplete="name"
            >
            <input 
              type="tel" 
              id="telefono" 
              class="w-full bg-gray-50 px-4 py-2.5 text-sm border-2 border-transparent rounded-lg focus:border-2 focus:border-orange-600 focus:bg-white transition-all font-bold outline-none"
              placeholder="WHATSAPP"
              autocomplete="tel"
            >
            <textarea 
              id="mensaje" 
              rows="3" 
              class="w-full bg-gray-50 px-4 py-2.5 text-sm border-2 border-transparent rounded-lg focus:border-2 focus:border-orange-600 focus:bg-white transition-all font-bold outline-none resize-none"
              placeholder="DETALLE TÉCNICO"
            ></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'CONFIRMAR',
      cancelButtonText: 'VOLVER',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'w-full md:w-[calc(100%-3rem)] mx-auto md:mx-6 bg-orange-600 text-white py-3 rounded-lg font-black text-xs uppercase tracking-widest shadow-md hover:bg-orange-700 transition-all mb-3',
        cancelButton: 'text-gray-500 py-1 font-bold text-[9px] uppercase tracking-widest hover:text-gray-700 transition-all',
        actions: 'flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-center'
      },
      preConfirm: () => {
        const nombre = document.getElementById('nombre').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const detalle = document.getElementById('mensaje').value.trim();

        if (!nombre || !telefono) {
          Swal.showValidationMessage('<i class="fas fa-exclamation-triangle"></i> Ingrese nombre y WhatsApp');
          return false;
        }

        const phoneRegex = /^[\d\s()+-]{9,15}$/;
        if (!phoneRegex.test(telefono)) {
          Swal.showValidationMessage('<i class="fas fa-phone"></i> Formato de WhatsApp inválido');
          return false;
        }

        // Mostrar loading en el botón de confirmación
        Swal.showLoading();

        return reservacionesService.create({
          servicio_id: servicio.id,
          nombre_cliente: nombre,
          whatsapp_cliente: telefono,
          detalle_tecnico: detalle
        }).then(response => {
          if (!response.success) {
            throw new Error(response.message || 'Error al procesar solicitud');
          }
          return response;
        }).catch(error => {
          Swal.showValidationMessage(`Error: ${error.message}`);
          return false;
        });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Protocolo Iniciado',
          text: 'Su ticket #00' + (result.value.id || '') + ' ha sido generado. Un ingeniero contactará su WhatsApp en breve.',
          showConfirmButton: false,
          timer: 3500,
          background: '#fff',
          iconColor: '#f97316',
          customClass: { popup: 'rounded-xl shadow-lg border-2 border-orange-600' }
        });
      }
    });

  };

  const handleRastrear = () => {
    Swal.fire({
      title: `<div class="p-4 border-b border-gray-100"><span class="text-gray-800 font-extrabold text-lg uppercase tracking-tight">Rastreo de <span class="text-orange-600">Protocolo</span></span></div>`,
      html: `
        <div class="p-6">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Ingrese su Código de Seguimiento</p>
          <div class="relative">
            <input 
              type="text" 
              id="ticketId" 
              class="w-full bg-gray-50 px-5 py-4 text-center text-lg border-2 border-dashed border-gray-200 rounded-xl focus:border-solid focus:border-orange-600 focus:bg-white transition-all font-black outline-none placeholder:text-gray-300"
              placeholder="#0000"
            >
          </div>
          <p class="text-[9px] text-gray-500 mt-4 leading-relaxed font-bold uppercase italic opacity-70">
            * El código se le proporcionó al momento de generar su ticket técnico.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'ESCANEAR TICKET',
      cancelButtonText: 'VOLVER',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-2xl border-2 border-gray-100 shadow-2xl',
        confirmButton: 'w-full md:w-[280px] mx-auto bg-gray-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-orange-600 transition-all mb-3',
        cancelButton: 'text-gray-400 py-1 font-bold text-[9px] uppercase tracking-widest hover:text-gray-600 transition-all',
        actions: 'flex flex-col items-center justify-center pb-4'
      },
      preConfirm: () => {
        const idInput = document.getElementById('ticketId').value.trim();
        const id = idInput.replace('#', '').replace(/^0+/, '');
        if (!id) {
          Swal.showValidationMessage('Ingrese un código válido');
          return false;
        }
        Swal.showLoading();
        return reservacionesService.trackTicket(id)
          .then(response => {
            if (!response.success) throw new Error(response.message);
            return response.data;
          })
          .catch(error => {
            Swal.showValidationMessage(`Error de Enlace: ${error.message}`);
          });
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const ticket = result.value;
        const statusConfig = {
          'Pendiente': { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
          'Confirmado': { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
          'En Proceso': { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
          'Completado': { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
          'Cancelado': { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
        };
        const st = statusConfig[ticket.estado] || statusConfig['Pendiente'];

        Swal.fire({
          title: `<div class="p-4 border-b border-gray-100"><span class="text-gray-900 font-black text-xs uppercase tracking-widest">Estado de Reparación #00${ticket.id}</span></div>`,
          html: `
            <div class="p-6 text-center">
              <div class="mb-4 inline-flex items-center justify-center p-3 ${st.bg} ${st.border} border-2 rounded-2xl">
                 <div class="text-2xl font-black ${st.color} uppercase italic tracking-tighter">${ticket.estado}</div>
              </div>
              <h3 class="font-black text-gray-900 text-lg uppercase mb-2">${ticket.servicio_nombre}</h3>
              <div class="space-y-3 mt-6">
                <div class="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase">
                  <span>REGISTRO_INICIAL:</span>
                  <span class="text-gray-900">${new Date(ticket.fecha_registro).toLocaleString()}</span>
                </div>
                <div class="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase">
                  <span>ÚLTIMA_ACTUALIZACIÓN:</span>
                  <span class="text-orange-600">${new Date(ticket.fecha_actualizacion).toLocaleString()}</span>
                </div>
                <div class="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase pt-2 border-t border-gray-50">
                  <span>COSTO_CONFIRMADO:</span>
                  <span class="text-gray-900 text-sm font-black italic">
                    S/ ${ticket.costo_final ? parseFloat(ticket.costo_final).toFixed(0) : parseFloat(ticket.costo_sugerido).toFixed(0) + ' (Estimado)'}
                  </span>
                </div>
              </div>
              <div class="mt-8 pt-6 border-t border-dashed border-gray-200">
                <p class="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                  Sistema de Diagnóstico RedHard v2.0 <br/> Protocolo de Seguridad en Tiempo Real
                </p>
              </div>
            </div>
          `,
          confirmButtonText: 'ENTENDIDO',
          buttonsStyling: false,
          customClass: {
            popup: 'rounded-2xl border-4 border-gray-50',
            confirmButton: 'bg-orange-600 text-white px-12 py-3 rounded-lg font-black text-xs tracking-widest hover:bg-orange-700 transition-all font-sans'
          }
        });
      }
    });
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Cpu className="text-orange-600 w-7 h-7 animate-spin" />
          <span className="text-gray-500 text-sm font-medium">Cargando protocolos...</span>
        </div>
      </div>
    );
  }

  if (servicios.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-md">
          <Terminal className="mx-auto text-gray-400 w-12 h-12 mb-4" />
          <h3 className="font-black text-gray-700 text-lg mb-2">No hay servicios disponibles</h3>
          <p className="text-gray-500 text-sm">Intente nuevamente más tarde o contacte al administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans cursor-default selection:bg-orange-100 selection:text-orange-700">
      {/* Spacer para header fijo - Ajustado para evitar que el header tape el contenido */}
      <div className="h-32 md:h-[185px]"></div>

      {/* Tech Header */}
      <header className="border-b border-gray-200 py-8 md:py-10 relative overflow-hidden bg-gray-50">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-600/5 -skew-x-12 translate-x-1/3"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 md:gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-0.5 bg-orange-600"></div>
                <span className="text-[9px] font-black text-orange-600 uppercase tracking-[0.3em]">División Técnica Especializada</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none italic">
                Repair<span className="text-gray-300">Center</span>_
              </h1>
              <p className="text-gray-500 font-medium text-xs md:text-sm max-w-lg">
                Diagnóstico avanzado por ingeniería y soporte técnico de precisión.
              </p>
            </div>
            <div class="grid grid-cols-2 lg:flex gap-6 md:gap-10 text-right">
              <button
                onClick={handleRastrear}
                className="col-span-2 md:col-span-1 group flex items-center gap-3 bg-gray-900 px-5 py-3 rounded-xl border border-gray-800 hover:border-orange-600 transition-all shadow-xl"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Search size={16} />
                </div>
                <div className="text-left">
                  <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Rastreo de Estado</div>
                  <div className="text-xs font-black text-white italic tracking-tight uppercase">CONSULTAR TICKET_</div>
                </div>
              </button>
              <div className="hidden md:block">
                <div className="text-xl md:text-2xl font-black leading-none italic text-orange-600">99.9%</div>
                <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">Precisión</div>
              </div>
              <div className="hidden md:block">
                <div className="text-xl md:text-2xl font-black leading-none italic">100%</div>
                <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">Garantía</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">

          {/* Sidebar */}
          <aside className="w-full lg:w-1/3">
            <div className="mb-4">
              <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Módulos_de_Servicio</div>
              <div className="h-0.5 w-8 bg-orange-600"></div>
            </div>

            <div className="space-y-2">
              {servicios.map((s, i) => (
                <motion.button
                  key={s.id}
                  onMouseEnter={() => setSelectedServicio(s)}
                  onClick={() => setSelectedServicio(s)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  className={`group relative w-full text-left px-4 py-3 transition-all duration-200 rounded-lg overflow-hidden 
                    ${selectedServicio?.id === s.id
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-500 hover:text-orange-600'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black opacity-50 min-w-[24px]">{String(i + 1).padStart(2, '0')}</span>
                      <span className="font-bold text-sm md:text-base tracking-tight">{s.nombre}</span>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 
                        ${selectedServicio?.id === s.id ? 'opacity-100 translate-x-0' : 'opacity-0 group-hover:opacity-100 -translate-x-1'}`}
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          </aside>

          {/* Viewport — SIN CUADRÍCULA, SOLO FONDO BLANCO LIMPIO */}
          <section className="flex-1">
            <AnimatePresence mode="wait">
              {selectedServicio && (
                <motion.div
                  key={selectedServicio.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl p-5 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden"
                >
                  {/* —— ¡¡¡NADA DE FONDO DE CUADRÍCULA AQUÍ!!! —— */}

                  <div className="flex flex-col md:flex-row gap-6 md:gap-8 relative z-10">
                    {/* Media Panel */}
                    <div className="w-full md:w-2/5 flex-shrink-0">
                      <div className="aspect-square bg-gray-50   flex items-center justify-center relative overflow-hidden">
                        {selectedServicio.imagen ? (
                          <img
                            src={selectedServicio.imagen.startsWith('http')
                              ? selectedServicio.imagen
                              : `http://localhost:8000${selectedServicio.imagen}`}
                            alt={selectedServicio.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-orange-100 font-black text-xl italic opacity-40 select-none">
                            OPERATIONS UNIT
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-600/5 to-transparent h-6 animate-pulse-slow"></div>
                      </div>
                    </div>

                    {/* Info Panel */}
                    <div className="flex-1 flex flex-col">
                      <div className="space-y-5 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Protocolo: Activo</span>
                        </div>

                        <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight italic">
                          {selectedServicio.nombre}
                        </h2>

                        <p className="text-gray-600 leading-relaxed">
                          {selectedServicio.descripcion}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {[
                            { icon: <Activity className="w-4 h-4" />, label: 'Estado', value: 'Precisión Máx.' },
                            { icon: <Shield className="w-4 h-4" />, label: 'Seguridad', value: 'Garantizada' },
                            { icon: <Clock className="w-4 h-4" />, label: 'Atención', value: 'Express' },
                            { icon: <Settings className="w-4 h-4" />, label: 'Técnica', value: 'Actualizada' },
                          ].map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-start"
                            >
                              <div className="text-orange-600 mb-1.5">{item.icon}</div>
                              <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{item.label}</div>
                              <div className="font-bold text-[10px] text-gray-800 uppercase mt-0.5">{item.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Costo Sugerido</div>
                          <div className="text-2xl md:text-3xl font-black text-orange-600 italic">
                            S/ {parseFloat(selectedServicio.precio).toFixed(0)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleSolicitar(selectedServicio)}
                          className="w-full md:w-auto px-6 py-3 bg-orange-600 text-white font-black text-xs md:text-sm uppercase tracking-widest rounded-lg hover:bg-orange-700 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          GENERAR TICKET <FiArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* Marquee */}
      <section className="bg-gray-100 py-6 md:py-8 border-y border-gray-200 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee-loop">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center mx-8 text-gray-400 text-sm md:text-base font-black italic">
              <span className="text-orange-600">[</span> HIGH_LEVEL_SUPPORT / CERTIFIED_ENGINEERS / NEXT_GEN_DIAGNOSTICS <span className="text-orange-600">]</span>
              <span className="mx-6 text-gray-300">|</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="bg-orange-600 rounded-2xl p-6 md:p-10 relative overflow-hidden">
            <div className="text-center text-white">
              <div className="w-8 h-0.5 bg-white mx-auto mb-4"></div>
              <h2 className="text-lg md:text-xl font-black italic mb-3">
                ¿Dificultades en el <span className="text-gray-900">Sistema</span>?
              </h2>
              <p className="text-orange-100 max-w-2xl mx-auto text-sm md:text-base opacity-90 mb-6">
                Iniciamos protocolos de reparación para infraestructuras tecnológicas críticas y dispositivos personales.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button className="bg-white text-orange-600 px-5 py-3 rounded-lg font-black text-xs md:text-sm uppercase tracking-widest hover:bg-gray-100 transition-all shadow-md flex items-center justify-center gap-2">
                  <MessageCircle size={14} /> CHATEAR SOPORTE
                </button>
                <button className="bg-white/10 border border-white/20 text-white px-5 py-3 rounded-lg font-black text-xs md:text-sm uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                  <MapPin size={14} /> UBICACIÓN
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 md:mt-10 flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center">
                <Lock className="w-3 h-3 text-gray-500" />
              </div>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Entorno Protegido · RedHard</span>
            </div>
            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
              © {new Date().getFullYear()} Lab_Support_Division
            </div>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes marquee-loop {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-loop {
            animation: marquee-loop 25s linear infinite;
          }
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.6; }
          }
          .animate-pulse-slow {
            animation: pulse-slow 3s ease-in-out infinite;
          }
          /* Scroll personalizado */
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #f97316 transparent;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #f97316;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #ea580c;
          }
          /* Input: borde grueso al hacer click (focus), sin delay — como tú prefieres */
          input:focus, textarea:focus {
            border-width: 2px !important;
            transition: border-color 0.15s ease-in-out;
          }
        `
      }} />
    </div>
  );
};

export default Servicios;