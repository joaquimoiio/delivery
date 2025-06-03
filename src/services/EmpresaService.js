// src/services/EmpresaService.js
import { api } from '../config/api';
import API_CONFIG from '../config/api';

class EmpresaService {
  // Buscar detalhes da empresa por ID
  async buscarEmpresaPorId(empresaId) {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.BUSCA.EMPRESA_DETALHES}/${empresaId}`;
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      throw error;
    }
  }

  // Buscar produtos da empresa
  async buscarProdutosEmpresa(empresaId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.BUSCA.EMPRESA_PRODUTOS.replace('{empresaId}', empresaId);
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error('Erro ao buscar produtos da empresa:', error);
      throw error;
    }
  }

  // Formatar preço
  formatarPreco(preco) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  }
}

export default new EmpresaService();
