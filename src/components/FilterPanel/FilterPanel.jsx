// src/components/FilterPanel/FilterPanel.jsx - Versão Compacta
import React, { useState } from 'react';
import './FilterPanel.css';

const FilterPanel = ({ filtros, onFiltroChange, onLimparFiltros, isOpen, onToggle }) => {
  const [faixaPreco, setFaixaPreco] = useState([
    filtros.precoMinimo || 0,
    filtros.precoMaximo || 100
  ]);

  const categorias = [
    { id: 'hamburgueria', nome: 'Burger', icon: '🍔' },
    { id: 'pizzaria', nome: 'Pizza', icon: '🍕' },
    { id: 'comida-japonesa', nome: 'Japonês', icon: '🍱' },
    { id: 'acai', nome: 'Açaí', icon: '🍇' },
    { id: 'bebidas', nome: 'Bebidas', icon: '🥤' }
  ];

  const opcoesOrdenacao = [
    { value: 'distancia', label: 'Distância' },
    { value: 'avaliacao', label: 'Avaliação' },
    { value: 'tempo_entrega', label: 'Tempo' },
    { value: 'taxa_entrega', label: 'Taxa' },
    { value: 'alfabetico', label: 'A-Z' }
  ];

  const handlePrecoChange = (tipo, valor) => {
    const novaFaixa = [...faixaPreco];
    if (tipo === 'min') {
      novaFaixa[0] = Math.max(0, Math.min(valor, novaFaixa[1]));
    } else {
      novaFaixa[1] = Math.max(novaFaixa[0], valor);
    }
    setFaixaPreco(novaFaixa);
    onFiltroChange('precoMinimo', novaFaixa[0] || null);
    onFiltroChange('precoMaximo', novaFaixa[1] || null);
  };

  const handleCategoriaChange = (categoriaId) => {
    const novaCategoria = filtros.categoria === categoriaId ? '' : categoriaId;
    onFiltroChange('categoria', novaCategoria);
  };

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.categoria) count++;
    if (filtros.precoMinimo || filtros.precoMaximo) count++;
    if (filtros.avaliacaoMinima) count++;
    if (filtros.taxaEntregaMaxima) count++;
    if (filtros.tempoEntregaMaximo) count++;
    if (filtros.entregaGratis) count++;
    if (filtros.apenasComPromocao) count++;
    if (!filtros.apenasAbertos) count++;
    return count;
  };

  const filtrosAtivos = contarFiltrosAtivos();

  return (
    <>
      {/* Botão de toggle para mobile */}
      <button className="filter-toggle" onClick={onToggle}>
        <span className="filter-icon">⚙️</span>
        <span>Filtros</span>
        {filtrosAtivos > 0 && (
          <span className="filter-badge">{filtrosAtivos}</span>
        )}
      </button>

      {/* Overlay para mobile */}
      {isOpen && <div className="filter-overlay" onClick={onToggle}></div>}

      {/* Painel de filtros */}
      <div className={`filter-panel ${isOpen ? 'open' : ''}`}>
        <div className="filter-header">
          <h3>Filtros</h3>
          <div className="filter-header-actions">
            {filtrosAtivos > 0 && (
              <button className="clear-filters-btn" onClick={onLimparFiltros}>
                Limpar ({filtrosAtivos})
              </button>
            )}
            <button className="close-filters" onClick={onToggle}>✕</button>
          </div>
        </div>

        <div className="filter-content">
          
          {/* Categorias - Layout Grid Compacto */}
          <div className="filter-section">
            <h4>Categoria</h4>
            <div className="category-filters">
              {categorias.map(categoria => (
                <button
                  key={categoria.id}
                  className={`category-filter-btn ${filtros.categoria === categoria.id ? 'active' : ''}`}
                  onClick={() => handleCategoriaChange(categoria.id)}
                >
                  <span className="category-icon">{categoria.icon}</span>
                  <span className="category-name">{categoria.nome}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Faixa de Preço - Layout Compacto */}
          <div className="filter-section">
            <h4>Preço (R$)</h4>
            <div className="price-range">
              <div className="price-inputs">
                <div className="price-input-group">
                  <label>Min</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={faixaPreco[0]}
                    onChange={(e) => handlePrecoChange('min', Number(e.target.value))}
                    className="price-input"
                    placeholder="0"
                  />
                </div>
                <div className="price-separator">até</div>
                <div className="price-input-group">
                  <label>Max</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={faixaPreco[1]}
                    onChange={(e) => handlePrecoChange('max', Number(e.target.value))}
                    className="price-input"
                    placeholder="100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Avaliação - Layout Horizontal */}
          <div className="filter-section">
            <h4>Avaliação</h4>
            <div className="rating-filters">
              {[4, 4.5, 5].map(rating => (
                <button
                  key={rating}
                  className={`rating-filter-btn ${filtros.avaliacaoMinima === rating ? 'active' : ''}`}
                  onClick={() => onFiltroChange('avaliacaoMinima', 
                    filtros.avaliacaoMinima === rating ? null : rating)}
                >
                  <span className="stars">
                    {'⭐'.repeat(Math.floor(rating))}
                    {rating % 1 !== 0 && '✨'}
                  </span>
                  <span>{rating}+</span>
                </button>
              ))}
            </div>
          </div>

          {/* Entrega */}
          <div className="filter-section">
            <h4>Entrega</h4>
            <div className="delivery-filters">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filtros.entregaGratis}
                  onChange={(e) => onFiltroChange('entregaGratis', e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                <span>Entrega Grátis</span>
              </label>
              
              <div className="input-group">
                <label>Taxa máx (R$)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={filtros.taxaEntregaMaxima || ''}
                  onChange={(e) => onFiltroChange('taxaEntregaMaxima', 
                    e.target.value ? Number(e.target.value) : null)}
                  className="filter-input"
                  placeholder="10"
                />
              </div>

              <div className="input-group">
                <label>Tempo máx (min)</label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  step="5"
                  value={filtros.tempoEntregaMaximo || ''}
                  onChange={(e) => onFiltroChange('tempoEntregaMaximo', 
                    e.target.value ? Number(e.target.value) : null)}
                  className="filter-input"
                  placeholder="60"
                />
              </div>
            </div>
          </div>

          {/* Outros Filtros */}
          <div className="filter-section">
            <h4>Outros</h4>
            <div className="other-filters">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filtros.apenasAbertos}
                  onChange={(e) => onFiltroChange('apenasAbertos', e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                <span>Apenas Abertos</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filtros.apenasComPromocao}
                  onChange={(e) => onFiltroChange('apenasComPromocao', e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                <span>Com Promoção</span>
              </label>
            </div>
          </div>

          {/* Ordenação */}
          <div className="filter-section">
            <h4>Ordenar</h4>
            <div className="sort-options">
              <select
                value={filtros.ordenarPor}
                onChange={(e) => onFiltroChange('ordenarPor', e.target.value)}
                className="sort-select"
              >
                {opcoesOrdenacao.map(opcao => (
                  <option key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </option>
                ))}
              </select>

              <div className="sort-direction">
                <button
                  className={`sort-direction-btn ${filtros.direcao === 'asc' ? 'active' : ''}`}
                  onClick={() => onFiltroChange('direcao', 'asc')}
                >
                  ↑ Crescente
                </button>
                <button
                  className={`sort-direction-btn ${filtros.direcao === 'desc' ? 'active' : ''}`}
                  onClick={() => onFiltroChange('direcao', 'desc')}
                >
                  ↓ Decrescente
                </button>
              </div>
            </div>
          </div>

          {/* Raio de Busca */}
          <div className="filter-section">
            <h4>Distância</h4>
            <div className="radius-filter">
              <input
                type="range"
                min="1"
                max="50"
                value={filtros.raioMaximoKm}
                onChange={(e) => onFiltroChange('raioMaximoKm', Number(e.target.value))}
                className="radius-slider"
              />
              <div className="radius-value">
                {filtros.raioMaximoKm} km
              </div>
            </div>
          </div>

        </div>

        {/* Botão de aplicar para mobile */}
        <div className="filter-footer">
          <button className="apply-filters-btn" onClick={onToggle}>
            Aplicar Filtros
            {filtrosAtivos > 0 && ` (${filtrosAtivos})`}
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;