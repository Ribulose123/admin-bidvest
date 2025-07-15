'use client'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Pen, Trash2, CheckCircle, XCircle, X, Eye, EyeOff } from 'lucide-react';

interface UserWallet {
  id: string;
  userId: string;
  email: string;
  balance: string;
  lastTransactionDate: string;
  status: 'Active' | 'Frozen';
  walletType: 'Deposit' | 'Withdrawal' | 'Trading';
  walletAddress: string;
  blockchainNetwork: 'Ethereum' | 'Bitcoin' | 'Binance Smart Chain';
}

interface EditWalletData {
  walletType: string;
  walletAddress: string;
  blockchainNetwork: string;
  status: string;
  comment: string;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const generateWalletAddress = (seed: number) => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let address = '';
  for (let i = 0; i < 34; i++) {
    address += chars[Math.floor(seededRandom(seed + i) * chars.length)];
  }
  return address;
};

const mockWallets: UserWallet[] = Array.from({ length: 256 }, (_, i) => {
  const seed = i + 1;
  const balance = (seededRandom(seed * 2000) * 1000).toFixed(2);
  const statusRandom = seededRandom(seed * 3000);
  const typeRandom = seededRandom(seed * 4000);
  const networkRandom = seededRandom(seed * 5000);
  
  let walletType: 'Deposit' | 'Withdrawal' | 'Trading';
  if (typeRandom < 0.33) walletType = 'Deposit';
  else if (typeRandom < 0.66) walletType = 'Withdrawal';
  else walletType = 'Trading';

  let blockchainNetwork: 'Ethereum' | 'Bitcoin' | 'Binance Smart Chain';
  if (networkRandom < 0.33) blockchainNetwork = 'Ethereum';
  else if (networkRandom < 0.66) blockchainNetwork = 'Bitcoin';
  else blockchainNetwork = 'Binance Smart Chain';
  
  return {
    id: `wallet-${i + 1}`,
    userId: `41629229411`,
    email: `james.smith114@gmail.com`,
    balance: `$${balance}`,
    lastTransactionDate: `2024-01-23`,
    status: statusRandom > 0.5 ? 'Active' : 'Frozen',
    walletType,
    walletAddress: generateWalletAddress(seed),
    blockchainNetwork,
  };
});

