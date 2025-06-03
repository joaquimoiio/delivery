import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { api } from '../../../../config/api';
import MapSelector from './MapSelector/MapSelector';
import './Loja.css';

const Loja = () => {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    logoUrl: ''
  });
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Função para aplicar máscara de CNPJ
  const maskCNPJ = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  // Função para aplicar máscara de telefone
  const maskPhone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  // Validação de senha
  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 8;

    if (!hasUpperCase) return 'A senha deve conter pelo menos uma letra maiúscula';
    if (!hasSpecialChar) return 'A senha deve conter pelo menos um caractere especial';
    if (!hasMinLength) return 'A senha deve ter pelo menos 8 caracteres';
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let newValue = value;

    // Aplicar máscaras
    if (name === 'cnpj') {
      newValue = maskCNPJ(value);
    } else if (name === 'telefone') {
      newValue = maskPhone(value);
    }
    // Validação para coordenadas
    else if (name === 'nuLatitude' || name === 'nuLongitude') {
      const coordenadaRegex = /^-?\d*\.?\d*$/;
      if (value !== '' && !coordenadaRegex.test(value)) {
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
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

  // Carregar dados da loja ao montar o componente
  useEffect(() => {
    const loadStoreData = async () => {
      try {
        const response = await api.get('/api/empresa/perfil');
        if (response) {
          setFormData({
            nomeLoja: response.nomeFantasia || '',
            cnpj: response.cnpj || '',
            id: response.id || '',
            telefone: response.telefoneEmpresa || '',
            nuLatitude: response.nuLatitude || '',
            nuLongitude: response.nuLongitude || '',
            descricao: response.descricao || '',
            logoUrl: response.logoUrl || '',
            senhaAtual: '',
            novaSenha: '',
            confirmarNovaSenha: ''
          });
        }
      } catch (err) {
        setError('Erro ao carregar dados da loja');
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStoreData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validação das coordenadas
    const lat = parseFloat(formData.nuLatitude);
    const lng = parseFloat(formData.nuLongitude);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Latitude deve estar entre -90 e 90');
      return;
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError('Longitude deve estar entre -180 e 180');
      return;
    }

    try {
      const dadosAtualizados = {
        nomeFantasia: formData.nomeLoja,
        cnpj: formData.cnpj,
        telefoneEmpresa: formData.telefone,
        nuLatitude: formData.nuLatitude,
        nuLongitude: formData.nuLongitude,
        descricao: formData.descricao,
        logoUrl: formData.logoUrl
      };

      // Atualizar perfil
      const response = await api.put('/api/empresa/perfil', dadosAtualizados);
      
      if (response) {
        // Atualizar dados do usuário no contexto
        await updateUserProfile(response);
        alert('Dados da loja atualizados com sucesso!');
      }
    } catch (err) {
      setError(err.message || 'Erro ao salvar dados da loja');
      console.error('Erro ao salvar:', err);
    }
  };

  const handleConfirmarSenha = async () => {
    if (!formData.novaSenha) {
      setError('Digite uma nova senha primeiro');
      return;
    }

    const passwordError = validatePassword(formData.novaSenha);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.novaSenha !== formData.confirmarNovaSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (!formData.senhaAtual) {
      setError('Digite sua senha atual');
      return;
    }

    try {
      await api.put('/api/empresa/senha', {
        senhaAtual: formData.senhaAtual,
        novaSenha: formData.novaSenha
      });

      alert('Senha atualizada com sucesso!');
      setFormData(prev => ({
        ...prev,
        senhaAtual: '',
        novaSenha: '',
        confirmarNovaSenha: ''
      }));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar senha');
    }
  };

  return (
    <div className="cadastro-produtos">
      <div className="cadastro-header">
        <h2>⚙️ Configurações da Loja</h2>
      </div>
      
      {error && (
        <div className="error-message" style={{
          color: 'red',
          padding: '10px',
          marginBottom: '20px',
          backgroundColor: 'rgba(255,0,0,0.1)',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-message" style={{
          textAlign: 'center',
          padding: '20px'
        }}>
          Carregando dados da loja...
        </div>
      ) : (
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
                placeholder="ID da Loja"
                className="form-input"
                readOnly
                disabled
                style={{ backgroundColor: '#f5f5f5' }}
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
                name="logoUrl"
                value={formData.logoUrl}
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

            <div className="password-requirements" style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginBottom: '1rem',
              padding: '10px',
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: '4px'
            }}>
              <strong>Requisitos da senha:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>Pelo menos 8 caracteres</li>
                <li>Pelo menos uma letra maiúscula</li>
                <li>Pelo menos um caractere especial</li>
              </ul>
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
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Logo" className="preview-image" />
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
      )}

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
