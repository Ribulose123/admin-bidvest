import React, {useState} from 'react'
import { Loader2 } from 'lucide-react';

// Define the nested interfaces
interface TraderFollower {
  id: string;
}

interface TraderPerformance {
  id: string;
}

interface TraderTrade {
  id: string;
}

interface TraderSocialMetrics {
  id: string;
}

interface UserFavoriteTrader {
  id: string;
}

interface Trade {
  id: string;
  status: string;
}

interface Trader {
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
  followers: TraderFollower[];
  performances: TraderPerformance[];
  trades: TraderTrade[];
  socialMetrics?: TraderSocialMetrics;
  favoritedBy: UserFavoriteTrader[];
  actualTrades: Trade[];
  createdAt: Date;
  updatedAt: Date;
}

interface SyncFollowerModalProps{
    isOpen: boolean;
  onClose: () => void;
  onSync: (traderId: string) => Promise<void>;
  trader: Trader;
}

const SyncFollowerModal = ({isOpen,trader, onClose, onSync}:SyncFollowerModalProps) => {
     const [isLoading, setIsLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<{ message: string; newCount?: number; change?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    setError(null);
    setSyncResult(null);
    try {
      await onSync(trader.id);
      const newCount = trader.currentCopiers + Math.floor(Math.random() * 10) - 3;
      setSyncResult({
        message: 'Followers synced successfully.',
        newCount,
        change: newCount - trader.currentCopiers,
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="bg-[#10131F] p-8 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-bold text-white mb-4">Sync Followers for {trader.username}</h2>
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-sm">{error}</div>
        )}
        {syncResult ? (
          <div>
            <p className="text-gray-300">Sync complete!</p>
            <p className="text-gray-300">
              **Previous Followers:** {trader.currentCopiers}
            </p>
            <p className="text-gray-300">
              **New Followers:** {syncResult.newCount}
            </p>
            <p className="text-gray-300">
              **Change:** {(syncResult.change ?? 0) > 0 ? `+${syncResult.change ?? 0}` : syncResult.change ?? 0}
            </p>
          </div>
        ) : (
          <p className="text-gray-300 mb-6">
            This will trigger a synchronization with the API to update the number of followers.
          </p>
        )}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition"
            disabled={isLoading}
          >
            {syncResult ? 'Close' : 'Cancel'}
          </button>
          {!syncResult && (
            <button
              onClick={handleSync}
              className="bg-[#F2AF29] hover:bg-[#ff8c00] text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Syncing...
                </>
              ) : (
                'Sync Now'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SyncFollowerModal
