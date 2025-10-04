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
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_ENDPOINT } from "../config/api";

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
  id: string; // Keep 'id' (likely a UUID)
  // REMOVED: userId: string;
  email: string;
  joined: string;
  userAssets: UserAsset[];
  status: "Active" | "Inactive" | "Suspended";
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

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterOutcome, setFilterOutcome] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(14);

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

  // UPDATED: Use 'id' (UUID) instead of the removed 'userId' for signal strength calculation.
  const calculateSignalStrength = useCallback((user: User): string => {
    // Convert the user's UUID (id) to a numeric hash for "random" generation
    // Uses the first few digits of the hash code of the UUID
    const uuidHash = user.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seed = uuidHash * 3.14159;
    const percentage = Math.abs(Math.sin(seed) * 100);
    return `${percentage.toFixed(2)}%`;
  }, []);

  useEffect(() => {
    const fetchAllUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No authentication token found");

        const userResponse = await fetch(API_ENDPOINT.ADMIN.GET_ALL_USERS, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!userResponse.ok) {
          throw new Error(`HTTP error! status: ${userResponse.status}`);
        }

        const userResponseData = await userResponse.json();
        
        let fetchedUsers: User[] = [];
        if (
          userResponseData.data &&
          Array.isArray(userResponseData.data.users)
        ) {
          fetchedUsers = userResponseData.data.users;
        } else if (Array.isArray(userResponseData.data)) {
          fetchedUsers = userResponseData.data;
        } else if (Array.isArray(userResponseData)) {
          fetchedUsers = userResponseData;
        } else {
          console.error(
            "API response data is not an array at expected paths:",
            userResponseData
          );
        }

        setUsers(fetchedUsers);

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
    };

    fetchAllUsers();
  }, []);

  const usersWithCalculatedFields = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.map((user) => ({
      ...user,
      displayBalance: `$${calculateTotalBalance(user, prices).toFixed(2)}`,
      signalStrength: calculateSignalStrength(user),
      outcome: user.status === "Active" ? "Active" : "Inactive",
    }));
  }, [users, prices, calculateTotalBalance, calculateSignalStrength]);

  const filteredUsers = useMemo(() => {
    return usersWithCalculatedFields.filter((user) => {
      const matchesSearch =
        searchTerm === "" ||
        // REMOVED: user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase()) || // Search the UUID instead
        user.joined.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayBalance.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesOutcome =
        filterOutcome === "All" || user.outcome === filterOutcome;
      return matchesSearch && matchesOutcome;
    });
  }, [searchTerm, filterOutcome, usersWithCalculatedFields]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const currentUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [currentPage, filteredUsers, itemsPerPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const handNavigation = useCallback(
    (id: string) => {
      router.push(`/admin/usermanagement/${id}`);
    },
    [router]
  );

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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">
          Users ({filteredUsers.length})
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg shadow-lg mb-6 bg-[#060A17] border border-gray-800">
          <div className="relative w-full md:w-1/3 mb-4 md:mb-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
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
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Total Balance (USD)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Signal Strength
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#10131F] divide-y divide-gray-800">
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.joined}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-semibold">
                      {user.displayBalance}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.signalStrength}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === "Active"
                            ? "bg-[#01BC8D14] text-[#01BC8D]"
                            : user.status === "Suspended"
                            ? "bg-[#F2AF2914] text-[#F2AF29]"
                            : "bg-[#F2364514] text-[#F23645]"
                        }`}
                      >
                        {user.status}
                      </span>
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
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No users match your criteria.
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

        <div className="flex flex-col md:flex-row items-center justify-between mt-6 text-sm text-gray-300">
          <div className="mb-4 md:mb-0">
            {filteredUsers.length > 0 ? (
              <span>
                {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
              </span>
            ) : (
              <span>0 - 0 of 0 users</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex space-x-1">{renderPaginationButtons()}</div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
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
