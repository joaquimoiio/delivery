// src/pages/Fornecedor/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import RelatorioService from '../../../../services/RelatorioService';
import PedidoService from '../../../../services/PedidoService';
import ProdutoService from '../../../../services/ProdutoService';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar dados do dashboard
      const data = await RelatorioService.obterDadosDashboard();
      
      // Carregar estatísticas de produtos
      const produtosStats = await ProdutoService.obterEstatisticasProdutos();
      
      // Combinar dados
      const dashboardCompleto = {
        ...data,
        totalProdutos: produtosStats.total || 0,
        produtosAtivos: produtosStats.ativos || 0,
        produtosBaixoEstoque: produtosStats.baixoEstoque || 0
      };
      
      setDashboardData(dashboardCompleto);

      // Carregar pedidos recentes com dados completos
      const pedidosData = await PedidoService.listarPedidosEmpresa();
      const pedidosList = pedidosData.content || pedidosData || [];
      
      // Buscar detalhes completos de cada pedido para obter o nome do cliente
      const pedidosDetalhados = await Promise.all(
        pedidosList.map(async (pedido) => {
          try {
            // Buscar detalhes completos do pedido
            const detalhes = await PedidoService.buscarMeuPedido(pedido.id);
            return {
              ...pedido,
              ...detalhes,
              cliente: detalhes.cliente || { nome: 'Cliente não identificado' }
            };
          } catch (error) {
            console.error(`Erro ao buscar detalhes do pedido ${pedido.id}:`, error);
            return {
              ...pedido,
              cliente: { nome: 'Cliente não identificado' }
            };
          }
        })
      );
      
      setPedidos(pedidosDetalhados);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error('Erro no dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarEntregue = async (pedidoId) => {
    try {
      await PedidoService.marcarComoEntregue(pedidoId);
      alert('Pedido marcado como entregue! O cliente receberá uma notificação para avaliar.');
      carregarDados(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao marcar pedido como entregue:', error);
      alert('Erro ao marcar pedido como entregue');
    }
  };

  const handleMarcarCancelado = async (pedidoId) => {
    try {
      await PedidoService.atualizarStatusPedido(pedidoId, 'CANCELADO');
      alert('Pedido marcado como cancelado.');
      carregarDados(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao marcar pedido como cancelado:', error);
      alert('Erro ao marcar pedido como cancelado');
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

  const formatarData = (dataHora) => {
    if (!dataHora) return 'N/A';
    return new Date(dataHora).toLocaleString('pt-BR');
  };

  const getVariacaoClass = (valor) => {
    if (valor > 0) return 'variacao-positiva';
    if (valor < 0) return 'variacao-negativa';
    return 'variacao-neutra';
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'entregue':
      case 'concluido':
        return 'concluido';
      case 'pendente':
      case 'preparando':
        return 'pendente';
      case 'cancelado':
        return 'cancelado';
      case 'a_caminho':
        return 'a-caminho';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch(status?.toLowerCase()) {
      case 'pendente':
        return 'Pendente';
      case 'preparando':
        return 'Preparando';
      case 'a_caminho':
        return 'A Caminho';
      case 'entregue':
        return 'Entregue';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status || 'Desconhecido';
    }
  };

  const podeMarcarEntregue = (status) => {
    const s = status?.toLowerCase();
    return s === 'preparando' || s === 'a_caminho' || s === 'pendente';
  };

  // Filtrar pedidos recentes (últimos 10)
  const pedidosRecentes = pedidos.slice(0, 10);

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
          <button onClick={carregarDados} className="retry-btn">
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
        <button onClick={carregarDados} className="refresh-btn">
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

        {/* Seção de Pedidos Recentes */}
        <div className="pedidos-section">
          <div className="section-header">
            <h3>📋 Pedidos Recentes</h3>
            <span className="pedidos-count">{pedidos.length} pedidos</span>
          </div>

          {pedidosRecentes.length === 0 ? (
            <div className="empty-pedidos">
              <p>Nenhum pedido encontrado.</p>
            </div>
          ) : (
            <div className="pedidos-lista">
              {pedidosRecentes.map(pedido => (
                <div key={pedido.id} className="pedido-card">
                  <div className="pedido-header">
                    <div className="pedido-info">
                      <span className="pedido-id">#{pedido.id}</span>
                      <span className="pedido-cliente">{pedido.cliente?.nome || 'N/A'}</span>
                    </div>
                    <div className="pedido-valor">
                      {formatarMoeda(pedido.total)}
                    </div>
                  </div>

                  <div className="pedido-details">
                    <div className="pedido-data">
                      {formatarData(pedido.dataHora)}
                    </div>
                    <div className={`pedido-status ${getStatusClass(pedido.status)}`}>
                      {getStatusText(pedido.status)}
                    </div>
                  </div>

                  {pedido.itens && pedido.itens.length > 0 && (
                    <div className="pedido-itens">
                      <small>
                        {pedido.itens.slice(0, 2).map(item => 
                          `${item.quantidade}x ${item.produto?.nome || 'Produto'}`
                        ).join(', ')}
                        {pedido.itens.length > 2 && ` +${pedido.itens.length - 2} itens`}
                      </small>
                    </div>
                  )}

                  {podeMarcarEntregue(pedido.status) && (
                    <div className="pedido-actions">
                      <button 
                        className="entregar-btn"
                        onClick={() => handleMarcarEntregue(pedido.id)}
                        title="Marcar como entregue"
                      >
                        ✅ Marcar como Entregue
                      </button>
                      <button
                        className="cancelar-btn"
                        onClick={() => handleMarcarCancelado(pedido.id)}
                        title="Marcar como cancelado"
                      >
                        ❌ Marcar como Cancelado
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
                <span className="annual-label">Pedidos:</span>
                <span className="annual-value">{dashboardData.pedidosAno || 0}</span>
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
      </div>
    </div>
  );
};

export default Dashboard;
