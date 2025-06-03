import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import './Menu.css';

const Menu = ({ onNavigate, activeScreen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'relatorio', label: 'Relatório', icon: '📊' },
    { id: 'vendas', label: 'Vendas', icon: '💰' },
    { id: 'produtos', label: 'Produtos', icon: '📦' },
    { id: 'loja', label: 'Loja', icon: '🏪' }
  ];

  const handleMenuClick = (itemId) => {
    onNavigate(itemId);
  };

  const { logout } = useAuth();
  
  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className={`menu-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="menu-header">
        <button 
          className="menu-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          ☰
        </button>
      </div>
      
      <nav className="menu-navigation">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`menu-item ${activeScreen === item.id ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.id)}
            title={item.label}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-text">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="menu-footer">
        <button 
          className="logout-btn"
          onClick={handleLogout}
          title="Sair do sistema"
        >
          <span className="menu-icon">🚪</span>
          <span className="menu-text">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Menu;
