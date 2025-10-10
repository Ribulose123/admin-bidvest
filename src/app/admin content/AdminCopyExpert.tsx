"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Plus, Search } from "lucide-react";
import { API_ENDPOINT } from "../config/api";
import { getAuthToken } from "../utils/auth";
import CopyPerson from "./CopyPerson";
import AddTraderForm from "./modal/AddTraderForm";
import SyncFollowerModal from "./modal/SyncFollowerModal";
import CreateTrade from "./CreateTrade";
import { Trader } from "../type/transctions";
import { useRouter } from "next/navigation";

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
  const router = useRouter()
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
  const [showModalCreateTrade, setShowModalCreateTrade] = useState(false);
  const [traderToSync, setTraderToSync] = useState<Trader | null>(null);
  const [traderToCreateTrade, setTraderToCreateTrade] = useState<Trader | null>(
    null
  );


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
        console.log("Processed traders data:", mappedTraders);
        
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

  const handleSyncFollowers = async (traderId: string) => {
    const token = getAuthToken();
    try {
      const response = await fetch(API_ENDPOINT.TRADERS.SYNC_FOLLOWERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ traderId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to sync followers");
      }

      const updateTraderFollower = await response.json();
      setTraders((prev) =>
        prev.map((t) =>
          t.id === traderId
            ? { ...t, currentCopiers: updateTraderFollower.newCount }
            : t
        )
      );
      toast("Followers synced successfully!");
    } catch (err) {
      console.error("Error syncing followers:", err);
      const errorMsg =
        err instanceof Error ? err.message : "An unknown error occurred.";
      toast(`Sync failed: ${errorMsg}`, true);
      throw err;
    }
  };

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

  const handleCreateTrade = () => {
    setShowModalCreateTrade(true);
  };

  
  const handleNavigationAlltrade =()=>{
    router.push('/admin/alltrade')
  }

 
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
    <div className="min-h-screen w-full p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Currently Copied Traders
            </h1>

            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 bg-[#0f1424] rounded-xl border border-gray-800">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search traders..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#10131F] border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F2AF29] focus:border-transparent transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="relative min-w-[150px]">
                <select
                  className="w-full bg-[#10131F] border border-gray-700 text-white py-2.5 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-[#F2AF29] focus:border-transparent appearance-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="bg-[#F2AF29] hover:bg-[#ff8c00] text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 min-w-[120px]"
                  onClick={handleAddTrader}
                >
                  <Plus className="w-4 h-4" />
                  Add Trader
                </button>
                <button
                  className="bg-[#01BC8D] hover:bg-[#00a87c] text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 min-w-[140px]"
                  onClick={handleCreateTrade}
                >
                  <Plus className="w-4 h-4" />
                  Create Trade

                </button>

                 <button
                  className="bg-[#01BC8D] hover:bg-[#00a87c] text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 min-w-[140px]"
                  onClick={handleNavigationAlltrade}
                >
                  Get all trade
                </button>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-[#0a0f1f] rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#060A17] border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                      Trader ID
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                      Trader Name
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                      Strategy Type
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                      P&L (%)
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                      Followers
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                      Risk Score
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredCopy.length > 0 ? (
                    filteredCopy.map((copy) => (
                      <tr
                        key={copy.id}
                        className="hover:bg-[#0f1424] transition-colors"
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                          <span className="font-mono text-xs bg-[#10131F] px-2 py-1 rounded">
                            {copy.id}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-white">
                          {copy.username}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-300 max-w-[200px] truncate">
                          {(copy.tradingPairs || []).join(", ")}
                        </td>
                        <td
                          className={`px-4 py-4 whitespace-nowrap text-sm font-bold ${
                            (copy.totalPnL || 0) >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {(copy.totalPnL || 0).toFixed(2)}%
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          <span className="bg-[#10131F] px-3 py-1 rounded-full">
                            {copy.currentCopiers || 0}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              (copy.riskScore || 0) <= 3
                                ? "bg-green-900/30 text-green-400"
                                : (copy.riskScore || 0) <= 7
                                ? "bg-yellow-900/30 text-yellow-400"
                                : "bg-red-900/30 text-red-400"
                            }`}
                          >
                            {copy.riskScore || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              copy.status === "ACTIVE"
                                ? "bg-green-900/30 text-green-400 border border-green-800/50"
                                : "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50"
                            }`}
                          >
                            {copy.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => handleRemoveClick(copy)}
                              className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 text-xs font-medium rounded-lg transition-colors border border-red-800/50"
                            >
                              Remove
                            </button>
                            <button
                              onClick={() => handleSyncClick(copy)}
                              className="px-3 py-1.5 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 text-xs font-medium rounded-lg transition-colors border border-blue-800/50"
                            >
                              Sync
                            </button>
                           
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Search className="w-12 h-12 text-gray-600 mb-2" />
                          <p className="text-lg font-medium">
                            No traders found
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Try adjusting your search or filter criteria
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* View More Footer */}
            {filteredCopy.length > 0 && (
              <div className="px-6 py-4 bg-[#060A17] border-t border-gray-800">
                <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors ml-auto">
                  View More Traders
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CopyPerson Component */}
        <div className="mt-8">
          <CopyPerson />
        </div>

        {/* Modals - They remain the same */}
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
  {showModalCreateTrade && (
  <CreateTrade
    isOpen={showModalCreateTrade}
    onClose={() => {
      setShowModalCreateTrade(false);
      setTraderToCreateTrade(null);
    }}
    onTradeCreated={() => {
      fetchTraders(); // Just refresh data
      setShowModalCreateTrade(false);
      setTraderToCreateTrade(null);
    }}
    preSelectedTraderId={traderToCreateTrade?.id}
  />
)}
       
      </div>
    </div>
  );
};

export default AdminCopyExpert;
