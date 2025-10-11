"use client";
import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Eye,
  Trash2,
  XCircle,
  X,
  CheckCircle,
  Image as ImageIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_ENDPOINT } from "../config/api";
import Image from "next/image";

interface PlatformAsset {
  id: string;
  name: string;
  symbol: string;
  networkId?: string;
}

interface UserAsset {
  platformAssetId: string;
  platformAsset: PlatformAsset;
  balance: number;
}

interface CoinGeckoPrice {
  [coinId: string]: {
    usd: number;
  };
}

interface User {
  id: string;
  email: string;
  kycImage: string;
  kycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED'; 
  joined: string;
  userAssets: UserAsset[];
  status: "Active" | "Inactive" | "Suspended";
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}



const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  DOT: "polkadot",
  SHIB: "shiba-inu",
  AVAX: "avalanche-2",
  MATIC: "matic-network",
  LTC: "litecoin",
  TRX: "tron",
  UNI: "uniswap",
  LINK: "chainlink",
  ATOM: "cosmos",
  XLM: "stellar",
  XMR: "monero",
  ETC: "ethereum-classic",
};

const getCoinGeckoId = (asset: PlatformAsset): string => {
  if (asset.networkId) {
    return asset.networkId.toLowerCase();
  }
  return SYMBOL_TO_COINGECKO_ID[asset.symbol] || asset.symbol.toLowerCase();
};

