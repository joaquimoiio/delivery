// src/pages/Home/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const handleCategoryClick = (categoryId) => {
    navigate(`/categoria/${categoryId}`);
  };

  return (
    <div className="home-page">
      <Navbar />
      
      <div className="home-content">
        <div className="hero-section">
          <h1>Praticidade que transforma sua rotina</h1>
          <p>Receba o que você precisa, onde estiver. Simples assim.</p>
        </div>

        <div className="categories-section">
          <h2>Categorias</h2>
          <div className="categories-grid">
            <div 
              className="category-card hamburgueria" 
              onClick={() => handleCategoryClick('hamburgueria')}
            >
              Hamburgueria
            </div>
            <div 
              className="category-card comida-japonesa" 
              onClick={() => handleCategoryClick('comida-japonesa')}
            >
              Comida Japonesa
            </div>
            <div 
              className="category-card pizzaria" 
              onClick={() => handleCategoryClick('pizzaria')}
            >
              Pizzaria
            </div>
            <div 
              className="category-card acai" 
              onClick={() => handleCategoryClick('acai')}
            >
              Açaí
            </div>
            <div 
              className="category-card bebidas" 
              onClick={() => handleCategoryClick('bebidas')}
            >
              Bebidas
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Home;
