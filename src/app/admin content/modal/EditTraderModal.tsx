'use client'
import React, { useState, useEffect, useRef } from 'react'
import { X, Upload, Camera } from 'lucide-react';
import Image from 'next/image';

// Define the interfaces directly in this file
interface Trade {
  id: string;
  status: string;
}

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

interface EditTraderModalProps {
  trader: Trader | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (trader: Trader) => void;
  isLoading: boolean;
}

const EditTraderModal: React.FC<EditTraderModalProps> = ({ trader, isLoading, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Trader>>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (trader) {
      setFormData({
        username: trader.username,
        status: trader.status,
        maxCopiers: trader.maxCopiers,
        commissionRate: trader.commissionRate,
        minCopyAmount: trader.minCopyAmount,
        maxCopyAmount: trader.maxCopyAmount,
        isPublic: trader.isPublic,
        profilePicture: trader.profilePicture,
      });
      setProfileImage(trader.profilePicture || null);
    }
  }, [trader]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trader) return;
    
    try {
      onSave({ ...trader, ...formData, profilePicture: profileImage || undefined } as Trader);
    } catch (error) {
      console.error("Failed to update trader", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: Partial<Trader>) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      
      // Simulate upload process
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
      
      // In a real application, you would upload to your server here
      // and then set the image URL from the server response
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#141E32] border border-[#1E2A4A] rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-[#1E2A4A] sticky top-0 bg-[#141E32] z-10">
          <h3 className="text-white font-semibold text-lg">Edit Trader</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-[#2A3A5F] to-[#1E2A4A] rounded-full overflow-hidden flex items-center justify-center border-2 border-[#2A3A5F]">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
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
                <span>{profileImage ? 'Change' : 'Upload'}</span>
              </button>
              
              {profileImage && (
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

          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username || ""}
              onChange={handleChange}
              className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Status</label>
            <select
              name="status"
              value={formData.status || "ACTIVE"}
              onChange={handleChange}
              className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
              required
            >
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Max Copiers</label>
            <input
              type="number"
              name="maxCopiers"
              value={formData.maxCopiers || 0}
              onChange={handleChange}
              min="0"
              className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Commission Rate (%)</label>
            <input
              type="number"
              step="0.01"
              name="commissionRate"
              value={formData.commissionRate || 0}
              onChange={handleChange}
              min="0"
              max="100"
              className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Min Copy Amount</label>
              <input
                type="number"
                step="0.01"
                name="minCopyAmount"
                value={formData.minCopyAmount || 0}
                onChange={handleChange}
                min="0"
                className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Max Copy Amount</label>
              <input
                type="number"
                step="0.01"
                name="maxCopyAmount"
                value={formData.maxCopyAmount || 0}
                onChange={handleChange}
                min="0"
                className="w-full bg-[#1E2A4A]/50 border border-[#2A3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                required
              />
            </div>
          </div>
          
          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic || false}
              onChange={handleChange}
              className="h-4 w-4 text-[#F2AF29] focus:ring-[#F2AF29] border-gray-600 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-300">
              Public Profile
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-[#1E2A4A]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white border border-[#2A3A5F] rounded-lg transition-colors"
              disabled={isLoading || isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#F2AF29] to-[#E6A522] text-[#01040F] font-medium rounded-lg transition-all duration-300 hover:opacity-90 disabled:opacity-50"
              disabled={isLoading || isUploading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTraderModal;