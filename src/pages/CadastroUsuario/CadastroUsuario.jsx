// src/pages/CadastroUsuario/CadastroUsuario.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import FormularioCliente from './components/FormularioCliente';
import FormularioEmpresa from './components/FormularioEmpresa';
import './CadastroUsuario.css';

const CadastroUsuario = () => {
  const navigate = useNavigate();
  const [tipoSelecionado, setTipoSelecionado] = useState('cliente');
  const [painelAberto, setPainelAberto] = useState(true);

  const tiposUsuario = [
    {
      id: 'cliente',
      titulo: 'Sou Cliente',
      descricao: 'Quero fazer pedidos'
    },
    {
      id: 'empresa',
      titulo: 'Sou Empresa',
      descricao: 'Quero vender produtos'
    },
  ];

  const handleTipoClick = (tipo) => {
    setTipoSelecionado(tipo);
    setPainelAberto(true);
  };

  const handleVoltar = () => {
    // Não fechar o painel, apenas resetar para cliente
    setTipoSelecionado('cliente');
  };

  const renderFormulario = () => {
    switch (tipoSelecionado) {
      case 'cliente':
        return <FormularioCliente onVoltar={handleVoltar} />;
      case 'empresa':
        return <FormularioEmpresa onVoltar={handleVoltar} />;
      default:
        return <FormularioCliente onVoltar={handleVoltar} />;
    }
  };

  return (
    <div className="cadastro-page">
      <Navbar />
      
      <div className="container">
        {/* Botões de seleção de tipo */}
        <div className="botoes">
          {tiposUsuario.map((tipo) => (
            <button
              key={tipo.id}
              onClick={() => handleTipoClick(tipo.id)}
              className={`botao-tipo ${tipoSelecionado === tipo.id ? 'ativo' : ''}`}
              data-tipo={tipo.id}
            >
              <div className="botao-texto">
                <span className="botao-titulo">{tipo.titulo}</span>
                <span className="botao-descricao">{tipo.descricao}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Painel de formulário */}
        <div className={`painel ${painelAberto ? 'aberto' : ''}`}>
          {renderFormulario()}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CadastroUsuario;