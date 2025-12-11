import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <div className="fixed inset-0 bg-purple-500 z-[9999] flex items-center justify-center p-4">
      {/* Fondo morado como en la imagen */}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring', damping: 20 }}
        className="relative"
      >
        {/* Laptop 3D estilizada */}
        <div className="w-64 h-48 bg-white rounded-xl shadow-lg flex flex-col items-center pt-4">
          {/* Pantalla */}
          <div className="w-full h-32 bg-gray-900 rounded-t-lg relative overflow-hidden">
            {/* Barra de progreso dentro de la pantalla */}
            <div className="absolute top-2 left-4 right-4 h-2 bg-gray-700 rounded-full">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                animate={{ width: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            {/* Texto "LOADING" */}
            <p className="absolute top-8 left-1/2 transform -translate-x-1/2 text-white font-bold text-xs uppercase tracking-wider">
              LOADING
            </p>
          </div>

          {/* Teclado */}
          <div className="w-full h-8 bg-gray-100 rounded-b-lg mt-2 flex justify-around items-center px-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-2 h-1 bg-gray-400 rounded-sm"></div>
            ))}
          </div>
        </div>

        {/* Campanita amarilla flotando */}
        <motion.div
          className="absolute -top-8 -left-4 w-12 h-12"
          animate={{ y: [-5, 5], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 24 24" fill="yellow" className="w-full h-full">
            <path d="M12 2C9.24 2 7 4.24 7 7c0 1.68 1.08 3.07 2.56 3.59 1.53 0.54 3.31 0.54 4.84 0C15.92 10.07 17 8.68 17 7c0-2.76-2.24-5-5-5zm0 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </motion.div>

        {/* Icono de correo con badge */}
        <motion.div
          className="absolute -top-6 -right-6 w-12 h-12"
          animate={{ y: [0, -5, 0], x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <div className="w-full h-full bg-cyan-300 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="pink" className="w-6 h-6">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 6 8-6v10zm-8-7L4 6h16l-8 6z" />
            </svg>
            <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-500 text-xs text-black rounded-full flex items-center justify-center">
              3
            </div>
          </div>
        </motion.div>

        {/* Teléfono NFC */}
        <motion.div
          className="absolute bottom-0 right-0 w-16 h-28"
          animate={{ rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <div className="w-full h-full bg-gray-800 rounded-xl flex flex-col items-center justify-center">
            <div className="w-12 h-16 bg-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">NFC</span>
            </div>
            {/* Señales de NFC */}
            <div className="flex space-x-1 mt-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1 h-2 bg-cyan-300 rounded-full"
                  style={{ transform: `rotate(${i * 30}deg)` }}
                ></div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Loading;