// File: src/pages/Dashboard.tsx
import React from 'react';
import { useIntl } from 'react-intl';
import { useInvestment } from '../context/InvestmentContext';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import '../styles/Dashboard.css';

// Sample performance data
const performanceData = [
  { month: 'Jan', value: 15000, target: 14500 },
  { month: 'Feb', value: 15800, target: 15200 },
  { month: 'Mar', value: 15400, target: 15800 },
  { month: 'Apr', value: 16200, target: 16500 },
  { month: 'May', value: 17100, target: 17000 },
  { month: 'Jun', value: 17800, target: 17500 },
];

// Color scheme for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Dashboard: React.FC = () => {
  const intl = useIntl();
  const { investments, isLoading } = useInvestment();

  // Calculate portfolio metrics
  const totalValue = investments.reduce((sum, inv) => sum + (inv.currentPrice * inv.quantity), 0);
  const totalCost = investments.reduce((sum, inv) => sum + (inv.purchasePrice * inv.quantity), 0);
  const totalProfitLoss = totalValue - totalCost;
  const profitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

  // Calculate asset allocation by sector
  const sectorAllocation = investments.reduce((acc, inv) => {
    const sector = inv.sector || 'Other';
    const value = inv.currentPrice * inv.quantity;
    acc[sector] = (acc[sector] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

  const allocationData = Object.entries(sectorAllocation).map(([name, value]) => ({
    name,
    value: Math.round((value / totalValue) * 100)
  }));

  // Calculate platform distribution
  const platformData = investments.reduce((acc, inv) => {
    const platform = inv.platform;
    const value = inv.currentPrice * inv.quantity;
    acc[platform] = (acc[platform] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

  const platformChartData = Object.entries(platformData).map(([name, value]) => ({
    name,
    value: Math.round(value)
  }));

  // Get recent transactions (last 5)
  const recentTransactions = investments.slice(-5).reverse();

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        {intl.formatMessage({ id: 'common.loading', defaultMessage: 'Loading...' })}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">
        {intl.formatMessage({ id: 'dashboard.welcome', defaultMessage: 'Welcome to your Investment Dashboard' })}
      </h1>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>{intl.formatMessage({ id: 'dashboard.totalValue', defaultMessage: 'Total Portfolio Value' })}</h3>
          <div className="summary-value primary">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="summary-card">
          <h3>{intl.formatMessage({ id: 'dashboard.totalCost', defaultMessage: 'Total Cost' })}</h3>
          <div className="summary-value">
            ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="summary-card">
          <h3>{intl.formatMessage({ id: 'dashboard.profitLoss', defaultMessage: 'Total Profit/Loss' })}</h3>
          <div className={`summary-value ${totalProfitLoss >= 0 ? 'profit' : 'loss'}`}>
            {totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="percentage">
              ({profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="summary-card">
          <h3>{intl.formatMessage({ id: 'dashboard.totalPositions', defaultMessage: 'Total Positions' })}</h3>
          <div className="summary-value">
            {investments.length}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>{intl.formatMessage({ id: 'dashboard.performance', defaultMessage: 'Portfolio Performance' })}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`${value.toLocaleString()}`, 'Value']} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#4a6cf7" strokeWidth={3} />
              <Line type="monotone" dataKey="target" stroke="#ff6b6b" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>{intl.formatMessage({ id: 'dashboard.allocation', defaultMessage: 'Sector Allocation' })}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>{intl.formatMessage({ id: 'dashboard.platformDistribution', defaultMessage: 'Platform Distribution' })}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value:any) => [`$${value.toLocaleString()}`, 'Value']} />
              <Bar dataKey="value" fill="#4a6cf7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="recent-transactions">
        <h3>{intl.formatMessage({ id: 'dashboard.recentTransactions', defaultMessage: 'Recent Investments' })}</h3>
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>{intl.formatMessage({ id: 'portfolio.symbol', defaultMessage: 'Symbol' })}</th>
                <th>{intl.formatMessage({ id: 'portfolio.name', defaultMessage: 'Name' })}</th>
                <th>{intl.formatMessage({ id: 'portfolio.platform', defaultMessage: 'Platform' })}</th>
                <th>{intl.formatMessage({ id: 'portfolio.purchaseDate', defaultMessage: 'Purchase Date' })}</th>
                <th>{intl.formatMessage({ id: 'portfolio.currentValue', defaultMessage: 'Current Value' })}</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((investment) => (
                <tr key={investment.id}>
                  <td className="symbol">{investment.symbol}</td>
                  <td>{investment.name}</td>
                  <td>{investment.platform}</td>
                  <td>{new Date(investment.purchaseDate).toLocaleDateString()}</td>
                  <td>${(investment.currentPrice * investment.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;