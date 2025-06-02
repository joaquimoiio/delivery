// src/pages/CadastroUsuario/components/FormularioCliente.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import AuthService from '../../../services/AuthService';

const FormularioCliente = ({ onVoltar }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [modoLogin, setModoLogin] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    cpf: '',
    telefone: '',
    senha: '',
    confirmarSenha: ''
  });

  const [errors, setErrors] = useState({});

  // Máscaras
  const aplicarMascaraCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const aplicarMascaraTelefone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  // Validações
  const validarSenha = (senha) => {
    const temMaiuscula = /[A-Z]/.test(senha);
    const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
    const tamanhoMinimo = senha.length >= 8;
    return temMaiuscula && temEspecial && tamanhoMinimo;
  };

  const validarConfirmacaoSenha = (senha, confirmacao) => {
    return senha === confirmacao;
  };

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let maskedValue = value;
    let newErrors = { ...errors };

    // Aplicar máscaras
    if (name === 'cpf') {
      maskedValue = aplicarMascaraCPF(value);
    } else if (name === 'telefone') {
      maskedValue = aplicarMascaraTelefone(value);
    }

    // Validações em tempo real
    if (name === 'senha') {
      if (!validarSenha(value)) {
        newErrors.senha = 'A senha deve ter no mínimo 8 caracteres, uma letra maiúscula e um caractere especial.';
      } else {
        delete newErrors.senha;
      }
      
      // Revalidar confirmação se já foi preenchida
      if (formData.confirmarSenha && !validarConfirmacaoSenha(value, formData.confirmarSenha)) {
        newErrors.confirmarSenha = 'As senhas não coincidem';
      } else if (formData.confirmarSenha) {
        delete newErrors.confirmarSenha;
      }
    }

    if (name === 'confirmarSenha') {
      if (!validarConfirmacaoSenha(formData.senha, value)) {
        newErrors.confirmarSenha = 'As senhas não coincidem';
      } else {
        delete newErrors.confirmarSenha;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: maskedValue
    }));

    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;

      if (modoLogin) {
        // Lógica de login usando o serviço
        result = await AuthService.loginCliente({
          email: formData.email,
          senha: formData.senha
        });
      } else {
        // Validações finais para cadastro
        const newErrors = {};

        if (!validarSenha(formData.senha)) {
          newErrors.senha = 'A senha não atende aos critérios';
        }

        if (!validarConfirmacaoSenha(formData.senha, formData.confirmarSenha)) {
          newErrors.confirmarSenha = 'As senhas não coincidem';
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          setLoading(false);
          return;
        }

        // Lógica de cadastro usando o serviço
        result = await AuthService.cadastrarCliente({
          nomeCompleto: formData.nomeCompleto,
          email: formData.email,
          senha: formData.senha,
          cpf: formData.cpf,
          telefone: formData.telefone
        });
      }

      if (result.success) {
        // Atualizar contexto de autenticação
        const userData = {
          name: formData.nomeCompleto || formData.email.split('@')[0],
          email: formData.email,
          type: 'cliente'
        };
        
        login(userData, result.token);
        
        alert(modoLogin ? 'Login realizado com sucesso!' : 'Cadastro realizado com sucesso!');
        navigate('/');
      } else {
        alert(result.message || 'Erro ao processar solicitação');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleModo = () => {
    setModoLogin(!modoLogin);
    setErrors({});
    setFormData({
      nomeCompleto: '',
      email: '',
      cpf: '',
      telefone: '',
      senha: '',
      confirmarSenha: ''
    });
  };

  return (
    <div className="FormularioCliente">
      <h3>{modoLogin ? 'Login - Cliente' : 'Cadastro - Cliente'}</h3>
      
      <form onSubmit={handleSubmit}>
        {!modoLogin && (
          <input
            type="text"
            name="nomeCompleto"
            placeholder="Nome Completo"
            value={formData.nomeCompleto}
            onChange={handleInputChange}
            required
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />

        {!modoLogin && (
          <>
            <div className="input-row">
              <input
                type="text"
                name="cpf"
                placeholder="CPF"
                maxLength="14"
                value={formData.cpf}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="telefone"
                placeholder="Telefone"
                maxLength="15"
                value={formData.telefone}
                onChange={handleInputChange}
              />
            </div>
          </>
        )}

        <div className="senha-container">
          <input
            type={mostrarSenha ? "text" : "password"}
            name="senha"
            placeholder="Senha"
            value={formData.senha}
            onChange={handleInputChange}
            required
          />
          <span 
            className="toggle-senha" 
            onClick={() => setMostrarSenha(!mostrarSenha)}
          >
            {mostrarSenha ? "🙈" : "👁️"}
          </span>
        </div>
        {errors.senha && (
          <span className="error-message">{errors.senha}</span>
        )}

        {!modoLogin && (
          <>
            <input
              type="password"
              name="confirmarSenha"
              placeholder="Confirmar Senha"
              value={formData.confirmarSenha}
              onChange={handleInputChange}
              required
            />
            {errors.confirmarSenha && (
              <span className="error-message">{errors.confirmarSenha}</span>
            )}
          </>
        )}

        <div className="botoes-acao">
          <button type="button" onClick={onVoltar}>
            Voltar
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Processando...' : (modoLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </div>

        <button type="button" className="botao-adicional" onClick={toggleModo}>
          {modoLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
        </button>
      </form>
    </div>
  );
};

export default FormularioCliente;