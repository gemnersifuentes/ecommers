
import React from 'react';

export const FullScreenLoader = () => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
            <div className="p-8 flex flex-col items-center gap-4">
                {/* Spinner naranja animado */}
                <div
                    className="animate-spin rounded-full border-4 border-t-transparent border-orange-500"
                    style={{
                        width: '48px',
                        height: '48px'
                    }}
                />
                <p className="text-white font-medium">Cargando...</p>
            </div>
        </div>
    );
};
