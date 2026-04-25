import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Stato per gestire i dropdown su desktop (opzionale, o puoi usare CSS hover)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const closeMenu = () => {
    setIsOpen(false);
    setActiveDropdown(null);
  };

  return (
    <nav className="navbar">
      <div className="logo">MYHOME</div>

      <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        <span className={`bar ${isOpen ? 'open' : ''}`}></span>
        <span className={`bar ${isOpen ? 'open' : ''}`}></span>
        <span className={`bar ${isOpen ? 'open' : ''}`}></span>
      </button>

      <div className={`nav-tabs ${isOpen ? 'mobile-open' : ''}`}>
        <NavLink to="/" onClick={closeMenu}>Dashboard</NavLink>

        {/* GRUPPO SOLDI / PATRIMONIO */}
        <div className="nav-group">
          <span className="group-title">Patrimonio</span>
          <div className="dropdown-content">
            <NavLink to="/investimenti" onClick={closeMenu}>Investimenti</NavLink>
            <NavLink to="/conti" onClick={closeMenu}>Conti Correnti</NavLink>
            <NavLink to="/tfr" onClick={closeMenu}>TFR</NavLink>
          </div>
        </div>

        {/* GRUPPO SPESE / CASA */}
        <div className="nav-group">
          <span className="group-title">Spese Casa</span>
          <div className="dropdown-content">
            <NavLink to="/mutuo" onClick={closeMenu}>Mutuo</NavLink>
            <NavLink to="/luce" onClick={closeMenu}>Luce</NavLink>
            <NavLink to="/gas" onClick={closeMenu}>Gas</NavLink>
            <NavLink to="/internet" onClick={closeMenu}>Internet</NavLink>
          </div>
        </div>

        <NavLink to="/notifications" onClick={closeMenu}>Notifiche</NavLink>
        
        <button onClick={onLogout} className="btn-logout">Esci</button>
      </div>
    </nav>
  );
};

export default Navbar;