import React from 'react';
import ProductCard from '../ProductCard/ProductCard';
import './ProductList.css';

const ProductList = ({ products, isLoggedIn }) => {
  if (!products || products.length === 0) {
    return (
      <div className="no-products">
        <p>Nenhum produto disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map(product => (
        <ProductCard 
          key={product.id} 
          product={product}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  );
};

export default ProductList;
