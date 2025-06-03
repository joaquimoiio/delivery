// src/services/BuscaService.js
import { api } from '../config/api';
import API_CONFIG from '../config/api';

class BuscaService {
  // Método auxiliar para adicionar informações da loja aos produtos
  async adicionarInformacoesLoja(response) {
    if (response?.content) {
      const produtosComLoja = await Promise.all(
        response.content.map(async (produto) => {
          try {
            const lojaInfo = await this.buscarEmpresa(produto.empresaId);
            return {
              ...produto,
              loja: lojaInfo
            };
          } catch (err) {
            console.error(`Erro ao buscar loja do produto ${produto.id}:`, err);
            return produto;
          }
        })
      );
      return {
        ...response,
        content: produtosComLoja
      };
    }
    return response;
  }

  // Listar produtos de uma empresa
  async listarProdutosDaEmpresa(empresaId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.BUSCA.EMPRESA_PRODUTOS.replace('{empresaId}', empresaId);
      const response = await api.get(endpoint);
      return this.adicionarInformacoesLoja(response);
    } catch (error) {
      console.error('Erro ao listar produtos da empresa:', error);
      throw error;
    }
  }

  // Listar todos os produtos com paginação
  async listarProdutos(opcoes = {}) {
    const { page = 0, size = 20 } = opcoes;
    const params = { page: page.toString(), size: size.toString() };

    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.BUSCA.PRODUTOS, params);
      return this.adicionarInformacoesLoja(response);
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      throw error;
    }
  }

  // Buscar produtos por termo e filtros opcionais
  async buscarProdutos(termo, opcoes = {}) {
    const {
      page = 0,
      size = 20,
      categoriaId = null,
      latitude = null,
      longitude = null,
      raioKm = null
    } = opcoes;

    const params = {
      termo,
      page: page.toString(),
      size: size.toString()
    };

    if (categoriaId) params.categoriaId = categoriaId.toString();
    if (latitude) params.latitude = latitude.toString();
    if (longitude) params.longitude = longitude.toString();
    if (raioKm) params.raioKm = raioKm.toString();

    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.BUSCA.PRODUTOS_TERMO, params);
      return this.adicionarInformacoesLoja(response);
    } catch (error) {
      console.error('Erro na busca de produtos:', error);
      throw error;
    }
  }

  // Buscar produtos por categoria (slug ou ID)
  async buscarProdutosPorCategoria(categoriaSlugOuId, opcoes = {}) {
    const { page = 0, size = 20, latitude = null, longitude = null, raioKm = null } = opcoes;
    const params = { 
      page: page.toString(), 
      size: size.toString()
    };

    if (latitude) params.latitude = latitude.toString();
    if (longitude) params.longitude = longitude.toString();
    if (raioKm) params.raioKm = raioKm.toString();

    try {
      // Mapear slug para ID se necessário
      const categoryMapping = {
        'hamburgueria': 1,
        'comida-japonesa': 2,
        'pizzaria': 3,
        'acai': 4,
        'bebidas': 5
      };

      const categoriaId = categoryMapping[categoriaSlugOuId] || categoriaSlugOuId;

      const response = await api.get(
        API_CONFIG.ENDPOINTS.PUBLICO.CATEGORIA_PRODUTOS.replace('{id}', categoriaId),
        params
      );
      
      return this.adicionarInformacoesLoja(response);
    } catch (error) {
      console.error('Erro na busca de produtos por categoria:', error);
      throw error;
    }
  }

  // Buscar empresa específica
  async buscarEmpresa(id) {
    try {
      return await api.get(`${API_CONFIG.ENDPOINTS.BUSCA.EMPRESA_DETALHES}/${id}`);
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      throw error;
    }
  }
}

export default new BuscaService();
