import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Dashboard</h2>
      </div>
      
      <div className="dashboard-content">
        <div className="metrics-container">
          <div className="metric-card">
            <h3>Vendas Hoje</h3>
            <div className="metric-number">R$ 1.250</div>
          </div>
          
          <div className="metric-card">
            <h3>Pedidos Hoje</h3>
            <div className="metric-number">24</div>
          </div>
          
          <div className="metric-card">
            <h3>Produtos Ativos</h3>
            <div className="metric-number">156</div>
          </div>
          
          <div className="metric-card">
            <h3>Avaliação Média</h3>
            <div className="metric-number">4.8</div>
          </div>
        </div>
        
        <div className="recent-orders-section">
          <h3>Pedidos Recentes</h3>
          <div className="orders-list">
            <p>Nenhum pedido recente encontrado.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
