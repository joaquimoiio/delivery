import React, { useState } from 'react';
import MapSelector from './MapSelector/MapSelector';
import './Loja.css';

const Loja = () => {
  const [formData, setFormData] = useState({
    nomeLoja: '',
    cnpj: '',
    id: '',
    telefone: '',
    nuLatitude: '',
    nuLongitude: '',
    senhaAtual: '',
    novaSenha: '',
    confirmarNovaSenha: '',
    descricao: '',
    linkLogo: ''
  });
  const [isMapOpen, setIsMapOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validação para coordenadas (aceita números decimais positivos e negativos)
    if (name === 'nuLatitude' || name === 'nuLongitude') {
      const coordenadaRegex = /^-?\d*\.?\d*$/;
      if (value !== '' && !coordenadaRegex.test(value)) {
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenMap = () => {
    setIsMapOpen(true);
  };

  const handleSelectCoordinates = (coordinatesData) => {
    setFormData(prev => ({
      ...prev,
      nuLatitude: coordinatesData.latitude,
      nuLongitude: coordinatesData.longitude
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação das coordenadas
    const lat = parseFloat(formData.nuLatitude);
    const lng = parseFloat(formData.nuLongitude);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      alert('Latitude deve estar entre -90 e 90');
      return;
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      alert('Longitude deve estar entre -180 e 180');
      return;
    }
    
    console.log('Dados da loja:', formData);
    alert('Dados da loja salvos com sucesso!');
  };

  const handleConfirmarSenha = () => {
    if (!formData.novaSenha) {
      alert('Digite uma nova senha primeiro');
      return;
    }
    if (formData.novaSenha === formData.confirmarNovaSenha) {
      alert('Senha confirmada com sucesso!');
      setFormData(prev => ({
        ...prev,
        senhaAtual: '',
        novaSenha: '',
        confirmarNovaSenha: ''
      }));
    } else {
      alert('As senhas não coincidem');
    }
  };

  return (
    <div className="cadastro-produtos">
      <div className="cadastro-header">
        <h2>⚙️ Configurações da Loja</h2>
      </div>
      
      <div className="cadastro-content">
        <form className="produto-form" onSubmit={handleSubmit}>
          <h2>Informações da Loja</h2>
          
          <div className="form-row">
            <input
              type="text"
              name="nomeLoja"
              value={formData.nomeLoja}
              onChange={handleChange}
              placeholder="Nome da Loja"
              className="form-input"
              required
            />
          </div>

          <div className="form-row two-columns">
            <input
              type="text"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              placeholder="CNPJ"
              className="form-input"
              required
            />
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="ID da Loja"
              className="form-input"
              required
            />
          </div>

          <div className="form-row">
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="Telefone"
              className="form-input"
              required
            />
          </div>

          <div className="coordenadas-section">
            <h4>📍 Localização da Loja</h4>
            <div className="coordenadas-grid">
              <div className="coordenada-field">
                <label htmlFor="nuLatitude">Latitude</label>
                <input
                  type="text"
                  id="nuLatitude"
                  name="nuLatitude"
                  value={formData.nuLatitude}
                  onChange={handleChange}
                  placeholder="-3.1190275"
                  className="coordenada-input"
                  required
                />
                <span className="coordenada-help">Entre -90 e 90</span>
              </div>
              
              <div className="coordenada-field">
                <label htmlFor="nuLongitude">Longitude</label>
                <input
                  type="text"
                  id="nuLongitude"
                  name="nuLongitude"
                  value={formData.nuLongitude}
                  onChange={handleChange}
                  placeholder="-60.0217314"
                  className="coordenada-input"
                  required
                />
                <span className="coordenada-help">Entre -180 e 180</span>
              </div>
            </div>
            
            <button type="button" onClick={handleOpenMap} className="map-btn">
              🗺️ Selecionar no Mapa
            </button>
          </div>

          <div className="form-row">
            <input
              type="url"
              name="linkLogo"
              value={formData.linkLogo}
              onChange={handleChange}
              placeholder="Link da Logo"
              className="form-input"
            />
          </div>

          <div className="form-row">
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descrição da loja"
              className="form-textarea"
              rows="4"
            />
          </div>

          <h3 style={{marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)'}}>
            🔐 Alterar Senha
          </h3>

          <div className="form-row">
            <input
              type="password"
              name="senhaAtual"
              value={formData.senhaAtual}
              onChange={handleChange}
              placeholder="Senha Atual"
              className="form-input"
            />
          </div>

          <div className="form-row two-columns">
            <input
              type="password"
              name="novaSenha"
              value={formData.novaSenha}
              onChange={handleChange}
              placeholder="Nova Senha"
              className="form-input"
            />
            <input
              type="password"
              name="confirmarNovaSenha"
              value={formData.confirmarNovaSenha}
              onChange={handleChange}
              placeholder="Confirmar Nova Senha"
              className="form-input"
            />
          </div>

          <div className="form-row two-columns">
            <button type="button" onClick={handleConfirmarSenha} className="submit-btn">
              Confirmar Senha
            </button>
            <button type="submit" className="submit-btn">
              Salvar Configurações
            </button>
          </div>
        </form>

        <div className="preview-section">
          <h3>👁️ Pré-visualização</h3>
          <div className="product-preview">
            {formData.linkLogo ? (
              <img src={formData.linkLogo} alt="Logo" className="preview-image" />
            ) : (
              <div style={{padding: '2rem', color: 'var(--text-muted)'}}>
                Nenhuma logo
              </div>
            )}
            <div className="preview-info">
              <h4>{formData.nomeLoja || 'Nome da Loja'}</h4>
              <p><strong>CNPJ:</strong> {formData.cnpj || 'Não informado'}</p>
              <p><strong>Telefone:</strong> {formData.telefone || 'Não informado'}</p>
              <p><strong>Coordenadas:</strong> {formData.nuLatitude && formData.nuLongitude ? 
                `${formData.nuLatitude}, ${formData.nuLongitude}` : 'Não informado'}</p>
              <p>{formData.descricao || 'Descrição da loja aparecerá aqui...'}</p>
            </div>
          </div>
        </div>
      </div>

      <MapSelector
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelectCoordinates={handleSelectCoordinates}
        initialCoordinates={
          formData.nuLatitude && formData.nuLongitude 
            ? { latitude: formData.nuLatitude, longitude: formData.nuLongitude }
            : null
        }
      />
    </div>
  );
};

export default Loja;
