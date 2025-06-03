// src/pages/Fornecedor/components/Dashboard/Dashboard.jsx - VERSÃO CORRIGIDA
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
  const [loadingPedidos, setLoadingPedidos] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar dados em paralelo para melhor performance
      const [relatorioData, pedidosData, produtosStats] = await Promise.allSettled([
        RelatorioService.obterDadosDashboard().catch(err => {
          console.error('Erro ao carregar relatório:', err);
          return null;
        }),
        PedidoService.listarPedidosEmpresa().catch(err => {
          console.error('Erro ao carregar pedidos:', err);
          return { content: [] };
        }),
        ProdutoService.obterEstatisticasProdutos().catch(err => {
          console.error('Erro ao carregar estatísticas de produtos:', err);
          return { total: 0, ativos: 0, baixoEstoque: 0 };
        })
      ]);

      // Processar resultado do relatório
      const relatorio = relatorioData.status === 'fulfilled' ? relatorioData.value : {};
      
      // Processar resultado dos produtos
      const statsData = produtosStats.status === 'fulfilled' ? produtosStats.value : {
        total: 0,
        ativos: 0,
        baixoEstoque: 0
      };
      
      // Combinar dados do dashboard
      const dashboardCompleto = {
        // Dados do relatório
        faturamentoMes: relatorio?.faturamentoMensal || 0,
        faturamentoAno: relatorio?.faturamentoAnual || 0,
        pedidosMes: relatorio?.pedidosMensal || 0,
        pedidosAno: relatorio?.pedidosAnual || 0,
        ticketMedio: relatorio?.ticketMedioMensal || 0,
        avaliacaoMedia: relatorio?.avaliacaoMedia || 0,
        totalAvaliacoes: relatorio?.totalAvaliacoes || 0,
        variacaoFaturamento: relatorio?.variacaoFaturamento || 0,
        variacaoPedidos: relatorio?.variacaoPedidos || 0,
        
        // Dados dos produtos
        totalProdutos: statsData.total || 0,
        produtosAtivos: statsData.ativos || 0,
        produtosBaixoEstoque: statsData.baixoEstoque || 0
      };
      
      setDashboardData(dashboardCompleto);

      // Processar pedidos
      const pedidosResult = pedidosData.status === 'fulfilled' ? pedidosData.value : { content: [] };
      const pedidosList = Array.isArray(pedidosResult) ? pedidosResult : (pedidosResult.content || []);
      
      // Buscar detalhes dos pedidos de forma mais robusta
      const pedidosDetalhados = await Promise.allSettled(
        pedidosList.slice(0, 10).map(async (pedido) => {
          try {
            // Tentar buscar detalhes completos
            const detalhes = await PedidoService.buscarMeuPedido(pedido.id);
            return {
              ...pedido,
              ...detalhes,
              cliente: detalhes?.cliente || pedido?.cliente || { nome: 'Cliente não identificado' }
            };
          } catch (error) {
            // Se falhar, usar dados básicos do pedido
            return {
              ...pedido,
              cliente: pedido?.cliente || { nome: 'Cliente não identificado' }
            };
          }
        })
      );
      
      const pedidosFinais = pedidosDetalhados
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      setPedidos(pedidosFinais);

    } catch (err) {
      console.error('Erro geral no dashboard:', err);
      setError('Erro ao carregar dados do dashboard');
      
      // Definir dados padrão em caso de erro
      setDashboardData({
        faturamentoMes: 0,
        faturamentoAno: 0,
        pedidosMes: 0,
        pedidosAno: 0,
        ticketMedio: 0,
        avaliacaoMedia: 0,
        totalAvaliacoes: 0,
        totalProdutos: 0,
        produtosAtivos: 0,
        produtosBaixoEstoque: 0,
        variacaoFaturamento: 0,
        variacaoPedidos: 0
      });
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarEntregue = async (pedidoId) => {
    if (!pedidoId) {
      alert('ID do pedido não encontrado');
      return;
    }

    setLoadingPedidos(true);
    try {
      await PedidoService.marcarComoEntregue(pedidoId);
      alert('Pedido marcado como entregue! O cliente receberá uma notificação para avaliar.');
      await carregarDados(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao marcar pedido como entregue:', error);
      alert('Erro ao marcar pedido como entregue: ' + (error.message || 'Tente novamente'));
    } finally {
      setLoadingPedidos(false);
    }
  };

  const handleMarcarCancelado = async (pedidoId) => {
    if (!pedidoId) {
      alert('ID do pedido não encontrado');
      return;
    }

    if (!window.confirm('Tem certeza que deseja cancelar este pedido?')) {
      return;
    }

    setLoadingPedidos(true);
    try {
      await PedidoService.atualizarStatusPedido(pedidoId, 'CANCELADO');
      alert('Pedido marcado como cancelado.');
      await carregarDados(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao marcar pedido como cancelado:', error);
      alert('Erro ao marcar pedido como cancelado: ' + (error.message || 'Tente novamente'));
    } finally {
      setLoadingPedidos(false);
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
    try {
      return new Date(dataHora).toLocaleString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const getVariacaoClass = (valor) => {
    if (valor > 0) return 'variacao-positiva';
    if (valor < 0) return 'variacao-negativa';
    return 'variacao-neutra';
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    switch(status.toLowerCase()) {
      case 'entregue':
      case 'concluido':
        return 'concluido';
      case 'pendente':
      case 'preparando':
        return 'pendente';
      case 'cancelado':
        return 'cancelado';
      case 'a_caminho':
      case 'saiu_entrega':
        return 'a-caminho';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'Desconhecido';
    switch(status.toLowerCase()) {
      case 'pendente':
        return 'Pendente';
      case 'preparando':
        return 'Preparando';
      case 'a_caminho':
      case 'saiu_entrega':
        return 'A Caminho';
      case 'entregue':
        return 'Entregue';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const podeMarcarEntregue = (status) => {
    if (!status) return false;
    const s = status.toLowerCase();
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Dashboard</h2>
        <button onClick={carregarDados} className="refresh-btn" disabled={loading}>
          🔄 {loading ? 'Carregando...' : 'Atualizar'}
        </button>
      </div>
      
      <div className="dashboard-content">
        {error && (
          <div className="dashboard-alerts">
            <div className="alert warning">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <h4>Aviso</h4>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Métricas Principais */}
        <div className="metrics-container">
          <div className="metric-card faturamento">
            <div className="metric-icon">💰</div>
            <div className="metric-content">
              <h3>Faturamento Mensal</h3>
              <div className="metric-number">
                {formatarMoeda(dashboardData?.faturamentoMes || 0)}
              </div>
              {dashboardData?.variacaoFaturamento !== undefined && (
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
                {dashboardData?.pedidosMes || 0}
              </div>
              {dashboardData?.variacaoPedidos !== undefined && (
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
                {formatarMoeda(dashboardData?.ticketMedio || 0)}
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
                      <span className="pedido-cliente">{pedido.cliente?.nome || 'Cliente não identificado'}</span>
                    </div>
                    <div className="pedido-valor">
                      {formatarMoeda(pedido.total || 0)}
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
                          `${item.quantidade || 1}x ${item.produto?.nome || item.nomeProduto || 'Produto'}`
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
                        disabled={loadingPedidos}
                      >
                        ✅ {loadingPedidos ? 'Processando...' : 'Marcar como Entregue'}
                      </button>
                      <button
                        className="cancelar-btn"
                        onClick={() => handleMarcarCancelado(pedido.id)}
                        title="Marcar como cancelado"
                        disabled={loadingPedidos}
                      >
                        ❌ {loadingPedidos ? 'Processando...' : 'Marcar como Cancelado'}
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
                <span className="annual-value">{formatarMoeda(dashboardData?.faturamentoAno || 0)}</span>
              </div>
              <div className="annual-item">
                <span className="annual-label">Pedidos:</span>
                <span className="annual-value">{dashboardData?.pedidosAno || 0}</span>
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
                  <span>{dashboardData?.totalProdutos || 0}</span>
                </div>
                <div className="metric-detail">
                  <span>Ativos:</span>
                  <span>{dashboardData?.produtosAtivos || 0}</span>
                </div>
                <div className="metric-detail warning">
                  <span>Baixo Estoque:</span>
                  <span>{dashboardData?.produtosBaixoEstoque || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="metric-card avaliacoes">
            <div className="metric-icon">⭐</div>
            <div className="metric-content">
              <h3>Avaliações</h3>
              <div className="metric-number rating">
                {(dashboardData?.avaliacaoMedia || 0).toFixed(1)}
              </div>
              <div className="metric-subtitle">
                {dashboardData?.totalAvaliacoes || 0} avaliações
              </div>
            </div>
          </div>
        </div>

        {/* Alertas e Indicadores */}
        {(dashboardData?.produtosBaixoEstoque || 0) > 0 && (
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