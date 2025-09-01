"use client";
import React, { useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Plus, Search } from "lucide-react";
import Link from "next/link";
import AddTraderForm from "./modal/AddTraderForm";

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
}

// Main Trader interface
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




interface TradersProps {
  copyTrade: Trader[];
  setTraders: (traders: Trader[] | ((prevTraders: Trader[]) => Trader[])) => void;
}
const CopyTable: React.FC<TradersProps> = ({ copyTrade, setTraders }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [addModal, setAddModal] = useState(false)

  const filteredCopy = useMemo(() => {
    return copyTrade.filter((copy) => {
      const matchesSearch =
        searchTerm === "" ||
        copy.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || copy.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus, copyTrade]);

  

  return (
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

          <button className="bg-[#F2AF29] hover:bg-[#ff8c00] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition" onClick={()=> setAddModal(!addModal)}>
            Add Signal
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#F23645]">
                    <button>Remove</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                  No Copy trader found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Link
        href="/admin/copytrademanagement"
        className="flex items-center justify-end cursor-pointer text-sm mr-6"
      >
        View More <ArrowRight size={14} />
      </Link>

       {addModal && (
        <AddTraderForm
          onClose={() => setAddModal(false)}
          onTraderAdded={(newTrader: Trader) => {
            setTraders((prevTraders) => [...prevTraders, newTrader]);
            setAddModal(false);
          }}
        />
      )}
    </div>
  );
};

export default CopyTable;