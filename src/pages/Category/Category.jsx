import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import SearchBar from '../../components/SearchBar/SearchBar';
import FilterPanel from '../../components/FilterPanel/FilterPanel';
import StoreList from '../../components/StoreList/StoreList';
import { categoryConfig } from '../../utils/categoryConfig';
import { useAuth } from '../../context/AuthContext';
import { useBusca, useLocalizacao } from '../../hooks/useBusca';
import './Category.css';

const Category = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const categoryInfo = categoryConfig[categoryId];
  
  // Hook de localização com verificação de segurança
  const localizacaoResult = useLocalizacao();
  const localizacao = localizacaoResult || {
    latitude: null,
    longitude: null,
    erro: null,
    loading: false,
    obterLocalizacao: () => {}
  };

  const {
    resultados,
    loading,
    error,
    totalElements,
    filtros,
    temMaisPaginas,
    executarBusca,
    atualizarFiltro,
    limparFiltros,
    carregarMais
  } = useBusca();

  useEffect(() => {
    if (!categoryInfo) {
      navigate('/');
      return;
    }

    document.title = `${categoryInfo.name} - Delivery App`;
    
    // Solicitar localização se não tiver e não estiver carregando
    if (!localizacao.latitude && !localizacao.loading && !localizacao.erro) {
      // Verificar se a função existe antes de chamar
      if (localizacao.obterLocalizacao && typeof localizacao.obterLocalizacao === 'function') {
        localizacao.obterLocalizacao();
      }
    }
  }, [categoryId, categoryInfo, navigate, localizacao]);

  useEffect(() => {
    // Configurar categoria no filtro quando a página carregar
    if (categoryId && categoryId !== filtros.categoria) {
      atualizarFiltro('categoria', categoryId);
    }
  }, [categoryId, filtros.categoria, atualizarFiltro]);

  useEffect(() => {
    // Configurar localização quando obtida
    if (localizacao && localizacao.latitude && localizacao.longitude) {
      atualizarFiltro('latitude', localizacao.latitude);
      atualizarFiltro('longitude', localizacao.longitude);
    }
  }, [localizacao.latitude, localizacao.longitude, atualizarFiltro]);

  const handleSearch = (termo) => {
    atualizarFiltro('termo', termo);
  };

  const handleFiltroChange = (campo, valor) => {
    atualizarFiltro(campo, valor);
  };

  const handleLimparFiltros = () => {
    limparFiltros();
    // Manter a categoria atual
    setTimeout(() => {
      atualizarFiltro('categoria', categoryId);
    }, 0);
  };

  const handleToggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleRetryLocation = () => {
    if (localizacao.obterLocalizacao && typeof localizacao.obterLocalizacao === 'function') {
      localizacao.obterLocalizacao();
    }
  };

  const getEmptyMessage = () => {
    if (filtros.termo) {
      return `Nenhuma loja encontrada para "${filtros.termo}" na categoria ${categoryInfo.name}`;
    }
    return `Nenhuma loja encontrada na categoria ${categoryInfo.name}`;
  };

  if (!categoryInfo) {
    return null;
  }

  return (
    <div className="category-page">
      <Navbar />
      
      <div className="category-content">
        {/* Header da categoria */}
        <div 
          className="category-header"
          style={{ background: categoryInfo.gradient }}
        >
          <div className="category-header-content">
            <span className="category-icon">{categoryInfo.icon}</span>
            <h1>{categoryInfo.name}</h1>
            <p>Descubra as melhores opções da categoria</p>
            
            {/* Indicador de localização com verificações de segurança */}
            {localizacao?.loading && (
              <div className="location-status">
                <span>📍 Obtendo sua localização...</span>
              </div>
            )}
            
            {localizacao?.erro && (
              <div className="location-error">
                <span>📍 Erro ao obter localização</span>
                <button onClick={handleRetryLocation} className="retry-location">
                  Tentar novamente
                </button>
              </div>
            )}
            
            {localizacao?.latitude && localizacao?.longitude && (
              <div className="location-success">
                <span>📍 Localização obtida - Mostrando lojas próximas</span>
              </div>
            )}

            {/* Fallback se localização não estiver disponível */}
            {!localizacao?.latitude && !localizacao?.loading && !localizacao?.erro && (
              <div className="location-fallback">
                <span>📍 Usando localização padrão (São Paulo)</span>
                <button 
                  onClick={handleRetryLocation} 
                  className="retry-location"
                >
                  Usar minha localização
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Seção de busca e filtros */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-row">
              {/* Barra de busca */}
              <div className="search-bar-wrapper">
                <SearchBar 
                  onSearch={handleSearch}
                  placeholder={`Buscar em ${categoryInfo.name}...`}
                  initialValue={filtros.termo}
                />
              </div>

              {/* Botão de filtros (mobile) */}
              <div className="filter-toggle-wrapper">
                <FilterPanel
                  filtros={filtros}
                  onFiltroChange={handleFiltroChange}
                  onLimparFiltros={handleLimparFiltros}
                  isOpen={isFilterOpen}
                  onToggle={handleToggleFilter}
                />
              </div>
            </div>

            {/* Indicadores ativos */}
            <div className="active-filters">
              {filtros.termo && (
                <div className="filter-tag">
                  <span>🔍 "{filtros.termo}"</span>
                  <button onClick={() => handleSearch('')}>✕</button>
                </div>
              )}
              
              {filtros.raioMaximoKm !== 10 && (
                <div className="filter-tag">
                  <span>📍 Raio: {filtros.raioMaximoKm}km</span>
                  <button onClick={() => atualizarFiltro('raioMaximoKm', 10)}>✕</button>
                </div>
              )}
              
              {filtros.entregaGratis && (
                <div className="filter-tag">
                  <span>🚚 Entrega Grátis</span>
                  <button onClick={() => atualizarFiltro('entregaGratis', false)}>✕</button>
                </div>
              )}
              
              {(filtros.precoMinimo || filtros.precoMaximo) && (
                <div className="filter-tag">
                  <span>💰 Preço: R$ {filtros.precoMinimo || 0} - R$ {filtros.precoMaximo || 100}</span>
                  <button onClick={() => {
                    atualizarFiltro('precoMinimo', null);
                    atualizarFiltro('precoMaximo', null);
                  }}>✕</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Layout principal */}
        <div className="main-layout">
          <div className="content-container">
            
            {/* Painel de filtros (desktop) */}
            <aside className="filters-sidebar">
              <FilterPanel
                filtros={filtros}
                onFiltroChange={handleFiltroChange}
                onLimparFiltros={handleLimparFiltros}
                isOpen={true}
                onToggle={() => {}}
              />
            </aside>

            {/* Lista de lojas */}
            <main className="stores-main">
              {/* Aviso se não tiver localização */}
              {!localizacao?.latitude && !localizacao?.loading && (
                <div className="location-warning">
                  <p>⚠️ Para ver lojas próximas, permita o acesso à sua localização</p>
                </div>
              )}

              <StoreList
                stores={resultados}
                loading={loading}
                error={error}
                onLoadMore={carregarMais}
                hasMore={temMaisPaginas}
                totalElements={totalElements}
                emptyMessage={getEmptyMessage()}
              />
            </main>

          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Category;