const AdminUserManagement = () => {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState<CoinGeckoPrice>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [selectedUserForKYC, setSelectedUserForKYC] = useState<User | null>(null);
  const [kycActionsLoading, setKycActionsLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterOutcome, setFilterOutcome] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(14);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 14,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const fetchPrices = async (allUsers: User[]): Promise<CoinGeckoPrice> => {
    try {
      const allAssets: PlatformAsset[] = allUsers.flatMap((user) =>
        user.userAssets.map((ua) => ua.platformAsset)
      );

      const uniqueCoinGeckoIds = [
        ...new Set(allAssets.map((asset) => getCoinGeckoId(asset))),
      ]
        .filter(Boolean)
        .join(",");

      if (!uniqueCoinGeckoIds) {
        return {};
      }

      const response = await axios.get<CoinGeckoPrice>(
        `https://api.coingecko.com/api/v3/simple/price?ids=${uniqueCoinGeckoIds}&vs_currencies=usd`,
        { timeout: 5000 }
      );
      return response.data || {};
    } catch (err) {
      console.error("Error fetching prices:", err);
      return {};
    }
  };

  const calculateTotalBalance = useCallback(
    (user: User, currentPrices: CoinGeckoPrice): number => {
      return user.userAssets.reduce((sum: number, asset: UserAsset) => {
        const coinGeckoId = getCoinGeckoId(asset.platformAsset);
        const price = currentPrices[coinGeckoId]?.usd || 0;
        return sum + asset.balance * price;
      }, 0);
    },
    []
  );

  const calculateSignalStrength = useCallback((user: User): string => {
    const uuidHash = user.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seed = uuidHash * 3.14159;
    const percentage = Math.abs(Math.sin(seed) * 100);
    return `${percentage.toFixed(2)}%`;
  }, []);

  const fetchAllUsers = useCallback(async (page: number = 1, search: string = "", filter: string = "All") => {
    setLoading(true);
    setError(null);
    try {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      // Add search parameter if provided
      if (search) {
        params.append('search', search);
      }

      // Add status filter if not "All"
      if (filter !== "All") {
        params.append('status', filter);
      }

      const paginatedEndpoint = `${API_ENDPOINT.ADMIN.GET_ALL_USERS}?${params.toString()}`;
      
      const userResponse = await fetch(paginatedEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!userResponse.ok) {
        throw new Error(`HTTP error! status: ${userResponse.status}`);
      }

      const userResponseData = await userResponse.json();
      console.log('API Response:', userResponseData);
      
      let fetchedUsers: User[] = [];
      let paginationInfo: PaginationInfo = {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: itemsPerPage,
        hasNextPage: false,
        hasPrevPage: false,
      };

      // Handle different response structures
      if (userResponseData.data && userResponseData.data.users && userResponseData.data.pagination) {
        // Structure: { data: { users: [], pagination: {} } }
        fetchedUsers = userResponseData.data.users;
        paginationInfo = { ...paginationInfo, ...userResponseData.data.pagination };
      } else if (userResponseData.users && userResponseData.pagination) {
        // Structure: { users: [], pagination: {} }
        fetchedUsers = userResponseData.users;
        paginationInfo = { ...paginationInfo, ...userResponseData.pagination };
      } else if (Array.isArray(userResponseData.data)) {
        // Fallback: array without pagination
        fetchedUsers = userResponseData.data;
        paginationInfo.totalItems = fetchedUsers.length;
        paginationInfo.totalPages = Math.ceil(fetchedUsers.length / itemsPerPage);
        paginationInfo.hasNextPage = page < paginationInfo.totalPages;
        paginationInfo.hasPrevPage = page > 1;
      } else if (Array.isArray(userResponseData)) {
        // Fallback: direct array
        fetchedUsers = userResponseData;
        paginationInfo.totalItems = fetchedUsers.length;
        paginationInfo.totalPages = Math.ceil(fetchedUsers.length / itemsPerPage);
        paginationInfo.hasNextPage = page < paginationInfo.totalPages;
        paginationInfo.hasPrevPage = page > 1;
      } else {
        console.error("Unexpected API response structure:", userResponseData);
        throw new Error("Invalid API response structure");
      }

      setUsers(fetchedUsers);
      setPagination(paginationInfo);

      if (fetchedUsers.length > 0) {
        const fetchedPrices = await fetchPrices(fetchedUsers);
        setPrices(fetchedPrices);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching user data"
      );
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  // Initial fetch and when page changes
  useEffect(() => {
    fetchAllUsers(currentPage, searchTerm, filterOutcome);
  }, [currentPage, filterOutcome, fetchAllUsers, searchTerm]);

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      fetchAllUsers(1, searchTerm, filterOutcome);
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filterOutcome, fetchAllUsers]);

  const usersWithCalculatedFields = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.map((user) => {
      const totalBalance = calculateTotalBalance(user, prices);
      const signalStrength = calculateSignalStrength(user);
      
      return {
        ...user,
        displayBalance: `$${totalBalance.toFixed(2)}`,
        signalStrength: signalStrength,
        outcome: user.status === "Active" ? "Active" : "Inactive",
      };
    });
  }, [users, prices, calculateTotalBalance, calculateSignalStrength]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  }, [pagination.totalPages]);

  const handNavigation = useCallback(
    (id: string) => {
      router.push(`/admin/usermanagement/${id}`);
    },
    [router]
  );

  const updateKYCStatus = async (userId: string, newStatus: 'VERIFIED' | 'REJECTED') => {
    setKycActionsLoading(`${newStatus}-${userId}`);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_ENDPOINT.ADMIN.UPDATE_USER.replace('{id}', userId)}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kycStatus: newStatus
        })
      });

      if (response.ok) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, kycStatus: newStatus }
            : user
        ));
        setShowImageModal(false);
        setSelectedUserForKYC(null);
        setSelectedImage(null);
      } else {
        throw new Error('Failed to update KYC status');
      }
    } catch (error) {
      console.error('Error updating KYC status:', error);
      setError('Failed to update KYC status');
    } finally {
      setKycActionsLoading(null);
    }
  };

  const handleImageClick = (user: User) => {
    // Only open modal if there's an actual image
    if (user.kycImage) {
      setSelectedImage(user.kycImage);
      setSelectedUserForKYC(user);
      setShowImageModal(true);
    }
    // If no image, do nothing (the placeholder will just show)
  };

  const handleApproveKYC = () => {
    if (selectedUserForKYC) {
      updateKYCStatus(selectedUserForKYC.id, 'VERIFIED');
    }
  };

 /*  const handleRejectKYC = () => {
    if (selectedUserForKYC) {
      updateKYCStatus(selectedUserForKYC.id, 'REJECTED');
    }
  }; */

  const handleActionClick = useCallback(
    (userId: string, event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();

      let left = rect.left + window.scrollX - 160 - 10;
      const viewportWidth = window.innerWidth;

      if (left < 0) {
        left = rect.right + window.scrollX + 10;
      }

      if (left + 160 > viewportWidth) {
        left = rect.left + window.scrollX - 160 - 10;
      }

      setSelectedUserId(userId);
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
        setSelectedUserId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleView = useCallback(() => {
    alert(`Viewing user: ${selectedUserId}`);
    handNavigation(selectedUserId!);
    setShowActionMenu(false);
  }, [selectedUserId, handNavigation]);

  const handleSuspend = useCallback(() => {
    if (
      window.confirm(
        `Are you sure you want to suspend user: ${selectedUserId}?`
      )
    ) {
      alert(`Suspending user: ${selectedUserId}`);
    }
    setShowActionMenu(false);
  }, [selectedUserId]);

  const handleDelete = useCallback(() => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete user: ${selectedUserId}?`
      )
    ) {
      alert(`Deleting user: ${selectedUserId}`);
    }
    setShowActionMenu(false);
  }, [selectedUserId]);

  const renderPaginationButtons = useCallback(() => {
    const pagesToShow = 7;
    const buttons = [];
    const startPage = Math.max(1, pagination.currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(pagination.totalPages, startPage + pagesToShow - 1);

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
            pagination.currentPage === i ? "bg-[#7D849114] e" : "hover:bg-gray-700"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        buttons.push(
          <span key="dots-end" className="px-3 py-1 text-gray-400">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={pagination.totalPages}
          onClick={() => handlePageChange(pagination.totalPages)}
          className="px-3 py-1 rounded-md hover:bg-gray-700"
        >
          {pagination.totalPages}
        </button>
      );
    }

    return buttons;
  }, [pagination.currentPage, pagination.totalPages, handlePageChange]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F2AF29]"></div>
        <span className="ml-4">Loading user data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500 p-8">
        <h2 className="text-xl font-semibold mb-4">Error Fetching Data</h2>
        <p>{error}</p>
        <p className="mt-2 text-gray-400">
          Please check the API endpoint and your authentication token.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-100 p-8 font-inter">
      <div className="max-w-full mx-auto">
        <h1 className="text-2xl font-semibold mb-6">
          Users ({pagination.totalItems})
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg shadow-lg mb-6 bg-[#060A17] border border-gray-800">
          <div className="relative w-full md:w-1/3 mb-4 md:mb-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by ID, email, or date..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#10131F] focus:outline-none focus:ring-2 focus:ring-[#F2AF29] text-white placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <select
                className="block appearance-none w-full bg-[#10131F] border border-gray-600 text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                value={filterOutcome}
                onChange={(e) => setFilterOutcome(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto relative rounded-lg border border-gray-800">
          <table className="min-w-full">
            <thead className="bg-[#060A17]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  KYC Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  KYC Status
                </th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Total Balance (USD)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Signal Strength
                </th>
               
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#10131F] divide-y divide-gray-800">
              {usersWithCalculatedFields.length > 0 ? (
                usersWithCalculatedFields.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                    onClick={() => handNavigation(user.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      {user.kycImage ? (
                        <Image 
                          src={user.kycImage} 
                          alt="KYC Document" 
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-md cursor-pointer object-cover hover:opacity-80 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageClick(user);
                          }}
                        />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-md bg-gray-700 flex items-center justify-center cursor-not-allowed border border-gray-600"
                          title="No KYC Image Available"
                        >
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.kycStatus === 'VERIFIED' ? 'bg-[#01BC8D14] text-[#01BC8D]' :
                        user.kycStatus === 'REJECTED' ? 'bg-[#F2364514] text-[#F23645]' :
                        'bg-yellow-800 text-yellow-300'
                      }`}>
                        {user.kycStatus || 'PENDING'}
                      </span>
                    </td>
                   
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-semibold">
                      {user.displayBalance}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.signalStrength}
                    </td>
                   
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        className="text-gray-400 hover:text-white focus:outline-none p-1 rounded-md hover:bg-gray-600 transition-colors duration-200"
                        onClick={(e) => handleActionClick(user.id, e)}
                      >
                        <span className="text-xl font-bold">...</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {showActionMenu && selectedUserId && menuPosition && (
            <div
              ref={actionMenuRef}
              className="absolute z-50 bg-[#141E32] border border-gray-600 rounded-md shadow-xl py-1 w-40"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              <button
                onClick={handleView}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
              >
                <Eye className="w-4 h-4 mr-2" /> View Details
              </button>
              <button
                onClick={handleSuspend}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Suspend
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-600 w-full text-left transition-colors duration-200"
              >
                <XCircle className="w-4 h-4 mr-2" /> Delete
              </button>
            </div>
          )}
        </div>

        {/* KYC Image Modal - Only shows when there's an actual image */}
        {showImageModal && selectedImage && selectedUserForKYC && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1E293B] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">KYC Document Verification</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    User: {selectedUserForKYC.email} | ID: {selectedUserForKYC.id}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setSelectedImage(null);
                    setSelectedUserForKYC(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 flex flex-col items-center">
                <div className="mb-6 w-full flex justify-center bg-black/50 rounded-lg p-4">
                  <Image 
                    src={selectedImage} 
                    alt="KYC Document Full Size" 
                    width={600}
                    height={400}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                  />
                </div>
                
                <div className="flex gap-4 w-full max-w-md">
                  
                  
                  <button
                    onClick={handleApproveKYC}
                    disabled={kycActionsLoading !== null}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {kycActionsLoading === `VERIFIED-${selectedUserForKYC.id}` ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve KYC
                      </>
                    )}
                  </button>
                </div>

                {/* KYC Status Information */}
                <div className="mt-6 w-full max-w-md text-sm text-gray-400">
                  <p className="text-center">
                    Current Status: <span className={`font-semibold ${
                      selectedUserForKYC.kycStatus === 'VERIFIED' ? 'text-green-400' :
                      selectedUserForKYC.kycStatus === 'REJECTED' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {selectedUserForKYC.kycStatus || 'PENDING'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between mt-6 text-sm text-gray-300">
          <div className="mb-4 md:mb-0">
            {pagination.totalItems > 0 ? (
              <span>
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} -{" "}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
                {pagination.totalItems} users
              </span>
            ) : (
              <span>0 users</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-3 py-1 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex space-x-1">{renderPaginationButtons()}</div>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="px-3 py-1 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;