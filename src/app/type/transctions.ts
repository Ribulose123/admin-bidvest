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