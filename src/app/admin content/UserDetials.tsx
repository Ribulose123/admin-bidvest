"use client";
import { CircleCheck, UploadIcon, Mail, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { API_ENDPOINT } from "../config/api";
import { UpdateBalanceModal } from "./modal/UpdateBalanceModal";
import { UpdateUserModal } from "./modal/UpdateUserModal";

// Interfaces based on your exact API response
interface StakingData {
  id: string;
  userId: string;
  totalBalance: number;
  activeBalance: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface SignalData {
  id: string;
  pair: string;
  direction: "buy" | "sell";
  strength: number;
  timestamp: string;
  stakings?: number;
}

interface CopyStats {
  totalFollowers: number;
  totalProfit: number;
  winRate: number;
  activeTrades: number;
}

interface CopyTradingStats {
  totalCopiers: number;
  totalVolume: number;
  monthlyProfit: number;
  performanceScore: number;
}

interface Conversion {
  rate: number;
  fromAsset: string;
  toAsset: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: "active" | "inactive";
}

interface PlatformAsset {
  id: string;
  name: string;
  symbol: string;
  network: string;
  createdAt: string;
  updatedAt: string;
  depositAddress: string;
}

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  platformAsset: PlatformAsset;
  conversion: Conversion | null;
  signal: SignalData | null;
  staking: StakingData | null;
  subscription: Subscription | null;
  withdrawal: Transaction | null;
}

interface UserAsset {
  id: string;
  userId: string;
  platformAssetId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  depositAddress: string;
  platformAsset: PlatformAsset;
}

interface Statistics {
  totalTransactions: number;
  totalAssets: number;
  totalTrades: number;
  totalCopiedTrades: number;
  totalFollowingTraders: number;
  hasActiveSignal: boolean;
  hasActiveStaking: boolean;
  copyTradingStats: CopyTradingStats | null;
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  isEmailVerified: boolean;
  referralCode: string;
  createdAt: string;
  updatedAt: string;
  twoFactorEnabled: boolean;
  withdrawalType:"AUTO" | "DEPOSIT" | "PASSCODE" ;
  kycStatus: "VERIFIED" | "PENDING" | "REJECTED" | "UNVERIFIED";
  withdrawalPercentage:number
  kycImage: string | null;
  subscriptionBalance: number;
  userStaking: StakingData | null;
  userSignal: SignalData | null;
  copyStats: CopyStats | null;
  copyTradingStats: CopyTradingStats | null;
  statistics: Statistics;
  transactions: Transaction[];
  userAssets: UserAsset[];
}

const UserDetails = () => {
  const params = useParams();
  const id = params.id as string;

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [activeModal, setActiveModal] = useState<"asset" | "signal" | "subscription" | "staking" | 'user' | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
const [transactionsPerPage] = useState<number>(6);

  const fetchUserDetails = useCallback(async (abortController: AbortController) => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token not found.");

      const endpoint = API_ENDPOINT.ADMIN.GET_USER_DETAILS.replace("{id}", id);

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('User staking data:', responseData.data.userStaking);
    console.log('User signal data:', responseData.data.userSignal)

      if (!responseData.data) {
        throw new Error("No user data found in response");
      }

      setUserData(responseData.data);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch user data";
      setError(errorMessage);
      console.error("Error fetching user details:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchUserDetails(abortController);

    return () => {
      abortController.abort();
    };
  }, [id, fetchUserDetails]);

  const handleExport = useCallback(() => {
    if (!userData) return;
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert(`User data for ${userData.fullName} exported successfully!`);
    }, 1500);
  }, [userData]);

  const handleUpdateSuccess = useCallback(() => {
    alert("Balance updated successfully!");
    setActiveModal(null);
    const abortController = new AbortController();
    fetchUserDetails(abortController);
  }, [fetchUserDetails]);



 const platformAssetId = userData?.userAssets?.[0]?.platformAssetId;
