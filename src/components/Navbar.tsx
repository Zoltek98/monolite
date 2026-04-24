import React, { useState } from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleTabClick = (tab: any) => {
    setActiveTab(tab);
    setIsOpen(false); 
  };

  return (
    <nav className="navbar">
      <div className="logo">HOME</div>

      {/* Pulsante Hamburger - DEVE ESSERE FUORI DA NAV-TABS */}
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
        <button 
          className={activeTab === 'mutuo' ? 'active' : ''} 
          onClick={() => handleTabClick('mutuo')}
        >
          Mutuo
        </button>
        <button 
          className={activeTab === 'luce' ? 'active' : ''} 
          onClick={() => handleTabClick('luce')}
        >
          Luce
        </button>
        <button 
          className={activeTab === 'gas' ? 'active' : ''} 
          onClick={() => handleTabClick('gas')}
        >
          Gas
        </button>
        <button 
          className={activeTab === 'investimenti' ? 'active' : ''} 
          onClick={() => handleTabClick('investimenti')}
        >
          Investimenti
        </button>
      </div>
    </nav>
  );
};

export default Navbar;