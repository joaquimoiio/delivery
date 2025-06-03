import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProductModal from '../../components/ProductModal/ProductModal';
import SearchBar from '../../components/SearchBar/SearchBar';
import { useAuth } from '../../context/AuthContext';
import EmpresaService from '../../services/EmpresaService';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    
    loadStoreData(storeId);
  }, [storeId, isLoggedIn, navigate]);

  const loadStoreData = async (id) => {
    setIsLoading(true);
    try {
      const storeData = await EmpresaService.buscarEmpresaPorId(id);
      const productsData = await EmpresaService.buscarProdutosEmpresa(id);
      
      setStore(storeData);
      const productsArray = productsData || [];
      setProducts(productsArray);
      setFilteredProducts(productsArray);
    } catch (error) {
      console.error('Erro ao carregar dados da loja:', error);
      setStore(null);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleSearch = (term) => {
    setSearchTerm(term);
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
          <div className="search-container">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Buscar produtos..."
              initialValue={searchTerm}
            />
          </div>
        {/* Banner da Loja */}
        <div className="store-banner">
          <img 
            src={store.logoUrl || store.imagem || 'https://via.placeholder.com/800x200?text=Loja'} 
            alt={store.nome}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x200?text=Loja';
            }}
          />
          <div className="store-overlay">
            <div className="store-info-banner">
              <h1>{store.nome}</h1>
              <p>{store.descricao}</p>
              <div className="store-details-banner">
                <span className="store-rating">⭐ {store.avaliacao}</span>
                {store.tempoEntrega ? (
                  <span className="store-time">🕐 {store.tempoEntrega} min</span>
                ) : null}
                {store.taxaEntrega !== null && store.taxaEntrega !== undefined && !isNaN(store.taxaEntrega) ? (
                  <span className="store-fee">🚚 {formatPrice(store.taxaEntrega)}</span>
                ) : null}
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
            
                {filteredProducts.length > 0 ? (
                  <div className="products-grid">
                    {filteredProducts.map(product => (
                      <div key={product.id} className="product-card">
                        <div className="product-image">
                          <img 
                            src={product.imagemUrl || product.imagem || 'https://via.placeholder.com/300x200?text=Produto'} 
                            alt={product.nome}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200?text=Produto';
                            }}
                          />
                        </div>
                        
                        <div className="product-info">
                          <h3 className="product-name">{product.nome}</h3>
                          <p className="product-description">{product.descricao}</p>
                          <div className="product-price">{formatPrice(product.preco || product.valor)}</div>
                          
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
