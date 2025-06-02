import React, { useState, useEffect } from 'react';
import './Relatorio.css';

const Relatorio = () => {
  const [vendas, setVendas] = useState([]);
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAno, setFiltroAno] = useState('');
  const [estatisticas, setEstatisticas] = useState({
    totalGeral: 0,
    totalMes: 0,
    totalAno: 0,
    quantidadeVendasMes: 0,
    quantidadeVendasAno: 0
  });

  // Dados de exemplo - substitua pela sua API
  const vendasExemplo = [
    { id: 1, produto: 'Smartphone Samsung', valor: 1200.00, data: '2025-05-15', cliente: 'João Silva' },
    { id: 2, produto: 'Notebook Dell', valor: 2500.00, data: '2025-05-20', cliente: 'Maria Santos' },
    { id: 3, produto: 'Fone Bluetooth', valor: 150.00, data: '2025-04-10', cliente: 'Pedro Costa' },
    { id: 4, produto: 'Tablet iPad', valor: 1800.00, data: '2025-05-25', cliente: 'Ana Oliveira' },
    { id: 5, produto: 'Smartwatch', valor: 400.00, data: '2024-12-15', cliente: 'Carlos Lima' },
    { id: 6, produto: 'Câmera Digital', valor: 800.00, data: '2025-03-08', cliente: 'Lucia Ferreira' },
    { id: 7, produto: 'Monitor 4K', valor: 600.00, data: '2025-05-28', cliente: 'Roberto Alves' }
  ];

  useEffect(() => {
    setVendas(vendasExemplo);
    calcularEstatisticas(vendasExemplo);
  }, []);

  const calcularEstatisticas = (listaVendas) => {
    const agora = new Date();
    const mesAtual = agora.getMonth() + 1;
    const anoAtual = agora.getFullYear();

    let totalGeral = 0;
    let totalMes = 0;
    let totalAno = 0;
    let quantidadeVendasMes = 0;
    let quantidadeVendasAno = 0;

    listaVendas.forEach(venda => {
      const dataVenda = new Date(venda.data);
      const mesVenda = dataVenda.getMonth() + 1;
      const anoVenda = dataVenda.getFullYear();

      totalGeral += venda.valor;

      if (anoVenda === anoAtual) {
        totalAno += venda.valor;
        quantidadeVendasAno++;

        if (mesVenda === mesAtual) {
          totalMes += venda.valor;
          quantidadeVendasMes++;
        }
      }
    });

    setEstatisticas({
      totalGeral,
      totalMes,
      totalAno,
      quantidadeVendasMes,
      quantidadeVendasAno
    });
  };

  const filtrarVendas = () => {
    let vendasFiltradas = vendas;

    if (filtroMes) {
      vendasFiltradas = vendasFiltradas.filter(venda => {
        const dataVenda = new Date(venda.data);
        return dataVenda.getMonth() + 1 === parseInt(filtroMes);
      });
    }

    if (filtroAno) {
      vendasFiltradas = vendasFiltradas.filter(venda => {
        const dataVenda = new Date(venda.data);
        return dataVenda.getFullYear() === parseInt(filtroAno);
      });
    }

    return vendasFiltradas;
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const obterMesNome = (numeroMes) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[numeroMes - 1];
  };

  const vendasFiltradas = filtrarVendas();
  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  return (
    <div className="vendas-container">
      <div className="vendas-header">
        <h2>Relatório de Vendas</h2>
      </div>

      {/* Cards de Estatísticas */}
      <div className="estatisticas-cards">
        <div className="card total-geral">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Geral</h3>
            <p className="valor-principal">{formatarMoeda(estatisticas.totalGeral)}</p>
            <span className="descricao">Todas as vendas</span>
          </div>
        </div>

        <div className="card total-mes">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <h3>Vendas do Mês</h3>
            <p className="valor-principal">{formatarMoeda(estatisticas.totalMes)}</p>
            <span className="descricao">
              {obterMesNome(mesAtual)} {anoAtual} • {estatisticas.quantidadeVendasMes} vendas
            </span>
          </div>
        </div>

        <div className="card total-ano">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Vendas do Ano</h3>
            <p className="valor-principal">{formatarMoeda(estatisticas.totalAno)}</p>
            <span className="descricao">
              {anoAtual} • {estatisticas.quantidadeVendasAno} vendas
            </span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <h3>Filtrar Vendas</h3>
        <div className="filtros">
          <select 
            value={filtroMes} 
            onChange={(e) => setFiltroMes(e.target.value)}
            className="filtro-select"
          >
            <option value="">Todos os meses</option>
            {Array.from({length: 12}, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {obterMesNome(i + 1)}
              </option>
            ))}
          </select>

          <select 
            value={filtroAno} 
            onChange={(e) => setFiltroAno(e.target.value)}
            className="filtro-select"
          >
            <option value="">Todos os anos</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>

          <button 
            onClick={() => {setFiltroMes(''); setFiltroAno('');}}
            className="limpar-filtros"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Tabela de Vendas */}
      <div className="vendas-tabela">
        <h3>Lista de Vendas {vendasFiltradas.length !== vendas.length && '(Filtrada)'}</h3>
        
        {vendasFiltradas.length > 0 ? (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Produto</th>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {vendasFiltradas.map(venda => (
                  <tr key={venda.id}>
                    <td>#{venda.id}</td>
                    <td>{venda.produto}</td>
                    <td>{venda.cliente}</td>
                    <td>{formatarData(venda.data)}</td>
                    <td className="valor">{formatarMoeda(venda.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="resumo-filtrado">
              <strong>
                Total filtrado: {formatarMoeda(vendasFiltradas.reduce((sum, venda) => sum + venda.valor, 0))}
                {' '}• {vendasFiltradas.length} vendas
              </strong>
            </div>
          </div>
        ) : (
          <div className="sem-vendas">
            <p>Nenhuma venda encontrada para os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Relatorio;