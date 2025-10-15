'use client'
import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react'
import { X, Upload, Camera } from 'lucide-react';
import Image from 'next/image';
import { Trader } from '@/app/type/trader'; 

interface EditTraderModalProps {
  trader: Trader | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (trader: Trader) => void | Promise<void>; 
  isLoading: boolean;
}

interface FormData {
  username: string;
  profilePicture: string;
  bio: string;
  status: "ACTIVE" | "PAUSED";
  maxCopiers: string;
  isVerified: boolean;
  isPublic: boolean;
  commissionRate: string;
  minCopyAmount: string;
  maxCopyAmount: string;
  tradingPairs: string;
  
  // New performance fields
  roiPercent: string;
  totalReturn: string;
  winRate: string;
  avgWinAmount: string;
  avgLossAmount: string;
  maxDrawdown: string;
  sharpeRatio: string;
  totalTrades: string;
  winningTrades: string;
  losingTrades: string;
  profitFactor: string;
  
  // New social metrics fields
  views: string;
  likes: string;
  comments: string;
  shares: string;
  subscribers: string;
}

const EditTraderModal: React.FC<EditTraderModalProps> = ({ 
  trader, 
  isLoading, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    profilePicture: '',
    bio: '',
    status: 'ACTIVE',
    maxCopiers: '',
    isVerified: false,
    isPublic: true,
    commissionRate: '',
    minCopyAmount: '',
    maxCopyAmount: '',
    tradingPairs: '',
    
    // New performance fields
    roiPercent: '',
    totalReturn: '',
    winRate: '',
    avgWinAmount: '',
    avgLossAmount: '',
    maxDrawdown: '',
    sharpeRatio: '',
    totalTrades: '',
    winningTrades: '',
    losingTrades: '',
    profitFactor: '',
    
    // New social metrics fields
    views: '',
    likes: '',
    comments: '',
    shares: '',
    subscribers: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (trader) {
      setFormData({
        username: trader.username,
        profilePicture: trader.profilePicture,
        bio: trader.bio,
        status: trader.status,
        maxCopiers: trader.maxCopiers.toString(),
        isVerified: trader.isVerified,
        isPublic: trader.isPublic,
        commissionRate: trader.commissionRate.toString(),
        minCopyAmount: trader.minCopyAmount.toString(),
        maxCopyAmount: trader.maxCopyAmount?.toString() || '',
        tradingPairs: trader.tradingPairs.join(', '),
        
        // New performance fields
        roiPercent: (trader.roiPercent || 0).toString(),
        totalReturn: (trader.totalReturn || 0).toString(),
        winRate: (trader.winRate || 0).toString(),
        avgWinAmount: (trader.avgWinAmount || 0).toString(),
        avgLossAmount: (trader.avgLossAmount || 0).toString(),
        maxDrawdown: (trader.maxDrawdown || 0).toString(),
        sharpeRatio: (trader.sharpeRatio || 0).toString(),
        totalTrades: (trader.totalTrades || 0).toString(),
        winningTrades: (trader.winningTrades || 0).toString(),
        losingTrades: (trader.losingTrades || 0).toString(),
        profitFactor: (trader.profitFactor || 0).toString(),
        
        // New social metrics fields
        views: (trader.views || 0).toString(),
        likes: (trader.likes || 0).toString(),
        comments: (trader.comments || 0).toString(),
        shares: (trader.shares || 0).toString(),
        subscribers: (trader.subscribers || 0).toString(),
      });
    }
  }, [trader]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required.';
    }

    if (!formData.profilePicture.trim()) {
      newErrors.profilePicture = 'Profile picture URL is required.';
    } else {
      try {
        new URL(formData.profilePicture);
      } catch {
        newErrors.profilePicture = 'Please enter a valid URL.';
      }
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required.';
    }

    if (!formData.tradingPairs.trim()) {
      newErrors.tradingPairs = 'Trading pairs are required.';
    }

    if (isNaN(Number(formData.maxCopiers)) || Number(formData.maxCopiers) < 0) {
      newErrors.maxCopiers = 'Max Copiers must be a positive number.';
    }
    
    if (isNaN(Number(formData.commissionRate)) || Number(formData.commissionRate) < 0) {
      newErrors.commissionRate = 'Commission Rate must be a positive number.';
    }

    if (isNaN(Number(formData.minCopyAmount)) || Number(formData.minCopyAmount) < 0) {
      newErrors.minCopyAmount = 'Min Copy Amount must be a positive number.';
    }

    if (formData.maxCopyAmount && (isNaN(Number(formData.maxCopyAmount)) || Number(formData.maxCopyAmount) < 0)) {
      newErrors.maxCopyAmount = 'Max Copy Amount must be a positive number.';
    }

    // Validate new numeric fields
    const numericFields = [
      'roiPercent', 'totalReturn', 'winRate', 'avgWinAmount', 'avgLossAmount',
      'maxDrawdown', 'sharpeRatio', 'totalTrades', 'winningTrades', 'losingTrades',
      'profitFactor', 'views', 'likes', 'comments', 'shares', 'subscribers'
    ];

    numericFields.forEach(field => {
      const value = formData[field as keyof FormData];
      if (value && isNaN(Number(value))) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} must be a valid number.`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setSubmissionError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmissionError('');
    
    if (!trader || !validateForm()) {
      return;
    }

    const updatedTrader: Trader = {
      ...trader,
      username: formData.username.trim(),
      profilePicture: formData.profilePicture.trim(),
      bio: formData.bio.trim(),
      status: formData.status,
      maxCopiers: Number(formData.maxCopiers) || 0,
      isVerified: formData.isVerified,
      isPublic: formData.isPublic,
      commissionRate: Number(formData.commissionRate) || 0,
      minCopyAmount: Number(formData.minCopyAmount) || 0,
      maxCopyAmount: formData.maxCopyAmount ? Number(formData.maxCopyAmount) : undefined,
      tradingPairs: formData.tradingPairs.split(',').map(pair => pair.trim()).filter(Boolean),
      
      // New performance fields
      roiPercent: Number(formData.roiPercent) || 0,
      totalReturn: Number(formData.totalReturn) || 0,
      winRate: Number(formData.winRate) || 0,
      avgWinAmount: Number(formData.avgWinAmount) || 0,
      avgLossAmount: Number(formData.avgLossAmount) || 0,
      maxDrawdown: Number(formData.maxDrawdown) || 0,
      sharpeRatio: Number(formData.sharpeRatio) || 0,
      totalTrades: Number(formData.totalTrades) || 0,
      winningTrades: Number(formData.winningTrades) || 0,
      losingTrades: Number(formData.losingTrades) || 0,
      profitFactor: Number(formData.profitFactor) || 0,
      
      // New social metrics fields
      views: Number(formData.views) || 0,
      likes: Number(formData.likes) || 0,
      comments: Number(formData.comments) || 0,
      shares: Number(formData.shares) || 0,
      subscribers: Number(formData.subscribers) || 0,
      
      updatedAt: new Date(),
    };

    try {
      await onSave(updatedTrader);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      setSubmissionError(message);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      
      // Simulate upload process - in real app, upload to your server
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profilePicture: reader.result as string
        }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeProfileImage = () => {
    setFormData(prev => ({
      ...prev,
      profilePicture: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    if (trader) {
      setFormData({
        username: trader.username,
        profilePicture: trader.profilePicture,
        bio: trader.bio,
        status: trader.status,
        maxCopiers: trader.maxCopiers.toString(),
        isVerified: trader.isVerified,
        isPublic: trader.isPublic,
        commissionRate: trader.commissionRate.toString(),
        minCopyAmount: trader.minCopyAmount.toString(),
        maxCopyAmount: trader.maxCopyAmount?.toString() || '',
        tradingPairs: trader.tradingPairs.join(', '),
        
        // New performance fields
        roiPercent: (trader.roiPercent || 0).toString(),
        totalReturn: (trader.totalReturn || 0).toString(),
        winRate: (trader.winRate || 0).toString(),
        avgWinAmount: (trader.avgWinAmount || 0).toString(),
        avgLossAmount: (trader.avgLossAmount || 0).toString(),
        maxDrawdown: (trader.maxDrawdown || 0).toString(),
        sharpeRatio: (trader.sharpeRatio || 0).toString(),
        totalTrades: (trader.totalTrades || 0).toString(),
        winningTrades: (trader.winningTrades || 0).toString(),
        losingTrades: (trader.losingTrades || 0).toString(),
        profitFactor: (trader.profitFactor || 0).toString(),
        
        // New social metrics fields
        views: (trader.views || 0).toString(),
        likes: (trader.likes || 0).toString(),
        comments: (trader.comments || 0).toString(),
        shares: (trader.shares || 0).toString(),
        subscribers: (trader.subscribers || 0).toString(),
      });
    }
    setErrors({});
    setSubmissionError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#141E32] border border-[#1E2A4A] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-[#1E2A4A] sticky top-0 bg-[#141E32] z-10">
          <h3 className="text-white font-semibold text-lg">Edit Trader</h3>
          <button 
            onClick={handleCancel}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {submissionError && (
            <div className="bg-red-600/20 border border-red-600/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {submissionError}
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-[#2A3A5F] to-[#1E2A4A] rounded-full overflow-hidden flex items-center justify-center border-2 border-[#2A3A5F]">
                {formData.profilePicture ? (
                  <Image
                    src={formData.profilePicture}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <Camera size={32} className="text-gray-400" />
                  </div>
                )}
              </div>
              
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2AF29]"></div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={triggerFileInput}
                className="px-4 py-2 bg-[#1E2A4A] text-white rounded-lg flex items-center space-x-2 hover:bg-[#2A3A5F] transition-colors"
                disabled={isUploading}
              >
                <Upload size={16} />
                <span>{formData.profilePicture ? 'Change' : 'Upload'}</span>
              </button>
              
              {formData.profilePicture && (
                <button
                  type="button"
                  onClick={removeProfileImage}
                  className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                  disabled={isUploading}
                >
                  Remove
                </button>
              )}
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            
            <p className="text-xs text-gray-400 mt-2 text-center">
              JPG, PNG or GIF. Max size: 2MB
            </p>
          </div>

          {/* Profile Picture URL Input */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Profile Picture URL *</label>
            <input
              type="url"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleInputChange}
              placeholder="https://example.com/profile.jpg"
              className={`w-full bg-[#1E2A4A]/50 border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29] ${
                errors.profilePicture ? 'border-red-500' : 'border-[#2A3A5F]'
              }`}
              required
              disabled={isLoading || isUploading}
            />
            {errors.profilePicture && (
              <p className="mt-1 text-sm text-red-500">{errors.profilePicture}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`w-full bg-[#1E2A4A]/50 border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29] ${
                errors.username ? 'border-red-500' : 'border-[#2A3A5F]'
              }`}
              required
              disabled={isLoading}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Bio *</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              placeholder="Professional forex trader with 5+ years experience"
              className={`w-full bg-[#1E2A4A]/50 border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29] ${
                errors.bio ? 'border-red-500' : 'border-[#2A3A5F]'
              }`}
              required
              disabled={isLoading}
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-500">{errors.bio}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
              disabled={isLoading}
            >
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
            </select>
          </div>

          {/* Max Copiers */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Max Copiers</label>
            <input
              type="number"
              name="maxCopiers"
              value={formData.maxCopiers}
              onChange={handleInputChange}
              min="0"
              className={`w-full bg-[#1E2A4A]/50 border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29] ${
                errors.maxCopiers ? 'border-red-500' : 'border-[#2A3A5F]'
              }`}
              required
              disabled={isLoading}
            />
            {errors.maxCopiers && (
              <p className="mt-1 text-sm text-red-500">{errors.maxCopiers}</p>
            )}
          </div>

          {/* Commission Rate */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Commission Rate (%)</label>
            <input
              type="number"
              name="commissionRate"
              value={formData.commissionRate}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              max="100"
              className={`w-full bg-[#1E2A4A]/50 border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29] ${
                errors.commissionRate ? 'border-red-500' : 'border-[#2A3A5F]'
              }`}
              required
              disabled={isLoading}
            />
            {errors.commissionRate && (
              <p className="mt-1 text-sm text-red-500">{errors.commissionRate}</p>
            )}
          </div>

          {/* Copy Amounts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Min Copy Amount ($)</label>
              <input
                type="number"
                name="minCopyAmount"
                value={formData.minCopyAmount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full bg-[#1E2A4A]/50 border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29] ${
                  errors.minCopyAmount ? 'border-red-500' : 'border-[#2A3A5F]'
                }`}
                required
                disabled={isLoading}
              />
              {errors.minCopyAmount && (
                <p className="mt-1 text-sm text-red-500">{errors.minCopyAmount}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Max Copy Amount ($) (Optional)</label>
              <input
                type="number"
                name="maxCopyAmount"
                value={formData.maxCopyAmount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full bg-[#1E2A4A]/50 border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29] ${
                  errors.maxCopyAmount ? 'border-red-500' : 'border-[#2A3A5F]'
                }`}
                disabled={isLoading}
              />
              {errors.maxCopyAmount && (
                <p className="mt-1 text-sm text-red-500">{errors.maxCopyAmount}</p>
              )}
            </div>
          </div>
          
          {/* Trading Pairs */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Trading Pairs (Comma-separated) *</label>
            <input
              type="text"
              name="tradingPairs"
              value={formData.tradingPairs}
              onChange={handleInputChange}
              placeholder="BTC/USDT, ETH/USD"
              className={`w-full bg-[#1E2A4A]/50 border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29] ${
                errors.tradingPairs ? 'border-red-500' : 'border-[#2A3A5F]'
              }`}
              required
              disabled={isLoading}
            />
            {errors.tradingPairs && (
              <p className="mt-1 text-sm text-red-500">{errors.tradingPairs}</p>
            )}
          </div>

          {/* Performance Metrics Section */}
          <div className="border-t border-[#1E2A4A] pt-4">
            <h4 className="text-white font-medium mb-4">Performance Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">ROI %</label>
                <input
                  type="number"
                  name="roiPercent"
                  value={formData.roiPercent}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Total Return</label>
                <input
                  type="number"
                  name="totalReturn"
                  value={formData.totalReturn}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Win Rate %</label>
                <input
                  type="number"
                  name="winRate"
                  value={formData.winRate}
                  onChange={handleInputChange}
                  step="0.1"
                  max="100"
                  className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Sharpe Ratio</label>
                <input
                  type="number"
                  name="sharpeRatio"
                  value={formData.sharpeRatio}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Avg Win Amount</label>
                <input
                  type="number"
                  name="avgWinAmount"
                  value={formData.avgWinAmount}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Avg Loss Amount</label>
                <input
                  type="number"
                  name="avgLossAmount"
                  value={formData.avgLossAmount}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Max Drawdown %</label>
                <input
                  type="number"
                  name="maxDrawdown"
                  value={formData.maxDrawdown}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Profit Factor</label>
                <input
                  type="number"
                  name="profitFactor"
                  value={formData.profitFactor}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Total Trades</label>
                <input
                  type="number"
                  name="totalTrades"
                  value={formData.totalTrades}
                  onChange={handleInputChange}
                  className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Winning Trades</label>
                <input
                  type="number"
                  name="winningTrades"
                  value={formData.winningTrades}
                  onChange={handleInputChange}
                  className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Losing Trades</label>
                <input
                  type="number"
                  name="losingTrades"
                  value={formData.losingTrades}
                  onChange={handleInputChange}
                  className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Social Metrics Section */}
          <div className="border-t border-[#1E2A4A] pt-4">
            <h4 className="text-white font-medium mb-4">Social Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Views</label>
                <input
                  type="number"
                  name="views"
                  value={formData.views}
                  onChange={handleInputChange}
                  className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Likes</label>
                <input
                  type="number"
                  name="likes"
                  value={formData.likes}
                  onChange={handleInputChange}
                  className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Comments</label>
                <input
                  type="number"
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Shares</label>
                <input
                  type="number"
                  name="shares"
                  value={formData.shares}
                  onChange={handleInputChange}
                  className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Subscribers</label>
                <input
                  type="number"
                  name="subscribers"
                  value={formData.subscribers}
                  onChange={handleInputChange}
                  className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          
          {/* Checkboxes */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center">
              <input
                id="isVerified"
                type="checkbox"
                name="isVerified"
                checked={formData.isVerified}
                onChange={handleInputChange}
                className="w-4 h-4 text-[#F2AF29] bg-gray-700 border-gray-600 rounded focus:ring-[#F2AF29]"
                disabled={isLoading}
              />
              <label htmlFor="isVerified" className="ml-2 text-sm font-medium text-gray-300">
                Is Verified Trader
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="isPublic"
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="w-4 h-4 text-[#F2AF29] bg-gray-700 border-gray-600 rounded focus:ring-[#F2AF29]"
                disabled={isLoading}
              />
              <label htmlFor="isPublic" className="ml-2 text-sm font-medium text-gray-300">
                Is Publicly Listed (Allows new copiers)
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2 border border-[#2A3A5F] text-gray-400 rounded-lg hover:bg-[#1E2A4A] transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#F2AF29] to-[#E6A522] text-[#01040F] font-semibold rounded-lg hover:from-[#E6A522] hover:to-[#D99C1F] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isLoading || isUploading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-[#01040F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTraderModal;