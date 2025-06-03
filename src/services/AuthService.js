// src/services/AuthService.js - VERSÃO ATUALIZADA COM BACKEND REFEITO
import { api } from '../config/api';
import API_CONFIG from '../config/api';

class AuthService {
  
  // ==================== MÉTODOS PRINCIPAIS ====================
  
  // Login unificado
  async login(email, senha, tipoUsuario) {
    try {
      console.log('Tentando login com:', { email, tipoUsuario });
      
      const requestData = {
        email: email,
        senha: senha,
        tipoUsuario: tipoUsuario
      };
      
      const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, requestData);
      
      if (response && response.token) {
        // Salvar token e dados do usuário
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userType', response.tipoUsuario || tipoUsuario);
        
        if (response.usuario) {
          localStorage.setItem('userData', JSON.stringify(response.usuario));
        }
        
        return {
          success: true,
          token: response.token,
          userType: response.tipoUsuario || tipoUsuario,
          usuario: response.usuario
        };
      }
      
      throw new Error('Resposta inválida do servidor');
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        message: error.message || 'Erro ao fazer login'
      };
    }
  }

  // Cadastro unificado
  async cadastrar(userData, tipoUsuario) {
    try {
      console.log('Tentando cadastro com:', { tipoUsuario });
      
      // Converter tipo de usuário para o formato esperado pelo backend
      const tipoUsuarioBackend = tipoUsuario === 'cliente' ? 'CLIENTE' : 'EMPRESA';
      
      const requestData = {
        email: userData.email,
        senha: userData.senha,
        tipoUsuario: tipoUsuarioBackend
      };
      
      // Ajustar campos baseado no tipo de usuário
      if (tipoUsuario === 'cliente') {
        requestData.nome = userData.nomeCompleto;
        requestData.cpf = userData.cpf?.replace(/\D/g, '');
        requestData.telefoneCliente = userData.telefone?.replace(/\D/g, '');
        requestData.enderecoCliente = userData.endereco || '';
      } else if (tipoUsuario === 'empresa' || tipoUsuario === 'fornecedor') {
        requestData.nomeFantasia = userData.nomeLoja || userData.nomeEmpresa;
        requestData.cnpj = userData.cnpj?.replace(/\D/g, '');
        requestData.telefoneEmpresa = userData.telefone?.replace(/\D/g, '');
        requestData.enderecoEmpresa = userData.endereco || '';
        requestData.descricao = userData.descricao || '';
        requestData.categoriaId = userData.categoriaId;
      }
      
      const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, requestData);
      
      if (response && response.token) {
        // Salvar token e dados do usuário
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userType', response.tipoUsuario || tipoUsuario);
        
        if (response.usuario) {
          localStorage.setItem('userData', JSON.stringify(response.usuario));
        }
        
        return {
          success: true,
          token: response.token,
          userType: response.tipoUsuario || tipoUsuario,
          usuario: response.usuario
        };
      }
      
      throw new Error('Resposta inválida do servidor');
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return {
        success: false,
        message: error.message || 'Erro ao fazer cadastro'
      };
    }
  }

  // ==================== MÉTODOS DE COMPATIBILIDADE ====================
  
  // Login do cliente (mantido para compatibilidade)
  async loginCliente(loginData) {
    return this.login(loginData.email, loginData.senha, 'cliente');
  }

  // Login do fornecedor (mantido para compatibilidade)
  async loginFornecedor(loginData) {
    return this.login(loginData.email, loginData.senha, 'empresa');
  }

  // Login do entregador (mantido para compatibilidade)
  async loginEntregador(loginData) {
    return this.login(loginData.email, loginData.senha, 'entregador');
  }

  // Cadastro do cliente (mantido para compatibilidade)
  async cadastrarCliente(clienteData) {
    return this.cadastrar(clienteData, 'cliente');
  }

  // Cadastro do fornecedor (mantido para compatibilidade)
  async cadastrarFornecedor(fornecedorData) {
    return this.cadastrar(fornecedorData, 'empresa');
  }

  // Cadastro do entregador (mantido para compatibilidade)
  async cadastrarEntregador(entregadorData) {
    return this.cadastrar(entregadorData, 'entregador');
  }

  // ==================== MÉTODOS GERAIS ====================
  
  // Logout
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
  }

  // Verificar se está logado
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  // Obter tipo de usuário
  getUserType() {
    return localStorage.getItem('userType');
  }

  // Obter token
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Obter dados do usuário
  getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  // Validar token (verificar se ainda é válido)
  async validateToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Usar endpoint de categorias para validar token
      await api.get(API_CONFIG.ENDPOINTS.PUBLICO.CATEGORIAS);
      return true;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      // Se o token for inválido, fazer logout
      if (error.message?.includes('401') || error.message?.includes('403')) {
        this.logout();
      }
      return false;
    }
  }

  // Obter dados do perfil do usuário logado
  async getProfile() {
    const userType = this.getUserType();
    
    if (!userType) {
      return null;
    }

    try {
      let endpoint;
      switch (userType) {
        case 'cliente':
          endpoint = API_CONFIG.ENDPOINTS.CLIENTE.PERFIL;
          break;
        case 'empresa':
        case 'fornecedor':
          endpoint = API_CONFIG.ENDPOINTS.EMPRESA.PERFIL;
          break;
        default:
          return null;
      }

      const response = await api.get(endpoint);
      
      if (response) {
        // Atualizar dados locais
        localStorage.setItem('userData', JSON.stringify(response));
        return response;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      return null;
    }
  }

  // Atualizar dados do perfil
  async updateProfile(profileData) {
    const userType = this.getUserType();
    
    if (!userType) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      };
    }

    try {
      let endpoint;
      switch (userType) {
        case 'cliente':
          endpoint = API_CONFIG.ENDPOINTS.CLIENTE.PERFIL;
          break;
        case 'empresa':
        case 'fornecedor':
          endpoint = API_CONFIG.ENDPOINTS.EMPRESA.PERFIL;
          break;
        default:
          return {
            success: false,
            message: 'Tipo de usuário inválido'
          };
      }

      const response = await api.put(endpoint, profileData);

      if (response) {
        // Atualizar dados locais
        localStorage.setItem('userData', JSON.stringify(response));
        return {
          success: true,
          data: response
        };
      }

      return {
        success: false,
        message: 'Erro ao atualizar perfil'
      };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return {
        success: false,
        message: error.message || 'Erro ao atualizar perfil'
      };
    }
  }

  // Cabeçalhos padrão para requisições (mantido para compatibilidade)
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Cabeçalhos com token de autenticação (mantido para compatibilidade)
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }
}

export default new AuthService();
