'use client';
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
  X,
  Loader,
} from "lucide-react";
import { getAuthToken } from "../utils/auth";
import { API_ENDPOINT } from "../config/api";

interface Transaction {
  id: string;
  userId: string;
  platformAssetId: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
}

const AdminDeposit = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterType, setFilterType] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(14);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAllDepositTransactions = async () => {
      const token = getAuthToken();
      setIsLoading(true);
      setError(null);

      if (!token) {
        setError('No authentication token found. Please log in.');
        setIsLoading(false);
        return;
      }

      try {
        let allDepositTransactions: Transaction[] = [];
        let currentPage = 1;
        let totalPages = 1;
        let hasMorePages = true;

        while (hasMorePages && currentPage <= totalPages) {
          const response = await fetch(
            `${API_ENDPOINT.TRANSACTION.GET_TRANSACTIONS}?page=${currentPage}&limit=50`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();

          if (result.statusCode === 200 && result.data) {
            const depositTransactions = result.data.filter(
              (transaction: Transaction) => transaction.type === "DEPOSIT"
            );

            allDepositTransactions = [...allDepositTransactions, ...depositTransactions];

            totalPages = result.pagination?.totalPages || 1;
            hasMorePages = result.pagination?.hasNextPage || false;
            currentPage++;
          } else {
            throw new Error(result.message || 'Failed to fetch transactions');
          }
        }

        setTransactions(allDepositTransactions);

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while fetching transactions.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllDepositTransactions();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        searchTerm === "" ||
        transaction.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.createdAt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.amount.toString().includes(searchTerm) ||
        transaction.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "All" || transaction.status === filterStatus.toUpperCase();

      const matchesType =
        filterType === "All" || transaction.type === filterType.toUpperCase();

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchTerm, filterStatus, filterType, transactions]);

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
          className="px-3 py-1 rounded-md hover:bg-gray-700"
        >
          1
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
            currentPage === i ? "bg-[#7D849114]" : "hover:bg-gray-700"
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

  const updateTransactionStatus = useCallback(async (transactionId: string, newStatus: string) => {
    const token = getAuthToken();
    if (!token) {
      setError('No authentication token found. Please log in.');
      return false;
    }

    try {
      // Use the correct API endpoint format
      const endpoint = API_ENDPOINT.ADMIN.UPDATE_TRANSACTION.replace('{transactionId}', transactionId);
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      // Check if response is OK first
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        // Try to parse error response
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (err) {
        console.error(err)
          errorMessage = response.statusText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Parse successful response
      const result = await response.json();
      
      if (result.statusCode === 200) {
        console.log("Transaction updated successfully:", result);
        setTransactions(prev => prev.map(transaction =>
          transaction.id === transactionId
            ? { ...transaction, status: newStatus }
            : transaction
        ));
        setError(null);
        setSuccessMessage(`Transaction status updated to ${newStatus} successfully!`);
        return true;
      } else {
        throw new Error(result.message || 'Failed to update transaction status');
      }

    } catch (err) {
      console.error("Failed to update transaction status:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while updating transaction status.');
      }
      return false;
    }
  }, [ setError]);

  const deleteTransaction = useCallback(async (transactionId: string) => {
    const token = getAuthToken();
    if (!token) {
      setError('No authentication token found. Please log in.');
      return false;
    }

    try {
      // Use the correct DELETE endpoint
      const endpoint = API_ENDPOINT.TRANSACTION.DELETE_TRANSACTIONS.replace('{id}', transactionId);
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'No detailed error message from server' }));
        console.error("Failed to delete transaction:", errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.statusCode === 200) {
        setTransactions(prev => prev.filter(transaction => transaction.id !== transactionId));
        setSuccessMessage('Transaction deleted successfully!');
        return true;
      } else {
        throw new Error(result.message || 'Failed to delete transaction');
      }
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while deleting transaction.');
      }
      return false;
    }
  }, [setTransactions, setError]);

  const handleDelete = useCallback(async () => {
    if (window.confirm(`Are you sure you want to delete transaction: ${selectedTransactionId}?`)) {
      if (selectedTransactionId) {
        setActionLoading(`delete-${selectedTransactionId}`);
        await deleteTransaction(selectedTransactionId);
        setActionLoading(null);
      }
    }
    setShowActionMenu(false);
  }, [selectedTransactionId, deleteTransaction]);

  const handleAccept = useCallback(async () => {
    if (selectedTransactionId) {
      setActionLoading(`accept-${selectedTransactionId}`);
      await updateTransactionStatus(selectedTransactionId, 'COMPLETED');
      setActionLoading(null);
    }
    setShowActionMenu(false);
  }, [selectedTransactionId, updateTransactionStatus]);

  const handleDecline = useCallback(async () => {
    if (selectedTransactionId) {
      setActionLoading(`decline-${selectedTransactionId}`);
      await updateTransactionStatus(selectedTransactionId, 'FAILED');
      setActionLoading(null);
    }
    setShowActionMenu(false);
  }, [selectedTransactionId, updateTransactionStatus]);

  const handleView = useCallback(() => {
    const transaction = transactions.find(t => t.id === selectedTransactionId);
    if (transaction) {
      setSelectedTransaction(transaction);
      setShowTransactionModal(true);
    }
    setShowActionMenu(false);
  }, [selectedTransactionId, transactions]);

  const handleConfirm = useCallback(async () => {
    if (selectedTransaction) {
      setActionLoading(`confirm-${selectedTransaction.id}`);
      await updateTransactionStatus(selectedTransaction.id, 'COMPLETED');
      setActionLoading(null);
    }
    setShowTransactionModal(false);
  }, [selectedTransaction, updateTransactionStatus]);

  const handleReject = useCallback(async () => {
    if (selectedTransaction) {
      setActionLoading(`reject-${selectedTransaction.id}`);
      await updateTransactionStatus(selectedTransaction.id, 'FAILED');
      setActionLoading(null);
    }
    setShowTransactionModal(false);
  }, [selectedTransaction, updateTransactionStatus]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const transactionTypes = useMemo(() => {
    const types = [...new Set(transactions.map(t => t.type))];
    return ['All', ...types];
  }, [transactions]);

  return (
    <div className="min-h-screen text-gray-100 p-8 font-inter ">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-800 text-green-200 rounded-lg">
            {successMessage}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-semibold">
            Transaction Management ({filteredTransactions.length})
          </h1>

          <div className="flex flex-col md:flex-row items-center gap-2 p-4 rounded-lg shadow-lg w-full md:w-auto">
            <div className="relative w-full md:w-64 mb-4 md:mb-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#10131F] focus:outline-none focus:border-[#F2AF29] text-white placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <select
                className="block appearance-none bg-[#10131F] border border-gray-600 text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none truncate"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <div className="relative">
              <select
                className="block appearance-none bg-[#10131F] border border-gray-600 text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none truncate"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                {transactionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Loading transactions...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 text-lg">Error: {error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="overflow-x-auto relative">
            <table className="min-w-full">
              <thead className="bg-[#060A17] rounded-lg">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
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

              <tbody>
                {currentTransactions.length > 0 ? (
                  currentTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-700 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                        {transaction.userId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                        {transaction.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === "COMPLETED"
                              ? 'bg-[#01BC8D14] text-[#01BC8D]'
                              : transaction.status === "PENDING"
                                ? 'bg-yellow-800 text-yellow-300'
                                : 'bg-[#F2364514] text-[#F23645]'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          className="text-gray-400 hover:text-white focus:outline-none p-1 rounded-md hover:bg-gray-600 transition-colors duration-200"
                          onClick={(e) => handleActionClick(transaction.id, e)}
                          disabled={actionLoading !== null}
                        >
                          <span className="text-xl font-bold">...</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-400"
                    >
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {showActionMenu && selectedTransactionId && menuPosition && (
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
                  disabled={actionLoading !== null}
                >
                  <Eye className="w-4 h-4 mr-2" /> View
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200 disabled:opacity-50"
                  disabled={actionLoading !== null}
                >
                  {actionLoading === `delete-${selectedTransactionId}` ? (
                    <><Loader className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>
                  ) : (
                    <><Trash2 className="w-4 h-4 mr-2" /> Delete</>
                  )}
                </button>
                <button
                  onClick={handleAccept}
                  className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200 disabled:opacity-50"
                  disabled={actionLoading !== null}
                >
                  {actionLoading === `accept-${selectedTransactionId}` ? (
                    <><Loader className="w-4 h-4 mr-2 animate-spin" /> Accepting...</>
                  ) : (
                    <><CheckCircle className="w-4 h-4 mr-2" /> Accept</>
                  )}
                </button>
                <button
                  onClick={handleDecline}
                  className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200 disabled:opacity-50"
                  disabled={actionLoading !== null}
                >
                  {actionLoading === `decline-${selectedTransactionId}` ? (
                    <><Loader className="w-4 h-4 mr-2 animate-spin" /> Declining...</>
                  ) : (
                    <><XCircle className="w-4 h-4 mr-2" /> Decline</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {!isLoading && !error && filteredTransactions.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between mt-6 text-sm text-gray-300">
            <div className="mb-4 md:mb-0">
              <span>
                {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex space-x-1">
                {renderPaginationButtons()}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {showTransactionModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Transaction Details</h2>
                    <p className="text-sm text-gray-600 mb-6">Transaction Information</p>
                  </div>
                  <button 
                    onClick={() => setShowTransactionModal(false)}
                    className="text-gray-700 hover:text-gray-900"
                    disabled={actionLoading !== null}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Transaction ID</span>
                    <span className="text-sm text-gray-900 font-mono">{selectedTransaction.id}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Type</span>
                    <span className="text-sm text-gray-900">{selectedTransaction.type}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">User ID</span>
                    <span className="text-sm text-gray-900">{selectedTransaction.userId}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Date Created</span>
                    <span className="text-sm text-gray-900">{formatDate(selectedTransaction.createdAt)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Amount</span>
                    <span className="text-sm text-gray-900">${selectedTransaction.amount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`text-sm font-medium ${
                      selectedTransaction.status === "COMPLETED" ? "text-green-600" :
                        selectedTransaction.status === "PENDING" ? "text-yellow-600" :
                          "text-red-600"
                    }`}>
                      {selectedTransaction.status}
                    </span>
                  </div>

                  {selectedTransaction.platformAssetId && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Platform Asset ID</span>
                      <span className="text-sm text-gray-900">{selectedTransaction.platformAssetId}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={handleReject}
                    disabled={actionLoading !== null}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {actionLoading === `reject-${selectedTransaction.id}` ? (
                      <><Loader className="w-4 h-4 mr-2 animate-spin" /> Rejecting...</>
                    ) : (
                      'Reject'
                    )}
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={actionLoading !== null}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {actionLoading === `confirm-${selectedTransaction.id}` ? (
                      <><Loader className="w-4 h-4 mr-2 animate-spin" /> Confirming...</>
                    ) : (
                      'Confirm'
                    )}
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