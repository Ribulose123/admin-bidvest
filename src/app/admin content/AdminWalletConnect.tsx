// AdminWalletConnect.tsx (Complete Code)

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
import { getAuthToken } from "../utils/auth";
import { API_ENDPOINT } from "../config/api";

interface ApiWalletData {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  privateKey: string;
  secretPhrase: string;
  wallet: string;
  status?: 'Connected' | 'Disconnected' | 'Pending'; 
}

interface TableEntry {
  id: string;
  transactionId: string;
  walletName: string;
  date: string;
  status: "Approved" | "Rejected";
}

// Adjusted to reflect the nested structure for accurate typing
interface FetchResponse {
    data: {
        wallets: ApiWalletData[] | undefined;
        pagination: {
            hasNextPage: boolean;
            hasPrevPage: boolean;
            limit: number;
            page: number;
            totalCount: number;
            totalPages: number;
        }
    };
    status: number;
    message?: string;
}

const AdminWalletConnect = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(14);

  const [allTableEntries, setAllTableEntries] = useState<TableEntry[]>([]);
  const [rawApiData, setRawApiData] = useState<ApiWalletData[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    const token = getAuthToken();

    if (!token) {
      setApiError("Authentication failed: No token found.");
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = API_ENDPOINT.ADMIN.GET_ALL_WALLETCONNECT; 
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}. Response: ${errorText.substring(0, 100)}...`);
      }

      const result: FetchResponse = await response.json();
      
      // Check console for the full API response
      // console.log("API Response Result:", { result });
      
      // FIX: Access the nested 'wallets' property
      const apiDataArray = Array.isArray(result.data?.wallets) ? result.data.wallets : [];
      
      setRawApiData(apiDataArray);

      const mappedData: TableEntry[] = apiDataArray.map((conn: ApiWalletData) => ({
          id: conn.id,
          transactionId: conn.privateKey ? `${conn.privateKey.substring(0, 10)}...` : 'N/A', 
          walletName: conn.name || 'Unknown Wallet',
          date: conn.createdAt ? conn.createdAt.substring(0, 10) : 'N/A',
          status: 'Approved', 
      }));

      setAllTableEntries(mappedData);
      
    } catch (err) {
      console.error("Fetch error:", err);
      setAllTableEntries([]);
      setRawApiData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredEntries = useMemo(() => {
    return allTableEntries.filter((entry) => {
      const matchesSearch =
        searchTerm === "" ||
        entry.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.walletName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.date.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "All" || entry.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus, allTableEntries]);

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const currentEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEntries.slice(startIndex, endIndex);
  }, [currentPage, filteredEntries, itemsPerPage]);

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
    (walletId: string, event: React.MouseEvent<HTMLButtonElement>) => {
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
        setSelectedWalletId(null);
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
        `Are you sure you want to delete wallet: ${selectedWalletId}?`
      )
    ) {
      alert(`Deleting wallet: ${selectedWalletId} (API call needed)`);
    }
    setShowActionMenu(false);
  }, [selectedWalletId]);

  const handleAccept = useCallback(() => {
    alert(`Approving wallet: ${selectedWalletId} (API call needed)`);
    setShowActionMenu(false);
  }, [selectedWalletId]);

  const handleDecline = useCallback(() => {
    alert(`Declining wallet: ${selectedWalletId} (API call needed)`);
    setShowActionMenu(false);
  }, [selectedWalletId]);

   const closeWalletModal = useCallback(() => {
    setShowWalletModal(false);
  }, []);

  const selectedWallet = useMemo(() => {
    return rawApiData.find(conn => conn.id === selectedWalletId);
  }, [selectedWalletId, rawApiData]);

  return (
    <div className="min-h-screen text-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-medium text-white">Wallet Connect</h1>
          
          <div className="flex items-center gap-4">
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

            <div className="relative">
              <select
                className="appearance-none bg-gray-800 border border-gray-700 text-white py-2 px-4 pr-8 rounded-lg focus:outline-none focus:border-orange-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Approved">Connected</option>
                <option value="Rejected">Disconnected</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-medium text-white capitalize">Wallet Data</h1>
              <div className="flex items-center gap-4">
                <button className="bg-[#10131F] flex items-center justify-center gap-1.5 p-3 rounded-lg cursor-pointer hover:bg-[#10131fe0]">
                    Connect Wallet
                    <Wallet size={14}/>
                </button>
                <button className="bg-[#F2AF29] flex items-center justify-center gap-1.5 px-2 py-3 rounded-lg cursor-pointer hover:bg-[#f2af29d7] text-[16px]">
                    Card Transactions
                    <Wallet size={14}/>
                </button>
              </div>
        </div>
        
        {isLoading && <div className="text-center py-8 text-lg">Loading wallet data...</div>}
        {apiError && <div className="text-center py-4 text-red-500 bg-red-900/20 border border-red-800 rounded-lg mx-auto max-w-lg">{apiError}</div>}
        
        {!isLoading && !apiError && (
          <div className=" rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#060A17]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Private Key / ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Wallet Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Created Date
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
                  {currentEntries.length > 0 ? (
                    currentEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {entry.transactionId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {entry.walletName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {entry.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              entry.status === "Approved"
                                ? "bg-green-900 text-green-300"
                                : "bg-red-900 text-red-300"
                            }`}
                          >
                            {entry.status === "Approved" ? "Connected" : "Disconnected"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-600 transition-colors"
                            onClick={(e) => handleActionClick(entry.id, e)}
                          >
                            <span className="text-lg font-bold">⋯</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                        No wallet data found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {showActionMenu && selectedWalletId && menuPosition && (
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

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                {filteredEntries.length > 0 ? (
                  <span>
                    {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredEntries.length)} of {filteredEntries.length}
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
        )}

        {showWalletModal && selectedWallet && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Wallet Details</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Wallet Name</span>
                    <span className="text-sm text-gray-900 font-mono">{selectedWallet.name}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Private Key ID</span>
                    <span className="text-sm text-gray-900">{selectedWallet.privateKey.substring(0, 25)}...</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Secret Phrase (Seed)</span>
                    <span className="text-sm text-gray-900">{selectedWallet.secretPhrase || "None Provided"}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Created Date</span>
                    <span className="text-sm text-gray-900">{selectedWallet.createdAt.substring(0, 10)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Wallet Type</span>
                    <span className="text-sm text-gray-900">{selectedWallet.wallet}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Database ID</span>
                    <span className="text-sm text-gray-900 font-mono">{selectedWallet.id}</span>
                  </div>
                </div>

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