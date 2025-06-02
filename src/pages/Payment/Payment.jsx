import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import MapSelector from './MapSelector/MapSelector';
import { useAuth } from '../../context/AuthContext';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [orderData, setOrderData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    endereco: '',
    nuLatitude: '',
    nuLongitude: ''
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    const savedOrder = localStorage.getItem('currentOrder');
    if (!savedOrder) {
      navigate('/');
      return;
    }

    setOrderData(JSON.parse(savedOrder));
  }, [isLoggedIn, navigate]);

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleOpenMap = () => {
    setIsMapOpen(true);
  };

  const handleSelectCoordinates = (coordinatesData) => {
    setDeliveryData({
      endereco: coordinatesData.address || 'Endereço selecionado no mapa',
      nuLatitude: coordinatesData.latitude,
      nuLongitude: coordinatesData.longitude
    });
    setIsMapOpen(false);
  };

  const handleCoordinateChange = (field, value) => {
    const coordenadaRegex = /^-?\d*\.?\d*$/;
    if (value !== '' && !coordenadaRegex.test(value)) {
      return;
    }

    setDeliveryData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFinalizePurchase = () => {
    if (!paymentMethod) {
      alert('Selecione uma forma de pagamento');
      return;
    }

    if (!deliveryData.nuLatitude || !deliveryData.nuLongitude) {
      alert('Informe as coordenadas de entrega');
      return;
    }

    const lat = parseFloat(deliveryData.nuLatitude);
    const lng = parseFloat(deliveryData.nuLongitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      alert('Latitude deve estar entre -90 e 90');
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      alert('Longitude deve estar entre -180 e 180');
      return;
    }

    const finalOrder = {
      ...orderData,
      paymentMethod,
      delivery: deliveryData,
      orderId: Date.now(),
      status: 'Confirmado'
    };

    console.log('Pedido finalizado:', finalOrder);
    localStorage.removeItem('currentOrder');
    alert('Pedido realizado com sucesso!');
    navigate('/');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (!orderData) {
    return (
      <div className="payment-page">
        <Navbar />
        <div className="payment-content">
          <div className="payment-container">
            <h1>Carregando...</h1>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="payment-page">
      <Navbar />
      <div className="payment-content">
        <div className="payment-container">
          <h1>Finalizar Pedido</h1>

          <div className="order-summary">
            <h2>Resumo do Pedido</h2>
            <div className="order-item">
              <img src={orderData.product.imagem} alt={orderData.product.nome} />
              <div className="item-details">
                <h3>{orderData.product.nome}</h3>
                <p>Quantidade: {orderData.quantity}</p>
                <p>Preço unitário: {formatPrice(orderData.product.valor)}</p>
                {orderData.observacao && (
                  <div className="observation">
                    <strong>Observação:</strong> {orderData.observacao}
                  </div>
                )}
                <p className="total-price">Total: {formatPrice(orderData.total)}</p>
              </div>
            </div>
          </div>

          <div className="delivery-section">
            <h2>Dados de Entrega</h2>
            <div className="address-input-group">
              <input
                type="text"
                className="address-input"
                placeholder="Endereço de entrega"
                value={deliveryData.endereco}
                onChange={(e) => setDeliveryData(prev => ({ ...prev, endereco: e.target.value }))}
              />
              <button className="map-btn" onClick={handleOpenMap}>
                📍 Selecionar no Mapa
              </button>
            </div>

            <div className="coordinates-section">
              <h4>Coordenadas de Entrega</h4>
              <div className="coordinates-grid">
                <div className="coordinate-field">
                  <label>Latitude:</label>
                  <input
                    type="text"
                    className="coordinate-input"
                    value={deliveryData.nuLatitude}
                    onChange={(e) => handleCoordinateChange('nuLatitude', e.target.value)}
                    placeholder="-23.5505"
                  />
                  <span className="coordinate-help">Entre -90 e 90</span>
                </div>
                <div className="coordinate-field">
                  <label>Longitude:</label>
                  <input
                    type="text"
                    className="coordinate-input"
                    value={deliveryData.nuLongitude}
                    onChange={(e) => handleCoordinateChange('nuLongitude', e.target.value)}
                    placeholder="-46.6333"
                  />
                  <span className="coordinate-help">Entre -180 e 180</span>
                </div>
              </div>
            </div>
          </div>

          <div className="payment-methods">
            <h2>Forma de Pagamento</h2>
            <div className="payment-options">
              <div
                className={`payment-option ${paymentMethod === 'pix' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('pix')}
              >
                <input
                  type="radio"
                  name="payment"
                  value="pix"
                  checked={paymentMethod === 'pix'}
                  onChange={() => handlePaymentMethodChange('pix')}
                />
                <div className="payment-info">
                  <span className="payment-icon">📱</span>
                  PIX
                </div>
              </div>

              <div
                className={`payment-option ${paymentMethod === 'cartao' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('cartao')}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cartao"
                  checked={paymentMethod === 'cartao'}
                  onChange={() => handlePaymentMethodChange('cartao')}
                />
                <div className="payment-info">
                  <span className="payment-icon">💳</span>
                  Cartão de Crédito/Débito
                </div>
              </div>

              <div
                className={`payment-option ${paymentMethod === 'dinheiro' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('dinheiro')}
              >
                <input
                  type="radio"
                  name="payment"
                  value="dinheiro"
                  checked={paymentMethod === 'dinheiro'}
                  onChange={() => handlePaymentMethodChange('dinheiro')}
                />
                <div className="payment-info">
                  <span className="payment-icon">💰</span>
                  Dinheiro
                </div>
              </div>
            </div>
          </div>

          <button className="finalize-btn" onClick={handleFinalizePurchase}>
            Finalizar Pedido - {formatPrice(orderData.total)}
          </button>
        </div>
      </div>

      <MapSelector
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelectCoordinates={handleSelectCoordinates}
      />

      <Footer />
    </div>
  );
};

export default Payment;
