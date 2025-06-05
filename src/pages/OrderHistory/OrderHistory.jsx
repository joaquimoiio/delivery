import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PedidoService from '../../services/PedidoService';
import FeedbackModal from '../../components/FeedbackModal/FeedbackModal';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './OrderHistory.css';

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [filter]); // Reload when filter changes

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      let response;
      if (filter === 'all') {
        response = await PedidoService.listarMeusPedidos();
      } else {
        response = await PedidoService.listarPedidosPorStatus(filter.toUpperCase());
      }
      
      const transformedOrders = await Promise.all((response?.content || []).map(async order => {
        const hasBeenEvaluated = await PedidoService.verificarFeedbackPedido(order.id);
        return {
          id: order.id,
          date: order.dataPedido,
          time: new Date(order.dataPedido).toLocaleTimeString('pt-BR'),
          store: order.nomeEmpresa,
          items: order.itens?.map(item => ({
            name: item.nomeProduto,
            quantity: item.quantidade,
            price: item.precoUnitario
          })) || [],
          total: order.total,
          status: order.status?.toLowerCase() || 'pendente',
          paymentMethod: order.formaPagamento,
          hasBeenEvaluated
        };
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFeedbackModal = (order) => {
    setSelectedOrder(order);
    setShowFeedbackModal(true);
  };

  const handleCloseFeedbackModal = () => {
    setSelectedOrder(null);
    setShowFeedbackModal(false);
  };

  const handleSubmitFeedback = async (feedbackData) => {
    try {
      await PedidoService.criarFeedback({
        pedidoId: feedbackData.pedidoId,
        nota: feedbackData.nota,
        comentario: feedbackData.comentario
      });
      alert('Avaliação enviada com sucesso!');
      handleCloseFeedbackModal();
      loadOrders();
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      alert('Erro ao enviar avaliação. Tente novamente.');
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'entregue': '#22c55e',
      'cancelado': '#ef4444',
      'preparando': '#fbbf24',
      'a_caminho': '#3b82f6',
      'pendente': '#6b7280',
      'confirmado': '#17a2b8'
    };
    return statusColors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'entregue': 'Entregue',
      'cancelado': 'Cancelado',
      'preparando': 'Preparando',
      'a_caminho': 'A Caminho',
      'pendente': 'Pendente',
      'confirmado': 'Confirmado'
    };
    return statusTexts[status] || 'Desconhecido';
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price || 0);
  };

  return (
    <div className="order-history-page">
      <Navbar />
      
      <div className="order-history-container">
        <div className="order-history-header">
          <h1>Histórico de Pedidos</h1>
          <p>Acompanhe todos os seus pedidos realizados</p>
        </div>

        <div className="order-filters">
          <button
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('all')}
          >
            Todos
          </button>
          <button
            className={filter === 'entregue' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('entregue')}
          >
            Entregues
          </button>
          <button
            className={filter === 'cancelado' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('cancelado')}
          >
            Cancelados
          </button>
        </div>

        <div className="orders-content">
          {isLoading ? (
            <div className="loading-orders">
              <div className="loading-spinner"></div>
              <p>Carregando pedidos...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="no-orders">
              <h3>Nenhum pedido encontrado</h3>
              <p>Você ainda não fez nenhum pedido ou não há pedidos para o filtro selecionado.</p>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Pedido #{order.id}</h3>
                      <p>{order.store}</p>
                      <span className="order-date">
                        {formatDate(order.date)} às {order.time}
                      </span>
                    </div>
                    <div className="order-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>

                  <div className="order-items">
                    <h4>Itens do pedido:</h4>
                    <ul>
                      {(order.items || []).map((item, index) => (
                        <li key={index}>
                          <span className="item-name">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="item-price">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="order-footer">
                    <div className="order-details">
                      <span>Pagamento: {order.paymentMethod}</span>
                    </div>
                    <div className="order-total">
                      <strong>Total: {formatPrice(order.total)}</strong>
                    </div>
                  </div>

                  {order.status === 'entregue' && !order.hasBeenEvaluated && (
                    <div className="order-feedback">
                      <button 
                        className="feedback-btn"
                        onClick={() => handleOpenFeedbackModal(order)}
                      >
                        Avaliar Pedido
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {showFeedbackModal && selectedOrder && (
        <FeedbackModal 
          pedido={selectedOrder} 
          onSubmit={handleSubmitFeedback} 
          onClose={handleCloseFeedbackModal} 
        />
      )}
    </div>
  );
};

export default OrderHistory;
