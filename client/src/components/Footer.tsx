// File: src/components/Footer.tsx
import React from 'react';
import { useIntl } from 'react-intl';
import '../styles/Footer.css';

const Footer: React.FC = () => {
  const intl = useIntl();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>{intl.formatMessage({ id: 'app.title', defaultMessage: 'Investment Tracker' })}</h3>
          <p>
            {intl.formatMessage({ 
              id: 'footer.description', 
              defaultMessage: 'Track your investments from multiple platforms in one place' 
            })}
          </p>
        </div>

        <div className="footer-section">
          <h4>{intl.formatMessage({ id: 'footer.links', defaultMessage: 'Quick Links' })}</h4>
          <ul>
            <li><a href="/">{intl.formatMessage({ id: 'nav.dashboard', defaultMessage: 'Dashboard' })}</a></li>
            <li><a href="/portfolio">{intl.formatMessage({ id: 'nav.portfolio', defaultMessage: 'Portfolio' })}</a></li>
            <li><a href="/import">{intl.formatMessage({ id: 'nav.import', defaultMessage: 'Import' })}</a></li>
            <li><a href="/settings">{intl.formatMessage({ id: 'nav.settings', defaultMessage: 'Settings' })}</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{intl.formatMessage({ id: 'footer.support', defaultMessage: 'Support' })}</h4>
          <ul>
            <li><a href="#">{intl.formatMessage({ id: 'footer.help', defaultMessage: 'Help Center' })}</a></li>
            <li><a href="#">{intl.formatMessage({ id: 'footer.contact', defaultMessage: 'Contact Us' })}</a></li>
            <li><a href="#">{intl.formatMessage({ id: 'footer.privacy', defaultMessage: 'Privacy Policy' })}</a></li>
            <li><a href="#">{intl.formatMessage({ id: 'footer.terms', defaultMessage: 'Terms of Service' })}</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{intl.formatMessage({ id: 'footer.platforms', defaultMessage: 'Supported Platforms' })}</h4>
          <ul>
            <li>Moomoo</li>
            <li>Robinhood</li>
            <li>eToro</li>
            <li>Interactive Brokers</li>
            <li>Tiger Brokers</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {currentYear} {intl.formatMessage({ id: 'app.title', defaultMessage: 'Investment Tracker' })}. 
          {' '}{intl.formatMessage({ id: 'footer.copyright', defaultMessage: 'All rights reserved.' })}
        </p>
      </div>
    </footer>
  );
};

export default Footer;