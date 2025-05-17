// Define all your TypeScript interfaces here
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