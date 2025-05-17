// File: src/pages/Settings.tsx
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import '../styles/Settings.css';

const Settings: React.FC = () => {
  const intl = useIntl();
  const [currency, setCurrency] = useState('USD');
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    dailySummary: false,
    weeklyReport: true,
    importCompleted: true,
  });

  const handleSave = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('settings', JSON.stringify({
      currency,
      theme,
      notifications,
    }));
    
    // Show success message (you could use a toast library here)
    alert(intl.formatMessage({ id: 'settings.saved', defaultMessage: 'Settings saved successfully!' }));
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'JPY', name: 'Japanese Yen (¥)' },
    { code: 'CNY', name: 'Chinese Yuan (¥)' },
    { code: 'AUD', name: 'Australian Dollar (A$)' },
    { code: 'CAD', name: 'Canadian Dollar (C$)' },
  ];

  return (
    <div className="settings">
      <h1>{intl.formatMessage({ id: 'settings.title', defaultMessage: 'Settings' })}</h1>

      <div className="settings-sections">
        {/* Display Preferences */}
        <div className="settings-section">
          <h2>{intl.formatMessage({ id: 'settings.display', defaultMessage: 'Display Preferences' })}</h2>
          
          <div className="setting-item">
            <label htmlFor="currency-select">
              {intl.formatMessage({ id: 'settings.currency', defaultMessage: 'Display Currency' })}
            </label>
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="setting-select"
            >
              {currencies.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.name}
                </option>
              ))}
            </select>
          </div>

          <div className="setting-item">
            <label htmlFor="theme-select">
              {intl.formatMessage({ id: 'settings.theme', defaultMessage: 'Theme' })}
            </label>
            <select
              id="theme-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="setting-select"
            >
              <option value="light">
                {intl.formatMessage({ id: 'settings.theme.light', defaultMessage: 'Light' })}
              </option>
              <option value="dark">
                {intl.formatMessage({ id: 'settings.theme.dark', defaultMessage: 'Dark' })}
              </option>
              <option value="system">
                {intl.formatMessage({ id: 'settings.theme.system', defaultMessage: 'System Default' })}
              </option>
            </select>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="settings-section">
          <h2>{intl.formatMessage({ id: 'settings.notifications', defaultMessage: 'Notifications' })}</h2>
          
          <div className="setting-item checkbox-item">
            <input
              type="checkbox"
              id="price-alerts"
              checked={notifications.priceAlerts}
              onChange={(e) => setNotifications({
                ...notifications,
                priceAlerts: e.target.checked
              })}
            />
            <label htmlFor="price-alerts">
              {intl.formatMessage({ id: 'settings.priceAlerts', defaultMessage: 'Price Alerts' })}
            </label>
          </div>

          <div className="setting-item checkbox-item">
            <input
              type="checkbox"
              id="daily-summary"
              checked={notifications.dailySummary}
              onChange={(e) => setNotifications({
                ...notifications,
                dailySummary: e.target.checked
              })}
            />
            <label htmlFor="daily-summary">
              {intl.formatMessage({ id: 'settings.dailySummary', defaultMessage: 'Daily Summary Email' })}
            </label>
          </div>

          <div className="setting-item checkbox-item">
            <input
              type="checkbox"
              id="weekly-report"
              checked={notifications.weeklyReport}
              onChange={(e) => setNotifications({
                ...notifications,
                weeklyReport: e.target.checked
              })}
            />
            <label htmlFor="weekly-report">
              {intl.formatMessage({ id: 'settings.weeklyReport', defaultMessage: 'Weekly Performance Report' })}
            </label>
          </div>

          <div className="setting-item checkbox-item">
            <input
              type="checkbox"
              id="import-completed"
              checked={notifications.importCompleted}
              onChange={(e) => setNotifications({
                ...notifications,
                importCompleted: e.target.checked
              })}
            />
            <label htmlFor="import-completed">
              {intl.formatMessage({ id: 'settings.importCompleted', defaultMessage: 'Import Completed Notifications' })}
            </label>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-section">
          <h2>{intl.formatMessage({ id: 'settings.dataManagement', defaultMessage: 'Data Management' })}</h2>
          
          <div className="setting-item">
            <button className="secondary-button">
              {intl.formatMessage({ id: 'settings.exportData', defaultMessage: 'Export All Data' })}
            </button>
            <p className="setting-description">
              {intl.formatMessage({ 
                id: 'settings.exportDescription', 
                defaultMessage: 'Download all your investment data as a CSV file' 
              })}
            </p>
          </div>

          <div className="setting-item">
            <button className="danger-button">
              {intl.formatMessage({ id: 'settings.clearData', defaultMessage: 'Clear All Data' })}
            </button>
            <p className="setting-description">
              {intl.formatMessage({ 
                id: 'settings.clearDescription', 
                defaultMessage: 'This will permanently delete all your investment data' 
              })}
            </p>
          </div>
        </div>

        {/* Account */}
        <div className="settings-section">
          <h2>{intl.formatMessage({ id: 'settings.account', defaultMessage: 'Account' })}</h2>
          
          <div className="setting-item">
            <button className="secondary-button">
              {intl.formatMessage({ id: 'settings.changePassword', defaultMessage: 'Change Password' })}
            </button>
          </div>

          <div className="setting-item">
            <button className="secondary-button">
              {intl.formatMessage({ id: 'settings.deleteAccount', defaultMessage: 'Delete Account' })}
            </button>
            <p className="setting-description">
              {intl.formatMessage({ 
                id: 'settings.deleteAccountDescription', 
                defaultMessage: 'Permanently delete your account and all associated data' 
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="primary-button" onClick={handleSave}>
          {intl.formatMessage({ id: 'settings.save', defaultMessage: 'Save Changes' })}
        </button>
      </div>
    </div>
  );
};

export default Settings;