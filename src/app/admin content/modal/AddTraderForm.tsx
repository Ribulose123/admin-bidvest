import Image from 'next/image';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Camera } from 'lucide-react';


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
}

// Main Trader interface
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
  isVerified: boolean;
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

interface AddTraderFormProps {
  onClose: () => void;
  onTraderAdded: (trader: Trader) => void;
  isLoading?: boolean;
}

interface FormData {
  username: string;
  displayName: string;
  status: "ACTIVE" | "PAUSED";
  maxCopiers: string;
  isVerified: boolean;
  isPublic: boolean;
  commissionRate: string;
  minCopyAmount: string;
  maxCopyAmount: string;
  tradingPairs: string;
  strategy: string;
  atrRoll: string;
  winRate: string;
  profitSharing: string;
  followers: string;
  description: string;
  profilePicture?: File | null;
}

const AddTraderForm: React.FC<AddTraderFormProps> = ({ onClose, onTraderAdded, isLoading = false }) => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    displayName: '',
    status: 'ACTIVE',
    maxCopiers: '',
    isVerified: false,
    isPublic: true,
    commissionRate: '',
    minCopyAmount: '',
    maxCopyAmount: '',
    tradingPairs: '',
    strategy: 'Short-Term Scalping',
    atrRoll: '',
    winRate: '',
    profitSharing: '',
    followers: '',
    description: '',
    profilePicture: null
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Create a temporary Trader object with default values
    // The actual API call should return the full Trader object
    const tempTrader: Trader = {
      id: `temp-${Date.now()}`, // Temporary ID
      username: formData.username,
      profilePicture: imagePreview || undefined,
      status: formData.status,
      maxCopiers: Number(formData.maxCopiers) || 0,
      currentCopiers: 0,
      totalCopiers: 0,
      totalPnL: 0,
      copiersPnL: 0,
      aum: 0,
      riskScore: 0,
      badges: [],
      isVerified: formData.isVerified,
      isPublic: formData.isPublic,
      commissionRate: Number(formData.commissionRate) || 0,
      minCopyAmount: Number(formData.minCopyAmount) || 0,
      maxCopyAmount: formData.maxCopyAmount ? Number(formData.maxCopyAmount) : undefined,
      tradingPairs: formData.tradingPairs.split(',').map(pair => pair.trim()).filter(Boolean),
      followers: [],
      performances: [],
      trades: [],
      socialMetrics: undefined,
      favoritedBy: [],
      actualTrades: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    onTraderAdded(tempTrader);
  };

  const handleCancel = () => {
    setFormData({
      username: '',
      displayName: '',
      status: 'ACTIVE',
      maxCopiers: '',
      isVerified: false,
      isPublic: true,
      commissionRate: '',
      minCopyAmount: '',
      maxCopyAmount: '',
      tradingPairs: '',
      strategy: 'Short-Term Scalping',
      atrRoll: '',
      winRate: '',
      profitSharing: '',
      followers: '',
      description: '',
      profilePicture: null
    });
    setImagePreview(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Add Trader</h2>
        <p className="text-sm text-gray-600 mb-6">
          Add a new trader to the platform. Fill in the required details below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Photo
            </label>
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                {imagePreview ? (
                  <Image
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    width={80}
                    height={80}
                  />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-20 h-20 opacity-0 cursor-pointer rounded-full"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer">
                +
              </div>
            </div>
          </div>

          {/* Username (Required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
            </select>
          </div>

          {/* Max Copiers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Copiers
            </label>
            <input
              type="number"
              name="maxCopiers"
              value={formData.maxCopiers}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              disabled={isLoading}
            />
          </div>

          {/* Commission Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commission Rate (%)
            </label>
            <input
              type="number"
              name="commissionRate"
              value={formData.commissionRate}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Min Copy Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Copy Amount ($)
            </label>
            <input
              type="number"
              name="minCopyAmount"
              value={formData.minCopyAmount}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Max Copy Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Copy Amount ($)
            </label>
            <input
              type="number"
              name="maxCopyAmount"
              value={formData.maxCopyAmount}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Trading Pairs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trading Pairs (comma separated) *
            </label>
            <input
              type="text"
              name="tradingPairs"
              value={formData.tradingPairs}
              onChange={handleInputChange}
              placeholder="BTC/USD, ETH/USD, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>

          {/* Is Verified */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isVerified"
              checked={formData.isVerified}
              onChange={handleInputChange}
              className="mr-2"
              disabled={isLoading}
            />
            <label className="text-sm font-medium text-gray-700">
              Verified Trader
            </label>
          </div>

          {/* Is Public */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleInputChange}
              className="mr-2"
              disabled={isLoading}
            />
            <label className="text-sm font-medium text-gray-700">
              Public Profile
            </label>
          </div>

          {/* Strategy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Strategy
            </label>
            <select
              name="strategy"
              value={formData.strategy}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="Short-Term Scalping">Short-Term Scalping</option>
              <option value="Day Trading">Day Trading</option>
              <option value="Swing Trading">Swing Trading</option>
              <option value="Position Trading">Position Trading</option>
            </select>
          </div>

          {/* ATR Roll */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ATR Roll
            </label>
            <input
              type="text"
              name="atrRoll"
              value={formData.atrRoll}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Win Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Win Rate (%)
            </label>
            <input
              type="text"
              name="winRate"
              value={formData.winRate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Profit Sharing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profit Sharing (%)
            </label>
            <input
              type="text"
              name="profitSharing"
              value={formData.profitSharing}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Followers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Followers
            </label>
            <input
              type="text"
              name="followers"
              value={formData.followers}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              maxLength={300}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isLoading}
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {formData.description.length}/300
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                handleCancel();
                onClose();
              }}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTraderForm;