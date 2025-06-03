// src/services/RelatorioService.js - VERSÃO ATUALIZADA COM BACKEND REFEITO
import { api } from '../config/api';
import API_CONFIG from '../config/api';

class RelatorioService {
  
  // Obter relatório principal da empresa
  async obterRelatorio(mes = null, ano = null) {
    try {
      const currentDate = new Date();
      const mesAtual = mes || currentDate.getMonth() + 1;
      const anoAtual = ano || currentDate.getFullYear();

      const params = {
        mes: mesAtual,
        ano: anoAtual
      };

      const response = await api.get(API_CONFIG.ENDPOINTS.EMPRESA.RELATORIO, params);
      return response;
    } catch (error) {
      console.error('Erro ao obter relatório:', error);
      throw error;
    }
  }

  // Dashboard principal (usando o relatório principal)
  async obterDadosDashboard() {
    try {
      return await this.obterRelatorio();
    } catch (error) {
      console.error('Erro ao obter dados do dashboard:', error);
      throw error;
    }
  }

  // Relatório completo (alias para obterRelatorio)
  async obterRelatorioCompleto(mes = null, ano = null) {
    try {
      return await this.obterRelatorio(mes, ano);
    } catch (error) {
      console.error('Erro ao obter relatório completo:', error);
      throw error;
    }
  }

  // Relatório mensal (usando o relatório principal)
  async obterRelatorioMensal(mes = null, ano = null) {
    try {
      return await this.obterRelatorio(mes, ano);
    } catch (error) {
      console.error('Erro ao obter relatório mensal:', error);
      throw error;
    }
  }

  // Relatório anual (usando o relatório principal)
  async obterRelatorioAnual(ano = null) {
    try {
      return await this.obterRelatorio(null, ano);
    } catch (error) {
      console.error('Erro ao obter relatório anual:', error);
      throw error;
    }
  }

  // Relatório de vendas detalhado (usando o relatório principal)
  async obterRelatorioVendas(mes = null, ano = null) {
    try {
      return await this.obterRelatorio(mes, ano);
    } catch (error) {
      console.error('Erro ao obter relatório de vendas:', error);
      throw error;
    }
  }

  // Listar pedidos da empresa
  async obterPedidos(page = 0, size = 20) {
    try {
      const params = { page, size };
      const response = await api.get(API_CONFIG.ENDPOINTS.EMPRESA.PEDIDOS, params);
      return response;
    } catch (error) {
      console.error('Erro ao obter pedidos:', error);
      throw error;
    }
  }

  // Atualizar status do pedido
  async atualizarStatusPedido(pedidoId, status) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EMPRESA.PEDIDO_STATUS.replace('{id}', pedidoId);
      const params = { status };
      const response = await api.patch(endpoint, {}, params);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      throw error;
    }
  }

  // Feedbacks da empresa
  async obterFeedbacks(page = 0, size = 20) {
    try {
      const params = { page, size };
      const response = await api.get(API_CONFIG.ENDPOINTS.EMPRESA.FEEDBACKS, params);
      return response;
    } catch (error) {
      console.error('Erro ao obter feedbacks:', error);
      throw error;
    }
  }

  // Métodos de compatibilidade com versão anterior
  async obterProdutosMaisVendidos(mes = null, ano = null, limite = 10) {
    try {
      const relatorio = await this.obterRelatorio(mes, ano);
      // Extrair produtos mais vendidos do relatório
      return relatorio.produtosMaisVendidos?.slice(0, limite) || [];
    } catch (error) {
      console.error('Erro ao obter produtos mais vendidos:', error);
      throw error;
    }
  }

  async obterClientesFrequentes(mes = null, ano = null, limite = 10) {
    try {
      const relatorio = await this.obterRelatorio(mes, ano);
      // Extrair clientes frequentes do relatório
      return relatorio.clientesFrequentes?.slice(0, limite) || [];
    } catch (error) {
      console.error('Erro ao obter clientes frequentes:', error);
      throw error;
    }
  }

  async obterRelatorioComparativo(mesAtual = null, anoAtual = null) {
    try {
      const currentDate = new Date();
      const mes = mesAtual || (currentDate.getMonth() + 1);
      const ano = anoAtual || currentDate.getFullYear();

      // Obter relatório atual
      const relatorioAtual = await this.obterRelatorio(mes, ano);
      
      // Obter relatório do mês anterior
      let mesAnterior = mes - 1;
      let anoAnterior = ano;
      if (mesAnterior === 0) {
        mesAnterior = 12;
        anoAnterior = ano - 1;
      }
      
      const relatorioAnterior = await this.obterRelatorio(mesAnterior, anoAnterior);

      // Calcular comparativo
      return {
        atual: relatorioAtual,
        anterior: relatorioAnterior,
        variacao: {
          vendas: this.calcularVariacaoPercentual(
            relatorioAtual.totalVendas || 0,
            relatorioAnterior.totalVendas || 0
          ),
          pedidos: this.calcularVariacaoPercentual(
            relatorioAtual.totalPedidos || 0,
            relatorioAnterior.totalPedidos || 0
          )
        }
      };
    } catch (error) {
      console.error('Erro ao obter relatório comparativo:', error);
      throw error;
    }
  }

  async obterEstatisticasFeedback() {
    try {
      const feedbacks = await this.obterFeedbacks(0, 1000); // Obter todos os feedbacks
      
      if (!feedbacks.content) {
        return {
          mediaAvaliacao: 0,
          totalFeedbacks: 0,
          distribuicaoNotas: {}
        };
      }

      const totalFeedbacks = feedbacks.content.length;
      const somaNotas = feedbacks.content.reduce((soma, feedback) => soma + (feedback.nota || 0), 0);
      const mediaAvaliacao = totalFeedbacks > 0 ? somaNotas / totalFeedbacks : 0;

      // Distribuição das notas
      const distribuicaoNotas = feedbacks.content.reduce((dist, feedback) => {
        const nota = feedback.nota || 0;
        dist[nota] = (dist[nota] || 0) + 1;
        return dist;
      }, {});

      return {
        mediaAvaliacao,
        totalFeedbacks,
        distribuicaoNotas
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de feedback:', error);
      throw error;
    }
  }

  // Exportar relatório em PDF (simulado - backend não tem este endpoint)
  async exportarRelatorioPDF(mes = null, ano = null) {
    try {
      const relatorio = await this.obterRelatorio(mes, ano);
      
      // Simular download de PDF
      const dataStr = JSON.stringify(relatorio, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = window.URL.createObjectURL(dataBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${mes || 'atual'}-${ano || 'atual'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      throw error;
    }
  }

  // Utilitários
  formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  }

  formatarPorcentagem(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format((valor || 0) / 100);
  }

  obterNomeMes(numeroMes) {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[numeroMes - 1];
  }

  calcularVariacaoPercentual(valorAtual, valorAnterior) {
    if (!valorAnterior || valorAnterior === 0) {
      return valorAtual > 0 ? 100 : 0;
    }
    return ((valorAtual - valorAnterior) / valorAnterior) * 100;
  }

  // Método para obter headers de autenticação (mantido para compatibilidade)
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }
}

export default new RelatorioService();
