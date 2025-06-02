import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StoreCard.css';

const StoreCard = ({ store, isLoggedIn }) => {
  const navigate = useNavigate();

  const handleStoreClick = () => {
    if (!isLoggedIn) {
      alert('Faça login para acessar as lojas');
      return;
    }
    
    // Navegar para a página da loja com seus produtos
    navigate(`/loja/${store.id}`);
  };

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : 'Novo';
  };

  const formatDeliveryTime = (time) => {
    return `${time} min`;
  };

  const formatDeliveryFee = (fee) => {
    if (fee === 0) return 'Grátis';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(fee);
  };

  return (
    <div className="store-card" onClick={handleStoreClick}>
      <div className="store-image">
        <img 
          src={store.imagem} 
          alt={store.nome}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Loja';
          }}
        />
        {store.promocao && (
          <div className="store-promotion">{store.promocao}</div>
        )}
      </div>
      
      <div className="store-info">
        <h3 className="store-name">{store.nome}</h3>
        <p className="store-description">{store.descricao}</p>
        
        <div className="store-details">
          <div className="store-rating">
            <span className="rating-star">⭐</span>
            <span>{formatRating(store.avaliacao)}</span>
          </div>
          
          <div className="store-delivery-info">
            <span className="delivery-time">{formatDeliveryTime(store.tempoEntrega)}</span>
            <span className="delivery-fee">Taxa: {formatDeliveryFee(store.taxaEntrega)}</span>
          </div>
        </div>
        
        {store.cupom && (
          <div className="store-coupon">
            🎫 {store.cupom}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreCard;
