import React, { useState, useEffect } from 'react';
import RelatorioService from '../../../../services/RelatorioService';
import './Relatorio.css';

const Relatorio = () => {
  const [relatorioData, setRelatorioData] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAno, setFiltroAno] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar dados do relatório
      const relatorio = await RelatorioService.obterRelatorioCompleto();
      setRelatorioData(relatorio);
      
      // Carregar feedbacks
      const feedbacksData = await RelatorioService.obterFeedbacks();
      setFeedbacks(feedbacksData.content || feedbacksData || []);
      
    } catch (err) {
      setError('Erro ao carregar dados do relatório');
      console.error('Erro ao carregar relatório:', err);
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

  const formatarData = (data) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const obterMesNome = (numeroMes) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[numeroMes - 1];
  };

  const renderEstrelas = (nota) => {
    const estrelas = [];
    for (let i = 1; i <= 5; i++) {
      estrelas.push(
        <span key={i} className={`estrela ${i <= nota ? 'preenchida' : ''}`}>
          ⭐
        </span>
      );
    }
    return estrelas;
  };

  const calcularMediaAvaliacoes = () => {
    if (feedbacks.length === 0) return 0;
    const soma = feedbacks.reduce((acc, feedback) => acc + feedback.nota, 0);
    return (soma / feedbacks.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="vendas-container">
        <div className="vendas-header">
          <h2>Relatório Financeiro</h2>
        </div>
        <div className="loading">Carregando relatório...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendas-container">
        <div className="vendas-header">
          <h2>Relatório Financeiro</h2>
        </div>
        <div className="error">
          <p>{error}</p>
          <button onClick={carregarDados} className="retry-btn">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  return (
    <div className="vendas-container">
      <div className="vendas-header">
        <h2>Relatório Financeiro</h2>
        <button onClick={carregarDados} className="refresh-btn">
          🔄 Atualizar
        </button>
      </div>

      {/* Cards de Estatísticas Financeiras */}
      <div className="estatisticas-cards">
        <div className="card lucro-mensal">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Lucro Mensal</h3>
            <p className="valor-principal">{formatarMoeda(relatorioData?.lucroMensal || 0)}</p>
            <span className="descricao">
              {obterMesNome(mesAtual)} {anoAtual}
            </span>
          </div>
        </div>

        <div className="card lucro-anual">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>Lucro Anual</h3>
            <p className="valor-principal">{formatarMoeda(relatorioData?.lucroAnual || 0)}</p>
            <span className="descricao">
              {anoAtual}
            </span>
          </div>
        </div>

        <div className="card faturamento-mensal">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Faturamento Mensal</h3>
            <p className="valor-principal">{formatarMoeda(relatorioData?.faturamentoMensal || 0)}</p>
            <span className="descricao">
              {relatorioData?.pedidosMensal || 0} pedidos
            </span>
          </div>
        </div>

        <div className="card faturamento-anual">
          <div className="card-icon">💼</div>
          <div className="card-content">
            <h3>Faturamento Anual</h3>
            <p className="valor-principal">{formatarMoeda(relatorioData?.faturamentoAnual || 0)}</p>
            <span className="descricao">
              {relatorioData?.pedidosAnual || 0} pedidos
            </span>
          </div>
        </div>
      </div>

      {/* Métricas Adicionais */}
      <div className="metricas-adicionais">
        <div className="metrica-card">
          <h3>📊 Margem de Lucro</h3>
          <div className="metrica-content">
            <div className="metrica-item">
              <span>Mensal:</span>
              <span className="valor-destaque">
                {relatorioData?.margemLucroMensal ? `${relatorioData.margemLucroMensal.toFixed(1)}%` : '0%'}
              </span>
            </div>
            <div className="metrica-item">
              <span>Anual:</span>
              <span className="valor-destaque">
                {relatorioData?.margemLucroAnual ? `${relatorioData.margemLucroAnual.toFixed(1)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>

        <div className="metrica-card">
          <h3>🎯 Ticket Médio</h3>
          <div className="metrica-content">
            <div className="metrica-item">
              <span>Mensal:</span>
              <span className="valor-destaque">{formatarMoeda(relatorioData?.ticketMedioMensal || 0)}</span>
            </div>
            <div className="metrica-item">
              <span>Anual:</span>
              <span className="valor-destaque">{formatarMoeda(relatorioData?.ticketMedioAnual || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Feedbacks */}
      <div className="feedbacks-section">
        <div className="feedbacks-header">
          <h3>⭐ Avaliações dos Clientes</h3>
          <div className="media-avaliacoes">
            <span className="media-numero">{calcularMediaAvaliacoes()}</span>
            <div className="estrelas-media">
              {renderEstrelas(Math.round(calcularMediaAvaliacoes()))}
            </div>
            <span className="total-avaliacoes">({feedbacks.length} avaliações)</span>
          </div>
        </div>

        {feedbacks.length === 0 ? (
          <div className="sem-feedbacks">
            <p>Nenhuma avaliação recebida ainda.</p>
          </div>
        ) : (
          <div className="feedbacks-lista">
            {feedbacks.slice(0, 10).map(feedback => (
              <div key={feedback.id} className="feedback-card">
                <div className="feedback-header">
                  <div className="cliente-info">
                    <strong>{feedback.cliente?.nome || 'Cliente'}</strong>
                    <span className="data-feedback">{formatarData(feedback.dataAvaliacao)}</span>
                  </div>
                  <div className="nota-feedback">
                    {renderEstrelas(feedback.nota)}
                  </div>
                </div>
                {feedback.comentario && (
                  <div className="feedback-comentario">
                    <p>"{feedback.comentario}"</p>
                  </div>
                )}
                {feedback.pedido && (
                  <div className="feedback-pedido">
                    <small>Pedido #{feedback.pedido.id}</small>
                  </div>
                )}
              </div>
            ))}
            
            {feedbacks.length > 10 && (
              <div className="mais-feedbacks">
                <p>E mais {feedbacks.length - 10} avaliações...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resumo Geral */}
      <div className="resumo-geral">
        <h3>📋 Resumo Geral</h3>
        <div className="resumo-grid">
          <div className="resumo-item">
            <span>Total de Produtos:</span>
            <span>{relatorioData?.totalProdutos || 0}</span>
          </div>
          <div className="resumo-item">
            <span>Produtos Ativos:</span>
            <span>{relatorioData?.produtosAtivos || 0}</span>
          </div>
          <div className="resumo-item">
            <span>Total de Pedidos (Ano):</span>
            <span>{relatorioData?.pedidosAnual || 0}</span>
          </div>
          <div className="resumo-item">
            <span>Pedidos Entregues:</span>
            <span>{relatorioData?.pedidosEntregues || 0}</span>
          </div>
          <div className="resumo-item">
            <span>Taxa de Satisfação:</span>
            <span>{calcularMediaAvaliacoes()}/5.0</span>
          </div>
          <div className="resumo-item">
            <span>Crescimento Mensal:</span>
            <span className={relatorioData?.crescimentoMensal >= 0 ? 'positivo' : 'negativo'}>
              {relatorioData?.crescimentoMensal ? `${relatorioData.crescimentoMensal.toFixed(1)}%` : '0%'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorio;
