import React, { useState } from 'react';
import './TabelaVendas.css';

const TabelaVendas = () => {
  const [dados] = useState([
    { id: 1, cliente: 'João Silva', valor: 'R$ 150,00', dataHora: '28/05/2025 14:30', situacao: 'Concluído' },
    { id: 2, cliente: 'Maria Santos', valor: 'R$ 280,00', dataHora: '28/05/2025 13:15', situacao: 'Pendente' },
    { id: 3, cliente: 'Pedro Costa', valor: 'R$ 95,00', dataHora: '28/05/2025 12:45', situacao: 'Cancelado' },
    { id: 4, cliente: 'Ana Oliveira', valor: 'R$ 320,00', dataHora: '28/05/2025 11:20', situacao: 'Concluído' },
    { id: 5, cliente: 'Carlos Lima', valor: 'R$ 180,00', dataHora: '28/05/2025 10:30', situacao: 'Pendente' },
    { id: 6, cliente: 'Lucia Ferreira', valor: 'R$ 450,00', dataHora: '28/05/2025 09:15', situacao: 'Concluído' }
  ]);

  const handleDetalhes = (id) => {
    const item = dados.find(d => d.id === id);
    alert(`Detalhes do pedido:\nID: ${item.id}\nCliente: ${item.cliente}\nValor: ${item.valor}\nStatus: ${item.situacao}`);
  };

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'concluído':
        return 'concluido';
      case 'pendente':
        return 'pendente';
      case 'cancelado':
        return 'cancelado';
      default:
        return '';
    }
  };

  return (
    <div className="tabela-relatorios">
      <div className="tabela-header">
        <h2>Relatórios de Vendas</h2>
      </div>
      
      <div className="tabela-content">
        <div className="table-wrapper">
          <table className="relatorios-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Valor</th>
                <th>Data e Hora</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {dados.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.cliente}</td>
                  <td>{item.valor}</td>
                  <td>{item.dataHora}</td>
                  <td>
                    <span className={`status ${getStatusClass(item.situacao)}`}>
                      {item.situacao}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="detalhes-btn"
                      onClick={() => handleDetalhes(item.id)}
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TabelaVendas;