import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import ImportData from './pages/ImportData';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import messagesEN from './translations/en.json';
import messagesZH from './translations/zh.json';
import { InvestmentProvider } from './context/InvestmentContext';
import './styles/App.css';

// Define supported locales
const locales = {
  en: messagesEN,
  zh: messagesZH,
};

type Locale = 'en' | 'zh';

const App: React.FC = () => {
  // Get locale from localStorage or default to English
  const savedLocale = localStorage.getItem('locale') as Locale;
  const [locale, setLocale] = useState<Locale>(savedLocale || 'en');
  const [messages, setMessages] = useState(locales[locale]);

  useEffect(() => {
    // Update localStorage when locale changes
    localStorage.setItem('locale', locale);
    setMessages(locales[locale]);
    // Set html lang attribute
    document.documentElement.lang = locale;
  }, [locale]);

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'zh' : 'en');
  };

  return (
    <IntlProvider locale={locale} messages={messages}>
      <InvestmentProvider>
        <Router>
          <div className="app-container">
            <Navbar toggleLocale={toggleLocale} currentLocale={locale} />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/import" element={<ImportData />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </InvestmentProvider>
    </IntlProvider>
  );
};

export default App;