const AdminWalletDashboard = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{top: number, left: number} | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editWalletData, setEditWalletData] = useState<EditWalletData>({
    walletType: '',
    walletAddress: '',
    blockchainNetwork: '',
    status: '',
    comment: ''
  });
  const [showBalance, setShowBalance] = useState(false)
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const filteredWallets = useMemo(() => {
    return mockWallets.filter(wallet => {
      const matchesSearch = searchTerm === '' ||
        wallet.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.balance.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'All' || wallet.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredWallets.length / itemsPerPage);
  const currentWallets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredWallets.slice(startIndex, endIndex);
  }, [currentPage, filteredWallets, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const renderPaginationButtons = useCallback(() => {
    const pagesToShow = 5;
    const buttons = [];
    const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md text-sm ${
            currentPage === i 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
        >
          {i}
        </button>
      );
    }

    return buttons;
  }, [currentPage, totalPages, handlePageChange]);

  const handleActionClick = useCallback((walletId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    const viewportWidth = window.innerWidth;
    const menuWidth = 160;

    let left = rect.left + window.scrollX - menuWidth - 10;
    
    if (left < 0) {
      left = rect.right + window.scrollX + 10;
    }
    
    if (left + menuWidth > viewportWidth) {
      left = rect.left + window.scrollX - menuWidth - 10;
    }
    
    setSelectedWalletId(walletId);
    setMenuPosition({
      top: rect.bottom + window.scrollY + 5,
      left: Math.max(10, left)
    });
    setShowActionMenu(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setShowActionMenu(false);
        setSelectedWalletId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEdit = useCallback(() => {
    const wallet = mockWallets.find(w => w.id === selectedWalletId);
    if (wallet) {
      setEditWalletData({
        walletType: wallet.walletType,
        walletAddress: wallet.walletAddress,
        blockchainNetwork: wallet.blockchainNetwork,
        status: wallet.status,
        comment: ''
      });
      setShowEditModal(true);
    }
    setShowActionMenu(false);
  }, [selectedWalletId]);

  const handleDelete = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete wallet: ${selectedWalletId}?`)) {
      alert(`Deleting wallet: ${selectedWalletId}`);
    }
    setShowActionMenu(false);
  }, [selectedWalletId]);

  const handleFreeze = useCallback(() => {
    alert(`Freezing wallet: ${selectedWalletId}`);
    setShowActionMenu(false);
  }, [selectedWalletId]);

  const handleActivate = useCallback(() => {
    alert(`Activating wallet: ${selectedWalletId}`);
    setShowActionMenu(false);
  }, [selectedWalletId]);

  const handleModalClose = useCallback(() => {
    setShowEditModal(false);
    setEditWalletData({
      walletType: '',
      walletAddress: '',
      blockchainNetwork: '',
      status: '',
      comment: ''
    });
  }, []);

  const handleSaveWallet = useCallback(() => {
    // Here you would typically make an API call to save the wallet data
    console.log('Saving wallet data:', editWalletData);
    alert('Wallet updated successfully!');
    handleModalClose();
  }, [editWalletData, handleModalClose]);

  const handleInputChange = useCallback((field: keyof EditWalletData, value: string) => {
    setEditWalletData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const stats = useMemo(() => {
    const totalWallets = filteredWallets.length;
    const activeWallets = filteredWallets.filter(w => w.status === 'Active').length;
    const frozenWallets = filteredWallets.filter(w => w.status === 'Frozen').length;
    
    return {
      totalBalances: totalWallets,
      totalWallets: totalWallets,
      pendingTransactions: activeWallets,
      frozenWallets: frozenWallets
    };
  }, [filteredWallets]);

  const handleShowBalance= ()=>{
    setShowBalance(!showBalance)
  }

  return (
    <div className="min-h-screen  text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-linear-to-l from-[#141E323D] to-[#01040F] rounded-lg p-6 border border-[#141E32]">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium text-gray-400">Total Balances</h3>
              
              <button onClick={handleShowBalance}>
                {showBalance ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
           
            <div className="text-2xl font-bold text-white">{showBalance ? '******' : `${stats.totalBalances.toLocaleString()}`}</div>
            <div className="text-xs text-gray-500 mt-1">=0.00btc</div>
          </div>

          <div className="bg-linear-to-l from-[#141E323D] to-[#01040F] rounded-lg p-6 border border-[#141E32]">
            <div className="text-sm font-medium text-gray-400 mb-2">Total Wallets</div>
            <div className="text-2xl font-bold text-white">{stats.totalWallets.toLocaleString()}</div>
          </div>

          <div className="bg-linear-to-l from-[#141b2b3d] to-[#01040F] rounded-lg p-6 border border-[#141E32]">
            <div className="text-sm font-medium text-gray-400 mb-2">Pending Transactions</div>
            <div className="text-2xl font-bold text-white">{stats.pendingTransactions.toLocaleString()}</div>
          </div>

          <div className="bg-linear-to-l from-[#141E323D] to-[#01040F] rounded-lg p-6 border border-[#141E32]">
            <div className="text-sm font-medium text-gray-400 mb-2">Frozen Wallets</div>
            <div className="text-2xl font-bold text-white">{stats.frozenWallets.toLocaleString()}</div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-white">User Wallet List</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-10 pr-4 py-2 rounded-lg bg-[#1A2332] border border-gray-600 focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="block appearance-none bg-[#1A2332] border border-gray-600 text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Frozen">Frozen</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-[#060A17]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Transaction Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentWallets.length > 0 ? (
                currentWallets.map((wallet) => (
                  <tr key={wallet.id} className="hover:bg-[#243447] transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{wallet.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{wallet.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{wallet.balance}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{wallet.lastTransactionDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        wallet.status === 'Active' 
                          ? 'text-green-400 bg-green-400/10' 
                          : 'text-red-400 bg-red-400/10'
                      }`}>
                        {wallet.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        className="text-gray-400 hover:text-white focus:outline-none p-1 rounded-md hover:bg-gray-600 transition-colors duration-200"
                        onClick={(e) => handleActionClick(wallet.id, e)}
                      >
                        <span className="text-xl font-bold">⋯</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">No wallets found.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Action Menu */}
          {showActionMenu && selectedWalletId && menuPosition && (
            <div
              ref={actionMenuRef}
              className="fixed z-50 bg-[#1A2332] border border-gray-600 rounded-md shadow-lg py-1 w-40"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
              >
                <Pen className="w-4 h-4 mr-2" /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
              <button
                onClick={handleFreeze}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
              >
                <XCircle className="w-4 h-4 mr-2" /> Freeze
              </button>
              <button
                onClick={handleActivate}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Activate
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-400">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredWallets.length)} of {filteredWallets.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex space-x-1">
              {renderPaginationButtons()}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Wallet Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Edit Wallet</h2>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3">
              {/* Wallet Type */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Wallet Type:
                </label>
                <div className="relative">
                  <select
                    className="block w-full appearance-none bg-gray-100 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    value={editWalletData.walletType}
                    onChange={(e) => handleInputChange('walletType', e.target.value)}
                  >
                    <option value="">Select wallet type</option>
                    <option value="Deposit">Deposit</option>
                    <option value="Withdrawal">Withdrawal</option>
                    <option value="Trading">Trading</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Wallet Address */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Wallet address:
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 text-gray-700"
                  value={editWalletData.walletAddress}
                  onChange={(e) => handleInputChange('walletAddress', e.target.value)}
                  placeholder="Enter wallet address"
                />
              </div>

              {/* Blockchain Network */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Blockchain Network:
                </label>
                <div className="relative">
                  <select
                    className="block w-full appearance-none bg-gray-100 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    value={editWalletData.blockchainNetwork}
                    onChange={(e) => handleInputChange('blockchainNetwork', e.target.value)}
                  >
                    <option value="">Select network</option>
                    <option value="Ethereum">Ethereum</option>
                    <option value="Bitcoin">Bitcoin</option>
                    <option value="Binance Smart Chain">Binance Smart Chain</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Status:
                </label>
                <div className="relative">
                  <select
                    className="block w-full appearance-none bg-gray-100 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    value={editWalletData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="">Select status</option>
                    <option value="Active">Active</option>
                    <option value="Frozen">Frozen</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Comment:
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 text-gray-700 resize-none"
                  rows={3}
                  value={editWalletData.comment}
                  onChange={(e) => handleInputChange('comment', e.target.value)}
                  placeholder="Enter comment"
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {editWalletData.comment.length}/500
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWallet}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWalletDashboard;