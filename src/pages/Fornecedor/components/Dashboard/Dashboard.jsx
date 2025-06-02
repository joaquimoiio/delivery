// src/pages/Fornecedor/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import RelatorioService from '../../../../services/RelatorioService';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  const carregarDadosDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await RelatorioService.obterDadosDashboard();
      setDashboardData(data);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error('Erro no dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarPorcentagem = (valor) => {
    const percentual = valor || 0;
    const sinal = percentual >= 0 ? '+' : '';
    return `${sinal}${percentual.toFixed(1)}%`;
  };

  const getVariacaoClass = (valor) => {
    if (valor > 0) return 'variacao-positiva';
    if (valor < 0) return 'variacao-negativa';
    return 'variacao-neutra';
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>📊 Dashboard</h2>
        </div>
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>📊 Dashboard</h2>
        </div>
        <div className="dashboard-error">
          <p>{error}</p>
          <button onClick={carregarDadosDashboard} className="retry-btn">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>📊 Dashboard</h2>
        </div>
        <div className="dashboard-empty">
          <p>Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Dashboard</h2>
        <button onClick={carregarDadosDashboard} className="refresh-btn">
          🔄 Atualizar
        </button>
      </div>
      
      <div className="dashboard-content">
        {/* Métricas Principais */}
        <div className="metrics-container">
          <div className="metric-card faturamento">
            <div className="metric-icon">💰</div>
            <div className="metric-content">
              <h3>Faturamento Mensal</h3>
              <div className="metric-number">
                {formatarMoeda(dashboardData.faturamentoMes)}
              </div>
              {dashboardData.variacaoFaturamento !== undefined && (
                <div className={`metric-variation ${getVariacaoClass(dashboardData.variacaoFaturamento)}`}>
                  {formatarPorcentagem(dashboardData.variacaoFaturamento)} vs mês anterior
                </div>
              )}
            </div>
          </div>
          
          <div className="metric-card lucro">
            <div className="metric-icon">📈</div>
            <div className="metric-content">
              <h3>Lucro Mensal</h3>
              <div className="metric-number">
                {formatarMoeda(dashboardData.lucroMes)}
              </div>
              {dashboardData.variacaoLucro !== undefined && (
                <div className={`metric-variation ${getVariacaoClass(dashboardData.variacaoLucro)}`}>
                  {formatarPorcentagem(dashboardData.variacaoLucro)} vs mês anterior
                </div>
              )}
            </div>
          </div>
          
          <div className="metric-card pedidos">
            <div className="metric-icon">📦</div>
            <div className="metric-content">
              <h3>Pedidos do Mês</h3>
              <div className="metric-number">
                {dashboardData.pedidosMes || 0}
              </div>
              {dashboardData.variacaoPedidos !== undefined && (
                <div className={`metric-variation ${getVariacaoClass(dashboardData.variacaoPedidos)}`}>
                  {formatarPorcentagem(dashboardData.variacaoPedidos)} vs mês anterior
                </div>
              )}
            </div>
          </div>
          
          <div className="metric-card ticket">
            <div className="metric-icon">🎯</div>
            <div className="metric-content">
              <h3>Ticket Médio</h3>
              <div className="metric-number">
                {formatarMoeda(dashboardData.ticketMedio)}
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Anuais */}
        <div className="annual-metrics">
          <div className="annual-card">
            <h3>📅 Desempenho Anual</h3>
            <div className="annual-data">
              <div className="annual-item">
                <span className="annual-label">Faturamento:</span>
                <span className="annual-value">{formatarMoeda(dashboardData.faturamentoAno)}</span>
              </div>
              <div className="annual-item">
                <span className="annual-label">Lucro:</span>
                <span className="annual-value">{formatarMoeda(dashboardData.lucroAno)}</span>
              </div>
              <div className="annual-item">
                <span className="annual-label">Pedidos:</span>
                <span className="annual-value">{dashboardData.pedidosAno || 0}</span>
              </div>
              <div className="annual-item">
                <span className="annual-label">Margem de Lucro:</span>
                <span className="annual-value">{formatarPorcentagem(dashboardData.margemLucroAno || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Produtos e Avaliações */}
        <div className="secondary-metrics">
          <div className="metric-card produtos">
            <div className="metric-icon">🛍️</div>
            <div className="metric-content">
              <h3>Produtos</h3>
              <div className="metric-details">
                <div className="metric-detail">
                  <span>Total:</span>
                  <span>{dashboardData.totalProdutos || 0}</span>
                </div>
                <div className="metric-detail">
                  <span>Ativos:</span>
                  <span>{dashboardData.produtosAtivos || 0}</span>
                </div>
                <div className="metric-detail warning">
                  <span>Baixo Estoque:</span>
                  <span>{dashboardData.produtosBaixoEstoque || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="metric-card avaliacoes">
            <div className="metric-icon">⭐</div>
            <div className="metric-content">
              <h3>Avaliações</h3>
              <div className="metric-number rating">
                {(dashboardData.avaliacaoMedia || 0).toFixed(1)}
              </div>
              <div className="metric-subtitle">
                {dashboardData.totalAvaliacoes || 0} avaliações
              </div>
            </div>
          </div>
        </div>

        {/* Alertas e Indicadores */}
        {dashboardData.produtosBaixoEstoque > 0 && (
          <div className="dashboard-alerts">
            <div className="alert warning">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <h4>Atenção ao Estoque</h4>
                <p>Você tem {dashboardData.produtosBaixoEstoque} produto(s) com estoque baixo</p>
              </div>
            </div>
          </div>
        )}

        {/* Resumo Financeiro */}
        <div className="financial-summary">
          <h3>💼 Resumo Financeiro</h3>
          <div className="financial-grid">
            <div className="financial-item">
              <span className="financial-label">Margem de Lucro Mensal:</span>
              <span className={`financial-value ${dashboardData.margemLucroMes >= 20 ? 'good' : dashboardData.margemLucroMes >= 10 ? 'average' : 'low'}`}>
                {formatarPorcentagem(dashboardData.margemLucroMes || 0)}
              </span>
            </div>
            <div className="financial-item">
              <span className="financial-label">Margem de Lucro Anual:</span>
              <span className={`financial-value ${dashboardData.margemLucroAno >= 20 ? 'good' : dashboardData.margemLucroAno >= 10 ? 'average' : 'low'}`}>
                {formatarPorcentagem(dashboardData.margemLucroAno || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;