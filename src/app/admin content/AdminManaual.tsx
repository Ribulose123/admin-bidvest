'use client'
import React, { useState } from 'react';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';

const WalletInterface: React.FC = () => {
  const [eventUserId, setEventUserId] = useState('41000426411');
  const [walletType, setWalletType] = useState('USDT');
  const [amount, setAmount] = useState('$1,725.13');
  const [transactionType, setTransactionType] = useState('Credit');
  const [reason, setReason] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  const balanceCards = [
    { title: 'Total Balance', value: '1,2471', showEye: true },
    { title: 'Total Wallets', value: '1,2471', showEye: false },
    { title: 'Pending Transactions', value: '1,2471', showEye: false },
    { title: 'Frozen Wallets', value: '1,2471', showEye: false }
  ];

  const walletOptions = ['USDT', 'BTC', 'ETH', 'BNB'];

  const handleShowBalance = () => {
    setShowBalance(!showBalance);
  };

  return (
    <div className="min-h-screen  text-white p-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {balanceCards.map((card, index) => (
          <div key={index} className="bg-linear-to-bl from-[#141E323D] to-[#01040F] rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-400 text-sm">{card.title}</span>
              <div className="flex gap-1">
                {card.showEye && (
                  <button onClick={handleShowBalance} className="hover:text-gray-300">
                    {showBalance ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {card.showEye && !showBalance ? '****' : card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Manual Adjustments Form */}
      <div className="bg-linear-to-bl from-[#141E323D] to-[#01040F] rounded-lg p-6 border border-gray-700 max-w-xl">
        <h2 className="text-xl font-semibold mb-6">Manual Adjustments</h2>
        
        <div className="space-y-4">
          {/* Event User ID */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Event User ID
            </label>
            <input
              type="text"
              value={eventUserId}
              onChange={(e) => setEventUserId(e.target.value)}
              className="w-full border border-[#141E32] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Wallet Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Wallet Type
            </label>
            <div className="relative">
              <button
                onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                className="w-full  border border-[#141E32] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
              >
                {walletType}
                <ChevronDown className="w-4 h-4" />
              </button>
              {isWalletDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-[#141E32] rounded-md shadow-lg z-10">
                  {walletOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setWalletType(option);
                        setIsWalletDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-600 first:rounded-t-md last:rounded-b-md"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full  border border-[#141E32] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Transaction Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Credit"
                  checked={transactionType === 'Credit'}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="mr-2 text-red-500 focus:ring-red-500"
                />
                <span className="text-red-400">Credit (+)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Debit"
                  checked={transactionType === 'Debit'}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="mr-2 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-orange-400">Debit (-)</span>
              </label>
            </div>
          </div>

          {/* Reason */}
          <div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for adjustment/transaction"
              className="w-full  border border-[#141E32] rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
            />
          </div>

          {/* Character count */}
          <div className="text-right text-sm text-gray-400">
            {reason.length}/500
          </div>

          {/* Confirmation */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="w-4 h-4 text-green-500 focus:ring-green-500 border-[#141E32] rounded"
            />
            <span className="text-sm text-gray-300">
              I confirm this adjustment is correct
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button className="flex-1 bg-[#439A86] hover:bg-[#439a86c7] text-white font-medium py-2 px-4 rounded-md transition-colors">
              Submit
            </button>
            <button className="flex-1 bg-transparent border border-[#E8E8E88F] text-white font-medium py-2 px-4 rounded-md transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletInterface;