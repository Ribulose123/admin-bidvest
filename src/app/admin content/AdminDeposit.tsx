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
} from "lucide-react";

interface Deposit {
  id: string;
  userId: string;
  type: string;
  date: string;
  asset: string;
  amount: string;
  status: "Approved" | "Rejected";
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const mockDeposits: Deposit[] = Array.from({ length: 69 }, (_, i) => {
  const seed = i + 1;
  const assetIndex = Math.floor(seededRandom(seed * 1000) * 4);
  const typeIndex = Math.floor(seededRandom(seed * 1000) * 4);
  const amount = (seededRandom(seed * 2000) * 10000).toFixed(2);
  const statusRandom = seededRandom(seed * 4000);

  return {
    id: `trade-${i + 1}`,
    userId: `41629229411`,
    type: ["Deposit", "Internal Transfer", "Withdrawal", "Signalfee payment"][
      typeIndex
    ],
    date: `2024-01-23`,
    asset: ["AUDCAD", "EURUSD", "GBPUSD", "USDJPY"][assetIndex],
    amount: `$${amount}`,
    status: statusRandom > 0.5 ? "Approved" : "Rejected",
  };
});
const AdminDeposit = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(14);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const [selectedDepositId, setSelectedDepositId] = useState<string | null>(
    null
  );
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
   const [showTransactionModal, setShowTransactionModal] = useState<boolean>(false);


