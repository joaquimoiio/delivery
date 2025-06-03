import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProductCard from '../../components/ProductCard/ProductCard';
import { categoryConfig } from '../../utils/categoryConfig';
import { useAuth } from '../../context/AuthContext';
import CategoriaService from '../../services/CategoriaService';
import './Category.css';

const Category = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroOrdem, setFiltroOrdem] = useState('');
  
  const categoryInfo = categoryConfig[categoryId];

  useEffect(() => {
    if (!categoryInfo) {
      navigate('/');
      return;
    }

    document.title = `${categoryInfo.name} - Delivery App`;
    loadCategoryProducts(categoryId);
  }, [categoryId, categoryInfo, navigate]);

  const loadCategoryProducts = async (category) => {
    try {
      setIsLoading(true);
      const data = await CategoriaService.listarProdutosPorCategoria(category);
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sortProducts = (products, ordem) => {
    const productsCopy = [...products];
    
    switch(ordem) {
      case 'preco':
        return productsCopy.sort((a, b) => (a.preco || 0) - (b.preco || 0));
      case 'alfabetica':
        return productsCopy.sort((a, b) => a.nome.localeCompare(b.nome));
      default:
        return productsCopy;
    }
  };

  const produtosFiltrados = sortProducts(products, filtroOrdem);

  if (!categoryInfo) {
    return null;
  }

  return (
    <div className="category-page">
      <Navbar />
      
      <div className="category-content">
        <div 
          className="category-header"
          style={{ background: categoryInfo.gradient }}
        >
          <div className="category-header-content">
            <span className="category-icon">{categoryInfo.icon}</span>
            <h1>{categoryInfo.name}</h1>
            <p>Descubra os melhores produtos da categoria</p>
          </div>
        </div>

        <div className="stores-section">
          <div className="stores-container">
            <div className="stores-header">
              <h2>Produtos Disponíveis</h2>
              
              <div className="stores-filters">
                <select 
                  value={filtroOrdem} 
                  onChange={(e) => setFiltroOrdem(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Ordenar por</option>
                  <option value="preco">Menor preço</option>
                  <option value="alfabetica">A-Z</option>
                </select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="loading-stores">
                <div className="loading-spinner"></div>
                <p>Carregando produtos...</p>
              </div>
            ) : produtosFiltrados.length > 0 ? (
              <div className="stores-grid">
                {produtosFiltrados.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            ) : (
              <div className="no-stores">
                <p>Nenhum produto encontrado nesta categoria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Category;
