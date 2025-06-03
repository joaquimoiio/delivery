import React, { useState, useEffect } from 'react';
import PedidoService from '../../../../services/PedidoService';
import './TabelaVendas.css';

const TabelaVendas = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('');

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await PedidoService.listarPedidosEmpresa();
      const pedidosProcessados = (response.content || response || []).map(pedido => ({
        ...pedido,
        cliente: pedido.cliente || { nome: 'Cliente não identificado' }
      }));
      setPedidos(pedidosProcessados);
    } catch (err) {
      setError('Erro ao carregar pedidos');
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarEntregue = async (pedidoId) => {
    try {
      await PedidoService.marcarComoEntregue(pedidoId);
      alert('Pedido marcado como entregue! O cliente receberá uma notificação para avaliar.');
      carregarPedidos(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao marcar pedido como entregue:', error);
      alert('Erro ao marcar pedido como entregue');
    }
  };

  const handleDetalhes = (pedido) => {
    const itens = pedido.itens?.map(item => 
      `${item.quantidade}x ${item.produto.nome} - ${formatarMoeda(item.preco)}`
    ).join('\n') || 'Sem itens';

    alert(`Detalhes do pedido:
ID: ${pedido.id}
Cliente: ${pedido.cliente?.nome || 'Cliente não identificado'}
Status: ${getStatusText(pedido.status)}
Total: ${formatarMoeda(pedido.total)}
Data: ${formatarData(pedido.dataHora)}

Itens:
${itens}`);
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'entregue':
      case 'concluido':
        return 'concluido';
      case 'pendente':
      case 'preparando':
        return 'pendente';
      case 'cancelado':
        return 'cancelado';
      case 'a_caminho':
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
        return 'A Caminho';
      case 'entregue':
        return 'Entregue';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status || 'Desconhecido';
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarData = (dataHora) => {
    if (!dataHora) return 'N/A';
    return new Date(dataHora).toLocaleString('pt-BR');
  };

  const pedidosFiltrados = filtroStatus 
    ? pedidos.filter(pedido => pedido.status?.toLowerCase() === filtroStatus.toLowerCase())
    : pedidos;

  const podeMarcarEntregue = (status) => {
    return status?.toLowerCase() === 'preparando' || status?.toLowerCase() === 'a_caminho';
  };

  if (loading) {
    return (
      <div className="tabela-relatorios">
        <div className="tabela-header">
          <h2>Pedidos e Vendas</h2>
        </div>
        <div className="loading">Carregando pedidos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tabela-relatorios">
        <div className="tabela-header">
          <h2>Pedidos e Vendas</h2>
        </div>
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
    <div className="tabela-relatorios">
      <div className="tabela-header">
        <h2>Pedidos e Vendas</h2>
        <button onClick={carregarPedidos} className="refresh-btn">
          🔄 Atualizar
        </button>
      </div>

      <div className="filtros">
        <select 
          value={filtroStatus} 
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="filtro-select"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="preparando">Preparando</option>
          <option value="a_caminho">A Caminho</option>
          <option value="entregue">Entregue</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>
      
      <div className="tabela-content">
        {pedidosFiltrados.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="relatorios-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Data e Hora</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map(pedido => (
                  <tr key={pedido.id}>
                    <td>#{pedido.id}</td>
                    <td>{pedido.cliente?.nome || 'Cliente não identificado'}</td>
                    <td>{formatarMoeda(pedido.total)}</td>
                    <td>{formatarData(pedido.dataHora)}</td>
                    <td>
                      <span className={`status ${getStatusClass(pedido.status)}`}>
                        {getStatusText(pedido.status)}
                      </span>
                    </td>
                    <td>
                      <div className="acoes">
                        <button 
                          className="detalhes-btn"
                          onClick={() => handleDetalhes(pedido)}
                          title="Ver detalhes do pedido"
                        >
                          👁️ Detalhes
                        </button>
                        {podeMarcarEntregue(pedido.status) && (
                          <button 
                            className="entregar-btn"
                            onClick={() => handleMarcarEntregue(pedido.id)}
                            title="Marcar como entregue"
                          >
                            ✅ Entregar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="resumo">
        <div className="resumo-item">
          <span>Total de Pedidos:</span>
          <span>{pedidosFiltrados.length}</span>
        </div>
        <div className="resumo-item">
          <span>Valor Total:</span>
          <span>{formatarMoeda(pedidosFiltrados.reduce((sum, pedido) => sum + (pedido.total || 0), 0))}</span>
        </div>
      </div>
    </div>
  );
};

export default TabelaVendas;
