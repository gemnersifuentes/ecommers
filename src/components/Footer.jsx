import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { Facebook, Instagram, MessageSquare } from 'lucide-react';

const Footer = () => {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log('Subscribing:', email);
    setEmail('');
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter Section */}
        <div className="mb-12 pb-8 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">¡Suscríbete y gana!</h3>
              <p className="text-sm text-gray-600">Recibe cupones exclusivos y ofertas secretas.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 w-full md:w-64 bg-gray-800 text-white placeholder-gray-400"
                required
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <h3 className="text-2xl font-bold text-orange-500 uppercase">{settings.nombre_empresa}</h3>
            </Link>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {settings.mision ? settings.mision.substring(0, 150) + '...' : 'Tu tienda online favorita para encontrar lo último en tecnología a precios increíbles. Envíos rápidos y garantía segura.'}
            </p>

            {/* Social Media Icons */}
            <div className="flex gap-3">
              {settings.redes_sociales.facebook && (
                <a href={settings.redes_sociales.facebook} className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:text-orange-500 hover:border-orange-500 transition-colors">
                  <Facebook size={18} />
                </a>
              )}
              {settings.redes_sociales.instagram && (
                <a href={settings.redes_sociales.instagram} className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:text-orange-500 hover:border-orange-500 transition-colors">
                  <Instagram size={18} />
                </a>
              )}
              {settings.redes_sociales.whatsapp && (
                <a href={`https://wa.me/${settings.redes_sociales.whatsapp}`} className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:text-orange-500 hover:border-orange-500 transition-colors">
                  <MessageSquare size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Compañía */}
          <div>
            <h4 className="font-bold text-sm text-gray-900 mb-4 uppercase">Compañía</h4>
            <ul className="space-y-2.5">
              {[
                { text: 'Sobre Nosotros', to: '/nosotros' },
                { text: 'Afiliados', to: '#' },
                { text: 'Blog Tech', to: '#' },
                { text: 'Contacto', to: '/contacto' }
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="font-bold text-sm text-gray-900 mb-4 uppercase">Ayuda</h4>
            <ul className="space-y-2.5">
              {[
                { text: 'Centro de Soporte', to: '#' },
                { text: 'Rastrear Pedido', to: '#' },
                { text: 'Devoluciones', to: '#' },
                { text: 'Garantía', to: '#' }
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-sm text-gray-900 mb-4 uppercase">Legal</h4>
            <ul className="space-y-2.5">
              {[
                { text: 'Términos y Condiciones', to: '#' },
                { text: 'Privacidad', to: '#' },
                { text: 'Cookies', to: '#' }
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} {settings.nombre_empresa.toUpperCase()} Inc. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
