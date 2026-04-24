import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Import Componenti
import Navbar from './components/Navbar'; // <--- IMPORTIAMO IL TUO COMPONENTE

// Import Sezioni
import Dashboard from './sections/Dashboard';
import MutuoSection from './sections/MutuoSection';
import LuceSection from './sections/LuceSection';
import GasSection from './sections/GasSection';
import InvestmentsSection from './sections/InvestmentsSection';
import Login from './sections/Login';
import NotificationWidget from './sections/Notifications';

import './App.css';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
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

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="dashboard-container">
        {/* USIAMO IL COMPONENTE NAVBAR QUI */}
        <Navbar onLogout={handleLogout} />

        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/investimenti" element={<InvestmentsSection />} />
            <Route path="/mutuo" element={<MutuoSection />} />
            <Route path="/luce" element={<LuceSection />} />
            <Route path="/gas" element={<GasSection />} />
            <Route path="/notifications" element={<NotificationWidget />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;