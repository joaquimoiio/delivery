import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Home from '../pages/Home/Home.js';
import Category from '../pages/Category/Category.jsx';
import Store from '../pages/Store/Store.jsx';
import Fornecedor from '../pages/Fornecedor/Fornecedor.js';
import Payment from '../pages/Payment/Payment.jsx'
import Profile from '../pages/Profile/Profile.jsx';
import OrderHistory from '../pages/OrderHistory/OrderHistory.jsx';
import CadastroUsuario from '../pages/CadastroUsuario/CadastroUsuario.jsx';

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categoria/:categoryId" element={<Category />} />
          <Route path="/loja/:storeId" element={<Store />} />
          <Route path="/fornecedor" element={<Fornecedor />} />
          <Route path="/cadastro" element={<CadastroUsuario />} />
          <Route path="/pagamento" element={<Payment />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/historico-pedidos" element={<OrderHistory />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRoutes;