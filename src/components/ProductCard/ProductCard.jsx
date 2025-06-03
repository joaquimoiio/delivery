import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, isLoggedIn }) => {
  const navigate = useNavigate();

  const handleStoreClick = () => {
    if (!isLoggedIn) {
      alert('Faça login para ver mais detalhes da loja');
      return;
    }
    
    // Check both empresa.id and empresaId since the API might return either format
    const storeId = product.empresa?.id || product.empresaId;
    if (storeId) {
      navigate(`/loja/${storeId}`);
    } else {
      console.error('ID da loja não encontrado no produto:', product);
      alert('Não foi possível encontrar a loja deste produto');
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'Consulte o preço';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const defaultImage = 'https://via.placeholder.com/300x200?text=Imagem+não+disponível';

  return (
    <div className="product-card">
      <div className="product-image">
        <img 
          src={product.imagemUrl ? product.imagemUrl : defaultImage} 
          alt={product.nome}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultImage;
          }}
        />
        
        {/* Preço em destaque */}
        {product.preco && (
          <div className="product-price-badge">
            {formatPrice(product.preco)}
          </div>
        )}

        {/* Promoção se houver */}
        {product.promocao && (
          <div className="product-promotion">{product.promocao}</div>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.nome}</h3>
        
        {/* Descrição do produto */}
        {product.descricao && (
          <p className="product-description">
            {product.descricao.length > 100 
              ? `${product.descricao.substring(0, 100)}...` 
              : product.descricao
            }
          </p>
        )}

        {/* Categoria do produto */}
        {product.categoria && (
          <div className="product-category">
            <span className="category-tag">
              {typeof product.categoria === 'string' 
                ? product.categoria.replace('_', ' ').replace('-', ' ')
                : product.categoria.nome || 'Categoria'}
            </span>
          </div>
        )}

        {product.empresa && (
          <div className="product-store-info">
            <div className="store-name">{product.empresa.nome}</div>
            {product.empresa.avaliacao && (
              <div className="store-rating">
                <span className="rating-star">★</span>
                {product.empresa.avaliacao.toFixed(1)}
              </div>
            )}
            <div className={`store-status ${product.empresa.aberto ? 'open' : 'closed'}`}>
              {product.empresa.aberto ? 'Aberto' : 'Fechado'}
            </div>
          </div>
        )}

        <div className="product-action">
          <button 
            className="view-store-btn"
            onClick={handleStoreClick}
          >
            Ir para Loja
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
