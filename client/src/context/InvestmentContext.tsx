import React, { createContext, useContext, useState, useEffect } from 'react';

// Define types for our investment data
export interface Investment {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  platform: string;
  currency: string;
  sector?: string;
  notes?: string;
}

export interface ImportPlatform {
  id: string;
  name: string;
  logo: string;
  description: string;
  supportedFormats: string[];
}

interface InvestmentContextType {
  investments: Investment[];
  platforms: ImportPlatform[];
  isLoading: boolean;
  addInvestment: (investment: Omit<Investment, 'id'>) => void;
  removeInvestment: (id: string) => void;
  updateInvestment: (id: string, data: Partial<Investment>) => void;
  importInvestments: (platform: string, data: any) => Promise<boolean>;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export const useInvestment = () => {
  const context = useContext(InvestmentContext);
  if (!context) {
    throw new Error('useInvestment must be used within an InvestmentProvider');
  }
  return context;
};

export const InvestmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Sample platforms for import
  const platforms: ImportPlatform[] = [
    {
      id: 'moomoo',
      name: 'Moomoo',
      logo: '/logos/moomoo.svg',
      description: 'Import your Moomoo portfolio data',
      supportedFormats: ['CSV', 'XLSX', 'PDF']
    },
    {
      id: 'robinhood',
      name: 'Robinhood',
      logo: '/logos/robinhood.svg',
      description: 'Import your Robinhood portfolio data',
      supportedFormats: ['CSV', 'PDF']
    },
    {
      id: 'etoro',
      name: 'eToro',
      logo: '/logos/etoro.svg',
      description: 'Import your eToro portfolio data',
      supportedFormats: ['CSV', 'XLSX']
    },
    {
      id: 'interactive-brokers',
      name: 'Interactive Brokers',
      logo: '/logos/ib.svg',
      description: 'Import your Interactive Brokers portfolio data',
      supportedFormats: ['CSV', 'XLSX']
    },
    {
      id: 'td-ameritrade',
      name: 'TD Ameritrade',
      logo: '/logos/td-ameritrade.svg',
      description: 'Import your TD Ameritrade portfolio data',
      supportedFormats: ['CSV']
    },
    {
      id: 'tiger-brokers',
      name: 'Tiger Brokers',
      logo: '/logos/tiger.svg',
      description: 'Import your Tiger Brokers portfolio data',
      supportedFormats: ['CSV', 'XLSX']
    }
  ];

  // Load investments from localStorage on initial load
  useEffect(() => {
    const loadInvestments = async () => {
      try {
        const savedInvestments = localStorage.getItem('investments');
        if (savedInvestments) {
          setInvestments(JSON.parse(savedInvestments));
        }
      } catch (error) {
        console.error('Failed to load investments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvestments();
  }, []);

  // Save investments to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('investments', JSON.stringify(investments));
    }
  }, [investments, isLoading]);

  const addInvestment = (investment: Omit<Investment, 'id'>) => {
    const newInvestment = {
      ...investment,
      id: Date.now().toString(),
    };
    setInvestments([...investments, newInvestment]);
  };

  const removeInvestment = (id: string) => {
    setInvestments(investments.filter(inv => inv.id !== id));
  };

  const updateInvestment = (id: string, data: Partial<Investment>) => {
    setInvestments(
      investments.map(inv => 
        inv.id === id ? { ...inv, ...data } : inv
      )
    );
  };

  // Function to import investments from various platforms
  const importInvestments = async (platform: string, fileData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      // In a real app, this would process the imported file based on the platform
      // For now, we'll simulate import with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample data parsing logic (simplified)
      let newInvestments: Omit<Investment, 'id'>[] = [];
      
      // Different parsing logic based on platform
      switch (platform) {
        case 'moomoo':
          // Parse Moomoo CSV/XLSX format
          newInvestments = parseMoomooData(fileData);
          break;
        case 'robinhood':
          // Parse Robinhood CSV format
          newInvestments = parseRobinhoodData(fileData);
          break;
        case 'etoro':
          // Parse eToro format
          newInvestments = parseEToroData(fileData);
          break;
        // Add cases for other platforms
        default:
          // Generic parser
          newInvestments = parseGenericData(fileData);
      }
      
      // Add all new investments
      newInvestments.forEach(inv => addInvestment(inv));
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sample parsing functions (would be more complex in a real app)
  const parseMoomooData = (data: any): Omit<Investment, 'id'>[] => {
    // This would parse the actual CSV/XLSX/PDF from Moomoo
    // Moomoo typically provides data with these columns:
    // Symbol, Security Name, Quantity, Average Cost, Market Price, Market Value, Unrealized P&L, etc.
    
    // For now, return sample data that represents typical Moomoo holdings
    return [
      {
        symbol: 'BABA',
        name: 'Alibaba Group Holding Limited',
        quantity: 100,
        purchasePrice: 85.50,
        currentPrice: 92.30,
        purchaseDate: '2023-07-15',
        platform: 'Moomoo',
        currency: 'USD',
        sector: 'Consumer Discretionary'
      },
      {
        symbol: 'NIO',
        name: 'NIO Inc.',
        quantity: 50,
        purchasePrice: 12.45,
        currentPrice: 8.70,
        purchaseDate: '2023-08-20',
        platform: 'Moomoo',
        currency: 'USD',
        sector: 'Automotive'
      },
      {
        symbol: 'PDD',
        name: 'PDD Holdings Inc.',
        quantity: 30,
        purchasePrice: 110.25,
        currentPrice: 125.80,
        purchaseDate: '2023-09-10',
        platform: 'Moomoo',
        currency: 'USD',
        sector: 'Consumer Discretionary'
      }
    ];
  };
  
  const parseRobinhoodData = (data: any): Omit<Investment, 'id'>[] => {
    // This would parse the actual CSV/PDF from Robinhood
    // For now, return sample data
    return [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 10,
        purchasePrice: 150.75,
        currentPrice: 175.23,
        purchaseDate: '2023-05-15',
        platform: 'Robinhood',
        currency: 'USD',
        sector: 'Technology'
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        quantity: 5,
        purchasePrice: 280.45,
        currentPrice: 330.12,
        purchaseDate: '2023-06-20',
        platform: 'Robinhood',
        currency: 'USD',
        sector: 'Technology'
      }
    ];
  };
  
  const parseEToroData = (data: any): Omit<Investment, 'id'>[] => {
    // eToro parsing logic
    return [
      {
        symbol: 'TSLA',
        name: 'Tesla, Inc.',
        quantity: 3,
        purchasePrice: 650.30,
        currentPrice: 720.15,
        purchaseDate: '2023-04-10',
        platform: 'eToro',
        currency: 'USD',
        sector: 'Automotive'
      }
    ];
  };
  
  const parseGenericData = (data: any): Omit<Investment, 'id'>[] => {
    // Generic parsing logic
    return [];
  };

  return (
    <InvestmentContext.Provider
      value={{
        investments,
        platforms,
        isLoading,
        addInvestment,
        removeInvestment,
        updateInvestment,
        importInvestments,
      }}
    >
      {children}
    </InvestmentContext.Provider>
  );
};