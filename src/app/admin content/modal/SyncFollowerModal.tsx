import React, { useState } from 'react'
import { Loader2 } from 'lucide-react';
import { Trader, SyncResponse, SyncParams } from '@/app/type/transctions';

interface SyncFollowerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: (traderId: string, params?: SyncParams) => Promise<SyncResponse>;
  trader: Trader;
}

const SyncFollowerModal = ({ isOpen, trader, onClose, onSync }: SyncFollowerModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
 const [syncParams, setSyncParams] = useState<SyncParams>({
    traderId: trader.id, // Include traderId in params
    maxChangePercent: 25,
    incrementProbability: 0.8,
    syncFields: ["currentCopiers", "totalPnL", "aum", "riskScore"]
  });


  const handleSync = async (customParams?: SyncParams) => {
    setIsLoading(true);
    setError(null);
    setSyncResult(null);
    try {
      const paramsToUse = customParams || syncParams;
      const result = await onSync(trader.id, paramsToUse);
      setSyncResult(result);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const quickSync = (type: 'conservative' | 'moderate' | 'aggressive') => {
    const params: Partial<SyncParams> = {
      conservative: { maxChangePercent: 10, incrementProbability: 0.9 },
      moderate: { maxChangePercent: 25, incrementProbability: 0.8 },
      aggressive: { maxChangePercent: 50, incrementProbability: 0.7 }
    }[type];
    
    handleSync({ ...syncParams, ...params });
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="bg-[#10131F] p-8 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Sync Stats for {trader.username}</h2>
        
        {!syncResult && (
          <div className="space-y-4 mb-6">
            <div className="bg-blue-500/20 border border-blue-500 text-blue-300 p-3 rounded text-sm">
              Choose sync intensity. Higher values create more dramatic changes.
            </div>
            
            {/* Quick Sync Buttons */}
            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => quickSync('conservative')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm"
              >
                Conservative
              </button>
              <button 
                onClick={() => quickSync('moderate')}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded text-sm"
              >
                Moderate
              </button>
              <button 
                onClick={() => quickSync('aggressive')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm"
              >
                Aggressive
              </button>
            </div>

            {/* Custom Parameters */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Max Change: {syncParams.maxChangePercent}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={syncParams.maxChangePercent}
                  onChange={(e) => setSyncParams(prev => ({
                    ...prev,
                    maxChangePercent: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Increase Chance: {Math.round(syncParams.incrementProbability * 100)}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={syncParams.incrementProbability * 100}
                  onChange={(e) => setSyncParams(prev => ({
                    ...prev,
                    incrementProbability: parseInt(e.target.value) / 100
                  }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        {syncResult ? (
          <div className="space-y-4">
            <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded text-sm">
              {syncResult.message}
            </div>
            
            {/* Display the updated stats */}
            {Object.entries(syncResult.data.updatedStats).map(([key, value]) => (
              value.change !== 0 && (
                <div key={key} className="bg-[#0A0F1C] p-3 rounded border border-gray-700">
                  <h3 className="font-semibold text-white mb-2 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-400">Previous:</div>
                    <div>{typeof value.previous === 'number' ? value.previous.toFixed(2) : value.previous}</div>
                    <div className="text-gray-400">New:</div>
                    <div className="text-green-400 font-semibold">
                      {typeof value.new === 'number' ? value.new.toFixed(2) : value.new}
                    </div>
                    <div className="text-gray-400">Change:</div>
                    <div className={
                      value.change > 0 ? "text-green-400" : 
                      value.change < 0 ? "text-red-400" : "text-gray-400"
                    }>
                      {value.change > 0 ? "+" : ""}{typeof value.change === 'number' ? value.change.toFixed(2) : value.change}
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <p className="text-gray-300 mb-6">
            This will generate realistic changes to trader statistics for testing and demonstration.
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
              onClick={() => handleSync()}
              className="bg-[#F2AF29] hover:bg-[#ff8c00] text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Syncing...
                </>
              ) : (
                'Custom Sync'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncFollowerModal