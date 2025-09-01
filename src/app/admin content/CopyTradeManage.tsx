"use client";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getAuthToken } from "../utils/auth";
import { API_ENDPOINT } from "../config/api";

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


interface CustomLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  percent?: number;
  name?: string;
}

const CopyTradeManage = () => {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(14);

  useEffect(() => {
    const fetchTraders = async () => {
      const token = getAuthToken();
      setIsLoading(true);
      setError(null);

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
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTraders();
  }, []);

  const filteredTraders = useMemo(() => {
    return traders.filter((trader) => {
      const matchesSearch =
        searchTerm === "" ||
        trader.username.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "All" || trader.status.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus, traders]);

  const totalPages = Math.ceil(filteredTraders.length / itemsPerPage);

  const currentTraders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTraders.slice(startIndex, endIndex);
  }, [currentPage, filteredTraders, itemsPerPage]);

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
            currentPage === i
              ? "bg-gray-600 text-white"
              : "text-gray-300 hover:bg-gray-700"
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

  const stats = useMemo(() => {
    const totalTraders = filteredTraders.length;
    const activeTraders = filteredTraders.filter(
      (trader) => trader.status === "ACTIVE"
    ).length;
    const pausedTraders = filteredTraders.filter(
      (trader) => trader.status === "PAUSED"
    ).length;
    const totalCopiedTrades = filteredTraders.reduce(
      (sum, trader) => sum + trader.totalCopiers,
      0
    );

    return {
      totalTraders,
      activeTraders,
      pausedTraders,
      totalCopiedTrades,
    };
  }, [filteredTraders]);

  const pieData = [
    { name: "Active", value: stats.activeTraders, color: "#01BC8D" },
    { name: "Paused", value: stats.pausedTraders, color: "#7CFDDF" },
  ];

  const renderCustomizedLabel = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    outerRadius = 0,
    percent = 0,
    name = "",
  }: CustomLabelProps) => {
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);

    const sx = cx + outerRadius * cos;
    const sy = cy + outerRadius * sin;

    const mx = cx + (outerRadius + 10) * cos;
    const my = cy + (outerRadius + 10) * sin;

    const mx2 = mx + (cos >= 0 ? 1 : -1) * 8;
    const my2 = my;

    const ex = mx2 + (cos >= 0 ? 1 : -1) * 8;
    const ey = my2;

    return (
      <g>
        <path
          d={`M${sx},${sy}L${mx},${my}L${mx2},${my2}L${ex},${ey}`}
          stroke="#6B7280"
          fill="none"
          strokeWidth={1.5}
        />
        <circle cx={ex} cy={ey} r={2} fill="#6B7280" stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 10}
          y={ey}
          textAnchor={cos >= 0 ? "start" : "end"}
          dominantBaseline="central"
          fill="#E5E7EB"
          className="text-xs font-medium"
        >
          {`${name} ${(percent * 100).toFixed(0)}%`}
        </text>
      </g>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-400">
        Loading traders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-100 p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
          <div className="bg-linear-to-l from-[#141E323D] to-[#01040F] rounded-lg p-3 border border-[#141E32] flex items-center justify-between h-50">
            <div className="gap-4 flex flex-col">
              <h3 className="text-xl text-gray-400">Total Users</h3>
              <p className="text-xl font-bold text-white">
                {stats.totalTraders.toLocaleString()}
              </p>
            </div>
            <div className="gap-4 flex flex-col">
              <TrendingUp size={30} className="text-[#01BC8D]" />
              <p className="text-xs p-3 rounded-lg mt-1 bg-[#1F3F29B8] text-[#01BC8D]">
                +2.5%
              </p>
            </div>
          </div>

          <div className="bg-linear-to-l from-[#141E323D] to-[#01040F] rounded-lg p-2 border border-[#141E32] flex items-center">
            <div className="-mt-5">
              <h3 className="text-[17px] text-gray-400 mb-2">
                Active Copy Trades
              </h3>
              <p className="text-xl font-bold text-white">
                {stats.totalCopiedTrades.toLocaleString()}
              </p>
            </div>
            <div className="h-35 w-full">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-linear-to-l from-[#141E323D] to-[#01040F] rounded-lg p-3 border border-[#141E32]">
            <h3 className="text-xl text-gray-400 mb-2 mt-14">
              Pending Executions
            </h3>
            <p className="text-2xl font-bold text-white">
              {stats.activeTraders.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium mb-6 text-gray-300">
            Users ({stats.totalTraders})
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-2 p-4 rounded-lg mb-6">
            <div className="relative w-full mb-4 md:mb-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#0A0E1A] border border-gray-700 focus:outline-none focus:border-[#00D4AA] text-white placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  className="block appearance-none bg-[#0A0E1A] border border-gray-700 text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:border-[#00D4AA]"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-[#060A17]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase whitespace-nowrap tracking-wider">
                  Trader ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase whitespace-nowrap tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase whitespace-nowrap tracking-wider">
                  Total Copiers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase whitespace-nowrap tracking-wider">
                  Total PnL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase whitespace-nowrap tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase whitespace-nowrap tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTraders.length > 0 ? (
                currentTraders.map((trader) => (
                  <tr
                    key={trader.id}
                    className="hover:bg-[#242938] transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      {trader.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {trader.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">
                      {trader.totalCopiers.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={
                          trader.totalPnL < 0 ? "text-red-400" : "text-green-400"
                        }
                      >
                        {`$${trader.totalPnL.toFixed(2)}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          trader.status === "ACTIVE"
                            ? "bg-green-900/20 text-green-400"
                            : "bg-yellow-900/20 text-yellow-400"
                        }`}
                      >
                        {trader.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-[#00D4AA] hover:text-[#00B894] transition-colors duration-200">
                        View details
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
                    No traders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mt-6 text-sm text-gray-400">
          <div className="mb-4 md:mb-0">
            {filteredTraders.length > 0 ? (
              <span>
                {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredTraders.length)} of{" "}
                {filteredTraders.length}
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
            <div className="flex space-x-1">{renderPaginationButtons()}</div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopyTradeManage;