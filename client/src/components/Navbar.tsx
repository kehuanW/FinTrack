import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useIntl } from 'react-intl';
import '../styles/Navbar.css';

interface NavbarProps {
  toggleLocale: () => void;
  currentLocale: string;
}

const Navbar: React.FC<NavbarProps> = ({ toggleLocale, currentLocale }) => {
  const intl = useIntl();
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-logo">
          <img src="/logo.svg" alt="Investment Tracker" />
          <span>{intl.formatMessage({ id: 'app.title' })}</span>
        </Link>
      </div>
      
      <div className="navbar-menu">
        <Link 
          to="/" 
          className={`navbar-item ${location.pathname === '/' ? 'active' : ''}`}
        >
          {intl.formatMessage({ id: 'nav.dashboard' })}
        </Link>
        <Link 
          to="/portfolio" 
          className={`navbar-item ${location.pathname === '/portfolio' ? 'active' : ''}`}
        >
          {intl.formatMessage({ id: 'nav.portfolio' })}
        </Link>
        <Link 
          to="/import" 
          className={`navbar-item ${location.pathname === '/import' ? 'active' : ''}`}
        >
          {intl.formatMessage({ id: 'nav.import' })}
        </Link>
        <Link 
          to="/settings" 
          className={`navbar-item ${location.pathname === '/settings' ? 'active' : ''}`}
        >
          {intl.formatMessage({ id: 'nav.settings' })}
        </Link>
      </div>
      
      <div className="navbar-end">
        <button className="language-toggle" onClick={toggleLocale}>
          {currentLocale === 'en' ? '中文' : 'English'}
        </button>
        <Link to="/login" className="login-button">
          {intl.formatMessage({ id: 'nav.login' })}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;