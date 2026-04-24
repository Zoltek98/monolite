import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Chiude il menu mobile quando si clicca su un link
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <div className="logo">MYHOME</div>

      <button 
        className="hamburger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        <span className={`bar ${isOpen ? 'open' : ''}`}></span>
        <span className={`bar ${isOpen ? 'open' : ''}`}></span>
        <span className={`bar ${isOpen ? 'open' : ''}`}></span>
      </button>

      <div className={`nav-tabs ${isOpen ? 'mobile-open' : ''}`}>
        <NavLink to="/" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
          Dashboard
        </NavLink>
        <NavLink to="/investimenti" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
          Investimenti
        </NavLink>
        <NavLink to="/mutuo" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
          Mutuo
        </NavLink>
        <NavLink to="/luce" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
          Luce
        </NavLink>
        <NavLink to="/gas" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
          Gas
        </NavLink>
        <NavLink to="/notifications" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
          Notifications
        </NavLink>
        
        <button onClick={() => { onLogout(); closeMenu(); }} className="btn-logout">
          Esci
        </button>
      </div>
    </nav>
  );
};

export default Navbar;