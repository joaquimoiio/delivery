// src/pages/OrderHistory/OrderHistory.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './OrderHistory.css';

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    
    // Simular carregamento de pedidos
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Dados de exemplo
    const mockOrders = [
      {
        id: 1,
        date: '2025-05-30',
        time: '14:30',
        store: 'Burger House',
        items: [
          { name: 'X-Bacon', quantity: 2, price: 25.90 },
          { name: 'Batata Frita', quantity: 1, price: 12.00 }
        ],
        total: 63.80,
        status: 'entregue',
        deliveryTime: 35,
        paymentMethod: 'Cartão de Crédito'
      },
      {
        id: 2,
        date: '2025-05-28',
        time: '19:15',
        store: 'Açaí Premium',
        items: [
          { name: 'Açaí 500ml', quantity: 1, price: 18.50 },
          { name: 'Granola Extra', quantity: 1, price: 3.00 }
        ],
        total: 21.50,
        status: 'entregue',
        deliveryTime: 25,
        paymentMethod: 'PIX'
      },
      {
        id: 3,
        date: '2025-05-25',
        time: '12:45',
        store: 'Pizza Bella',
        items: [
          { name: 'Pizza Margherita', quantity: 1, price: 42.00 }
        ],
        total: 42.00,
        status: 'cancelado',
        deliveryTime: 50,
        paymentMethod: 'Dinheiro'
      }
    ];
    
    setOrders(mockOrders);
    setIsLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'entregue': return '#22c55e';
      case 'cancelado': return '#ef4444';
      case 'preparando': return '#fbbf24';
      case 'a caminho': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'entregue': return 'Entregue';
      case 'cancelado': return 'Cancelado';
      case 'preparando': return 'Preparando';
      case 'a caminho': return 'A Caminho';
      default: return 'Desconhecido';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
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
                      {order.items.map((item, index) => (
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
                      <span>Tempo de entrega: {order.deliveryTime} min</span>
                      <span>Pagamento: {order.paymentMethod}</span>
                    </div>
                    <div className="order-total">
                      <strong>Total: {formatPrice(order.total)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderHistory;
