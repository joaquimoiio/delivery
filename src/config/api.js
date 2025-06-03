// src/config/api.js - VERSÃO ATUALIZADA COM ENDPOINTS DO BACKEND REFEITO
const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
    ENDPOINTS: {
      // Autenticação
      AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register'
      },
      
      // Busca Pública
      BUSCA: {
        EMPRESAS: '/api/publico/busca/empresas',
        EMPRESAS_TERMO: '/api/publico/busca/empresas/termo',
        EMPRESAS_CATEGORIA: '/api/publico/busca/empresas/categoria',
        EMPRESAS_PROXIMAS: '/api/publico/busca/empresas/proximas',
        EMPRESA_DETALHES: '/api/publico/busca/empresas',
        EMPRESA_PRODUTOS: '/api/publico/busca/empresas/{empresaId}/produtos',
        PRODUTOS: '/api/publico/busca/produtos',
        PRODUTOS_TERMO: '/api/publico/busca/produtos/termo',
        PRODUTOS_CATEGORIA: '/api/publico/busca/produtos/categoria'
      },
      
      // Cliente
      CLIENTE: {
        PERFIL: '/api/cliente/perfil',
        PEDIDOS: '/api/cliente/pedidos',
        PEDIDO_POR_ID: '/api/cliente/pedidos/{id}',
        PEDIDOS_POR_STATUS: '/api/cliente/pedidos/status/{status}',
        CANCELAR_PEDIDO: '/api/cliente/pedidos/{id}/cancelar',
        ESTATISTICAS_PEDIDOS: '/api/cliente/pedidos/estatisticas',
        RASTREAR_PEDIDO: '/api/cliente/pedidos/{id}/rastrear',
        PAGAR_PEDIDO: '/api/cliente/pedidos/{id}/pagar',
        FEEDBACKS: '/api/cliente/feedbacks',
        FEEDBACK: '/api/cliente/feedbacks'
      },
      
      // Empresa
      EMPRESA: {
        PERFIL: '/api/empresa/perfil',
        PRODUTOS: '/api/empresa/produtos',
        PRODUTOS_PAGINADO: '/api/empresa/produtos/paginado',
        PRODUTO_POR_ID: '/api/empresa/produtos/{id}',
        PRODUTO_ATIVAR: '/api/empresa/produtos/{id}/ativar',
        PRODUTO_DESATIVAR: '/api/empresa/produtos/{id}/desativar',
        PRODUTOS_ESTATISTICAS: '/api/empresa/produtos/estatisticas',
        PEDIDOS: '/api/empresa/pedidos',
        PEDIDO_STATUS: '/api/empresa/pedidos/{id}/status',
        PEDIDO_ENTREGAR: '/api/empresa/pedidos/{id}/entregar',
        RELATORIO: '/api/empresa/relatorio',
        RELATORIOS: '/api/empresa/relatorios',
        FEEDBACKS: '/api/empresa/feedbacks'
      },
      
      // Público - Categorias
      PUBLICO: {
        CATEGORIAS: '/api/publico/categorias',
        CATEGORIA_POR_ID: '/api/publico/categorias/{id}',
        CATEGORIA_POR_SLUG: '/api/publico/categorias/slug/{slug}',
        CATEGORIA_EMPRESAS: '/api/publico/categorias/{id}/empresas',
        CATEGORIA_PRODUTOS: '/api/publico/categorias/{id}/produtos',
        CATEGORIA_ESTATISTICAS: '/api/publico/categorias/{id}/estatisticas',
        CATEGORIAS_POPULARES: '/api/publico/categorias/populares',
        CATEGORIAS_COM_EMPRESAS: '/api/publico/categorias/com-empresas',
        CATEGORIAS_BUSCAR: '/api/publico/categorias/buscar'
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
    const token = localStorage.getItem('authToken');
    
    if (!token && !endpoint.includes('/api/auth/') && !endpoint.includes('/api/publico/')) {
      throw new Error('Usuário não está autenticado. Faça login novamente.');
    }

    const config = {
      timeout: API_CONFIG.TIMEOUT,
      headers: getAuthHeaders(),
      validateStatus: false, // Permite tratar erros manualmente
      ...options
    };

    try {
      console.log('Enviando requisição para:', url);
      console.log('Configuração:', {
        ...config,
        headers: { ...config.headers, Authorization: '[REDACTED]' }
      });

      const response = await fetch(url, config);
      const responseData = response.status !== 204 ? await response.json().catch(() => ({})) : null;

      console.log('Status da resposta:', response.status);
      console.log('Dados da resposta:', responseData);

      // Tratamento específico de erros
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken'); // Limpa o token inválido
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        
        if (response.status === 403) {
          throw new Error('Acesso negado. Você não tem permissão para realizar esta ação.');
        }
        
        if (response.status === 500) {
          console.error('Erro do servidor:', responseData);
          throw new Error('Erro interno do servidor. Por favor, tente novamente em alguns minutos.');
        }

        throw new Error(responseData.message || `Erro HTTP: ${response.status}`);
      }

      return response.status === 204 ? { success: true } : responseData;

    } catch (error) {
      console.error('Erro detalhado:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        url,
        method: options.method || 'GET'
      });

      // Tratamento de erros de rede
      if (error.name === 'TypeError' || error.name === 'NetworkError') {
        throw new Error('Erro de conexão. Verifique sua internet e se o servidor está rodando.');
      }

      // Tratamento de timeout
      if (error.name === 'AbortError') {
        throw new Error('Tempo limite da requisição esgotado. Tente novamente.');
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