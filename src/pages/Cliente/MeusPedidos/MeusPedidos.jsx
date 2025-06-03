import React, { useState, useEffect } from 'react';
import PedidoService from '../../../services/PedidoService';
import FeedbackModal from '../../../components/FeedbackModal/FeedbackModal';
import './MeusPedidos.css';

const MeusPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, pedido: null });
  const [filtroStatus, setFiltroStatus] = useState('TODOS');

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await PedidoService.listarMeusPedidos();
      setPedidos(response.content || response || []);
    } catch (err) {
      setError('Erro ao carregar pedidos');
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvaliarPedido = (pedido) => {
    setFeedbackModal({ isOpen: true, pedido });
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      await PedidoService.criarFeedback({
        ...feedbackData,
        pedidoId: feedbackModal.pedido.id
      });
      
      alert('Avaliação enviada com sucesso!');
      setFeedbackModal({ isOpen: false, pedido: null });
      carregarPedidos(); // Recarregar para atualizar status
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      alert('Erro ao enviar avaliação. Tente novamente.');
    }
  };

  const formatarData = (dataHora) => {
    if (!dataHora) return 'N/A';
    return new Date(dataHora).toLocaleString('pt-BR');
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'entregue':
      case 'concluido':
        return 'entregue';
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
    switch(status?.toLowerCase()) {
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
        return status || 'Desconhecido';
    }
  };

  const podeAvaliar = (pedido) => {
    return pedido.status?.toLowerCase() === 'entregue' && !pedido.avaliado;
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtroStatus === 'TODOS') return true;
    return pedido.status?.toUpperCase() === filtroStatus;
  });

  if (loading) {
    return (
      <div className="meus-pedidos">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="meus-pedidos">
        <div className="error">
          <p>{error}</p>
          <button onClick={carregarPedidos} className="retry-btn">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="meus-pedidos">
      <div className="pedidos-header">
        <h2>📦 Meus Pedidos</h2>
        <button onClick={carregarPedidos} className="refresh-btn">
          🔄 Atualizar
        </button>
      </div>

      <div className="filtros">
        <label>Filtrar por status:</label>
        <select 
          value={filtroStatus} 
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="filtro-select"
        >
          <option value="TODOS">Todos</option>
          <option value="PENDENTE">Pendente</option>
          <option value="PREPARANDO">Preparando</option>
          <option value="A_CAMINHO">A Caminho</option>
          <option value="ENTREGUE">Entregue</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="empty-pedidos">
          <p>Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="pedidos-lista">
          {pedidosFiltrados.map(pedido => (
            <div key={pedido.id} className="pedido-card">
              <div className="pedido-header">
                <div className="pedido-info">
                  <span className="pedido-id">#{pedido.id}</span>
                  <span className="pedido-empresa">{pedido.empresa?.nome || 'N/A'}</span>
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
                  <h4>Itens:</h4>
                  <ul>
                    {pedido.itens.map((item, index) => (
                      <li key={index}>
                        {item.quantidade}x {item.produto?.nome || 'Produto'} - {formatarMoeda(item.preco * item.quantidade)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pedido.enderecoEntrega && (
                <div className="pedido-endereco">
                  <strong>Endereço de entrega:</strong>
                  <p>
                    {pedido.enderecoEntrega.logradouro}, {pedido.enderecoEntrega.numero}
                    {pedido.enderecoEntrega.complemento && `, ${pedido.enderecoEntrega.complemento}`}
                    <br />
                    {pedido.enderecoEntrega.bairro}, {pedido.enderecoEntrega.cidade}
                    <br />
                    CEP: {pedido.enderecoEntrega.cep}
                  </p>
                </div>
              )}

              <div className="pedido-actions">
                {podeAvaliar(pedido) && (
                  <button 
                    className="avaliar-btn"
                    onClick={() => handleAvaliarPedido(pedido)}
                  >
                    ⭐ Avaliar Pedido
                  </button>
                )}
                
                {pedido.status?.toLowerCase() === 'pendente' && (
                  <button 
                    className="cancelar-btn"
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja cancelar este pedido?')) {
                        // Implementar cancelamento
                        console.log('Cancelar pedido:', pedido.id);
                      }
                    }}
                  >
                    ❌ Cancelar
                  </button>
                )}
              </div>

              {pedido.observacoes && (
                <div className="pedido-observacoes">
                  <strong>Observações:</strong>
                  <p>{pedido.observacoes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {feedbackModal.isOpen && (
        <FeedbackModal
          pedido={feedbackModal.pedido}
          onClose={() => setFeedbackModal({ isOpen: false, pedido: null })}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
};

export default MeusPedidos;
