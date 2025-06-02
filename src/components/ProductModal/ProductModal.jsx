import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductModal.css';

const ProductModal = ({ product, isOpen, onClose, storeId }) => {
  const [quantity, setQuantity] = useState(1);
  const [observacao, setObservacao] = useState('');
  const navigate = useNavigate();

  if (!isOpen || !product) return null;

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleBuyNow = () => {
    const orderData = {
      product,
      quantity,
      observacao,
      storeId,
      total: product.valor * quantity
    };
    
    localStorage.setItem('currentOrder', JSON.stringify(orderData));
    navigate('/pagamento');
    onClose();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Finalizar Pedido</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="product-image-modal">
            <img 
              src={product.imagem} 
              alt={product.nome}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x200?text=Produto';
              }}
            />
          </div>
          
          <div className="product-details-modal">
            <h3>{product.nome}</h3>
            <p className="product-description-modal">{product.descricao}</p>
            <div className="product-price-modal">{formatPrice(product.valor)}</div>
            
            <div className="quantity-section">
              <label>Quantidade:</label>
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="observation-section">
              <label>Observações:</label>
              <textarea
                className="observation-input"
                placeholder="Alguma observação especial? (Ex: sem cebola, ponto da carne, etc.)"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                maxLength={200}
                rows={3}
              />
              <div className="char-counter">
                {observacao.length}/200 caracteres
              </div>
            </div>
            
            <div className="total-section">
              <strong>Total: {formatPrice(product.valor * quantity)}</strong>
            </div>
            
            <button className="buy-now-btn" onClick={handleBuyNow}>
              Comprar Agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
