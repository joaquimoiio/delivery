// src/services/CategoriaService.js - SERVIÇO PARA GERENCIAR CATEGORIAS
import { api } from '../config/api';
import API_CONFIG from '../config/api';

class CategoriaService {
  
  // Listar todas as categorias
  async listarCategorias() {
    try {
      return await api.get(API_CONFIG.ENDPOINTS.PUBLICO.CATEGORIAS);
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      throw error;
    }
  }

  // Buscar categoria por ID
  async buscarCategoriaPorId(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.PUBLICO.CATEGORIA_POR_ID.replace('{id}', id);
      return await api.get(endpoint);
    } catch (error) {
      console.error('Erro ao buscar categoria por ID:', error);
      throw error;
    }
  }

  // Buscar categoria por slug
  async buscarCategoriaPorSlug(slug) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.PUBLICO.CATEGORIA_POR_SLUG.replace('{slug}', slug);
      return await api.get(endpoint);
    } catch (error) {
      console.error('Erro ao buscar categoria por slug:', error);
      throw error;
    }
  }

  // Listar empresas de uma categoria
  async listarEmpresasPorCategoria(categoriaId, page = 0, size = 20) {
    try {
      const params = { page, size };
      const endpoint = API_CONFIG.ENDPOINTS.PUBLICO.CATEGORIA_EMPRESAS.replace('{id}', categoriaId);
      return await api.get(endpoint, params);
    } catch (error) {
      console.error('Erro ao listar empresas por categoria:', error);
      throw error;
    }
  }

  // Listar produtos de uma categoria
  async listarProdutosPorCategoria(categorySlug, page = 0, size = 20) {
    try {
      // Primeiro, buscar o ID da categoria usando o slug
      const categoria = await this.buscarCategoriaPorSlug(categorySlug);
      if (!categoria) {
        throw new Error('Categoria não encontrada');
      }
      
      // Depois, buscar os produtos usando o ID da categoria
      const params = { page, size };
      const endpoint = API_CONFIG.ENDPOINTS.PUBLICO.CATEGORIA_PRODUTOS.replace('{id}', categoria.id);
      const response = await api.get(endpoint, params);
      return response.content || [];
    } catch (error) {
      console.error('Erro ao listar produtos por categoria:', error);
      throw error;
    }
  }

  // Obter estatísticas de uma categoria
  async obterEstatisticasCategoria(categoriaId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.PUBLICO.CATEGORIA_ESTATISTICAS.replace('{id}', categoriaId);
      return await api.get(endpoint);
    } catch (error) {
      console.error('Erro ao obter estatísticas da categoria:', error);
      throw error;
    }
  }

  // Listar categorias populares
  async listarCategoriasPopulares(limite = 10) {
    try {
      const params = { limite };
      return await api.get(API_CONFIG.ENDPOINTS.PUBLICO.CATEGORIAS_POPULARES, params);
    } catch (error) {
      console.error('Erro ao listar categorias populares:', error);
      throw error;
    }
  }

  // Listar categorias que têm empresas
  async listarCategoriasComEmpresas() {
    try {
      return await api.get(API_CONFIG.ENDPOINTS.PUBLICO.CATEGORIAS_COM_EMPRESAS);
    } catch (error) {
      console.error('Erro ao listar categorias com empresas:', error);
      throw error;
    }
  }

  // Buscar categorias por termo
  async buscarCategorias(termo) {
    try {
      const params = { termo };
      return await api.get(API_CONFIG.ENDPOINTS.PUBLICO.CATEGORIAS_BUSCAR, params);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  }

  // ==================== MÉTODOS UTILITÁRIOS ====================
  
  // Obter ícone da categoria
  obterIconeCategoria(categoria) {
    return '🍽️';
  }

  // Obter cor da categoria
  obterCorCategoria(categoria) {
    return '#95A5A6';
  }

  // Formatar nome da categoria
  formatarNomeCategoria(nome) {
    if (!nome) return '';
    
    return nome
      .split('-')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  }

  // Gerar slug da categoria
  gerarSlug(nome) {
    if (!nome) return '';
    
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim();
  }

  // Validar dados da categoria
  validarCategoria(categoriaData) {
    const erros = [];

    if (!categoriaData.nome || categoriaData.nome.trim().length === 0) {
      erros.push('Nome da categoria é obrigatório');
    }

    if (categoriaData.nome && categoriaData.nome.length > 50) {
      erros.push('Nome da categoria deve ter no máximo 50 caracteres');
    }

    if (categoriaData.descricao && categoriaData.descricao.length > 200) {
      erros.push('Descrição deve ter no máximo 200 caracteres');
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }

  // Ordenar categorias
  ordenarCategorias(categorias, criterio = 'nome') {
    if (!categorias || categorias.length === 0) return [];
    
    const categoriasOrdenadas = [...categorias];
    
    switch (criterio) {
      case 'nome':
        return categoriasOrdenadas.sort((a, b) => 
          a.nome.localeCompare(b.nome, 'pt-BR')
        );
      
      case 'popularidade':
        return categoriasOrdenadas.sort((a, b) => 
          (b.totalEmpresas || 0) - (a.totalEmpresas || 0)
        );
      
      case 'alfabetica':
        return categoriasOrdenadas.sort((a, b) => 
          a.nome.localeCompare(b.nome, 'pt-BR')
        );
      
      default:
        return categoriasOrdenadas;
    }
  }

  // Filtrar categorias
  filtrarCategorias(categorias, filtros = {}) {
    if (!categorias || categorias.length === 0) return [];
    
    let categoriasFiltradas = [...categorias];
    
    // Filtrar por termo de busca
    if (filtros.termo) {
      const termo = filtros.termo.toLowerCase();
      categoriasFiltradas = categoriasFiltradas.filter(categoria =>
        categoria.nome.toLowerCase().includes(termo) ||
        categoria.descricao?.toLowerCase().includes(termo)
      );
    }
    
    // Filtrar apenas categorias com empresas
    if (filtros.apenasComEmpresas) {
      categoriasFiltradas = categoriasFiltradas.filter(categoria =>
        categoria.totalEmpresas > 0
      );
    }
    
    // Filtrar por número mínimo de empresas
    if (filtros.minimoEmpresas) {
      categoriasFiltradas = categoriasFiltradas.filter(categoria =>
        (categoria.totalEmpresas || 0) >= filtros.minimoEmpresas
      );
    }
    
    return categoriasFiltradas;
  }

  // Obter categorias em destaque
  obterCategoriasDestaque(categorias, limite = 6) {
    if (!categorias || categorias.length === 0) return [];
    
    return this.ordenarCategorias(categorias, 'popularidade')
      .slice(0, limite);
  }
}

export default new CategoriaService();
