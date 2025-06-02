// src/services/AuthService.js
const API_BASE_URL = 'http://localhost:8082';

class AuthService {
  
  // Cabeçalhos padrão para requisições
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Cabeçalhos com token de autenticação
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // ==================== CLIENTE ====================
  
  async loginCliente(loginData) {
    try {
      console.log('Tentando login do cliente com:', { email: loginData.email });
      
      const requestData = {
        dsEmail: loginData.email,
        dsSenha: loginData.senha
      };
      
      console.log('Dados da requisição:', requestData);
      
      const response = await fetch(`${API_BASE_URL}/cliente/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        let errorMessage = 'Erro ao fazer login';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('Erro da API:', errorData);
        } catch (e) {
          console.error('Erro ao parsear resposta de erro:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Dados de resposta do login:', data);
      
      // Salvar token e dados do usuário
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userType', 'cliente');
      
      return {
        success: true,
        token: data.token,
        userType: 'cliente'
      };
    } catch (error) {
      console.error('Erro no login do cliente:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async cadastrarCliente(clienteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/cliente/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          nmUsuario: clienteData.nomeCompleto,
          dsEmail: clienteData.email,
          dsSenha: clienteData.senha,
          nuCpf: clienteData.cpf.replace(/\D/g, ''),
          dsTelefone: clienteData.telefone ? clienteData.telefone.replace(/\D/g, '') : null,
          dtNascimento: clienteData.dataNascimento || null,
          nuLatitude: clienteData.latitude || null,
          nuLongitude: clienteData.longitude || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar cliente');
      }

      const data = await response.json();
      
      // Salvar token e dados do usuário
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userType', 'cliente');
      
      return {
        success: true,
        token: data.token,
        userType: 'cliente'
      };
    } catch (error) {
      console.error('Erro no cadastro do cliente:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // ==================== FORNECEDOR ====================
  
  async loginFornecedor(loginData) {
    try {
      console.log('Tentando login do fornecedor com:', { email: loginData.email });
      
      const requestData = {
        dsEmail: loginData.email,
        dsSenha: loginData.senha
      };
      
      console.log('Dados da requisição:', requestData);
      
      const response = await fetch(`${API_BASE_URL}/fornecedor/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        let errorMessage = 'Erro ao fazer login';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('Erro da API:', errorData);
        } catch (e) {
          console.error('Erro ao parsear resposta de erro:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Dados de resposta do login:', data);
      
      // Salvar token e dados do usuário
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userType', 'fornecedor');
      
      return {
        success: true,
        token: data.token,
        userType: 'fornecedor'
      };
    } catch (error) {
      console.error('Erro no login do fornecedor:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async cadastrarFornecedor(fornecedorData) {
    try {
      const response = await fetch(`${API_BASE_URL}/fornecedor/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          nmUsuario: fornecedorData.nomeLoja,
          dsEmail: fornecedorData.email,
          dsSenha: fornecedorData.senha,
          nuCnpj: fornecedorData.cnpj.replace(/\D/g, ''),
          dsTelefone: fornecedorData.telefone ? fornecedorData.telefone.replace(/\D/g, '') : null,
          nuLatitude: fornecedorData.latitude || null,
          nuLongitude: fornecedorData.longitude || null,
          dsAvatar: fornecedorData.avatar || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar fornecedor');
      }

      const data = await response.json();
      
      // Salvar token e dados do usuário
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userType', 'fornecedor');
      
      return {
        success: true,
        token: data.token,
        userType: 'fornecedor'
      };
    } catch (error) {
      console.error('Erro no cadastro do fornecedor:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // ==================== ENTREGADOR ====================
  
  async loginEntregador(loginData) {
    try {
      console.log('Tentando login do entregador com:', { email: loginData.email });
      
      const requestData = {
        dsEmail: loginData.email,
        dsSenha: loginData.senha
      };
      
      console.log('Dados da requisição:', requestData);
      
      const response = await fetch(`${API_BASE_URL}/entregador/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        let errorMessage = 'Erro ao fazer login';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('Erro da API:', errorData);
        } catch (e) {
          console.error('Erro ao parsear resposta de erro:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Dados de resposta do login:', data);
      
      // Salvar token e dados do usuário
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userType', 'entregador');
      
      return {
        success: true,
        token: data.token,
        userType: 'entregador'
      };
    } catch (error) {
      console.error('Erro no login do entregador:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async cadastrarEntregador(entregadorData) {
    try {
      const response = await fetch(`${API_BASE_URL}/entregador/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          nmUsuario: entregadorData.nomeCompleto,
          dsEmail: entregadorData.email,
          dsSenha: entregadorData.senha,
          nuCpf: entregadorData.cpf.replace(/\D/g, ''),
          dsTelefone: entregadorData.telefone ? entregadorData.telefone.replace(/\D/g, '') : null,
          dtNascimento: entregadorData.dataNascimento || null,
          nuLatitude: entregadorData.latitude || null,
          nuLongitude: entregadorData.longitude || null,
          dsNumeroCnh: entregadorData.cnh,
          dsPlacaVeiculo: entregadorData.placa
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar entregador');
      }

      const data = await response.json();
      
      // Salvar token e dados do usuário
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userType', 'entregador');
      
      return {
        success: true,
        token: data.token,
        userType: 'entregador'
      };
    } catch (error) {
      console.error('Erro no cadastro do entregador:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // ==================== MÉTODOS GERAIS ====================
  
  // Login unificado baseado no tipo de usuário
  async login(email, senha, tipoUsuario) {
    const loginData = { email, senha };
    
    switch (tipoUsuario) {
      case 'cliente':
        return await this.loginCliente(loginData);
      case 'empresa':
      case 'fornecedor':
        return await this.loginFornecedor(loginData);
      case 'entregador':
        return await this.loginEntregador(loginData);
      default:
        return {
          success: false,
          message: 'Tipo de usuário inválido'
        };
    }
  }

  // Cadastro unificado baseado no tipo de usuário
  async cadastrar(userData, tipoUsuario) {
    switch (tipoUsuario) {
      case 'cliente':
        return await this.cadastrarCliente(userData);
      case 'empresa':
      case 'fornecedor':
        return await this.cadastrarFornecedor(userData);
      case 'entregador':
        return await this.cadastrarEntregador(userData);
      default:
        return {
          success: false,
          message: 'Tipo de usuário inválido'
        };
    }
  }

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

  // Validar token (verificar se ainda é válido)
  async validateToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Fazer uma requisição simples para verificar se o token é válido
      const response = await fetch(`${API_BASE_URL}/busca/categorias`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return false;
    }
  }

  // Obter dados do perfil do usuário logado
  async getProfile() {
    const token = this.getToken();
    const userType = this.getUserType();
    
    if (!token || !userType) {
      return null;
    }

    try {
      // Endpoint baseado no tipo de usuário
      let endpoint;
      switch (userType) {
        case 'cliente':
          endpoint = '/clientes/perfil';
          break;
        case 'fornecedor':
          endpoint = '/fornecedores/perfil';
          break;
        case 'entregador':
          endpoint = '/entregadores/perfil';
          break;
        default:
          return null;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (response.ok) {
        return await response.json();
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
          endpoint = '/clientes/perfil';
          break;
        case 'fornecedor':
          endpoint = '/fornecedores/perfil';
          break;
        case 'entregador':
          endpoint = '/entregadores/perfil';
          break;
        default:
          return {
            success: false,
            message: 'Tipo de usuário inválido'
          };
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        return {
          success: true,
          data: updatedData
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Erro ao atualizar perfil'
        };
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

export default new AuthService();