// src/services/ProdutoService.js - SERVIÇO PARA GERENCIAR PRODUTOS DA EMPRESA
import { api } from '../config/api';
import API_CONFIG from '../config/api';

class ProdutoService {
  
  // Listar todos os produtos da empresa (incluindo inativos)
  async listarProdutos() {
    try {
      // Adiciona parâmetro para incluir produtos inativos
      const params = { incluirInativos: true };
      const response = await api.get(API_CONFIG.ENDPOINTS.EMPRESA.PRODUTOS, params);
      console.log('Produtos carregados:', response); // Debug para verificar se produtos inativos estão sendo retornados
      return response;
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      throw error;
    }
  }

  // Listar produtos com paginação
  async listarProdutosPaginado(page = 0, size = 20) {
    try {
      const params = { page, size };
      return await api.get(API_CONFIG.ENDPOINTS.EMPRESA.PRODUTOS_PAGINADO, params);
    } catch (error) {
      console.error('Erro ao listar produtos paginado:', error);
      throw error;
    }
  }

  // Buscar produto por ID
  async buscarProdutoPorId(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EMPRESA.PRODUTO_POR_ID.replace('{id}', id);
      return await api.get(endpoint);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  }

  // Criar novo produto
  async criarProduto(produtoData) {
    try {
      return await api.post(API_CONFIG.ENDPOINTS.EMPRESA.PRODUTOS, produtoData);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  }

  // Atualizar produto
  async atualizarProduto(id, produtoData) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EMPRESA.PRODUTO_POR_ID.replace('{id}', id);
      return await api.put(endpoint, produtoData);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  }

  // Deletar produto
  async deletarProduto(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EMPRESA.PRODUTO_POR_ID.replace('{id}', id);
      return await api.delete(endpoint);
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  }

  // Ativar produto
  async ativarProduto(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EMPRESA.PRODUTO_ATIVAR.replace('{id}', id);
      return await api.patch(endpoint);
    } catch (error) {
      console.error('Erro ao ativar produto:', error);
      throw error;
    }
  }

  // Desativar produto
  async desativarProduto(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EMPRESA.PRODUTO_DESATIVAR.replace('{id}', id);
      return await api.patch(endpoint);
    } catch (error) {
      console.error('Erro ao desativar produto:', error);
      throw error;
    }
  }

  // Obter estatísticas dos produtos
  async obterEstatisticasProdutos() {
    try {
      return await api.get(API_CONFIG.ENDPOINTS.EMPRESA.PRODUTOS_ESTATISTICAS);
    } catch (error) {
      console.error('Erro ao obter estatísticas dos produtos:', error);
      throw error;
    }
  }

  // Alternar status do produto (ativar/desativar)
  async alternarStatusProduto(id, ativo) {
    try {
      if (ativo) {
        return await this.ativarProduto(id);
      } else {
        return await this.desativarProduto(id);
      }
    } catch (error) {
      console.error('Erro ao alternar status do produto:', error);
      throw error;
    }
  }

  // Validar dados do produto antes de enviar
  validarProduto(produtoData) {
    const erros = [];

    if (!produtoData.nome || produtoData.nome.trim().length === 0) {
      erros.push('Nome do produto é obrigatório');
    }

    if (!produtoData.preco || produtoData.preco <= 0) {
      erros.push('Preço deve ser maior que zero');
    }

    if (!produtoData.categoriaId) {
      erros.push('Categoria é obrigatória');
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }

  // Formatar dados do produto para envio
  formatarProdutoParaEnvio(produtoData) {
    return {
      nome: produtoData.nome?.trim(),
      descricao: produtoData.descricao?.trim() || '',
      preco: parseFloat(produtoData.preco) || 0,
      categoriaId: parseInt(produtoData.categoriaId) || null,
      ativo: produtoData.ativo !== undefined ? produtoData.ativo : true,
      imagem: produtoData.imagem || null,
      ingredientes: produtoData.ingredientes || [],
      tempoPreparoMinutos: parseInt(produtoData.tempoPreparoMinutos) || 0
    };
  }

  // Utilitários para formatação
  formatarPreco(preco) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco || 0);
  }

  obterStatusProduto(produto) {
    if (!produto.ativo) return 'Inativo';
    return 'Disponível';
  }

  obterCorStatus(produto) {
    if (!produto.ativo) return '#dc3545'; // Vermelho
    return '#28a745'; // Verde
  }
}

export default new ProdutoService();
