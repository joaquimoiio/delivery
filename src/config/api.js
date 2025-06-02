// src/config/api.js - VERSÃO CORRIGIDA COM ENDPOINTS DO BACKEND
const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
    ENDPOINTS: {
      // Autenticação
      AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        ME: '/api/auth/user/me',
        VALIDATE: '/api/auth/user/validate-token'
      },
      
      // Busca Pública
      BUSCA: {
        GERAL: '/api/publico/busca/empresas/termo',
        CATEGORIA: '/api/publico/busca/empresas/categoria',
        PROXIMOS: '/api/publico/busca/empresas/proximas',
        SUGESTOES: '/api/publico/busca/empresas/termo',
        CATEGORIAS: '/api/publico/categorias'
      },
      
      // Cliente
      CLIENTE: {
        PERFIL: '/api/cliente/perfil',
        PEDIDOS: '/api/cliente/pedidos',
        FEEDBACK: '/api/cliente/feedbacks'
      },
      
      // Empresa
      EMPRESA: {
        PERFIL: '/api/empresa/perfil',
        PRODUTOS: '/api/empresa/produtos',
        PEDIDOS: '/api/empresa/pedidos',
        RELATORIO: '/api/empresa/relatorios',
        FEEDBACKS: '/api/empresa/feedbacks'
      },
      
      // Público
      PUBLICO: {
        EMPRESAS: '/api/publico/busca/empresas',
        PRODUTOS: '/api/publico/busca/produtos',
        CATEGORIAS: '/api/publico/categorias'
      }
    },
    
    // Configurações de timeout
    TIMEOUT: 30000,
    
    // Headers padrão
    DEFAULT_HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  
  // Utilitário para construir URLs completas
  export const buildUrl = (endpoint) => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  };
  
  // Utilitário para obter headers com autenticação
  export const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };
  
  // Utilitário para fazer requisições com tratamento de erro
  export const apiRequest = async (endpoint, options = {}) => {
    const url = buildUrl(endpoint);
    const config = {
      timeout: API_CONFIG.TIMEOUT,
      headers: getAuthHeaders(),
      ...options
    };
  
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
      }
      
      if (response.status === 204) {
        return { success: true };
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Erro na requisição:', error);
      
      if (error.name === 'TypeError' || error.name === 'NetworkError') {
        throw new Error('Erro de conexão. Verifique sua internet.');
      }
      
      if (error.name === 'AbortError') {
        throw new Error('Tempo limite da requisição esgotado.');
      }
      
      throw error;
    }
  };
  
  // Métodos de conveniência para diferentes tipos de requisição
  export const api = {
    get: (endpoint, params = {}) => {
      const url = new URL(buildUrl(endpoint));
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          url.searchParams.append(key, params[key]);
        }
      });
      
      return apiRequest(url.pathname + url.search, {
        method: 'GET'
      });
    },
    
    post: (endpoint, data = {}) => {
      return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    
    put: (endpoint, data = {}) => {
      return apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    
    patch: (endpoint, data = {}) => {
      return apiRequest(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },
    
    delete: (endpoint) => {
      return apiRequest(endpoint, {
        method: 'DELETE'
      });
    }
  };
  
  export default API_CONFIG;