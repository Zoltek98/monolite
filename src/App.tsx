import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Dashboard from './sections/Dashboard';
import MutuoSection from './sections/MutuoSection';
import LuceSection from './sections/LuceSection';
import GasSection from './sections/GasSection';
import InvestmentsSection from './sections/InvestmentsSection';
import './App.css';

const App: React.FC = () => {
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
            {/* Redirect se l'utente sbaglia URL */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;