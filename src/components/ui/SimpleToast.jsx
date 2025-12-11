import React, { useEffect, useState } from 'react';
import { FaCheck, FaHeart, FaTimes } from 'react-icons/fa';

const SimpleToast = ({ message, type = 'success', onClose, duration = 2000 }) => {
    const [isVisible, setIsVisible] = useState(false);
    // Use ref to store current onClose to avoid resetting timer on re-renders
    const onCloseRef = React.useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        // Fade in
        const fadeInTimer = setTimeout(() => setIsVisible(true), 10);

        // Start fade out before closing
        const fadeOutTimer = setTimeout(() => {
            setIsVisible(false);
        }, duration - 300);

        // Close after fade out completes
        const closeTimer = setTimeout(() => {
            if (onCloseRef.current) {
                onCloseRef.current();
            }
        }, duration);

        return () => {
            clearTimeout(fadeInTimer);
            clearTimeout(fadeOutTimer);
            clearTimeout(closeTimer);
        };
    }, [duration]); // Removed onClose from dependency to prevent timer reset

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaCheck className="text-white" size={12} />
                    </div>
                );
            case 'favorite':
                return (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaHeart className="text-white" size={12} />
                    </div>
                );
            case 'error':
                return (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaTimes className="text-white" size={16} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`fixed bottom-6 right-6 z-[9999] pointer-events-none transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-gray-900/70 text-white px-4 py-2 rounded-lg shadow-2xl flex items-center gap-3 pointer-events-auto">
                {getIcon()}
                <span className="font-normal text-xs whitespace-nowrap">{message}</span>
            </div>
        </div>
    );
};

export default SimpleToast;
