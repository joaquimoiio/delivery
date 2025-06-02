import React, { useState, useRef, useLayoutEffect } from 'react';
import './CadastroProdutos.css';

// Hook customizado para redimensionamento automático do textarea
const useAutoSizeTextArea = (textAreaRef, value) => {
  useLayoutEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '0px';
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = scrollHeight + 'px';
    }
  }, [textAreaRef, value]);
};

const CadastroProdutos = () => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    valor: '',
    categoria: '',
    linkImagem: ''
  });

  const textAreaRef = useRef(null);
  const previewTextAreaRef = useRef(null);

  // Hook para redimensionar o textarea da descrição
  useAutoSizeTextArea(textAreaRef, formData.descricao);
  useAutoSizeTextArea(previewTextAreaRef, formData.descricao);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Limitar descrição a 500 caracteres
    if (name === 'descricao' && value.length > 500) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Produto cadastrado:', formData);
    alert('Produto cadastrado com sucesso!');
    setFormData({
      nome: '',
      descricao: '',
      valor: '',
      categoria: '',
      linkImagem: ''
    });
  };

  const remainingChars = 500 - formData.descricao.length;

  return (
    <div className="cadastro-produtos">
      <div className="cadastro-header">
        <h2>Cadastro de Produtos</h2>
      </div>
      
      <div className="cadastro-content">
        <div className="produto-form">
          <h2>Informações do Produto</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Nome do produto"
                className="form-input"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="textarea-container">
                <textarea
                  ref={textAreaRef}
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  placeholder="Descrição do produto"
                  className="form-textarea auto-resize"
                  maxLength={500}
                  rows={3}
                />
                <div className="char-counter">
                  {formData.descricao.length}/500 caracteres
                  {remainingChars < 50 && (
                    <span className="warning"> - {remainingChars} restantes</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="form-row two-columns">
              <input
                type="number"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                placeholder="Valor (R$)"
                className="form-input"
                step="0.01"
                min="0"
              />
              
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Selecione uma categoria</option> 
                <option value="eletronicos">Hamburgueria</option>
                <option value="roupas">Comida japonês</option>
                <option value="casa">Bebidas</option>
                <option value="esportes">Pizzaria</option>
                <option value="esportes">Açaí</option>
              </select>
            </div>
            
            <div className="form-row">
              <input
                type="url"
                name="linkImagem"
                value={formData.linkImagem}
                onChange={handleChange}
                placeholder="Link da imagem"
                className="form-input"
              />
            </div>
            
            <button type="submit" className="submit-btn">
              Cadastrar Produto
            </button>
          </form>
        </div>
        
        <div className="preview-section">
          <h3>Preview do Produto</h3>
          <div className="product-preview">
            {formData.linkImagem && (
              <img 
                src={formData.linkImagem} 
                alt="Preview" 
                className="preview-image"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            
            <div className="preview-info">
              <h4>{formData.nome || 'Nome do produto'}</h4>
              
              <div className="preview-description-container">
                <textarea
                  ref={previewTextAreaRef}
                  value={formData.descricao || 'Descrição do produto'}
                  className="preview-description auto-resize"
                  readOnly
                  rows={1}
                />
              </div>
              
              <span className="preview-price">
                {formData.valor ? `R$ ${parseFloat(formData.valor).toFixed(2)}` : 'R$ 0,00'}
              </span>
              
              <span className="preview-category">
                {formData.categoria || 'Categoria'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastroProdutos;