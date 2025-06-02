// src/services/RelatorioService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class RelatorioService {
  
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Dashboard principal
  async obterDadosDashboard() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/empresa/relatorios/dashboard`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do dashboard');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter dados do dashboard:', error);
      throw error;
    }
  }

  // Relatório mensal
  async obterRelatorioMensal(mes = null, ano = null) {
    try {
      const currentDate = new Date();
      const mesAtual = mes || (currentDate.getMonth() + 1);
      const anoAtual = ano || currentDate.getFullYear();

      const response = await fetch(
        `${API_BASE_URL}/api/empresa/relatorios/mensal?mes=${mesAtual}&ano=${anoAtual}`, 
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar relatório mensal');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter relatório mensal:', error);
      throw error;
    }
  }

  // Relatório anual
  async obterRelatorioAnual(ano = null) {
    try {
      const anoAtual = ano || new Date().getFullYear();

      const response = await fetch(
        `${API_BASE_URL}/api/empresa/relatorios/anual?ano=${anoAtual}`, 
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar relatório anual');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter relatório anual:', error);
      throw error;
    }
  }

  // Relatório de vendas detalhado
  async obterRelatorioVendas(mes = null, ano = null) {
    try {
      const currentDate = new Date();
      const mesAtual = mes || (currentDate.getMonth() + 1);
      const anoAtual = ano || currentDate.getFullYear();

      const response = await fetch(
        `${API_BASE_URL}/api/empresa/relatorios/vendas?mes=${mesAtual}&ano=${anoAtual}`, 
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar relatório de vendas');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter relatório de vendas:', error);
      throw error;
    }
  }

  // Produtos mais vendidos
  async obterProdutosMaisVendidos(mes = null, ano = null, limite = 10) {
    try {
      const currentDate = new Date();
      const mesAtual = mes || (currentDate.getMonth() + 1);
      const anoAtual = ano || currentDate.getFullYear();

      const response = await fetch(
        `${API_BASE_URL}/api/empresa/relatorios/produtos-mais-vendidos?mes=${mesAtual}&ano=${anoAtual}&limite=${limite}`, 
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar produtos mais vendidos');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter produtos mais vendidos:', error);
      throw error;
    }
  }

  // Clientes frequentes
  async obterClientesFrequentes(mes = null, ano = null, limite = 10) {
    try {
      const currentDate = new Date();
      const mesAtual = mes || (currentDate.getMonth() + 1);
      const anoAtual = ano || currentDate.getFullYear();

      const response = await fetch(
        `${API_BASE_URL}/api/empresa/relatorios/clientes-frequentes?mes=${mesAtual}&ano=${anoAtual}&limite=${limite}`, 
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar clientes frequentes');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter clientes frequentes:', error);
      throw error;
    }
  }

  // Relatório comparativo
  async obterRelatorioComparativo(mesAtual = null, anoAtual = null) {
    try {
      const currentDate = new Date();
      const mes = mesAtual || (currentDate.getMonth() + 1);
      const ano = anoAtual || currentDate.getFullYear();

      const response = await fetch(
        `${API_BASE_URL}/api/empresa/relatorios/comparativo?mesAtual=${mes}&anoAtual=${ano}`, 
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar relatório comparativo');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter relatório comparativo:', error);
      throw error;
    }
  }

  // Feedbacks da empresa
  async obterFeedbacks(page = 0, size = 20) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/empresa/feedbacks?page=${page}&size=${size}`, 
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar feedbacks');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter feedbacks:', error);
      throw error;
    }
  }

  // Estatísticas de feedbacks
  async obterEstatisticasFeedback() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/empresa/feedbacks/estatisticas`, 
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas de feedback');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter estatísticas de feedback:', error);
      throw error;
    }
  }

  // Exportar relatório em PDF
  async exportarRelatorioPDF(mes = null, ano = null) {
    try {
      const currentDate = new Date();
      const mesAtual = mes || (currentDate.getMonth() + 1);
      const anoAtual = ano || currentDate.getFullYear();

      const response = await fetch(
        `${API_BASE_URL}/api/empresa/relatorios/exportar/pdf?mes=${mesAtual}&ano=${anoAtual}`, 
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao exportar relatório');
      }

      // Criar blob e download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${mesAtual}-${anoAtual}.pdf`;
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
}

export default new RelatorioService();