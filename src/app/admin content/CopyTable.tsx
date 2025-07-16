"use client";
import React, { useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Plus, Search } from "lucide-react";
import Link from "next/link";

interface Copy {
  id: string;
  name: string;
  type: string;
  RIO: string;
  follwers: string;
  risk: string;
  status: "Active" | "paused";
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 1000;
  return x - Math.floor(x);
};

const MockCopy: Copy[] = Array.from({ length: 10 }, (_, i) => {
  const seed = i + 1;
  const percentage = (seededRandom(seed) * 100).toFixed(2);
  const amount = (seededRandom(seed * 2000) * 100).toFixed(2);
  const statusRandom = seededRandom(seed * 4000);
  const typeIndex = Math.floor(seededRandom(seed * 1000) * 2);
  const riskIndex = Math.floor(seededRandom(seed * 1000) * 3);
  return {
    id: `trade-${i + 1}`,
    name: "john mike",
    type: ["Short-Term Scalping", "Long-Term Scalping"][typeIndex],
    RIO: `${percentage}%`,
    follwers: `${amount}`,
    risk: ["high", "low", "medium"][riskIndex],
    status: statusRandom > 0.5 ? "Active" : "paused",
  };
});
const CopyTable = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const filteredCopy = useMemo(() => {
    return MockCopy.filter((copy) => {
      const matchesSearch =
        searchTerm === "" ||
        copy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        copy.risk.toLowerCase().includes(searchTerm.toLowerCase()) ||
        copy.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "All" || copy.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold mb-6 text-white">
          Currently copied traders
        </h1>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row items-center space-x-3 p-4 rounded-lg shadow-lg mb-6">
          <div className="relative  mb-4 md:mb-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              className="w- pl-10 pr-4 py-2 rounded-lg bg-[#10131F]  focus:outline-none focus:border-[#F2AF29] text-white placeholder-gray-400"
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
              <option value="Active">Active</option>
              <option value="paused">paused</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <button className="bg-[#F2AF29] hover:bg-[#ff8c00] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition">
            Add Signal
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* table */}
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
                    {copy.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                    {copy.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                    {copy.RIO}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                    {copy.follwers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                    {copy.risk}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        copy.status === "Active"
                          ? "bg-[#01BC8D14] text-[#01BC8D]"
                          : "bg-[#F29429] text-[#F29429]"
                      }`}
                    >
                      {copy.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium  text-[#F23645]">
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
    </div>
  );
};

export default CopyTable;
