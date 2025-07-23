import React, {useState} from 'react'

interface WalletData {
  type: string;
  address: string;
  network: string;
  status: string;
}
const AddWalletModal: React.FC<{
  isOpen?: boolean;
  onClose?: () => void;
  onAdd?: (walletData: WalletData) => void;
}>  = ({
    isOpen = false, 
  onClose = () => {}, 
  onAdd = () => {}
}) => {
    const [formData, setFormData] = useState<WalletData>({
    type: 'Deposit',
    address: '',
    network: 'Ethereum',
    status: 'Active'
  });

    const handleInputChange = (field: keyof WalletData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdd = () => {
    if (!formData.address) {
      return;
    }
    onAdd(formData);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-6">Add New Wallet</h2>
        
        <div className="space-y-4">
          {/* Wallet Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Wallet Type:
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
            >
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Trading">Trading</option>
            </select>
          </div>

          {/* Wallet Address */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Wallet address:
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              placeholder="Enter wallet address"
            />
          </div>

          {/* Blockchain Network */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Blockchain Network:
            </label>
            <select
              value={formData.network}
              onChange={(e) => handleInputChange('network', e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
            >
              <option value="Ethereum">Ethereum</option>
              <option value="Bitcoin">Bitcoin</option>
              <option value="Binance Smart Chain">Binance Smart Chain</option>
              <option value="Polygon">Polygon</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status:
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>

  )
}

export default AddWalletModal
