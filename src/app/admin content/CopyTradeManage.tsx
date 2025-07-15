"use client";
import React, { useMemo, useState, useCallback } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  totalCopiedTrades: number;
  profitLoss: string;
  status: "Active" | "Paused";
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 100;
  return x - Math.floor(x);
};

const names = [
  "Idumela Nelson",
  "Samuel Johnson",
  "Michael Brown",
  "Sarah Davis",
  "James Wilson",
  "Emma Thompson",
  "David Miller",
  "Lisa Anderson",
  "Robert Taylor",
  "Jennifer Martinez",
  "Christopher Lee",
  "Amanda Clark",
  "Matthew Rodriguez",
  "Ashley Lewis",
  "Daniel Walker",
  "Jessica Hall",
];

const mockUsers: User[] = Array.from({ length: 300 }, (_, i) => {
  const seed = i + 1;
  const statusRandom = seededRandom(seed * 3000);
  const trades = Math.floor(seededRandom(seed * 1500) * 1000);
  const profitAmount = (seededRandom(seed * 2000) * 2000 - 1000).toFixed(0);
  const profitPercentage = (seededRandom(seed * 4000) * 20 - 10).toFixed(0);
  const nameIndex = Math.floor(seededRandom(seed * 5000) * names.length);

  return {
    id: `user-${i + 1}`,
    userId: `4${String(seed).padStart(8, "0")}`,
    name: names[nameIndex],
    email: "idumela@testmail.com",
    totalCopiedTrades: trades,
    profitLoss: `$${profitAmount}(${profitPercentage}%)`,
    status: statusRandom > 0.6 ? "Active" : "Paused",
  };
});

const CopyTradeManage = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(14);

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesSearch =
        searchTerm === "" ||
        user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "All" || user.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

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

  // Calculate stats for dashboard
  const stats = useMemo(() => {
    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter(
      (user) => user.status === "Active"
    ).length;
    const pausedUsers = filteredUsers.filter(
      (user) => user.status === "Paused"
    ).length;
    const totalTrades = filteredUsers.reduce(
      (sum, user) => sum + user.totalCopiedTrades,
      0
    );

    return {
      totalUsers,
      activeUsers,
      pausedUsers,
      totalTrades,
    };
  }, [filteredUsers]);

  // Pie chart data
  const pieData = [
    { name: "Active", value: stats.activeUsers, color: "#01BC8D" },
    { name: "Paused", value: stats.pausedUsers, color: "#7CFDDF" },
  ];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    name,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    outerRadius: number;
    percent: number;
    name: string;
  }) => {
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);

    // Start point (on the edge of the pie)
    const sx = cx + outerRadius * cos;
    const sy = cy + outerRadius * sin;

    // First bend point (closer to the pie)
    const mx = cx + (outerRadius + 10) * cos;
    const my = cy + (outerRadius + 10) * sin;

    // Second bend point (creates the Z shape)
    const mx2 = mx + (cos >= 0 ? 1 : -1) * 8;
    const my2 = my;

    // End point (where the text starts)
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

  return (
    <div className="min-h-screen text-gray-100 p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
          {/* Total Users */}
          <div className="bg-linear-to-l from-[#141E323D] to-[#01040F] rounded-lg p-3 border border-[#141E32] flex items-center justify-between h-50">
            <div className="gap-4 flex flex-col">
              <h3 className="text-xl text-gray-400">Total Users</h3>
              <p className="text-xl font-bold text-white">
                {stats.totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="gap-4 flex flex-col">
              <TrendingUp size={30} className="text-[#01BC8D]" />
              <p className="text-xs p-3 rounded-lg mt-1 bg-[#1F3F29B8] text-[#01BC8D]">
                +2.5%
              </p>
            </div>
          </div>

          {/* User Status */}
          <div className="bg-linear-to-l from-[#141E323D] to-[#01040F] rounded-lg p-2 border border-[#141E32] flex items-center">
            <div className="-mt-5">
              <h3 className="text-[17px] text-gray-400 mb-2">
                Active Copy Trades
              </h3>
              <p className="text-xl font-bold text-white">
                {stats.totalTrades.toLocaleString()}
              </p>
            </div>
            <div className="h-35 w-full">
              <ResponsiveContainer width="100%" height="100%">
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

          {/* Pending Executions */}
          <div className="bg-linear-to-l from-[#141E323D] to-[#01040F] rounded-lg p-3 border border-[#141E32]">
            <h3 className="text-xl text-gray-400 mb-2 mt-14">
              Pending Executions
            </h3>
            <p className="text-2xl font-bold text-white">
              {stats.activeUsers.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium mb-6 text-gray-300">
            Users ({stats.totalUsers})
          </h1>
          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row items-center gap-2  p-4 rounded-lg mb-6">
            <div className="relative w-full  mb-4 md:mb-0">
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
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-[#060A17]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase whitespace-nowrap tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase whitespace-nowrap tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase whitespace-nowrap tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase whitespace-nowrap tracking-wider">
                  Total Copied Trades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase whitespace-nowrap tracking-wider">
                  Profit/Loss
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
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[#242938] transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      {user.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">
                      {user.totalCopiedTrades.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`${
                          user.profitLoss.includes("-")
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {user.profitLoss}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === "Active"
                            ? "bg-green-900/20 text-green-400"
                            : "bg-yellow-900/20 text-yellow-400"
                        }`}
                      >
                        {user.status}
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
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-6 text-sm text-gray-400">
          <div className="mb-4 md:mb-0">
            {filteredUsers.length > 0 ? (
              <span>
                {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
                {filteredUsers.length}
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
