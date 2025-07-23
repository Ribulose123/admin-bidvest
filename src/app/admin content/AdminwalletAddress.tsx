'use client'
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Search, ChevronDown, ChevronRight, ChevronLeft, Plus, MoreHorizontal } from 'lucide-react';
import AddWalletModal from "./AddWalletModal";

interface GlobalWallet {
  id: string;
  name: string;
  type: string;
  address: string;
  network: string;
  lastModified: string;
  status: "Active" | "Frozen";
}

interface UserWallet {
  id: string;
  email: string;
  userId: string;
  type: string;
  address: string;
  network: string;
  lastModified: string;
  status: "Active" | "Frozen";
}

interface WalletData {
  type: string;
  address: string;
  network: string;
  status: string;
}

// Generate mock global wallets
const generateGlobalWallets = (): GlobalWallet[] => {
  const walletNames = [
    "Main Deposit Wallet", "Signal Wallet", "Withdrawal Wallet", "Trading Wallet",
    "Reserve Wallet", "Cold Storage Wallet", "Hot Wallet", "Multi-Sig Wallet"
  ];
  const types = ["Deposit", "Withdrawal", "Purchase", "Trading"];
  const networks = ["Ethereum", "BSC", "Polygon"];
  
  return Array.from({ length: 8 }, (_, i) => ({
    id: `global-${i + 1}`,
    name: walletNames[i % walletNames.length],
    type: types[i % types.length],
    address: `0x${Math.random().toString(16).substr(2, 8)}`,
    network: networks[i % networks.length],
    lastModified: "09:21:23 WAT",
    status: i % 3 === 0 ? "Active" : "Frozen"
  }));
};

// Generate mock user wallets
const generateUserWallets = (count: number): UserWallet[] => {
  const types = ["Deposit", "Withdrawal", "Purchase"];
  const networks = ["Ethereum", "BSC", "Polygon"];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    email: "jamessmith14@gmail.com",
    userId: "41629229411",
    type: types[i % types.length],
    address: `0x${Math.random().toString(16).substr(2, 8)}`,
    network: networks[i % networks.length],
    lastModified: "09:21:23 WAT",
    status: i % 4 === 0 ? "Active" : "Frozen"
  }));
};

