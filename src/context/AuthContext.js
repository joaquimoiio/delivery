// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/AuthService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = AuthService.getToken();
        const userType = AuthService.getUserType();
        
        if (token && userType) {
          // Verificar se o token ainda é válido
          const isValidToken = await AuthService.validateToken();
          
          if (isValidToken) {
            // Tentar obter dados do perfil
            const profileData = await AuthService.getProfile();
            
            if (profileData) {
              setIsLoggedIn(true);
              setUser({
                ...profileData,
                type: userType
              });
            } else {
              // Usar dados básicos se não conseguir obter perfil
              const savedUserData = localStorage.getItem('userData');
              if (savedUserData) {
                setIsLoggedIn(true);
                setUser({
                  ...JSON.parse(savedUserData),
                  type: userType
                });
              } else {
                // Token válido mas sem dados - fazer logout
                AuthService.logout();
              }
            }
          } else {
            // Token inválido - fazer logout
            AuthService.logout();
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (userData, token = null) => {
    try {
      // Se um token foi fornecido, usar ele
      if (token) {
        localStorage.setItem('authToken', token);
      }

      // Salvar dados do usuário
      const userDataToSave = {
        name: userData.name || userData.nmUsuario || userData.email?.split('@')[0] || 'Usuário',
        email: userData.email || userData.dsEmail,
        phone: userData.phone || userData.dsTelefone,
        avatar: userData.avatar || userData.dsAvatar,
        type: userData.type || AuthService.getUserType() || 'cliente',
        ...userData
      };

      setIsLoggedIn(true);
      setUser(userDataToSave);
      
      localStorage.setItem('userData', JSON.stringify(userDataToSave));

      return true;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    AuthService.logout();
  };

  const updateUserProfile = async (profileData) => {
    try {
      const result = await AuthService.updateProfile(profileData);
      
      if (result.success) {
        const updatedUser = {
          ...user,
          ...profileData,
          ...result.data
        };
        
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, message: 'Erro ao atualizar perfil' };
    }
  };

  // Verificar se é um tipo específico de usuário
  const isCliente = () => user?.type === 'cliente';
  const isFornecedor = () => user?.type === 'fornecedor';
  const isEntregador = () => user?.type === 'entregador';

  // Obter dados do usuário logado de forma mais robusta
  const getUserData = () => {
    if (!user) return null;
    
    return {
      id: user.id,
      name: user.name || user.nmUsuario || 'Usuário',
      email: user.email || user.dsEmail,
      phone: user.phone || user.dsTelefone,
      avatar: user.avatar || user.dsAvatar,
      type: user.type,
      ...user
    };
  };

  // Reautenticar após expiração do token
  const reAuthenticate = async () => {
    setIsLoading(true);
    const userData = localStorage.getItem('userData');
    
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        // Aqui você poderia implementar um refresh token se necessário
        // Por enquanto, apenas limpar os dados e pedir para fazer login novamente
        logout();
      } catch (error) {
        logout();
      }
    } else {
      logout();
    }
    
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        color: 'white',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #555',
          borderTop: '4px solid #ff4444',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div>Verificando autenticação...</div>
        
        {/* Movido o CSS para um estilo inline */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
      </div>
    );
  }

  const contextValue = {
    // Estados
    isLoggedIn,
    user: getUserData(),
    isLoading,

    // Ações principais
    login,
    logout,
    updateUserProfile,
    reAuthenticate,

    // Verificações de tipo
    isCliente,
    isFornecedor,
    isEntregador,

    // Utilitários
    getToken: AuthService.getToken,
    getUserType: AuthService.getUserType,
    isAuthenticated: AuthService.isAuthenticated
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};