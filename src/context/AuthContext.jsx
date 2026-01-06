import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Cargar datos de localStorage al iniciar
    const usuarioGuardado = localStorage.getItem('usuario');
    const tokenGuardado = localStorage.getItem('token');

    if (usuarioGuardado && tokenGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (e) {
        console.error('Error parsing usuario:', e);
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
      }
    }

    setLoading(false);
    setInitialized(true);
  }, []);

  const login = async (correo, clave) => {
    const response = await authService.login(correo, clave);
    if (response.success) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('usuario', JSON.stringify(response.usuario));
      setUsuario(response.usuario);
      return response;
    }
    throw new Error(response.message);
  };

  const googleLogin = async (credential) => {
    const response = await authService.googleLogin(credential);
    if (response.success) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('usuario', JSON.stringify(response.usuario));
      setUsuario(response.usuario);
      return response;
    }
    throw new Error(response.message);
  };

  const register = async (nombre, correo, clave) => {
    const response = await authService.register(nombre, correo, clave);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
    // Eliminar token de localStorage al cerrar sesión
    localStorage.removeItem('token');
  };

  const value = {
    usuario,
    login,
    googleLogin,
    register,
    logout,
    isAuthenticated: !!usuario,
    isAdmin: usuario?.rol === 'admin',
    isEmpleado: usuario?.rol === 'empleado',
    loading,
    initialized
  };

  if (loading) {
    return <div>Cargando autenticación...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
