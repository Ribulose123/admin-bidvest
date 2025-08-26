"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface WithdrawalSettings {
  withdrawalFeeOverride: boolean;
  withdrawalCode: boolean;
  customFeeRate: string;
  customFeeType: "percentage" | "fixed";
  dailyLimit: string;
  perTransactionLimit: string;
}
const AdminWithdrawalSetting = () => {
  const router = useRouter();
  const [setting, setSetting] = useState<WithdrawalSettings>({
    withdrawalFeeOverride: true,
    withdrawalCode: true,
    customFeeRate: "",
    customFeeType: "percentage",
    dailyLimit: "",
    perTransactionLimit: "",
  });

  const handleToggle = (
    field: keyof Pick<
      WithdrawalSettings,
      "withdrawalFeeOverride" | "withdrawalCode"
    >
  ) => {
    setSetting((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleInputChange = (
    field: keyof WithdrawalSettings,
    value: string
  ) => {
    setSetting((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave= ()=>{
    console.log("Saved settings:", setting);
  }
  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center  ">
        <ArrowLeft
          className="w-6 h-6 mr-4 cursor-pointer hover:text-gray-300 transition-colors"
          onClick={() => router.back}
        />
        <h1 className="text-xl font-semibold">User Withdrawal Settings</h1>
      </div>

      <div className="space-y-8 mt-6">
        <div>
          <h2 className="text-lg font-medium">Withdrawal Fee Override</h2>
          <div className="flex justify-between items-center">
            <p className="text-[#A4A4A4] text-sm w-1/2">
              Toggle this setting to override the global withdrawal fee for this
              user. When enabled, you can specify a unique fee structure
              (percentage or fixed) for the user’s withdrawals.
            </p>

            <label
              htmlFor="withdrawal-fee-toggle"
              className="flex items-center cursor-pointer"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  id="withdrawal-fee-toggle"
                  className="sr-only"
                  checked={setting.withdrawalFeeOverride}
                  onChange={() => handleToggle("withdrawalFeeOverride")}
                />
                <div
                  className={`block w-14 h-8 rounded-full transition-colors duration-200 ease-in-out ${
                    setting.withdrawalFeeOverride
                      ? "bg-[#439A86] shadow-lg"
                      : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`
                        absolute left-1 top-1 bg-[#D9D9D9] w-6 h-6 rounded-full transition-transform duration-200 ease-in-out shadow-sm ${
                          setting.withdrawalFeeOverride
                            ? "transform translate-x-6"
                            : ""
                        }`}
                ></div>
              </div>
            </label>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium">Withdrawal Code</h2>
          <div className="flex justify-between items-center">
            <p className="text-[#A4A4A4] text-sm w-1/2">
              For added security, a unique verification code will be required every time you request a withdrawal. This helps protect your funds from unauthorized access.
            </p>

            <label
              htmlFor="withdrawal-fee"
              className="flex items-center cursor-pointer"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  id="withdrawal-fee"
                  className="sr-only"
                  checked={setting.withdrawalCode}
                  onChange={() => handleToggle("withdrawalCode")}
                />
                <div
                  className={`block w-14 h-8 rounded-full transition-colors duration-200 ease-in-out ${
                    setting.withdrawalCode
                      ? "bg-[#439A86] shadow-lg"
                      : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`
                        absolute left-1 top-1 bg-[#D9D9D9] w-6 h-6 rounded-full transition-transform duration-200 ease-in-out shadow-sm ${
                          setting.withdrawalCode
                            ? "transform translate-x-6"
                            : ""
                        }`}
                ></div>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">Custom Withdrawal Fee Rate</h2>
          <p className="text-sm text-[#A4A4A4] w-1/2">
            Define the specific fee to be applied to this user’s withdrawals. You may choose a percentage of the withdrawal amount or a fixed fee.
          </p>
          
          <div className="flex space-x-4">
            <div className="flex items-center">
              <select
                className=" bg-[#10131F] rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                value={setting.customFeeType}
                onChange={(e) => handleInputChange('customFeeType', e.target.value as 'percentage' | 'fixed')}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter amount"
                className=" border border-[#141E32] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
                value={setting.customFeeRate}
                onChange={(e) => handleInputChange('customFeeRate', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Set Limit */}
        <div className="space-y-4">
          <div className="flex items-baseline space-x-2">
            <h2 className="text-lg font-medium">Set Limit</h2>
            <span className="text-sm text-gray-500">(User specified)</span>
          </div>
          <div className="space-y-2 flex items-center gap-21">
            <label className="block text-sm font-medium text-gray-300">Daily Limit:</label>
            <input
              type="text"
              className=" border border-[#141E32] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              value={setting.dailyLimit}
              onChange={(e) => handleInputChange('dailyLimit', e.target.value)}
            />
          </div>

          {/* Per-Transaction Limit */}
          <div className="space-y-2 flex items-center gap-4">
            <label className="block text-sm font-medium text-gray-300">Per-Transaction Limit:</label>
            <input
              type="text"
              className=" border border-[#141E32] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              value={setting.perTransactionLimit}
              onChange={(e) => handleInputChange('perTransactionLimit', e.target.value)}
            />
          </div>
        </div>
            
            <div className="pt-4">
          <button
            onClick={handleSave}
            className="bg-[#439A86] hover:bg-emerald-700 text-white font-medium py-3 px-8 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminWithdrawalSetting;
