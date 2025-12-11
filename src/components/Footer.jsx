import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaStore,
  FaCreditCard,
  FaShieldAlt,
  FaTruck,
  FaHeadset
} from 'react-icons/fa';

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Logo y descripción */}
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <motion.div 
                className="bg-gradient-to-br from-blue-500 to-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl"
                whileHover={{ rotate: 12, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FaStore className="text-2xl" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  TiendaTEC
                </h3>
                <p className="text-sm text-gray-400">Tecnología de Calidad</p>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Tu tienda de tecnología de confianza. Los mejores productos al mejor precio con garantía y servicio técnico especializado.
            </p>
            
            {/* Redes sociales */}
            <div className="flex gap-3">
              {[
                { icon: FaFacebookF, color: 'from-blue-600 to-blue-700', href: '#' },
                { icon: FaTwitter, color: 'from-blue-400 to-blue-500', href: '#' },
                { icon: FaInstagram, color: 'from-pink-600 to-purple-600', href: '#' },
                { icon: FaYoutube, color: 'from-red-600 to-red-700', href: '#' }
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center shadow-lg`}
                  whileHover={{ y: -4, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <social.icon className="text-lg" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Compra */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold text-lg mb-6 text-white">Compra</h4>
            <ul className="space-y-3">
              {[
                { text: 'Productos', to: '/productos' },
                { text: 'Servicios', to: '/servicios' },
                { text: 'Ofertas', to: '/productos' },
                { text: 'Destacados', to: '/productos' }
              ].map((link, i) => (
                <li key={i}>
                  <Link 
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <motion.span
                      className="w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-4 transition-all"
                    />
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Ayuda */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold text-lg mb-6 text-white">Ayuda</h4>
            <ul className="space-y-3">
              {[
                'Preguntas frecuentes',
                'Envíos',
                'Devoluciones',
                'Garantía'
              ].map((item, i) => (
                <li key={i}>
                  <a 
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <motion.span
                      className="w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-4 transition-all"
                    />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contacto */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold text-lg mb-6 text-white">Contacto</h4>
            <ul className="space-y-4">
              {[
                { icon: FaPhone, text: '+1 234 567 890', color: 'from-green-500 to-green-600' },
                { icon: FaEnvelope, text: 'info@tiendatec.com', color: 'from-blue-500 to-blue-600' },
                { icon: FaMapMarkerAlt, text: 'Calle Principal #123', color: 'from-red-500 to-red-600' }
              ].map((contact, i) => (
                <li key={i} className="flex items-start gap-3 group">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${contact.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                    <contact.icon className="text-sm" />
                  </div>
                  <span className="text-gray-400 text-sm pt-2">{contact.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Métodos de pago y garantías */}
        <motion.div 
          className="border-t border-gray-700 pt-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: FaCreditCard, text: 'Pago Seguro', color: 'from-blue-500 to-blue-600' },
              { icon: FaShieldAlt, text: 'Compra Protegida', color: 'from-green-500 to-green-600' },
              { icon: FaTruck, text: 'Envío Rápido', color: 'from-purple-500 to-purple-600' },
              { icon: FaHeadset, text: 'Soporte 24/7', color: 'from-orange-500 to-orange-600' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl"
                whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.1)' }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <feature.icon className="text-xl" />
                </div>
                <span className="text-sm font-semibold text-gray-300">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div 
          className="border-t border-gray-700 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; 2024 TiendaTEC. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Términos y Condiciones
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Política de Privacidad
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
