'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getAuthToken } from '@/app/utils/auth';
import { API_ENDPOINT } from '@/app/config/api';
import { Trade } from '@/app/type/transctions';

interface EditTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: Trade | null;
  onTradeUpdated: () => void;
}

interface TradeUpdateData {
  executionStatus?: string;
  realizedPnL?: number;
  notes?: string;
  price?: number;
  quantity?: number;
  leverage?: number;
  orderType?: string;
}

const EditTradeModal: React.FC<EditTradeModalProps> = ({ 
  isOpen, 
  onClose, 
  trade, 
  onTradeUpdated 
}) => {
  const [formData, setFormData] = useState<TradeUpdateData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset form when trade changes
  useEffect(() => {
    if (trade) {
      setFormData({
        executionStatus: trade.executionStatus,
        realizedPnL: trade.realizedPnL,
        notes: trade.notes,
        price: trade.price,
        quantity: trade.quantity,
        leverage: trade.leverage,
        orderType: trade.orderType
      });
      setError('');
      setSuccess('');
    }
  }, [trade]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'realizedPnL' || name === 'price' || name === 'amount' || name === 'leverage') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : Number(value)
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
    
    if (!trade) {
      setError('No trade selected for editing');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

    // Fixed code:
const updateData: TradeUpdateData = Object.fromEntries(
  Object.entries(formData).filter(([_key, value]) => value !== undefined && value !== '')
);
      // If no changes, show message and return
      if (Object.keys(updateData).length === 0) {
        setError('No changes made to the trade');
        setLoading(false);
        return;
      }
      console.log("Sending update data:", updateData);
      const response = await fetch(
        API_ENDPOINT.TRADERS.EDIT_TRADE.replace('{tradeId}', trade.id),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update trade: ${response.statusText}`);
      }

      setSuccess('Trade updated successfully!');
      
      // Notify parent component to refresh data
      onTradeUpdated();
      
      // Close modal after successful update
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Error updating trade:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const executionStatusOptions = [
    'PENDING',
    'EXECUTED',
    'PARTIALLY_FILLED',
    'CANCELLED',
    'FAILED'
  ];

  const orderTypeOptions = [
    'MARKET',
    'LIMIT',
    'STOP_LIMIT',
    'STOP_LOSS'
  ];

  if (!isOpen || !trade) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#0b101a] rounded-lg p-6 w-full max-w-md mx-4 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Edit Trade</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Trade Info */}
        <div className="mb-6 p-4 bg-[#10131F] rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Trade Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">Pair:</span>
              <p className="text-white">{trade.tradePair}</p>
            </div>
            <div>
              <span className="text-gray-400">Side:</span>
              <p className={`${trade.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                {trade.side}
              </p>
            </div>
            <div>
              <span className="text-gray-400">ID:</span>
              <p className="text-white text-xs font-mono">{trade.id}</p>
            </div>
            <div>
              <span className="text-gray-400">Trader ID:</span>
              <p className="text-white text-xs font-mono">{trade.traderId}</p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-3 mb-4 text-sm text-red-400 bg-red-900/30 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 mb-4 text-sm text-green-400 bg-green-900/30 rounded-lg">
            {success}
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Execution Status */}
          <div>
            <label htmlFor="executionStatus" className="block text-sm font-medium text-gray-400 mb-2">
              Execution Status *
            </label>
            <select
              id="executionStatus"
              name="executionStatus"
              value={formData.executionStatus || ''}
              onChange={handleInputChange}
              className="w-full rounded-md bg-[#10131F] border border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
              required
            >
              <option value="">Select Status</option>
              {executionStatusOptions.map(status => (
                <option key={status} value={status} className="bg-[#10131F] text-white">
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Realized PnL */}
          <div>
            <label htmlFor="realizedPnL" className="block text-sm font-medium text-gray-400 mb-2">
              Realized PnL
            </label>
            <input
              type="number"
              id="realizedPnL"
              name="realizedPnL"
              value={formData.realizedPnL ?? ''}
              onChange={handleInputChange}
              step="0.01"
              className="w-full rounded-md bg-[#10131F] border border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
              placeholder="Enter realized PnL"
            />
          </div>

          {/* Price and Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-400 mb-2">
                Price
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price ?? ''}
                onChange={handleInputChange}
                step="0.00001"
                className="w-full rounded-md bg-[#10131F] border border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                placeholder="Price"
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-400 mb-2">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.quantity ?? ''}
                onChange={handleInputChange}
                step="0.00001"
                className="w-full rounded-md bg-[#10131F] border border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                placeholder="Amount"
              />
            </div>
          </div>

          {/* Leverage and Order Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="leverage" className="block text-sm font-medium text-gray-400 mb-2">
                Leverage
              </label>
              <select
                id="leverage"
                name="leverage"
                value={formData.leverage || 1}
                onChange={handleInputChange}
                className="w-full rounded-md bg-[#10131F] border border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
              >
                {[1, 5, 10, 20, 50, 100].map(value => (
                  <option key={value} value={value} className="bg-[#10131F] text-white">
                    {value}x
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="orderType" className="block text-sm font-medium text-gray-400 mb-2">
                Order Type
              </label>
              <select
                id="orderType"
                name="orderType"
                value={formData.orderType || ''}
                onChange={handleInputChange}
                className="w-full rounded-md bg-[#10131F] border border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
              >
                {orderTypeOptions.map(type => (
                  <option key={type} value={type} className="bg-[#10131F] text-white">
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-400 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes || ''}
              onChange={handleInputChange}
              className="w-full rounded-md bg-[#10131F] border border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
              placeholder="Add any notes about this trade update..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-transparent hover:bg-gray-800 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              disabled={loading}
            >
              {loading ? 'Updating Trade...' : 'Update Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTradeModal;