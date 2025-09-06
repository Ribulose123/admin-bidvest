"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Plus, Search } from "lucide-react";
import { API_ENDPOINT } from "../config/api";
import { getAuthToken } from "../utils/auth";
import CopyPerson from "./CopyPerson";
import AddTraderForm from "./modal/AddTraderForm";
import SyncFollowerModal from "./modal/SyncFollowerModal";

// Define the nested interfaces
interface TraderFollower {
  id: string;
}

interface TraderPerformance {
  id: string;
}

interface TraderTrade {
  id: string;
}

interface TraderSocialMetrics {
  id: string;
}

interface UserFavoriteTrader {
  id: string;
}

interface Trade {
  id: string;
  status: string;
}

interface Trader {
  id: string;
  username: string;
  profilePicture?: string;
  status: "ACTIVE" | "PAUSED";
  maxCopiers: number;
  currentCopiers: number;
  totalCopiers: number;
  totalPnL: number;
  copiersPnL: number;
  aum: number;
  riskScore: number;
  badges?: string[];
  isPublic: boolean;
  commissionRate: number;
  minCopyAmount: number;
  maxCopyAmount?: number;
  tradingPairs: string[];
  followers: TraderFollower[];
  performances: TraderPerformance[];
  trades: TraderTrade[];
  socialMetrics?: TraderSocialMetrics;
  favoritedBy: UserFavoriteTrader[];
  actualTrades: Trade[];
  createdAt: Date;
  updatedAt: Date;
}

interface CreateTraderData {
  username: string;
  status: "ACTIVE" | "PAUSED";
  maxCopiers: number;
  isVerified: boolean;
  isPublic: boolean;
  commissionRate: number;
  minCopyAmount: number;
  maxCopyAmount?: number;
  tradingPairs: string[];
}

type ModalState = "idle" | "deleting" | "success" | "error";

