// src/components/Navbar/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';
import SearchBar from '../SearchBar/SearchBar';

const Navbar = () => {
  const { isLoggedIn, user, login, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLoginRedirect = () => {
    navigate('/cadastro');
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleSearch = (termo) => {
    navigate(`/busca?q=${encodeURIComponent(termo)}`);
  };

  const handleDropdownItemClick = () => {
    setIsDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <div className="logo-placeholder"></div>
        </Link>

        {/* Menu de navegação */}
        <ul className="navbar-menu">
          <li>
            <Link to="/categoria/hamburgueria" className="navbar-link">
              Hamburgueria
            </Link>
          </li>
          <li>
            <Link to="/categoria/japonesa" className="navbar-link">
              Restaurante Japonês
            </Link>
          </li>
          <li>
            <Link to="/categoria/pizzaria" className="navbar-link">
              Pizzaria
            </Link>
          </li>
        </ul>

        {/* Área direita */}
        <div className="navbar-right">
          {isLoggedIn ? (
            <>
              {/* Barra de pesquisa */}
              {/*<div className="search-container">
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder="Buscar restaurantes..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className="search-button">
                    🔍
                  </button>
                </form>
              </div> */}

              {/* Dropdown do perfil */}
              <div className="profile-dropdown" ref={dropdownRef}>
                <button 
                  className="profile-button" 
                  onClick={toggleDropdown}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="profile-avatar">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" />
                    ) : (
                      <span>{user?.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-user-info">
                      <div className="dropdown-user-name">{user?.name || 'Usuário'}</div>
                      <div className="dropdown-user-email">{user?.email || 'email@exemplo.com'}</div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <div className="dropdown-item">
                      <Link to="/perfil" onClick={handleDropdownItemClick}>
                        👤 Meu Perfil
                      </Link>
                    </div>
                    
                    <div className="dropdown-item">
                      <Link to="/historico-pedidos" onClick={handleDropdownItemClick}>
                        📋 Histórico de Pedidos
                      </Link>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <div className="dropdown-item">
                      <button onClick={handleLogout}>
                        🚪 Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button className="navbar-button" onClick={handleLoginRedirect}>
              Entrar/Cadastro
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;