  const filteredDeposit = useMemo(() => {
    return mockDeposits.filter((deposit) => {
      const matchesSearch =
        searchTerm === "" ||
        deposit.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.amount.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "All" || deposit.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredDeposit.length / itemsPerPage);
  const currentDeposit = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDeposit.slice(startIndex, endIndex);
  }, [currentPage, filteredDeposit, itemsPerPage]);

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
          className="px-3 py-1 rounded-md hover:bg-gray-700"
        >
          2
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="dots-start" className="px-3 py-1 text-[#7D8491DE]">
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
          className={`px-3 py-1 rounded-md text-[#7D8491DE] ${
            currentPage === i ? "bg-[#7D849114] e" : "hover:bg-gray-700"
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
          className="px-3 py-1 rounded-md hover:bg-gray-700"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  }, [currentPage, totalPages, handlePageChange]);

  const handleActionClick = useCallback(
    (tradeId: string, event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();

      // Calculate position relative to viewport
      const viewportWidth = window.innerWidth;
      const menuWidth = 160;

      // Position to the left of the button by default
      let left = rect.left + window.scrollX - menuWidth - 10;

      if (left < 0) {
        left = rect.right + window.scrollX + 10;
      }

      // If menu would go off the right edge, position to the left
      if (left + menuWidth > viewportWidth) {
        left = rect.left + window.scrollX - menuWidth - 10;
      }

      setSelectedDepositId(tradeId);
      setMenuPosition({
        top: rect.bottom + window.scrollY + 5,
        left: Math.max(10, left), // Ensure minimum distance from edge
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
        setSelectedDepositId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleView = useCallback(() => {
    alert(`Viewing trade: ${selectedDepositId}`);
    setShowActionMenu(false);
    setShowTransactionModal(true)
  }, [selectedDepositId]);

   const handleConfirm = useCallback(() => {
    alert('Transaction confirmed');
    setShowTransactionModal(false);
  }, []);

  const handleReject = useCallback(() => {
    alert('Transaction rejected');
    setShowTransactionModal(false);
  }, []);
  const handleDelete = useCallback(() => {
    if (
      window.confirm(
        `Are you sure you want to delete trade: ${selectedDepositId}?`
      )
    ) {
      alert(`Deleting trade: ${selectedDepositId}`);
    }
    setShowActionMenu(false);
  }, [selectedDepositId]);

  const handleAccept = useCallback(() => {
    alert(`Accepting trade: ${selectedDepositId}`);
    setShowActionMenu(false);
  }, [selectedDepositId]);

  const handleDecline = useCallback(() => {
    alert(`Declining trade: ${selectedDepositId}`);
    setShowActionMenu(false);
  }, [selectedDepositId]);
  return (
    <div className="min-h-screen  text-gray-100 p-8 font-inter ">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold mb-6">
            Pending Approvals ({filteredDeposit.length})
          </h1>

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row items-center gap-2 p-4 rounded-lg shadow-lg mb-6">
            <div className="relative w-full  mb-4 md:mb-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                className="w- pl-10 pr-4 py-2 rounded-lg bg-[#10131F]  focus:outline-none focus:border-[#F2AF29] text-white placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <select
                className="block appearance-none bg-[#10131F] border border-gray-600 text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none truncate "
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Trades Table */}
        <div className="overflow-x-auto relative">
          <table className="min-w-full">
            <thead className="bg-[#060A17] rounded-lg ">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Transction type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Asset
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

            <tbody>
              {currentDeposit.length > 0 ? (
                currentDeposit.map((deposit) => (
                  <tr
                    key={deposit.id}
                    className="hover:bg-gray-700 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      {deposit.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      {deposit.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {deposit.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {deposit.asset}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {deposit.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          deposit.status === "Approved"
                            ? 'bg-[#01BC8D14] text-[#01BC8D]' : 'bg-[#F2364514] text-[#F2364514]'
                        }`}
                      >
                        {deposit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        className="text-gray-400 hover:text-white focus:outline-none p-1 rounded-md hover:bg-gray-600 transition-colors duration-200"
                        onClick={(e) => handleActionClick(deposit.id, e)}
                      >
                        <span className="text-xl font-bold">...</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    No deposit found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
           {/* Action Menu */}
           {showActionMenu && selectedDepositId && menuPosition && (
            <div
              ref={actionMenuRef}
              className="fixed z-50 bg-[#141E32] border border-gray-600 rounded-md shadow-lg py-1 w-40"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              <button
                onClick={handleView}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
              >
                <Eye className="w-4 h-4 mr-2" /> View
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
              <button
                onClick={handleAccept}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Accept
              </button>
              <button
                onClick={handleDecline}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
              >
                <XCircle className="w-4 h-4 mr-2" /> Decline
              </button>
            </div>
          )}
        </div>

         {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-6 text-sm text-gray-300">
          <div className="mb-4 md:mb-0">
            {filteredDeposit.length > 0 ? (
              <span>
                {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredDeposit.length)} of {filteredDeposit.length}
              </span>
            ) : (
              <span>0 - 0 of 0</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md  hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex space-x-1">
              {renderPaginationButtons()}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md  hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
      </div>

           {/* Transaction Details Modal */}
          {showTransactionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Transaction Details</h2>
                  <p className="text-sm text-gray-600 mb-6">Pending Deposit Request</p>
                  
                  <div className="space-y-4">
                    {/* Transaction ID */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Transaction ID</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 font-mono">TXNS4GXQAB</span>
                        <button className="w-4 h-4 text-gray-400 hover:text-gray-600">
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Type</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">Deposit</span>
                        <button className="w-4 h-4 text-gray-400 hover:text-gray-600">
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* User */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">User</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">JohnDoe90 (UserID:8563)</span>
                        <button className="w-4 h-4 text-gray-400 hover:text-gray-600">
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Date Requested */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Date Requested</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">April 19, 2035, 12:39 PM UTC</span>
                        <button className="w-4 h-4 text-gray-400 hover:text-gray-600">
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Amount</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">1000 USDT</span>
                        <button className="w-4 h-4 text-gray-400 hover:text-gray-600">
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Currency */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Currency</span>
                      <span className="text-sm text-gray-900">USDT</span>
                    </div>

                    {/* Destination Address */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Destination Address</span>
                      <span className="text-sm text-gray-900">0x6bc...4a56</span>
                    </div>

                    {/* Source Address */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Source Address</span>
                      <span className="text-sm text-gray-900">0x6bc...4a56</span>
                    </div>

                    {/* Payment Method */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Payment Method</span>
                      <span className="text-sm text-gray-900">Crypto</span>
                    </div>

                    {/* Transaction Hash */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Transaction Hash</span>
                      <span className="text-sm text-gray-900">0x6bc...4a56</span>
                    </div>

                    {/* KYC Status */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">KYC Status</span>
                      <span className="text-sm text-green-600 font-medium">Verified</span>
                    </div>

                    {/* IP Address */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">IP Address</span>
                      <span className="text-sm text-gray-900">192.41.7.XXX</span>
                    </div>

                    {/* Request Code */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Request Code</span>
                      <span className="text-sm text-gray-900"></span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={handleReject}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
    </div>
  </div>
  );
};

export default AdminDeposit;