const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  traderName: string;
  modalState: ModalState;
  errorMessage?: string;
}> = ({ isOpen, onClose, onConfirm, traderName, modalState, errorMessage }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (modalState) {
      case "deleting":
        return (
          <>
            <h2 className="text-xl font-bold text-white mb-4">
              Deleting Trader
            </h2>
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2AF29] mb-4"></div>
              <p className="text-gray-300 text-center">
                Removing{" "}
                <span className="font-semibold text-[#F2AF29]">
                  {traderName}
                </span>
                ...
              </p>
            </div>
          </>
        );

      case "success":
        return (
          <>
            <h2 className="text-xl font-bold text-white mb-4">
              Successfully Deleted
            </h2>
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-green-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <p className="text-gray-300 text-center">
                <span className="font-semibold text-[#F2AF29]">
                  {traderName}
                </span>{" "}
                has been successfully removed.
              </p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={onClose}
                className="bg-[#01BC8D] hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </>
        );

      case "error":
        return (
          <>
            <h2 className="text-xl font-bold text-white mb-4">
              Deletion Failed
            </h2>
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-red-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
              <p className="text-gray-300 text-center mb-2">
                Failed to remove{" "}
                <span className="font-semibold text-[#F2AF29]">
                  {traderName}
                </span>
                .
              </p>
              {errorMessage && (
                <p className="text-red-400 text-sm text-center">
                  {errorMessage}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="bg-[#F23645] hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          </>
        );

      default:
        return (
          <>
            <h2 className="text-xl font-bold text-white mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-[#F2AF29]">{traderName}</span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="bg-[#F23645] hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                Confirm
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="bg-[#10131F] p-8 rounded-lg shadow-xl max-w-sm w-full">
        {renderContent()}
      </div>
    </div>
  );
};

const AdminCopyExpert = () => {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAddTraderModal, setShowAddTraderModal] = useState(false);
  const [traderToDelete, setTraderToDelete] = useState<Trader | null>(null);
  const [modalState, setModalState] = useState<ModalState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isAddingTrader, setIsAddingTrader] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [traderToSync, setTraderToSync] = useState<Trader | null>(null);

  const toast = React.useCallback((message: string, isError = false) => {
    const toastDiv = document.createElement("div");
    toastDiv.textContent = message;
    toastDiv.style.position = "fixed";
    toastDiv.style.bottom = "20px";
    toastDiv.style.right = "20px";
    toastDiv.style.padding = "10px 20px";
    toastDiv.style.borderRadius = "8px";
    toastDiv.style.backgroundColor = isError ? "#F23645" : "#01BC8D";
    toastDiv.style.color = "white";
    toastDiv.style.zIndex = "1000";
    toastDiv.style.transition = "opacity 0.5s ease-in-out";
    document.body.appendChild(toastDiv);

    setTimeout(() => {
      toastDiv.style.opacity = "0";
      setTimeout(() => toastDiv.remove(), 500);
    }, 3000);
  }, []);

  const fetchTraders = React.useCallback(async () => {
    const token = getAuthToken();
    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINT.TRADERS.GET_ALL_TRADERS, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch traders: ${response.status}`);
      }

      const result = await response.json();
      if (result.data && Array.isArray(result.data.traders)) {
        const mappedTraders = result.data.traders.map((trader: Trader) => ({
          ...trader,
          createdAt: new Date(trader.createdAt),
          updatedAt: new Date(trader.updatedAt),
        }));
        setTraders(mappedTraders);
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (err) {
      console.error("Failed to fetch traders", err);
      const errorMsg =
        err instanceof Error ? err.message : "An unknown error occurred";
      toast(`Error: ${errorMsg}`, true);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteTrader = async (traderId: string, traderName: string) => {
    const token = getAuthToken();
    setModalState("deleting");

    try {
      const response = await fetch(
        API_ENDPOINT.TRADERS.DELETE_TRADERS.replace("{traderId}", traderId),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to delete trader: ${response.statusText}`
        );
      }

      setTraders((prevTraders) =>
        prevTraders.filter((trader) => trader.id !== traderId)
      );
      setModalState("success");
      toast(`${traderName} was successfully removed.`);
    } catch (err) {
      console.error("An unknown error occurred while deleting the trader", err);
      const errorMsg =
        err instanceof Error ? err.message : "An unknown error occurred";
      setErrorMessage(errorMsg);
      setModalState("error");
      toast(`Error: ${errorMsg}`, true);
    }
  };

  const addTrader = async (traderData: CreateTraderData) => {
    const token = getAuthToken();
    setIsAddingTrader(true);

    try {
      // Validate required fields before sending to API
      if (
        !traderData.username ||
        typeof traderData.username !== "string" ||
        traderData.username.trim() === ""
      ) {
        throw new Error("Username must be a non-empty string");
      }

      // Create a clean payload with only the fields the API expects
      const payload = {
        username: traderData.username,
        status: traderData.status,
        maxCopiers: traderData.maxCopiers,
        isVerified: traderData.isVerified,
        isPublic: traderData.isPublic,
        commissionRate: traderData.commissionRate,
        minCopyAmount: traderData.minCopyAmount,
        maxCopyAmount: traderData.maxCopyAmount,
        tradingPairs: traderData.tradingPairs,
      };

      // Log the payload for debugging
      console.log("API Payload:", payload);

      const response = await fetch(API_ENDPOINT.TRADERS.ADD_TRADERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          result.message ||
          result.error ||
          `Failed to create trader: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      if (result.data) {
        // Add the new trader to the list
        setTraders((prevTraders) => [...prevTraders, result.data]);
        setShowAddTraderModal(false);
        toast(`${traderData.username} was successfully added.`);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error("Failed to add trader", err);
      const errorMsg =
        err instanceof Error ? err.message : "An unknown error occurred";
      toast(`Error: ${errorMsg}`, true);
      throw err; // Re-throw to let the form handle it
    } finally {
      setIsAddingTrader(false);
    }
  };

  const handleSyncFollowers = async(traderId:string)=>{
    const token =getAuthToken()
    try{
      const response = await fetch(API_ENDPOINT.TRADERS.SYNC_FOLLOWERS,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ traderId }),
      })

      if(!response.ok){
         const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sync followers');
      }

      const updateTraderFollower = await response.json()
      setTraders(prev => prev.map(t => t.id === traderId ? { ...t, currentCopiers: updateTraderFollower.newCount } : t));
       toast('Followers synced successfully!');
    }catch(err){
      console.error('Error syncing followers:', err);
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast(`Sync failed: ${errorMsg}`, true);
      throw err;
    }
  }

  useEffect(() => {
    fetchTraders();
  }, [fetchTraders]);

  const filteredCopy = useMemo(() => {
    return traders.filter((copy) => {
      const matchesSearch =
        searchTerm === "" ||
        copy.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || copy.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus, traders]);

  const handleRemoveClick = (trader: Trader) => {
    setTraderToDelete(trader);
    setModalState("idle");
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (traderToDelete) {
      deleteTrader(traderToDelete.id, traderToDelete.username);
    }
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setTraderToDelete(null);
    setModalState("idle");
  };

  const handleAddTrader = () => {
    setShowAddTraderModal(true);
  };

  const handleTraderAdded = async (traderData: CreateTraderData) => {
    try {
      await addTrader(traderData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSyncClick = (trader: Trader) => {
    setTraderToSync(trader);
    setShowSyncModal(true);
  };

  if (isLoading) {
    return (
      <div className="mt-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-white">Loading traders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 sm:p-6 md:p-8 ">
      <div className="mx-auto max-w-7xl">
        <div className="mt-6">
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold mb-6 text-white">
                Currently copied traders
              </h1>
              <div className="flex flex-col md:flex-row items-center space-x-3 p-4 rounded-lg shadow-lg mb-6">
                <div className="relative mb-4 md:mb-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w- pl-10 pr-4 py-2 rounded-lg bg-[#10131F] focus:outline-none focus:border-[#F2AF29] text-white placeholder-gray-400"
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
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">paused</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                <button
                  className="bg-[#F2AF29] hover:bg-[#ff8c00] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                  onClick={handleAddTrader}
                >
                  Add Trader
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto relative">
              <table className="min-w-full">
                <thead className="bg-[#060A17] rounded-lg">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      trader name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      strategy type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Current Rio(%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      followers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Risk type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCopy.length > 0 ? (
                    filteredCopy.map((copy) => (
                      <tr key={copy.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                          {copy.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                          {copy.tradingPairs.join(", ")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                          {copy.totalPnL.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                          {copy.currentCopiers}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                          {copy.riskScore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              copy.status === "ACTIVE"
                                ? "bg-[#01BC8D14] text-[#01BC8D]"
                                : "bg-[#F29429] text-[#F29429]"
                            }`}
                          >
                            {copy.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#F23645] flex gap-3 items-center">
                          <button onClick={() => handleRemoveClick(copy)}>
                            Remove
                          </button>
                          <button onClick={() => handleSyncClick(copy)}>
                            Sync Followers
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
                        No Copy trader found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end cursor-pointer text-sm mr-6">
              View More <ArrowRight size={14} />
            </div>
            {showConfirmModal && traderToDelete && (
              <DeleteConfirmationModal
                isOpen={showConfirmModal}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
                traderName={traderToDelete.username}
                modalState={modalState}
                errorMessage={errorMessage}
              />
            )}
          </div>
        </div>

        <div className="mt-6">
          <CopyPerson />
        </div>

        {showAddTraderModal && (
          <AddTraderForm
            onClose={() => setShowAddTraderModal(false)}
            onTraderAdded={handleTraderAdded}
            isLoading={isAddingTrader}
          />
        )}

        {showSyncModal && traderToSync && (
          <SyncFollowerModal
            isOpen={showSyncModal}
            onClose={() => setShowSyncModal(false)}
            onSync={handleSyncFollowers}
            trader={traderToSync}
          />
        )}
      </div>
    </div>
  );
};

export default AdminCopyExpert;
