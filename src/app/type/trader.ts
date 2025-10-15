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

// ADD THE MISSING INTERFACES
export interface Follower {
  id: string;
  userId: string;
  traderId: string;
  followedAt: Date;
}

export interface Performance {
  id: string;
  period: string; // e.g., "DAILY", "WEEKLY", "MONTHLY"
  roi: number;
  pnl: number;
  date: Date;
}

export interface FavoritedBy {
  id: string;
  userId: string;
  traderId: string;
  favoritedAt: Date;
}

export interface SocialMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  subscribers: number;
}

// CONSOLIDATED TRADER INTERFACE
export interface Trader {
  id: string;
  username: string;
  profilePicture: string;
  bio: string;
  status: 'ACTIVE' | 'PAUSED';
  maxCopiers: number;
  currentCopiers: number;
  totalCopiers: number;
  totalPnL: number;
  copiersPnL: number;
  aum: number;
  riskScore: number;
  badges: string[];
  isVerified: boolean;
  isPublic: boolean;
  commissionRate: number;
  minCopyAmount: number;
  maxCopyAmount?: number;
  tradingPairs: string[];
  followers: Follower[];
  performances: Performance[];
  trades: Trade[];
  socialMetrics: SocialMetrics;
  favoritedBy: FavoritedBy[];
  actualTrades: Trade[];
  createdAt: Date;
  updatedAt: Date;
  copied: boolean;
  favorited: boolean;
  
  // Add new performance fields
  roiPercent?: number;
  totalReturn?: number;
  winRate?: number;
  avgWinAmount?: number;
  avgLossAmount?: number;
  maxDrawdown?: number;
  sharpeRatio?: number;
  totalTrades?: number;
  winningTrades?: number;
  losingTrades?: number;
  profitFactor?: number;
  
  // Add new social metrics fields
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  subscribers?: number;
}