import React, { useState } from 'react';
import Menu from './components/Menu/Menu';
import Dashboard from './components/Dashboard/Dashboard';
import CadastroProdutos from './components/CadastroProdutos/CadastroProdutos';
import Relatorio from './components/Relatorio/Relatorio';
import TabelaVendas from './components/TabelaVendas/TabelaVendas';
import Loja from './components/Loja/Loja';
import './Fornecedor.css';

const Fornecedor = () => {
  const [activeComponent, setActiveComponent] = useState('home');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'home':
      case 'dashboard':
        return <Dashboard />;
      case 'relatorio':
        return <Relatorio />;
      case 'vendas':
        return <TabelaVendas />;
      case 'produtos':
        return <CadastroProdutos />;
      case 'loja':
        return <Loja />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Menu 
        onNavigate={setActiveComponent} 
        activeScreen={activeComponent} 
      />
      <main className="main-content">
        {renderComponent()}
      </main>
    </div>
  );
};

export default Fornecedor;
