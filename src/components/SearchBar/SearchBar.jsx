// src/components/SearchBar/SearchBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useSugestoes } from '../../hooks/useBusca';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = "Buscar restaurantes...", initialValue = "" }) => {
  const [termo, setTermo] = useState(initialValue);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [indiceSelecionado, setIndiceSelecionado] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const { sugestoes, loading } = useSugestoes(termo);

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setMostrarSugestoes(false);
        setIndiceSelecionado(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const valor = e.target.value;
    setTermo(valor);
    setMostrarSugestoes(valor.length > 0);
    setIndiceSelecionado(-1);
  };

  const handleKeyDown = (e) => {
    if (!mostrarSugestoes || sugestoes.length === 0) {
      if (e.key === 'Enter') {
        handleSubmit(e);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIndiceSelecionado(prev => 
          prev < sugestoes.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setIndiceSelecionado(prev => prev > 0 ? prev - 1 : -1);
        break;

      case 'Enter':
        e.preventDefault();
        if (indiceSelecionado >= 0) {
          selecionarSugestao(sugestoes[indiceSelecionado]);
        } else {
          handleSubmit(e);
        }
        break;

      case 'Escape':
        setMostrarSugestoes(false);
        setIndiceSelecionado(-1);
        inputRef.current?.blur();
        break;

      default:
        break;
    }
  };

  const selecionarSugestao = (sugestao) => {
    setTermo(sugestao);
    setMostrarSugestoes(false);
    setIndiceSelecionado(-1);
    onSearch(sugestao);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (termo.trim()) {
      setMostrarSugestoes(false);
      onSearch(termo.trim());
    }
  };

  const limparBusca = () => {
    setTermo('');
    setMostrarSugestoes(false);
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <div className="search-bar-container" ref={containerRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={termo}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setMostrarSugestoes(termo.length > 0)}
            placeholder={placeholder}
            className="search-input"
            autoComplete="off"
          />
          
          <div className="search-actions">
            {termo && (
              <button
                type="button"
                onClick={limparBusca}
                className="clear-button"
                aria-label="Limpar busca"
              >
                ✕
              </button>
            )}
            
            <button
              type="submit"
              className="search-button"
              disabled={loading}
              aria-label="Buscar"
            >
              {loading ? (
                <div className="loading-spinner-small"></div>
              ) : (
                '🔍'
              )}
            </button>
          </div>
        </div>

        {/* Lista de sugestões */}
        {mostrarSugestoes && (
          <div className="suggestions-dropdown">
            {loading && (
              <div className="suggestion-item loading">
                <div className="loading-spinner-small"></div>
                <span>Buscando sugestões...</span>
              </div>
            )}
            
            {!loading && sugestoes.length > 0 && (
              <>
                {sugestoes.map((sugestao, index) => (
                  <div
                    key={index}
                    className={`suggestion-item ${index === indiceSelecionado ? 'selected' : ''}`}
                    onClick={() => selecionarSugestao(sugestao)}
                    onMouseEnter={() => setIndiceSelecionado(index)}
                  >
                    <span className="suggestion-icon">🔍</span>
                    <span className="suggestion-text">{sugestao}</span>
                  </div>
                ))}
              </>
            )}
            
            {!loading && sugestoes.length === 0 && termo.length > 1 && (
              <div className="suggestion-item no-results">
                <span className="suggestion-icon">❌</span>
                <span>Nenhuma sugestão encontrada</span>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;