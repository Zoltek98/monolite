import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import axios from 'axios';

// Import Sezioni
import Dashboard from './sections/Dashboard';
import MutuoSection from './sections/MutuoSection';
import LuceSection from './sections/LuceSection';
import GasSection from './sections/GasSection';
import InvestmentsSection from './sections/InvestmentsSection';
import Login from './sections/Login'; // Assicurati di creare questo file

import './App.css';

const App: React.FC = () => {
  // 1. Recuperiamo il token dal localStorage all'avvio
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // 2. Ogni volta che il token cambia, lo iniettiamo negli header di Axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Intercettore per gestire la scadenza del token (se il BE risponde 401 o 403)
      const interceptor = axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            handleLogout();
          }
          return Promise.reject(error);
        }
      );
      return () => axios.interceptors.response.eject(interceptor);
    }
  }, [token]);

  const handleLogin = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // 3. Se non c'è il token, mostriamo solo il Login (senza Navbar)
  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="dashboard-container">
        {/* NAVBAR ORIZZONTALE */}
        <nav className="navbar">
          <div className="logo">MYHOME</div>
          <div className="nav-tabs">
            <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
              Dashboard
            </NavLink>
            <NavLink to="/investimenti" className={({ isActive }) => isActive ? "active" : ""}>
              Investimenti
            </NavLink>
            <NavLink to="/mutuo" className={({ isActive }) => isActive ? "active" : ""}>
              Mutuo
            </NavLink>
            <NavLink to="/luce" className={({ isActive }) => isActive ? "active" : ""}>
              Luce
            </NavLink>
            <NavLink to="/gas" className={({ isActive }) => isActive ? "active" : ""}>
              Gas
            </NavLink>
            {/* Pulsante Logout integrato */}
            <button onClick={handleLogout} className="btn-logout">
               Esci
            </button>
          </div>
        </nav>

        {/* AREA CONTENUTO */}
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/investimenti" element={<InvestmentsSection />} />
            <Route path="/mutuo" element={<MutuoSection />} />
            <Route path="/luce" element={<LuceSection />} />
            <Route path="/gas" element={<GasSection />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;