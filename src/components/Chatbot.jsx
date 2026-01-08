import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Sparkles, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tiendaService, serviciosService } from '../services';
import { aiBrain } from '../utils/aiBrain';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "¡Hola! Soy ShopGenie 🧞‍♂️. ¿Buscas un regalo, una oferta o necesitas **Soporte Técnico**? ¡Estoy aquí para ayudarte!",
            isBot: true
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);
    const messagesEndRef = useRef(null);

    // Cargar productos y servicios al iniciar para tener "conocimiento"
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, servicesData] = await Promise.all([
                    tiendaService.getProductos(),
                    serviciosService.getAll()
                ]);

                setProducts(Array.isArray(productsData) ? productsData : (productsData.data || []));
                setServices(Array.isArray(servicesData) ? servicesData : (servicesData.data || []));
            } catch (error) {
                console.error("Error cargando datos para el bot:", error);
            }
        };
        fetchData();
    }, []);

    // Auto-scroll al final del chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen, isTyping]);



    // ... (inside component)

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userText = inputValue.trim();

        // Agregar mensaje del usuario
        const newMessage = {
            id: Date.now(),
            text: userText,
            isBot: false
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue("");
        setIsTyping(true);

        // "Pensamiento" de la IA (Algoritmo de búsqueda + NLP Template)
        setTimeout(async () => {
            try {
                const response = await aiBrain.processQuery(userText, products || [], services || [], messages);
                setMessages(prev => [...prev, response]);
            } catch (error) {
                console.error("AI Brain Error:", error);
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: "⚠️ **Error Fatal**: Lo siento, mi cerebro se ha desconectado momentáneamente. Por favor intenta de nuevo.",
                    isBot: true
                }]);
            } finally {
                setIsTyping(false);
            }
        }, 1200);
    };

    // Helper para formatear texto con negritas y listas (Simulación de Markdown)
    const renderFormattedText = (text) => {
        if (!text) return null;

        // Dividir por saltos de línea para manejar párrafos
        return text.split('\n').map((line, i) => {
            // Manejar listas
            if (line.trim().startsWith('* ')) {
                return (
                    <li key={i} className="ml-4 list-disc marker:text-orange-500 mb-1">
                        {renderBoldText(line.replace('* ', ''))}
                    </li>
                );
            }

            // Párrafos normales
            return (
                <p key={i} className="mb-2 last:mb-0">
                    {renderBoldText(line)}
                </p>
            );
        });
    };

    const renderBoldText = (text) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    // AI Logic is now handled by src/utils/aiBrain.js

    return (
        <>
            {/* Botón flotante siempre visible - Movido arriba en móvil para evitar barra nav */}
            <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
                <div className="pointer-events-auto">
                    <AnimatePresence>
                        {!isOpen && (
                            <motion.button
                                initial={{ scale: 0, rotate: 180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: -180 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsOpen(true)}
                                className="w-14 h-14 bg-[#0ea5e9] text-white rounded-full shadow-lg flex items-center justify-center relative group"
                            >
                                <Bot className="w-8 h-8" />
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] items-center justify-center text-white font-bold">AI</span>
                                </span>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Chatbot Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-[calc(100vw-32px)] md:w-[380px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 font-sans"
                        style={{ maxHeight: 'calc(100vh - 120px)' }}
                    >
                        {/* Header */}
                        <div className="bg-[#0ea5e9] p-4 flex items-center justify-between text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">ShopGenie AI</h3>
                                    <div className="flex items-center gap-1.5 opacity-90">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        <span className="text-xs font-medium">En Línea</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 bg-gray-50 p-4 overflow-y-auto min-h-[300px] max-h-[500px]">
                            <div className="flex flex-col gap-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div className={`max-w-[85%] ${msg.isBot ? 'items-start' : 'items-end'} flex flex-col gap-2`}>
                                            <div
                                                className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.isBot
                                                    ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                                    : 'bg-[#0ea5e9] text-white rounded-tr-none'
                                                    }`}
                                            >
                                                {msg.isBot ? renderFormattedText(msg.text) : msg.text}
                                            </div>

                                            {/* Productos Recomendados */}
                                            {msg.products && msg.products.length > 0 && (
                                                <div className="w-full mt-1 flex flex-col gap-2">
                                                    {msg.products.map(prod => (
                                                        <Link
                                                            key={prod.id}
                                                            to={`/producto/${prod.id}`}
                                                            className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 hover:border-[#0ea5e9] hover:shadow-md transition-all group"
                                                        >
                                                            <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                                                                {prod.imagen ? (
                                                                    <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <ShoppingBag className="w-full h-full p-3 text-gray-300" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight mb-0.5 group-hover:text-[#0ea5e9] transition-colors">
                                                                    {prod.nombre}
                                                                </p>
                                                                <p className="text-sm font-bold text-orange-500">
                                                                    ${(() => {
                                                                        const p = parseFloat(prod.precio);
                                                                        return isNaN(p) ? '0.00' : p.toFixed(2);
                                                                    })()}
                                                                </p>
                                                            </div>
                                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0ea5e9]" />
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                                            <div className="flex gap-1.5">
                                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="bg-white p-3 border-t border-gray-100 shrink-0">
                            <div className="relative flex items-center gap-2">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Pregunta por ofertas..."
                                    className="w-full pl-9 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-[#0ea5e9] text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-[#0ea5e9] transition-colors shadow-sm"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-center mt-2">
                                <p className="text-[10px] text-gray-400">
                                    Busca productos con AI intelligence 🤖
                                </p>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;
