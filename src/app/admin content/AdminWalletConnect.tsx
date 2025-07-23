"use client";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Wallet,
} from "lucide-react";

interface Transaction {
  id: string;
  transactionId: string;
  userId: string;
  cardType: string;
  date: string;
  amount: string;
  status: "Approved" | "Rejected";
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const mockTransactions: Transaction[] = Array.from({ length: 69 }, (_, i) => {
  const seed = i + 1;
  const cardTypeIndex = Math.floor(seededRandom(seed * 1000) * 4);
  const amount = (seededRandom(seed * 2000) * 10000).toFixed(2);
  const statusRandom = seededRandom(seed * 4000);

  return {
    id: `trans-${i + 1}`,
    transactionId: `jamesavid14@gmail.com`,
    userId: `41629229411`,
    cardType: ["AUDCAD", "EURUSD", "GBPUSD", "USDJPY"][cardTypeIndex],
    date: `2024-01-23`,
    amount: `$${amount}`,
    status: statusRandom > 0.5 ? "Approved" : "Rejected",
  };
});

const AdminWalletConnect = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(14);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((transaction) => {
      const matchesSearch =
        searchTerm === "" ||
        transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.cardType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.amount.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "All" || transaction.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [currentPage, filteredTransactions, itemsPerPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const renderPaginationButtons = useCallback(() => {
    const pagesToShow = 7;
    const buttons = [];
    const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 rounded-md hover:bg-gray-700 text-gray-300"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="dots-start" className="px-3 py-1 text-gray-400">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i ? "bg-gray-600 text-white" : "text-gray-300 hover:bg-gray-700"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="dots-end" className="px-3 py-1 text-gray-400">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 rounded-md hover:bg-gray-700 text-gray-300"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  }, [currentPage, totalPages, handlePageChange]);

  const handleActionClick = useCallback(
    (transactionId: string, event: React.MouseEvent<HTMLButtonElement>) => {
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

      setSelectedTransactionId(transactionId);
      setMenuPosition({
        top: rect.bottom + window.scrollY + 5,
        left: Math.max(10, left),
      });
      setShowActionMenu(true);
    },
    []
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setShowActionMenu(false);
        setSelectedTransactionId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleView = useCallback(() => {
    setShowActionMenu(false);
    setShowWalletModal(true)
  }, []);

  const handleDelete = useCallback(() => {
    if (
      window.confirm(
        `Are you sure you want to delete transaction: ${selectedTransactionId}?`
      )
    ) {
      alert(`Deleting transaction: ${selectedTransactionId}`);
    }
    setShowActionMenu(false);
  }, [selectedTransactionId]);

  const handleAccept = useCallback(() => {
    alert(`Accepting transaction: ${selectedTransactionId}`);
    setShowActionMenu(false);
  }, [selectedTransactionId]);

  const handleDecline = useCallback(() => {
    alert(`Declining transaction: ${selectedTransactionId}`);
    setShowActionMenu(false);
  }, [selectedTransactionId]);

   const closeWalletModal = useCallback(() => {
    setShowWalletModal(false);
  }, []);
  return (
    <div className="min-h-screen  text-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-medium text-white">Wallet Connect</h1>
          
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                className="appearance-none bg-gray-800 border border-gray-700 text-white py-2 px-4 pr-8 rounded-lg focus:outline-none focus:border-orange-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
             <h1 className="text-xl font-medium text-white capitalize">card transactions</h1>
             <div className="flex items-center gap-4">
                <button className="bg-[#10131F] flex items-center justify-center gap-1.5 p-3 rounded-lg cursor-pointer hover:bg-[#10131fe0]">
                    Connet Wallet
                    <Wallet size={14}/>
                </button>
                <button className="bg-[#F2AF29] flex items-center justify-center gap-1.5 px-2 py-3 rounded-lg cursor-pointer hover:bg-[#f2af29d7] text-[16px]">
                    Card Transactions
                    <Wallet size={14}/>
                </button>
             </div>
        </div>
        {/* Table Section */}
        <div className=" rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#060A17]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Card Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody >
                {currentTransactions.length > 0 ? (
                  currentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {transaction.transactionId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {transaction.userId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {transaction.cardType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {transaction.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {transaction.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            transaction.status === "Approved"
                              ? "bg-green-900 text-green-300"
                              : "bg-red-900 text-red-300"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-600 transition-colors"
                          onClick={(e) => handleActionClick(transaction.id, e)}
                        >
                          <span className="text-lg font-bold">⋯</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Action Menu */}
          {showActionMenu && selectedTransactionId && menuPosition && (
            <div
              ref={actionMenuRef}
              className="fixed z-50 bg-gray-800 border border-gray-600 rounded-md shadow-lg py-1 w-40"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              <button
                onClick={handleView}
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" /> View
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
              <button
                onClick={handleAccept}
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Accept
              </button>
              <button
                onClick={handleDecline}
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left transition-colors"
              >
                <XCircle className="w-4 h-4 mr-2" /> Decline
              </button>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              {filteredTransactions.length > 0 ? (
                <span>
                  {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
                </span>
              ) : (
                <span>0 - 0 of 0</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex space-x-1">
                {renderPaginationButtons()}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

           {/* Wallet Details Modal */}
          {showWalletModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Wallet Details</h2>
                  
                  <div className="space-y-4">
                    {/* Wallet Address */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Wallet address</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 font-mono">BqISPAu...IErhO</span>
                        <button 
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          onClick={() => navigator.clipboard?.writeText('BqISPAuIErhO')}
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    {/* Label */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Label</span>
                      <span className="text-sm text-gray-900">Main Wallet</span>
                    </div>

                    {/* Network */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Network</span>
                      <span className="text-sm text-gray-900">Ethereum</span>
                    </div>

                    {/* Status */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="text-sm text-green-600 font-medium">Connected</span>
                    </div>

                    {/* Connected Date */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Connected Date</span>
                      <span className="text-sm text-gray-900">2023-03-15</span>
                    </div>

                    {/* Connection ID */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Connection ID</span>
                      <span className="text-sm text-gray-900 font-mono">328abcadf0754</span>
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={closeWalletModal}
                    className="w-full mt-8 bg-[#6967AE] hover:bg-[#6967aea1] text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default AdminWalletConnect;