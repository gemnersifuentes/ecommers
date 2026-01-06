import { createContext, useContext, useState, useEffect } from 'react';
import { ajustesService } from '../services';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        nombre_empresa: 'RedHard',
        ruc: '',
        telefono: '',
        correo_contacto: '',
        direccion: '',
        mision: '',
        vision: '',
        redes_sociales: {
            facebook: '',
            instagram: '',
            whatsapp: ''
        },
        logo_url: '',
        favicon_url: '',
        color_primario: '#f97316',
        color_secundario: '#1e293b',
        google_client_id: '892467941848-u323sdjer75uhgc7cufdj3ae8k08unrn.apps.googleusercontent.com'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await ajustesService.get();
                if (data && !data.error) {
                    setSettings({
                        ...data,
                        redes_sociales: data.redes_sociales || { facebook: '', instagram: '', whatsapp: '' }
                    });
                }
            } catch (error) {
                console.error('Error fetching global settings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
