"use client";

import React, { useState, useEffect } from "react";
import { UserApiService, UpdateUserRequest } from "@/app/hooks/data";

interface UpdateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentUserData: {
    fullName: string;
    email: string;
    isEmailVerified: boolean;
    twoFactorEnabled: boolean;
    withdrawalType:"AUTO" | "DEPOSIT" | "PASSCODE" ;
    kycStatus: "VERIFIED" | "PENDING" | "REJECTED" | "UNVERIFIED";
  };
  onUpdateSuccess: () => void;
}

export const UpdateUserModal: React.FC<UpdateUserModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentUserData,
  onUpdateSuccess,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    isEmailVerified: false,
    twoFactorEnabled: false,
    withdrawalType: "AUTO" as "AUTO" | "DEPOSIT" | "PASSCODE" ,
    kycStatus: "UNVERIFIED" as "VERIFIED" | "PENDING" | "REJECTED" | "UNVERIFIED",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentUserData) {
      setFormData({
        fullName: currentUserData.fullName || "",
        isEmailVerified: currentUserData.isEmailVerified || false,
        twoFactorEnabled: currentUserData.twoFactorEnabled || false,
        withdrawalType: currentUserData.withdrawalType || "AUTO",
        kycStatus: currentUserData.kycStatus || "UNVERIFIED",
      });
      setError(null);
    }
  }, [isOpen, currentUserData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updateData: UpdateUserRequest = {};
      
      // Only include fields that have changed or are not empty
      if (formData.fullName !== currentUserData.fullName) {
        updateData.fullName = formData.fullName;
      }
      if (formData.isEmailVerified !== currentUserData.isEmailVerified) {
        updateData.isEmailVerified = formData.isEmailVerified;
      }
      if (formData.twoFactorEnabled !== currentUserData.twoFactorEnabled) {
        updateData.twoFactorEnabled = formData.twoFactorEnabled;
      }
      if (formData.withdrawalType !== currentUserData.withdrawalType) {
        updateData.withdrawalType = formData.withdrawalType;
      }
      if (formData.kycStatus !== currentUserData.kycStatus) {
        updateData.kycStatus = formData.kycStatus;
      }

      await UserApiService.updateUser(userId, updateData);
      onUpdateSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="bg-[#141E32] border border-[#243049] rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Update User Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full bg-[#0A0F1C] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
              required
            />
          </div>

          {/* KYC Status Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              KYC Status
            </label>
            <select
              name="kycStatus"
              value={formData.kycStatus}
              onChange={handleInputChange}
              className="w-full bg-[#0A0F1C] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
            >
              <option value="UNVERIFIED">Unverified</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Withdrawal type</label>
            <select
              name="withdrawalType"
              value={formData.withdrawalType}
              onChange={handleInputChange}
              className="w-full bg-[#0A0F1C] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
              >
               <option value="AUTO">Auto</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="PASSCODE">Passcode</option> 
              </select>
          </div>

          {/* Checkbox Fields */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isEmailVerified"
                checked={formData.isEmailVerified}
                onChange={handleInputChange}
                className="rounded bg-[#0A0F1C] border-gray-700 text-[#F2AF29] focus:ring-[#F2AF29]"
              />
              <span className="text-sm text-gray-300">Email Verified</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="twoFactorEnabled"
                checked={formData.twoFactorEnabled}
                onChange={handleInputChange}
                className="rounded bg-[#0A0F1C] border-gray-700 text-[#F2AF29] focus:ring-[#F2AF29]"
              />
              <span className="text-sm text-gray-300">2FA Enabled</span>
            </label>


          </div>

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
              disabled={loading}
              className="px-4 py-2 bg-[#F2AF29] text-white rounded-lg hover:bg-[#e5a524] transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                  Updating...
                </>
              ) : (
                "Update User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};