const WalletManagement = () => {
  const [activeTab, setActiveTab] = useState<"global" | "user">("global");
  const [globalWallets] = useState<GlobalWallet[]>(generateGlobalWallets());
  const [userWallets] = useState<UserWallet[]>(generateUserWallets(47));
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  
  const actionMenuRef = useRef<HTMLDivElement>(null);
   const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);

  const totalWallets = activeTab === "global" ? globalWallets.length : userWallets.length;
  const lastModified = "21-02-25 14:25 PM UTC";

  // Filter logic for user wallets
  const filteredUserWallets = useMemo(() => {
    return userWallets.filter(wallet => {
      const matchesSearch = searchTerm === '' ||
        wallet.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'All' || wallet.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus, userWallets]);

  // Get current data based on active tab
  const currentData = activeTab === "global" ? globalWallets : filteredUserWallets;
  
  // Pagination logic
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return currentData.slice(startIndex, endIndex);
  }, [currentPage, currentData, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // Reset to first page when tab or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, filterStatus]);

  // Pagination buttons renderer
  const renderPaginationButtons = useCallback(() => {
    const pagesToShow = 5;
    const buttons = [];
    const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    if (startPage > 1) {
      buttons.push(
        <button 
          key={1} 
          onClick={() => handlePageChange(1)} 
          className="px-3 py-1 rounded-md hover:bg-gray-700 text-gray-300 transition-colors duration-200"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="dots-start" className="px-3 py-1 text-gray-400">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md transition-colors duration-200 ${
            currentPage === i 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots-end" className="px-3 py-1 text-gray-400">...</span>);
      }
      buttons.push(
        <button 
          key={totalPages} 
          onClick={() => handlePageChange(totalPages)} 
          className="px-3 py-1 rounded-md hover:bg-gray-700 text-gray-300 transition-colors duration-200"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  }, [currentPage, totalPages, handlePageChange]);

  // Action menu handlers
  const handleActionClick = useCallback((itemId: string, event: React.MouseEvent<HTMLButtonElement>) => {
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
    
    setSelectedItemId(itemId);
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
        setSelectedItemId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEdit = useCallback(() => {
    alert(`Editing: ${selectedItemId}`);
    setShowActionMenu(false);
  }, [selectedItemId]);

  const handleFreeze = useCallback(() => {
    alert(`Freezing: ${selectedItemId}`);
    setShowActionMenu(false);
  }, [selectedItemId]);

  const handleActivate = useCallback(() => {
    alert(`Activating: ${selectedItemId}`);
    setShowActionMenu(false);
  }, [selectedItemId]);

   const handleAddWallet = (walletData: WalletData) => {
    console.log('Adding wallet:', walletData);
    setIsAddWalletModalOpen(false);
  };
  return (
    <div className="min-h-screen  text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-medium text-white">Wallet Address</h1>
          <button className="bg-[#F2AF29] hover:bg-[#f2af29e7] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 cursor-pointer">
            <Plus className="w-4 h-4" />
            Add Wallet
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab("global")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === "global"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            Global Wallets
          </button>
          <button
            onClick={() => setActiveTab("user")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === "user"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            User wallets
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="bg-linear-to-bl from-[#141E323D] to-[#01040F] px-6 py-3 flex items-center space-x-10 border border-[#141E32] rounded-lg">
          <div>
            <div className="text-gray-400 text-sm mb-2">Total Wallets</div>
            <div className="text-3xl font-bold text-white">{totalWallets.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-2">Last Modified</div>
            <div className="text-lg text-gray-300">{lastModified}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-2">Last Modified</div>
            <div className="text-lg text-gray-300">{lastModified}</div>
          </div>
        </div>

        {/* Wallets Section */}
        <div className=" rounded-lg">
          <div className="p-6 ">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">Wallets</h2>
              {activeTab === "user" && (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-64 pl-4 pr-4 py-2 rounded-lg bg-[#10131F] border border-gray-600 focus:outline-none focus:border-blue-500 text-white placeholder-gray-400 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  <div className="relative">
                    <select
                      className="block appearance-none bg-[#10131F] border border-gray-600 text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:border-blue-500 text-sm"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="Active">Active</option>
                      <option value="Frozen">Frozen</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#060A17]">
                <tr>
                  {activeTab === "global" ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Network</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Modified</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Network</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Modified</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody >
                {paginatedData.length > 0 ? (
                  activeTab === "global" ? (
                    (paginatedData as GlobalWallet[]).map((wallet) => (
                      <tr key={wallet.id} className="hover:bg-gray-700 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{wallet.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{wallet.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">{wallet.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{wallet.network}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{wallet.lastModified}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            wallet.status === 'Active' 
                              ? 'bg-[#01BC8D14] text-[#01BC8D]' 
                              : 'bg-[#F2364514] text-[#F2364514]'
                          }`}>
                            {wallet.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            className="text-gray-400 hover:text-white transition-colors duration-200"
                            onClick={(e) => handleActionClick(wallet.id, e)}
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    (paginatedData as UserWallet[]).map((wallet) => (
                      <tr key={wallet.id} className="hover:bg-gray-700 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{wallet.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{wallet.userId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{wallet.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">{wallet.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{wallet.network}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{wallet.lastModified}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            wallet.status === 'Active' 
                              ? 'bg-[#01BC8D14] text-[#01BC8D]' 
                              : 'bg-[#F2364514] text-[#F2364514]'
                          }`}>
                            {wallet.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            className="text-gray-400 hover:text-white transition-colors duration-200"
                            onClick={(e) => handleActionClick(wallet.id, e)}
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  <tr>
                    <td colSpan={activeTab === "global" ? 7 : 8} className="px-6 py-8 text-center text-gray-400">
                      No wallets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col md:flex-row items-center justify-between p-6 border-t border-gray-700 text-sm text-gray-300">
              <div className="mb-4 md:mb-0">
                {currentData.length > 0 ? (
                  <span>
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, currentData.length)} of {currentData.length} entries
                  </span>
                ) : (
                  <span>No entries found</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex space-x-1">
                  {renderPaginationButtons()}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Menu */}
        {showActionMenu && selectedItemId && menuPosition && (
          <div
            ref={actionMenuRef}
            className="fixed z-50 bg-gray-700 border border-gray-600 rounded-md shadow-lg py-1 w-40"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
            >
              Edit
            </button>
            <button
              onClick={handleFreeze}
              className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
            >
              Freeze
            </button>
            <button
              onClick={handleActivate}
              className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
            >
              Activate
            </button>
          </div>
        )}
      </div>
      <AddWalletModal
      isOpen={isAddWalletModalOpen}
      onClose = {()=>setIsAddWalletModalOpen(false)}
      onAdd= {handleAddWallet}
      />
    </div>
  );
};

export default WalletManagement;