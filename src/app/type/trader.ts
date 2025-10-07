export interface ChartData {
  minValue: number;
  maxValue: number;
  dataPoints: number[];
}

export interface Trade {
  id: string;
  status: string;
}

export interface TraderFollower {
  id: string;
}

export interface TraderPerformance {
  id: string;
}

export interface TraderTrade {
  id: string;
}

export interface TraderSocialMetrics {
  id: string;
}

export interface UserFavoriteTrader {
  id: string;
}

// CONSOLIDATED TRADER INTERFACE
export interface Trader {
  id: string;
  username: string;
  profilePicture: string; // Made non-optional for EditTraderModal form
  bio: string; // Added from EditTraderModal
  status: "ACTIVE" | "PAUSED";
  maxCopiers: number;
  currentCopiers: number;
  totalCopiers: number;
  totalPnL: number;
  copiersPnL: number;
  aum: number;
  riskScore: number;
  badges?: string[];
  isVerified: boolean; // Added from EditTraderModal
  isPublic: boolean;
  commissionRate: number;
  minCopyAmount: number;
  maxCopyAmount?: number;
  tradingPairs: string[];
  followers: TraderFollower[]; 
  performances: TraderPerformance[]; 
  trades: TraderTrade[]; 
  socialMetrics?: TraderSocialMetrics;
  favoritedBy: UserFavoriteTrader[]; 
  actualTrades: Trade[]; 
  createdAt: Date | string;
  updatedAt: Date | string;
  copied: boolean; // Added from EditTraderModal
  favorited: boolean; // Added from EditTraderModal
}