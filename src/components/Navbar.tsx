import React from 'react';

interface NavbarProps {
  activeTab: 'mutuo' | 'luce' | 'gas' | 'investimenti';
  setActiveTab: (tab: 'mutuo' | 'luce' | 'gas' | 'investimenti') => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="navbar">
      <div className="logo">RASPBERRY-HOME</div>
      <div className="nav-tabs">
        <button 
          className={activeTab === 'mutuo' ? 'active' : ''} 
          onClick={() => setActiveTab('mutuo')}
        >
          Mutuo
        </button>
        <button 
          className={activeTab === 'luce' ? 'active' : ''} 
          onClick={() => setActiveTab('luce')}
        >
          Luce
        </button>
         <button 
          className={activeTab === 'gas' ? 'active' : ''} 
          onClick={() => setActiveTab('gas')}
        >
          Gas
        </button>
         <button 
          className={activeTab === 'investimenti' ? 'active' : ''} 
          onClick={() => setActiveTab('investimenti')}
        >
          Investimenti
        </button>
      </div>
    </nav>
  );
};

export default Navbar;