const signalId = userData?.userSignal?.id;
const stakeId = userData?.userStaking?.id
// Fixed Current Balances calculation
// Fixed Current Balances calculation
const currentBalances = {
  asset: { 
    balance: userData?.userAssets?.[0]?.balance || 0,
    platformAssetId: platformAssetId
  },
  signal: {
    stakings: userData?.userSignal?.stakings || 0,
    strength: userData?.userSignal?.strength || 0,
    signalId: signalId
  },
  subscription: { subscriptionBalance: userData?.subscriptionBalance || 0 },
  staking: {
    totalBalance: userData?.userStaking?.totalBalance || 0,
    activeBalance: userData?.userStaking?.activeBalance || 0,
    stakeId: stakeId
  }
}



  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };


  const transactionsPagination = useMemo(()=>{
    if(!userData) return {currentTransactions: [], totalPages:0}

    const totalPages = Math.ceil(userData.transactions.length / transactionsPerPage)
    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTranstion = indexOfLastTransaction - transactionsPerPage;

    const currentTransactions = userData.transactions.slice(indexOfFirstTranstion, indexOfLastTransaction)

    return {
      currentTransactions,
      totalPages,
      currentPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    }
  },[userData, currentPage, transactionsPerPage])

  const handleNextPage = ()=>{
    if(transactionsPagination.hasNextPage){
      setCurrentPage(prev=> prev + 1)
    }
  }

  const handlePrevPage = () =>{
    if(transactionsPagination.hasPrevPage){
      setCurrentPage(prev => prev - 1)
    }
  }

    const handlePageClick = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-3 text-[#F2AF29]"></div>
        Loading user data...
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p className="p-4 bg-[#141E32] rounded-lg border border-red-800">
          {error || "No user data found for this ID."}
        </p>
      </div>
    );
  }

  const { kycStatus, isEmailVerified, statistics } = userData;
  const isVerified = kycStatus === "VERIFIED";

  return (
    <div className="p-6 w-full text-white font-inter">
      {/* User Profile Section */}
      <div className="bg-[#141E323D] border border-[#141E32] rounded-lg p-6 w-full flex flex-col justify-between gap-6 mb-6">
        <div className="flex-1">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <Image
                  src="/image/Image-60.png"
                  alt="avatar"
                  height={100}
                  width={100}
                  className="rounded-full border-2 border-[#439A86] object-cover"
                />
              </div>

              <div className="text-[#E4E4E4] flex flex-col gap-1">
                <h2 className="text-2xl font-bold">{userData.fullName}</h2>

                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[#797A80]" />
                  <p>
                    {userData.email}{" "}
                    {isEmailVerified && (
                      <span className="text-xs text-[#01BC8D]">(Verified)</span>
                    )}
                  </p>
                </div>

                <div
                  className={`w-fit px-3 py-1.5 flex items-center gap-1.5 rounded-md mt-2 ${
                    isVerified
                      ? "bg-[#439A861F] text-[#439A86]"
                      : "bg-yellow-800/20 text-yellow-500"
                  }`}
                >
                  <CircleCheck size={14} />
                  <span>KYC Status: {userData.kycStatus}</span>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="bg-[#01BC8D0A] text-xs px-3 py-1.5 rounded-md">
                    Referral: {userData.referralCode}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-12 flex-wrap">
              <div className="flex flex-col gap-1">
                <h3 className="text-[#E8E8E880] text-sm uppercase">User ID</h3>
                <p className="text-lg font-medium">{userData.id}</p>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-[#E8E8E880] text-sm">Member Since</h3>
                <p className="text-lg font-medium">
                  {formatDate(userData.createdAt)}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-[#E8E8E880] text-sm">2FA Enabled</h3>
                <p
                  className={`text-lg font-medium flex items-center gap-1.5 ${
                    userData.twoFactorEnabled
                      ? "text-[#01BC8D]"
                      : "text-red-500"
                  }`}
                >
                  {userData.twoFactorEnabled ? "Yes" : "No"}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="text-[#E8E8E880] text-sm">Withdrawal percentage</h2>
                <p className="text-lg font-medium flex items-center">{userData.withdrawalPercentage}%</p>
              </div>

              {/* <div className="flex flex-col gap-1">
                <h3 className="text-[#E8E8E880] text-sm">Allow Withdrawal</h3>
                <p
                  className={`text-lg font-medium flex items-center gap-1.5 ${
                    userData.allowWithdrawal ? "text-[#01BC8D]" : "text-red-500"
                  }`}
                >
                  {userData.allowWithdrawal ? "Yes" : "No"}
                </p>
              </div> */}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setActiveModal("asset")}
              className="bg-[#01BC8D] hover:bg-[#00a87c] text-white font-medium px-4 py-2 rounded-md transition-colors"
            >
              Update Asset Balance
            </button>

            <button
  onClick={() => setActiveModal("user")}
  className="bg-[#439A86] hover:bg-[#3a8573] text-white font-medium px-4 py-2 rounded-md transition-colors"
>
  Update User
</button>

            <button
              onClick={() => setActiveModal("signal")}
              className="bg-[#F2AF29] hover:bg-[#e5a524] text-white font-medium px-4 py-2 rounded-md transition-colors"
            >
              Update Signal Balance
            </button>
            <button
              onClick={() => setActiveModal("staking")}
              className="bg-[#F2AF29] hover:bg-[#e5a524] text-white font-medium px-4 py-2 rounded-md transition-colors"
            >
              Update Staking Balance
            </button>

            <button
              onClick={() => setActiveModal("subscription")}
              className="bg-[#439A86] hover:bg-[#3a8573] text-white font-medium px-4 py-2 rounded-md transition-colors"
            >
              Update Subscription
            </button>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="bg-[#F2AF29] hover:bg-[#e5a524] text-white font-medium px-6 py-2 rounded-md flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                Exporting...
              </>
            ) : (
              <>
                <p>Export</p>
                <UploadIcon size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="mt-6">
        <div
          className="flex items-center gap-4 mb-6 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <h2 className="text-xl font-bold">Account Statistics</h2>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              expanded ? "rotate-0" : "rotate-180"
            }`}
          />
        </div>
        {expanded && (
          <div className="bg-[#141E323D] border border-[#141E32] rounded-lg p-6 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-8 text-white">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Assets</p>
                <p className="text-2xl font-bold">
                  {statistics.totalAssets.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Transactions</p>
                <p className="text-2xl font-bold">
                  {statistics.totalTransactions.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Trades</p>
                <p className="text-2xl font-bold">
                  {statistics.totalTrades.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Copied Trades</p>
                <p className="text-2xl font-bold">
                  {statistics.totalCopiedTrades.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Active Staking</p>
                <p
                  className={`text-2xl font-bold ${
                    statistics.hasActiveStaking
                      ? "text-emerald-400"
                      : "text-red-500"
                  }`}
                >
                  {statistics.hasActiveStaking ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Active Signal</p>
                <p
                  className={`text-2xl font-bold ${
                    statistics.hasActiveSignal
                      ? "text-emerald-400"
                      : "text-red-500"
                  }`}
                >
                  {statistics.hasActiveSignal ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Following Traders</p>
                <p className="text-2xl font-bold">
                  {statistics.totalFollowingTraders.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Subscription Balance</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(userData.subscriptionBalance)}
                </p>
              </div>
            </div>

            {/* Current Balances Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
              <div className="bg-[#0A0F1C] p-4 rounded-lg">
                <h3 className="text-gray-400 text-sm">Current Asset Balance</h3>
                <p className="text-xl font-bold">
                  {formatCurrency(currentBalances.asset.balance)}
                </p>
              </div>
              <div className="bg-[#0A0F1C] p-4 rounded-lg">
                <h3 className="text-gray-400 text-sm">Current Signal Staking</h3>
                <p className="text-xl font-bold">
                  {formatCurrency(currentBalances.signal.stakings)}
                </p>
                <p className="text-sm text-gray-400">
                  Strength: {(currentBalances.signal.strength * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-[#0A0F1C] p-4 rounded-lg">
                <h3 className="text-gray-400 text-sm">Current Subscription</h3>
                <p className="text-xl font-bold">
                  {formatCurrency(currentBalances.subscription.subscriptionBalance)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Assets Section */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-6">User Assets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userData.userAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-[#141E323D] border border-[#141E32] rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {asset.platformAsset.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {asset.platformAsset.symbol}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Network: {asset.platformAsset.network}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {asset.balance.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Balance</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {userData.userAssets.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-[#141E323D] rounded-lg border border-[#141E32]">
            No assets found for this user.
          </div>
        )}
      </div>

      {/* Transaction History Section */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-6">Transaction History</h2>
        <div className="overflow-x-auto rounded-lg border border-[#141E32]">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="text-gray-400 text-xs uppercase bg-[#060A17] border-b border-[#141E32]">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactionsPagination.currentTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-[#141E32] hover:bg-[#10131F] transition-colors duration-150"
                >
                  <td className="py-4 px-4 text-sm font-medium">
                    {transaction.id.slice(0, 8)}...
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        transaction.type === "DEPOSIT"
                          ? "text-emerald-400 bg-emerald-400/10"
                          : transaction.type === "WITHDRAWAL"
                          ? "text-red-400 bg-red-400/10"
                          : "text-blue-400 bg-blue-400/10"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm">
                    {transaction.platformAsset.symbol}
                  </td>
                  <td className="py-4 px-4 text-sm">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="py-4 px-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        transaction.status === "COMPLETED"
                          ? "bg-[#01BC8D14] text-[#01BC8D]"
                          : "bg-yellow-800/20 text-yellow-500"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-gray-400">
                    {formatDate(transaction.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {userData.transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No transaction history found.
            </div>
          )}
          {/* Pagination Controls */}
        {userData && userData.transactions.length > transactionsPerPage && (
          <div className="flex items-center justify-between mt-6 px-4">
            <button
              onClick={handlePrevPage}
              disabled={!transactionsPagination.hasPrevPage}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                transactionsPagination.hasPrevPage
                  ? "bg-[#F2AF29] hover:bg-[#e5a524] text-white cursor-pointer"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: transactionsPagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-[#01BC8D] text-white"
                      : "bg-[#141E32] text-gray-300 hover:bg-[#2D3748]"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={!transactionsPagination.hasNextPage}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                transactionsPagination.hasNextPage
                  ? "bg-[#F2AF29] hover:bg-[#e5a524] text-white cursor-pointer"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        </div>
      </div>

 {/* Balance Update Modals */}
{activeModal && activeModal !== 'user' && (
  <UpdateBalanceModal
    isOpen={!!activeModal}
    onClose={() => setActiveModal(null)}
    userId={userData.id}
    title={
      activeModal === "asset"
        ? "Asset Balance"
        : activeModal === "signal"
        ? "Signal Balance"
        : activeModal === "staking"
        ? "Staking Balance"
        : "Subscription Balance"
    }
    balanceType={activeModal}
    currentData={
      activeModal === "asset"
        ? currentBalances.asset
        : activeModal === "signal"
        ? currentBalances.signal
        : activeModal === "staking"
        ? currentBalances.staking
        : currentBalances.subscription
    }
    onUpdateSuccess={handleUpdateSuccess}
    platformAssetId={platformAssetId}
    signalId={signalId}
  />
)}

{activeModal === 'user' && (
  <UpdateUserModal
    isOpen={true}
    onClose={() => setActiveModal(null)}
    userId={userData.id}
    currentUserData={{
      fullName: userData.fullName,
      email: userData.email,
      isEmailVerified: userData.isEmailVerified,
      twoFactorEnabled: userData.twoFactorEnabled,
      withdrawalType: userData.withdrawalType,
      kycStatus: userData.kycStatus,
      withdrawalPercentage: userData.withdrawalPercentage
    }}
    onUpdateSuccess={handleUpdateSuccess}
  />
)}
    </div>
  );
};

export default UserDetails;