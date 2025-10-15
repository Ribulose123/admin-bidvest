// types/transaction.ts
export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'SUBSCRIPTION' | 'STAKING' | 'SIGNALS';
  amount: number;
  currency: string;
  createdAt: string;
  description: string;
  userId?: string;
  status?: 'pending' | 'completed' | 'failed';
}

export interface TransactionSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  depositCount: number;
  withdrawalCount: number;
  breakdown: {
    DEPOSIT: number;
    SIGNALS: number;
    STAKING: number;
    SUBSCRIPTION: number;
    WITHDRAWAL: number;
  };
  currency: string;
}

// types/transaction.ts
export interface Transactions {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'SUBSCRIPTION' | 'STAKING' | 'SIGNALS';
  amount: number;
  currency: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  userId?: string;
  status: 'pending' | 'completed' | 'failed';
  platformAssetId?: string;
  reference?: string;
}

export type TransactionStatus = 'all' | 'pending' | 'completed' | 'failed';



// src/app/types/trader.ts
export interface TraderInfo {
  id: string;
  username: string;
  bio?: string;
}

export interface UserInfo {
  id: string;
  fullName: string;
}

export interface Trade {
  id: string;
  traderType: string;
  traderId: string;
  userId: string | null;
  tradePair: string;
  action: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  orderType: string;
  timeInForce: string;
  leverage: number;
  executionStatus: string;
  executedAt: string | null;
  failureReason: string | null;
  positionId: string | null;
  isClosingTrade: boolean;
  realizedPnL: number;
  unrealizedPnL: number;
  originalTradeId: string | null;
  copyRatio: number | null;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  trader: TraderInfo; 
  user: UserInfo;
}
export interface Trader {
  id: string;
  username: string;
  profilePicture?: string;
  status: "ACTIVE" | "PAUSED";
  maxCopiers: number;
  currentCopiers: number;
  totalCopiers: number;
  totalPnL: number;
  copiersPnL: number;
  aum: number;
  riskScore: number;
  badges?: string[];
  isPublic: boolean;
  commissionRate: number;
  minCopyAmount: number;
  maxCopyAmount?: number;
  tradingPairs: string[];
  followers: { id: string }[];
  performances: { id: string }[];
  trades: { id: string }[];
  socialMetrics?: { id: string };
  favoritedBy: { id: string }[];
  actualTrades: Trade[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
}

export interface TradesResponse {
  data: {
    trades: Trade[];
    pagination: PaginationInfo;
  }
}


// In your types/transctions.ts file, add:
// Add to your types/transctions.ts file
export interface SyncParams {
  traderId: string;
  maxChangePercent: number;
  incrementProbability: number;
  syncFields?: string[];
}

export interface SyncResponse {
  status: number;
  message: string;
  data: {
    traderId: string;
    updatedStats: {
      currentCopiers: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      totalCopiers: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      totalPnL: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      copiersPnL: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      aum: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      riskScore: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      commissionRate: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      roiPercent?: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      totalReturn?: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      winRate?: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      avgWinAmount?: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      avgLossAmount?: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      maxDrawdown?: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      sharpeRatio?: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      totalTrades?: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      winningTrades?: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      losingTrades?: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      profitFactor?: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      views?: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      likes?: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      comments?: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      shares?: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
      subscribers?: {
        previous: number;
        new: number;
        change: number;
        changeType: "INCREMENT" | "DECREMENT" | "NO_CHANGE";
      };
    };
    message: string;
  };
}