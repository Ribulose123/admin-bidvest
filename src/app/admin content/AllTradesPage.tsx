// AllTradesPage.tsx
'use client'
import React, { useState } from "react";
import { useTrades } from "../hooks/useTrades"; 
import EditTradeModal from "./modal/EditTradeModal";
import { Trade } from "../type/transctions";

const AllTradesPage = () => {
  const { trades, loading, error, refetch } = useTrades();
  const [currentTrade, setCurrentTrade] = useState<Trade | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<"ALL" | "TRADER" | "USER">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleEditClick = (trade: Trade) => {
    setCurrentTrade(trade);
    setIsEditModalOpen(true);
  };

  const handleTradeUpdated = () => {
    refetch();
    setIsEditModalOpen(false);
  };

  // Filter trades based on type
  const filteredTrades = trades.filter(trade => {
    if (filterType === "ALL") return true;
    if (filterType === "TRADER") return trade.traderType === "TRADER";
    if (filterType === "USER") return trade.traderType === "USER";
    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTrades = filteredTrades.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  const handleFilterChange = (newFilter: "ALL" | "TRADER" | "USER") => {
    setFilterType(newFilter);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-white">Loading trades...</div>;
  if (error) return <div className="text-red-400 p-4">Error loading trades: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">All Trades</h1>
      
      {/* Filter UI */}
      <div className="mb-6 flex items-center space-x-4">
        <label className="text-gray-300 text-sm font-medium">Filter by Type:</label>
        <select 
          value={filterType}
          onChange={(e) => handleFilterChange(e.target.value as "ALL" | "TRADER" | "USER")}
          className="bg-[#10131F] border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
        >
          <option value="ALL">All Types</option>
          <option value="TRADER">Trader Trades</option>
          <option value="USER">User Trades</option>
        </select>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs bg-[#060A17] text-gray-300">
            <tr>
              <th scope="col" className="px-4 py-3">Trade ID</th>
              <th scope="col" className="px-4 py-3">Trader Name</th>
              <th scope="col" className="px-4 py-3">Type</th>
              <th scope="col" className="px-4 py-3">Pair</th>
              <th scope="col" className="px-4 py-3">Side</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTrades.map((trade: Trade) => (
              <tr key={trade.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="px-4 py-3 font-mono text-xs">
                  {trade.id.substring(0, 8)}...
                </td>
                <td className="px-4 py-3">
                  {trade.trader?.username || trade.user.fullName}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    trade.traderType === 'TRADER' 
                      ? 'bg-blue-900/30 text-blue-400' 
                      : 'bg-green-900/30 text-green-400'
                  }`}>
                    {trade.traderType}
                  </span>
                </td>
                <td className="px-4 py-3">{trade.tradePair}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    trade.side === 'BUY' 
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {trade.side}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    trade.executionStatus === 'EXECUTED' 
                      ? 'bg-green-900/30 text-green-400'
                      : trade.executionStatus === 'PENDING'
                      ? 'bg-yellow-900/30 text-yellow-400'
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {trade.executionStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button 
                    onClick={() => handleEditClick(trade)}
                    className="px-3 py-1 bg-purple-900/30 hover:bg-purple-900/50 text-purple-400 text-xs font-medium rounded-lg transition-colors border border-purple-800/50"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredTrades.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No trades found matching the current filter.
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredTrades.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredTrades.length)} of {filteredTrades.length} trades
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-[#10131F] border border-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              Previous
            </button>
            
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                disabled={page === '...'}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  page === currentPage
                    ? 'bg-[#F2AF29] text-black font-medium'
                    : page === '...'
                    ? 'bg-transparent text-gray-400 cursor-default'
                    : 'bg-[#10131F] border border-gray-700 text-white hover:bg-gray-800'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-[#10131F] border border-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isEditModalOpen && currentTrade && (
        <EditTradeModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          trade={currentTrade}
          onTradeUpdated={handleTradeUpdated}
        />
      )}
    </div>
  );
};

export default AllTradesPage;