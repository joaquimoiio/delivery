// src/components/StoreList/StoreList.jsx
import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './StoreList.css';

const StoreList = ({ 
  stores, 
  loading, 
  error, 
  onLoadMore, 
  hasMore, 
  totalElements,
  emptyMessage = "Nenhuma loja encontrada" 
}) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const observerRef = useRef();
  const loadingRef = useRef();

  // Intersection Observer para scroll infinito
  const lastStoreElementRef = useCallback(node => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && onLoadMore) {
        onLoadMore();
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, onLoadMore]);

  const handleStoreClick = (store) => {
    if (!isLoggedIn) {
      alert('Faça login para acessar as lojas');
      navigate('/cadastro');
      return;
    }
    
    navigate(`/loja/${store.id}`);
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatRating = (rating) => {
    if (!rating) return 'Novo';
    return rating.toFixed(1);
  };

  const formatDeliveryTime = (time) => {
    if (!time) return 'N/A';
    return `${time} min`;
  };

  const getStatusClass = (isOpen) => {
    return isOpen ? 'open' : 'closed';
  };

  const getDistanceText = (distance) => {
    if (!distance) return null;
    return distance < 1 ? 
      `${(distance * 1000).toFixed(0)}m` : 
      `${distance.toFixed(1)}km`;
  };

  if (error) {
    return (
      <div className="store-list-error">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <h3>Erro ao carregar lojas</h3>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!loading && stores.length === 0) {
    return (
      <div className="store-list-empty">
        <div className="empty-content">
          <span className="empty-icon">🔍</span>
          <h3>Nenhuma loja encontrada</h3>
          <p>{emptyMessage}</p>
          <p className="empty-suggestion">
            Tente ajustar os filtros ou buscar por outro termo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="store-list">
      {/* Header com total de resultados */}
      {totalElements > 0 && (
        <div className="store-list-header">
          <p className="results-count">
            {totalElements} {totalElements === 1 ? 'loja encontrada' : 'lojas encontradas'}
          </p>
        </div>
      )}

      {/* Grid de lojas */}
      <div className="store-grid">
        {stores.map((store, index) => {
          const isLast = index === stores.length - 1;
          
          return (
            <div
              key={store.id}
              ref={isLast ? lastStoreElementRef : null}
              className="store-card"
              onClick={() => handleStoreClick(store)}
            >
              {/* Status da loja */}
              <div className={`store-status ${getStatusClass(store.aberto)}`}>
                {store.aberto ? 'Aberto' : 'Fechado'}
              </div>

              {/* Promoção */}
              {store.promocaoAtiva && (
                <div className="store-promotion">
                  {store.promocaoAtiva}
                </div>
              )}

              {/* Imagem da loja */}
              <div className="store-image">
                <img 
                  src={store.dsAvatar || 'https://via.placeholder.com/300x180?text=Loja'} 
                  alt={store.nmUsuario}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x180?text=Loja';
                  }}
                />
                
                {/* Distância */}
                {store.distanciaKm && (
                  <div className="store-distance">
                    📍 {getDistanceText(store.distanciaKm)}
                  </div>
                )}
              </div>

              {/* Informações da loja */}
              <div className="store-info">
                <h3 className="store-name">{store.nmUsuario}</h3>
                
                {/* Categorias */}
                {store.categorias && store.categorias.length > 0 && (
                  <div className="store-categories">
                    {store.categorias.slice(0, 3).map(categoria => (
                      <span key={categoria} className="category-tag">
                        {categoria.replace('_', ' ')}
                      </span>
                    ))}
                    {store.categorias.length > 3 && (
                      <span className="category-more">
                        +{store.categorias.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Produto destaque */}
                {store.produtoDestaque && (
                  <p className="store-highlight">
                    {store.produtoDestaque} - {formatPrice(store.precoDestaque)}
                  </p>
                )}

                {/* Métricas */}
                <div className="store-metrics">
                  <div className="metric-item">
                    <span className="metric-icon">⭐</span>
                    <span className="metric-value">{formatRating(store.avaliacao)}</span>
                    {store.totalAvaliacoes && (
                      <span className="metric-detail">({store.totalAvaliacoes})</span>
                    )}
                  </div>

                  <div className="metric-item">
                    <span className="metric-icon">🕐</span>
                    <span className="metric-value">{formatDeliveryTime(store.tempoEntregaMinutos)}</span>
                  </div>

                  <div className="metric-item">
                    <span className="metric-icon">🚚</span>
                    <span className="metric-value">
                      {store.entregaGratis ? 'Grátis' : formatPrice(store.taxaEntrega)}
                    </span>
                  </div>
                </div>

                {/* Cupom de desconto */}
                {store.cupomDesconto && (
                  <div className="store-coupon">
                    🎫 {store.cupomDesconto}
                  </div>
                )}

                {/* Tags adicionais */}
                <div className="store-tags">
                  {store.entregaGratis && (
                    <span className="tag tag-delivery">Entrega Grátis</span>
                  )}
                  {store.promocaoAtiva && (
                    <span className="tag tag-promo">Promoção</span>
                  )}
                  {store.totalProdutos && (
                    <span className="tag tag-info">
                      {store.totalProdutos} produtos
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading para scroll infinito */}
      {loading && (
        <div className="store-list-loading" ref={loadingRef}>
          <div className="loading-spinner"></div>
          <p>Carregando mais lojas...</p>
        </div>
      )}

      {/* Fim da lista */}
      {!loading && !hasMore && stores.length > 0 && (
        <div className="store-list-end">
          <p>Todas as lojas foram carregadas</p>
        </div>
      )}
    </div>
  );
};

export default StoreList;