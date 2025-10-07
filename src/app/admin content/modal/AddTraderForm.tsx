import Image from 'next/image';
import React, { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
// Interface for the trader creation data (only fields API accepts)
interface CreateTraderData {
  username: string;
  profilePicture: string;
  bio: string;
  status: "ACTIVE" | "PAUSED";
  maxCopiers: number;
  isVerified: boolean;
  isPublic: boolean;
  commissionRate: number;
  minCopyAmount: number;
  maxCopyAmount?: number;
  tradingPairs: string[];
}

interface AddTraderFormProps {
  onClose: () => void;
  onTraderAdded: (traderData: CreateTraderData) => Promise<void>;
  isLoading?: boolean;
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
}

const AddTraderForm: React.FC<AddTraderFormProps> = ({ onClose, onTraderAdded, isLoading = false }) => {
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required.';
    }

    if (!formData.profilePicture.trim()) {
      newErrors.profilePicture = 'Profile picture URL is required.';
    } else {
      // Basic URL validation
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
  

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmissionError('');
    
    if (!validateForm()) {
      return;
    }

    const traderData: CreateTraderData = {
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
    };

    try {
      await onTraderAdded(traderData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      setSubmissionError(message);
    }
  };

  const handleCancel = () => {
    setFormData({
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
    });
    setErrors({});
    setSubmissionError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Add Trader</h2>
        <p className="text-sm text-gray-600 mb-6">
          Add a new trader to the platform. Fill in the required details below.
        </p>

        {submissionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{submissionError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-black">

          
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              disabled={isLoading}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          {/* Profile Picture (Required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture URL *
            </label>
            <input
              type="url"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleInputChange}
              placeholder="https://example.com/profile.jpg"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.profilePicture ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              disabled={isLoading}
            />
            {errors.profilePicture && (
              <p className="mt-1 text-sm text-red-500">{errors.profilePicture}</p>
            )}
            {formData.profilePicture && !errors.profilePicture && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Profile Preview:</p>
                <Image 
                  src={formData.profilePicture} 
                  alt="Profile preview" 
                  className="h-20 w-20 object-cover rounded-full border"
                  width={40}
                  height={40}
                  unoptimized
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Bio (Required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio *
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              placeholder="Professional forex trader with 5+ years experience"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.bio ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.maxCopiers ? 'border-red-500' : 'border-gray-300'
              }`}
              min="0"
              disabled={isLoading}
            />
            {errors.maxCopiers && (
              <p className="mt-1 text-sm text-red-500">{errors.maxCopiers}</p>
            )}
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.commissionRate ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.commissionRate && (
              <p className="mt-1 text-sm text-red-500">{errors.commissionRate}</p>
            )}
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.minCopyAmount ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.minCopyAmount && (
              <p className="mt-1 text-sm text-red-500">{errors.minCopyAmount}</p>
            )}
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.maxCopyAmount ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.maxCopyAmount && (
              <p className="mt-1 text-sm text-red-500">{errors.maxCopyAmount}</p>
            )}
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
              placeholder="AUD/USD, EUR/USD, GBP/USD"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.tradingPairs ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              disabled={isLoading}
            />
            {errors.tradingPairs && (
              <p className="mt-1 text-sm text-red-500">{errors.tradingPairs}</p>
            )}
          </div>

          {/* Is Verified & Is Public Checkboxes */}
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isVerified"
                checked={formData.isVerified}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isLoading}
              />
              <label className="ml-2 block text-sm text-gray-700">Is Verified</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isLoading}
              />
              <label className="ml-2 block text-sm text-gray-700">Is Public</label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                "Add Trader"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTraderForm;