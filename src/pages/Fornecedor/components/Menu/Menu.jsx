import React, { useState } from 'react';
import './Menu.css';

const Menu = ({ onNavigate, activeScreen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  return (
    <div className={`menu-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="menu-header">
        <button 
          className="menu-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
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
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-text">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Menu;
