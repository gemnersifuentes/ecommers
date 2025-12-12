import React, { createContext, useContext, useState } from 'react';
import { FullScreenLoader } from '../components/FullScreenLoader';

const LoaderContext = createContext();

export const useLoader = () => {
    const context = useContext(LoaderContext);
    if (!context) {
        throw new Error('useLoader debe ser usado dentro de LoaderProvider');
    }
    return context;
};

export const LoaderProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    const showLoader = () => setIsLoading(true);
    const hideLoader = () => setIsLoading(false);

    return (
        <LoaderContext.Provider value={{ isLoading, showLoader, hideLoader }}>
            {children}
            {isLoading && <FullScreenLoader />}
        </LoaderContext.Provider>
    );
};
