import React, { useState, useEffect, useMemo } from "react";
import { 
  UserApiService, 
  UpdateAssetBalanceRequest, 
  UpdateSignalBalanceRequest, 
  UpdateSubscriptionBalanceRequest, 
  UpdateStakingBalanceRequest
} from "@/app/hooks/data";

interface BalanceField {
  name: string;
  label: string;
  type: 'number' | 'text';
  required?: boolean;
  step?: string;
  min?: number;
  max?: number;
}

interface CurrentData {
  asset?: { balance: number; platformAssetId?: string };
  signal?: { stakings: number; strength: number; signalId?: string };
  subscription?: { subscriptionBalance: number };
  staking?:{stakeId?: string; totalBalance: number, activeBalance:number}
}

interface UpdateBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  title: string;
  balanceType: 'asset' | 'signal' | 'subscription' | 'staking';
  currentData?: CurrentData['asset'] | CurrentData['signal'] | CurrentData['subscription'] | CurrentData['staking'];
  onUpdateSuccess: () => void;
  platformAssetId?: string;
  signalId?: string;
  stakeId?:string
}

export const UpdateBalanceModal: React.FC<UpdateBalanceModalProps> = ({
  isOpen,
  onClose,
  userId,
  title,
  balanceType,
  currentData,
  onUpdateSuccess,
  platformAssetId,
  signalId,
  stakeId
}) => {
  const balanceFields = useMemo((): Record<string, BalanceField[]> => ({
    asset: [
      { name: 'balance', label: 'Asset Balance', type: 'number', required: true, step: '0.01', min: 0 }
    ],
    signal: [
      { name: 'stakings', label: 'Staking Amount', type: 'number', required: true, step: '0.01', min: 0 },
      { name: 'strength', label: 'Signal Strength', type: 'number', required: true, step: '0.01', min: 0, max: 1 }
    ],
    subscription: [
      { name: 'subscriptionBalance', label: 'Subscription Balance', type: 'number', required: true, step: '0.01', min: 0 }
    ],
     staking: [
    { name: 'totalBalance', label: 'Total Staking Balance', type: 'number', required: true, step: '0.01', min: 0 },
     ]
  }), []);

  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initialData: Record<string, string | number> = { userId };
      
      balanceFields[balanceType].forEach(field => {
        const fieldName = field.name;
        const currentValue = (currentData as Record<string, number>)?.[fieldName] || 0;
        initialData[fieldName] = currentValue;
      });

      setFormData(initialData);
      setError(null);
    }
  }, [isOpen, balanceType, userId, currentData, balanceFields]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    const currentField = balanceFields[balanceType].find(f => f.name === name);
    const numericValue = currentField?.type === 'number' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      switch (balanceType) {
        case 'asset':
          if (!platformAssetId) {
            throw new Error("platformAssetId is required for asset balance updates");
          }
          
          const assetRequest: UpdateAssetBalanceRequest = {
            userId,
            platformAssetId: platformAssetId,
            balance: Number(formData.balance)
          };
          await UserApiService.updateAssetBalance(assetRequest);
          break;
        
        case 'signal':
          if (!signalId) {
            throw new Error("signalId is required for signal balance updates");
          }
          
          const signalRequest: UpdateSignalBalanceRequest = {
            userId,
            signalId: signalId,
            stakings: Number(formData.stakings),
            strength: Number(formData.strength)
          };
          await UserApiService.updateSignalBalance(signalRequest);
          break;
        
        case 'subscription':
          const subscriptionRequest: UpdateSubscriptionBalanceRequest = {
            userId,
            subscriptionBalance: Number(formData.subscriptionBalance)
          };
          await UserApiService.updateSubscriptionBalance(subscriptionRequest);
          break;

        case'staking':
        const stakeRequest:UpdateStakingBalanceRequest={
          userId,
          stakeId:stakeId,
          activeBalance:Number(formData.activeBalance),
          totalBalance: Number(formData.totalBalance)
        }
        await UserApiService.updateStakingBalance(stakeRequest);
        break
      }
      
      onUpdateSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update ${title}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const fields = balanceFields[balanceType];
  const isAssetMissingId = balanceType === 'asset' && !platformAssetId;
  const isSignalMissingId = balanceType === 'signal' && !signalId;
  const isStakingMissingId = balanceType === 'staking' && !stakeId

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="bg-[#141E32] border border-[#243049] rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Update {title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {isAssetMissingId && (
          <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg p-3 mb-4">
            <p className="text-yellow-300 text-sm">
              platformAssetId is missing. Cannot update asset balance without a valid asset ID.
            </p>
          </div>
        )}

        {isSignalMissingId && (
          <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg p-3 mb-4">
            <p className="text-yellow-300 text-sm">
              signalId is missing. Cannot update signal balance without a valid signal ID.
            </p>
          </div>
        )}

         {isStakingMissingId && (
          <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg p-3 mb-4">
            <p className="text-yellow-300 text-sm">
              stakeId is missing. Cannot update stake balance without a valid signal ID.
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                step={field.step}
                min={field.min}
                max={field.max}
                className="w-full bg-[#0A0F1C] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                required={field.required}
                disabled={isAssetMissingId || isSignalMissingId || isStakingMissingId}
              />
            </div>
          ))}

          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isAssetMissingId || isSignalMissingId || isStakingMissingId}
              className="px-4 py-2 bg-[#F2AF29] text-white rounded-lg hover:bg-[#e5a524] transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                  Updating...
                </>
              ) : (
                `Update ${title}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};