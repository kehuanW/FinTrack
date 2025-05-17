import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useInvestment, ImportPlatform } from '../context/InvestmentContext';
import '../styles/ImportData.css';

const ImportData: React.FC = () => {
  const intl = useIntl();
  const { platforms, importInvestments, isLoading } = useInvestment();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [fileData, setFileData] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId);
    setImportStatus('idle');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileData(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedPlatform || !fileData) return;

    try {
      // In a real app, you'd use FileReader to read the file content
      // For demonstration, we'll just pass the file object
      const success = await importInvestments(selectedPlatform, fileData);
      setImportStatus(success ? 'success' : 'error');
    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus('error');
    }
  };

  return (
    <div className="import-container">
      <h1>
        {intl.formatMessage({ id: 'import.title', defaultMessage: 'Import Your Investments' })}
      </h1>
      
      <div className="platform-selection">
        <h2>
          {intl.formatMessage({ id: 'import.selectPlatform', defaultMessage: 'Select Platform' })}
        </h2>
        <div className="platform-grid">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={`platform-card ${selectedPlatform === platform.id ? 'selected' : ''}`}
              onClick={() => handlePlatformSelect(platform.id)}
            >
              <div className="platform-logo">
                <img src={platform.logo} alt={platform.name} />
              </div>
              <h3>{platform.name}</h3>
              <p>{platform.description}</p>
              <div className="supported-formats">
                {intl.formatMessage({ id: 'import.supportedFormats', defaultMessage: 'Supported Formats' })}:
                {platform.supportedFormats.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPlatform && (
        <div className="file-upload-section">
          <h2>
            {intl.formatMessage({ id: 'import.uploadFile', defaultMessage: 'Upload File' })}
          </h2>
          
          <div className="upload-area">
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              accept=".csv,.xlsx,.pdf"
            />
            <label htmlFor="file-upload" className="upload-button">
              {intl.formatMessage({ id: 'import.chooseFile', defaultMessage: 'Choose File' })}
            </label>
            {fileData && <div className="selected-file">{fileData.name}</div>}
          </div>

          <button 
            className="import-button"
            disabled={!fileData || isLoading}
            onClick={handleImport}
          >
            {isLoading 
              ? intl.formatMessage({ id: 'import.importing', defaultMessage: 'Importing...' })
              : intl.formatMessage({ id: 'import.importNow', defaultMessage: 'Import Now' })
            }
          </button>

          {importStatus === 'success' && (
            <div className="import-status success">
              {intl.formatMessage({ id: 'import.success', defaultMessage: 'Import successful!' })}
            </div>
          )}

          {importStatus === 'error' && (
            <div className="import-status error">
              {intl.formatMessage({ id: 'import.error', defaultMessage: 'Import failed. Please try again.' })}
            </div>
          )}
        </div>
      )}

      <div className="import-instructions">
        <h3>
          {intl.formatMessage({ id: 'import.howTo', defaultMessage: 'How to Import' })}
        </h3>
        <ol>
          <li>
            {intl.formatMessage({ 
              id: 'import.step1', 
              defaultMessage: 'Select your investment platform from the options above'
            })}
          </li>
          <li>
            {intl.formatMessage({ 
              id: 'import.step2', 
              defaultMessage: 'Export your investment data from the platform in one of the supported formats'
            })}
          </li>
          <li>
            {intl.formatMessage({ 
              id: 'import.step3', 
              defaultMessage: 'Upload the exported file using the file uploader'
            })}
          </li>
          <li>
            {intl.formatMessage({ 
              id: 'import.step4', 
              defaultMessage: 'Click "Import Now" to process your investments'
            })}
          </li>
        </ol>
      </div>
    </div>
  );
};

export default ImportData;