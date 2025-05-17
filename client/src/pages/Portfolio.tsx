// File: src/pages/Portfolio.tsx
import React, { useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useInvestment } from '../context/InvestmentContext';
import '../styles/Portfolio.css';

type SortField = 'symbol' | 'name' | 'value' | 'profitLoss' | 'profitLossPercent';
type SortDirection = 'asc' | 'desc';

const Portfolio: React.FC = () => {
  const intl = useIntl();
  const { investments, isLoading, removeInvestment } = useInvestment();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  // Get unique platforms for filter
  const platforms = useMemo(() => {
    const uniquePlatforms = Array.from(new Set(investments.map(inv => inv.platform)));
    return uniquePlatforms;
  }, [investments]);

  // Filter and sort investments
  const filteredAndSortedInvestments = useMemo(() => {
    let filtered = investments.filter(inv => {
      const matchesSearch = inv.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inv.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = selectedPlatform === 'all' || inv.platform === selectedPlatform;
      return matchesSearch && matchesPlatform;
    });

    // Sort investments
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'symbol':
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'value':
          aValue = a.currentPrice * a.quantity;
          bValue = b.currentPrice * b.quantity;
          break;
        case 'profitLoss':
          aValue = (a.currentPrice - a.purchasePrice) * a.quantity;
          bValue = (b.currentPrice - b.purchasePrice) * b.quantity;
          break;
        case 'profitLossPercent':
          aValue = ((a.currentPrice - a.purchasePrice) / a.purchasePrice) * 100;
          bValue = ((b.currentPrice - b.purchasePrice) / b.purchasePrice) * 100;
          break;
        default:
          aValue = a.symbol;
          bValue = b.symbol;
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return filtered;
  }, [investments, searchTerm, sortField, sortDirection, selectedPlatform]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const calculateProfitLoss = (investment: any) => {
    const cost = investment.purchasePrice * investment.quantity;
    const currentValue = investment.currentPrice * investment.quantity;
    return currentValue - cost;
  };

  const calculateProfitLossPercent = (investment: any) => {
    const profitLoss = calculateProfitLoss(investment);
    const cost = investment.purchasePrice * investment.quantity;
    return cost > 0 ? (profitLoss / cost) * 100 : 0;
  };

  if (isLoading) {
    return (
      <div className="portfolio-loading">
        {intl.formatMessage({ id: 'common.loading', defaultMessage: 'Loading...' })}
      </div>
    );
  }

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <h1>{intl.formatMessage({ id: 'portfolio.title', defaultMessage: 'Your Portfolio' })}</h1>
        <button className="add-investment-btn">
          + {intl.formatMessage({ id: 'portfolio.addInvestment', defaultMessage: 'Add Investment' })}
        </button>
      </div>

      {/* Filters and Search */}
      <div className="portfolio-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder={intl.formatMessage({ id: 'portfolio.search', defaultMessage: 'Search investments...' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="platform-filter"
          >
            <option value="all">
              {intl.formatMessage({ id: 'portfolio.allPlatforms', defaultMessage: 'All Platforms' })}
            </option>
            {platforms.map(platform => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Portfolio Table */}
      <div className="portfolio-table-container">
        <table className="portfolio-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('symbol')} className="sortable">
                {intl.formatMessage({ id: 'portfolio.symbol', defaultMessage: 'Symbol' })}
                {sortField === 'symbol' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th onClick={() => handleSort('name')} className="sortable">
                {intl.formatMessage({ id: 'portfolio.name', defaultMessage: 'Name' })}
                {sortField === 'name' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th>{intl.formatMessage({ id: 'portfolio.quantity', defaultMessage: 'Quantity' })}</th>
              <th>{intl.formatMessage({ id: 'portfolio.purchasePrice', defaultMessage: 'Purchase Price' })}</th>
              <th>{intl.formatMessage({ id: 'portfolio.currentPrice', defaultMessage: 'Current Price' })}</th>
              <th onClick={() => handleSort('value')} className="sortable">
                {intl.formatMessage({ id: 'portfolio.currentValue', defaultMessage: 'Current Value' })}
                {sortField === 'value' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th onClick={() => handleSort('profitLoss')} className="sortable">
                {intl.formatMessage({ id: 'portfolio.profitLoss', defaultMessage: 'Profit/Loss' })}
                {sortField === 'profitLoss' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
              <th>{intl.formatMessage({ id: 'portfolio.platform', defaultMessage: 'Platform' })}</th>
              <th>{intl.formatMessage({ id: 'portfolio.actions', defaultMessage: 'Actions' })}</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedInvestments.map((investment) => {
              const profitLoss = calculateProfitLoss(investment);
              const profitLossPercent = calculateProfitLossPercent(investment);
              const currentValue = investment.currentPrice * investment.quantity;
              const isProfit = profitLoss >= 0;

              return (
                <tr key={investment.id}>
                  <td className="symbol-cell">{investment.symbol}</td>
                  <td className="name-cell">{investment.name}</td>
                  <td>{investment.quantity}</td>
                  <td>${investment.purchasePrice.toFixed(2)}</td>
                  <td>${investment.currentPrice.toFixed(2)}</td>
                  <td>${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className={`profit-loss-cell ${isProfit ? 'profit' : 'loss'}`}>
                    {isProfit ? '+' : ''}${profitLoss.toFixed(2)}
                    <span className="percentage">
                      ({isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%)
                    </span>
                  </td>
                  <td>{investment.platform}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => removeInvestment(investment.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAndSortedInvestments.length === 0 && (
        <div className="empty-state">
          <p>
            {searchTerm || selectedPlatform !== 'all'
              ? intl.formatMessage({ id: 'portfolio.noResults', defaultMessage: 'No investments match your filters.' })
              : intl.formatMessage({ id: 'portfolio.empty', defaultMessage: 'No investments yet. Start by importing your data!' })
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Portfolio;