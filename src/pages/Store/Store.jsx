import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProductModal from '../../components/ProductModal/ProductModal';
import { useAuth } from '../../context/AuthContext';
import './Store.css';

const Store = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    
    loadStoreData(storeId);
  }, [storeId, isLoggedIn, navigate]);

  const loadStoreData = async (id) => {
    setIsLoading(true);
    
    // Simular delay de carregamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Dados da loja baseados no ID
    const storeData = {
      1: {
        id: 1,
        nome: 'Açaí do João',
        descricao: 'Os melhores açaís da região com frutas frescas',
        imagem: 'https://via.placeholder.com/800x300/8e24aa/ffffff?text=Açaí+do+João',
        avaliacao: 4.8,
        tempoEntrega: 25,
        taxaEntrega: 3.99,
        endereco: 'Rua das Flores, 123 - Centro',
        categoria: 'acai'
      },
      2: {
        id: 2,
        nome: 'Açaí Premium',
        descricao: 'Açaí artesanal com ingredientes selecionados',
        imagem: 'https://via.placeholder.com/800x300/8e24aa/ffffff?text=Açaí+Premium',
        avaliacao: 4.9,
        tempoEntrega: 30,
        taxaEntrega: 0,
        endereco: 'Av. Principal, 456 - Centro',
        categoria: 'acai'
      },
      5: {
        id: 5,
        nome: 'Burger House',
        descricao: 'Hambúrgueres artesanais com ingredientes frescos',
        imagem: 'https://via.placeholder.com/800x300/ff8c00/ffffff?text=Burger+House',
        avaliacao: 4.9,
        tempoEntrega: 35,
        taxaEntrega: 5.99,
        endereco: 'Rua dos Sabores, 789 - Centro',
        categoria: 'hamburgueria'
      }
    };

    // Produtos baseados na loja
    const productsData = {
      1: [ // Açaí do João
        {
          id: 1,
          nome: 'Açaí 300ml',
          descricao: 'Açaí cremoso tradicional com granola crocante',
          valor: 12.90,
          imagem: 'https://via.placeholder.com/300x200/8e24aa/ffffff?text=Açaí+300ml',
          categoria: 'acai'
        },
        {
          id: 2,
          nome: 'Açaí 500ml',
          descricao: 'Açaí cremoso com granola, banana e mel',
          valor: 18.90,
          imagem: 'https://via.placeholder.com/300x200/8e24aa/ffffff?text=Açaí+500ml',
          categoria: 'acai'
        },
        {
          id: 3,
          nome: 'Açaí 700ml',
          descricao: 'Açaí cremoso com frutas variadas e complementos',
          valor: 24.90,
          imagem: 'https://via.placeholder.com/300x200/8e24aa/ffffff?text=Açaí+700ml',
          categoria: 'acai'
        },
        {
          id: 4,
          nome: 'Açaí Premium 500ml',
          descricao: 'Açaí especial com frutas premium e castanhas',
          valor: 28.90,
          imagem: 'https://via.placeholder.com/300x200/8e24aa/ffffff?text=Açaí+Premium',
          categoria: 'acai'
        }
      ],
      2: [ // Açaí Premium
        {
          id: 5,
          nome: 'Açaí Gourmet 400ml',
          descricao: 'Açaí premium com frutas orgânicas',
          valor: 22.90,
          imagem: 'https://via.placeholder.com/300x200/8e24aa/ffffff?text=Açaí+Gourmet',
          categoria: 'acai'
        },
        {
          id: 6,
          nome: 'Açaí Especial 600ml',
          descricao: 'Açaí com ingredientes especiais e superfoods',
          valor: 32.90,
          imagem: 'https://via.placeholder.com/300x200/8e24aa/ffffff?text=Açaí+Especial',
          categoria: 'acai'
        }
      ],
      5: [ // Burger House
        {
          id: 7,
          nome: 'X-Burger Clássico',
          descricao: 'Hambúrguer artesanal com queijo, alface e tomate',
          valor: 25.90,
          imagem: 'https://via.placeholder.com/300x200/ff8c00/ffffff?text=X-Burger',
          categoria: 'hamburgueria'
        },
        {
          id: 8,
          nome: 'X-Bacon Duplo',
          descricao: 'Dois hambúrgueres, bacon crocante e queijo',
          valor: 32.90,
          imagem: 'https://via.placeholder.com/300x200/ff8c00/ffffff?text=X-Bacon',
          categoria: 'hamburgueria'
        }
      ]
    };

    const currentStore = storeData[id];
    const currentProducts = productsData[id] || [];

    setStore(currentStore);
    setProducts(currentProducts);
    setIsLoading(false);
  };

  const handleBuyClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="store-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando loja...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="store-page">
        <Navbar />
        <div className="error-container">
          <h2>Loja não encontrada</h2>
          <button onClick={() => navigate('/')}>Voltar ao início</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="store-page">
      <Navbar />
      
      <div className="store-content">
        {/* Banner da Loja */}
        <div className="store-banner">
          <img src={store.imagem} alt={store.nome} />
          <div className="store-overlay">
            <div className="store-info-banner">
              <h1>{store.nome}</h1>
              <p>{store.descricao}</p>
              <div className="store-details-banner">
                <span className="store-rating">⭐ {store.avaliacao}</span>
                <span className="store-time">🕐 {store.tempoEntrega} min</span>
                <span className="store-fee">🚚 {formatPrice(store.taxaEntrega)}</span>
              </div>
              <div className="store-address">
                📍 {store.endereco}
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Produtos */}
        <div className="store-products-section">
          <div className="products-container">
            <h2>Cardápio</h2>
            
            {products.length > 0 ? (
              <div className="products-grid">
                {products.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      <img 
                        src={product.imagem} 
                        alt={product.nome}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=Produto';
                        }}
                      />
                    </div>
                    
                    <div className="product-info">
                      <h3 className="product-name">{product.nome}</h3>
                      <p className="product-description">{product.descricao}</p>
                      <div className="product-price">{formatPrice(product.valor)}</div>
                      
                      <button 
                        className="buy-now-btn"
                        onClick={() => handleBuyClick(product)}
                      >
                        Comprar Agora
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-products">
                <p>Nenhum produto disponível no momento.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Compra */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        storeId={storeId}
      />
      
      <Footer />
    </div>
  );
};

export default Store;
