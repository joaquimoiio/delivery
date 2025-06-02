// src/services/BuscaService.js - VERSÃO INTEGRADA COM BACKEND REAL
import { api } from '../config/api';

class BuscaService {
  
  // Obter token de autenticação
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Busca geral por termo
  async buscarGeral(termo, opcoes = {}) {
    const { 
      latitude = null, 
      longitude = null, 
      raioKm = 10, 
      page = 0, 
      size = 20 
    } = opcoes;

    const params = {
      termo,
      page: page.toString(),
      size: size.toString(),
      raioKm: raioKm.toString()
    };

    if (latitude && longitude) {
      params.latitude = latitude.toString();
      params.longitude = longitude.toString();
    }

    try {
      return await api.get('/api/publico/busca/geral', params);
    } catch (error) {
      console.error('Erro na busca geral:', error);
      throw error;
    }
  }

  // Busca por categoria
  async buscarPorCategoria(categoria, opcoes = {}) {
    const { 
      latitude = null, 
      longitude = null, 
      raioKm = 10, 
      page = 0, 
      size = 20 
    } = opcoes;

    const params = {
      page: page.toString(),
      size: size.toString(),
      raioKm: raioKm.toString()
    };

    if (latitude && longitude) {
      params.latitude = latitude.toString();
      params.longitude = longitude.toString();
    }

    try {
      return await api.get(`/api/publico/busca/categoria/${categoria}`, params);
    } catch (error) {
      console.error('Erro na busca por categoria:', error);
      throw error;
    }
  }

  // Busca com filtros avançados
  async buscarComFiltros(filtros, opcoes = {}) {
    const { page = 0, size = 20 } = opcoes;

    const params = {
      page: page.toString(),
      size: size.toString()
    };

    try {
      return await api.post(`/api/publico/busca/filtros?page=${page}&size=${size}`, filtros);
    } catch (error) {
      console.error('Erro na busca com filtros:', error);
      throw error;
    }
  }

  // Buscar fornecedores próximos
  async buscarProximos(latitude, longitude, opcoes = {}) {
    const { raioKm = 5, limite = 20 } = opcoes;

    const params = {
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      raioKm: raioKm.toString(),
      limite: limite.toString()
    };

    try {
      return await api.get('/api/publico/busca/proximos', params);
    } catch (error) {
      console.error('Erro na busca de próximos:', error);
      throw error;
    }
  }

  // Obter sugestões para autocomplete
  async obterSugestoes(termo, limite = 8) {
    if (!termo || termo.length < 2) {
      return [];
    }

    const params = {
      termo,
      limite: limite.toString()
    };

    try {
      return await api.get('/api/publico/busca/sugestoes', params);
    } catch (error) {
      console.error('Erro ao obter sugestões:', error);
      return [];
    }
  }

  // Listar categorias disponíveis
  async listarCategorias() {
    try {
      return await api.get('/api/publico/categorias');
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      throw error;
    }
  }

  // Buscar empresa específica
  async buscarEmpresa(id) {
    try {
      return await api.get(`/api/publico/busca/empresas/${id}`);
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      throw error;
    }
  }

  // Listar produtos de uma empresa
  async listarProdutosDaEmpresa(empresaId) {
    try {
      return await api.get(`/api/publico/busca/empresas/${empresaId}/produtos`);
    } catch (error) {
      console.error('Erro ao listar produtos da empresa:', error);
      throw error;
    }
  }

  // Converter categoria do front-end para back-end
  converterCategoriaParaBackend(categoria) {
    const mapping = {
      'hamburgueria': 'hamburgueria',
      'comida-japonesa': 'japonesa',
      'pizzaria': 'pizzaria',
      'acai': 'acai',
      'bebidas': 'bebidas'
    };
    
    return mapping[categoria] || categoria;
  }

  // Converter categoria do back-end para front-end
  converterCategoriaParaFrontend(categoria) {
    const mapping = {
      'hamburgueria': 'hamburgueria',
      'japonesa': 'comida-japonesa',
      'pizzaria': 'pizzaria',
      'acai': 'acai',
      'bebidas': 'bebidas'
    };
    
    return mapping[categoria] || categoria;
  }

  // Obter estatísticas da busca
  async obterEstatisticas() {
    try {
      return await api.get('/api/publico/busca/estatisticas');
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }
}

export default new BuscaService();