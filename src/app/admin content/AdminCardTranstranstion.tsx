"use client";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Card {
  id: string;
  userId: string;
  email: string;
  card: string;
  last4digit: string;
  date: string;
  type: "Deposit" | "Purshase";
  amount: string;
  outcome: "Active" | "Inactive";
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const mockCards: Card[] = Array.from({ length: 256 }, (_, i) => {
  const seed = i + 1;
  const assetIndex = Math.floor(seededRandom(seed * 1000) * 2);
  const amount = (seededRandom(seed * 2000) * 10000).toFixed(2);
  const outcomeRandom = seededRandom(seed * 3000);
  const typesRandom = seededRandom(seed * 4000);
  const randomdigit = Math.floor(seededRandom(seed * 1000))
    .toString()
    .padStart(4, "0");

  return {
    id: `trade-${i + 1}`,
    userId: `41629229411`,
    email: "johndoe@gmail.com",
    date: `2024-01-23`,
    card: ["Visa", "Mastercard"][assetIndex],
    amount: `$${amount}`,
    outcome: outcomeRandom > 0.5 ? "Active" : "Inactive",
    type: typesRandom > 0.5 ? "Deposit" : "Purshase",
    last4digit: `${randomdigit}`,
  };
});

const AdminCardTranstranstion = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterOutcome, setFilterOutcome] = useState<string>("All");
  const [filterType, setFilterType] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(14);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const filteredCard = useMemo(() => {
    return mockCards.filter((card) => {
      const matchesSearch =
        searchTerm === "" ||
        card.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.amount.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesOutcome =
        filterOutcome === "All" || card.outcome === filterOutcome;
      const matchesStatus = filterType === "All" || card.card === filterType;
      return matchesSearch && matchesOutcome && matchesStatus;
    });
  }, [searchTerm, filterOutcome, filterType]);

  const totalPages = Math.ceil(filteredCard.length / itemsPerPage);
  const currentCard = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCard.slice(startIndex, endIndex);
  }, [currentPage, filteredCard, itemsPerPage]);

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
          className="px-3 py-1 rounded-md hover:bg-gray-700"
        >
          2
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

  const handleActionClick = useCallback(
    (tradeId: string, event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();

      // Calculate position relative to viewport
      const viewportWidth = window.innerWidth;
      const menuWidth = 160;

      // Position to the left of the button by default
      let left = rect.left + window.scrollX - menuWidth - 10;

      if (left < 0) {
        left = rect.right + window.scrollX + 10;
      }

      // If menu would go off the right edge, position to the left
      if (left + menuWidth > viewportWidth) {
        left = rect.left + window.scrollX - menuWidth - 10;
      }

      setSelectedTradeId(tradeId);
      setMenuPosition({
        top: rect.bottom + window.scrollY + 5,
        left: Math.max(10, left), // Ensure minimum distance from edge
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
        setSelectedTradeId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleView = useCallback(() => {
    alert(`Viewing trade: ${selectedTradeId}`);
    setShowActionMenu(false);
  }, [selectedTradeId]);

  const handleDelete = useCallback(() => {
    if (
      window.confirm(
        `Are you sure you want to delete trade: ${selectedTradeId}?`
      )
    ) {
      alert(`Deleting trade: ${selectedTradeId}`);
    }
    setShowActionMenu(false);
  }, [selectedTradeId]);

  const handleAccept = useCallback(() => {
    alert(`Accepting trade: ${selectedTradeId}`);
    setShowActionMenu(false);
  }, [selectedTradeId]);

  const handleDecline = useCallback(() => {
    alert(`Declining trade: ${selectedTradeId}`);
    setShowActionMenu(false);
  }, [selectedTradeId]);

  return (
    <div className="min-h-screen text-gray-100 p-4 md:p-8 font-inter ">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold mb-4 md:mb-0">
            Card Transactions ({filteredCard.length})
          </h1>
          
          {/* Search and Filters */}
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#10131F] border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#F2AF29] text-white placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Card Type Filter */}
            <div className="relative w-full md:w-48">
              <select
                className="block appearance-none w-full bg-[#10131F] border border-gray-700 text-white py-2 px-4 pr-8 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#F2AF29]"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="All">Card Type</option>
                <option value="Visa">Visa</option>
                <option value="Mastercard">MasterCard</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
            
            {/* Status Filter */}
            <div className="relative w-full md:w-40">
              <select
                className="block appearance-none w-full bg-[#10131F] border border-gray-700 text-white py-2 px-4 pr-8 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#F2AF29]"
                value={filterOutcome}
                onChange={(e) => setFilterOutcome(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-[#060A17]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Transactions ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Card Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Last-4-digit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentCard.length > 0 ? (
                  currentCard.map((card) => (
                    <tr key={card.id} className="hover:bg-[#141E32] transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200">{card.userId}</td>
                      <td className="px-4 py-4 text-sm text-gray-200">
                        <div className="flex flex-col">
                          <span className="font-medium">John Doe</span>
                          <span className="text-gray-400 text-xs">{card.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200">{card.card}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200">{card.last4digit}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200">{card.date}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200">{card.type}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200">{card.amount}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          card.outcome === 'Active' ? 'bg-green-900/20 text-green-300' :
                          card.outcome === 'Inactive' ? 'bg-[#F2364514] text-[#F2364514]' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {card.outcome}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <button
                          className="text-gray-400 hover:text-white focus:outline-none p-1 rounded-md hover:bg-gray-600 transition-colors duration-200"
                          onClick={(e) => handleActionClick(card.id, e)}
                        >
                          <span className="text-xl font-bold">...</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Action Menu */}
          {showActionMenu && selectedTradeId && menuPosition && (
            <div
              ref={actionMenuRef}
              className="fixed z-50 bg-[#141E32] border border-gray-700 rounded-md shadow-lg py-1 w-40"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              <button
                onClick={handleView}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 w-full text-left transition-colors duration-200"
              >
                <Eye className="w-4 h-4 mr-2" /> View
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 w-full text-left transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
              <button
                onClick={handleAccept}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 w-full text-left transition-colors duration-200"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Accept
              </button>
              <button
                onClick={handleDecline}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 w-full text-left transition-colors duration-200"
              >
                <XCircle className="w-4 h-4 mr-2" /> Decline
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-6 text-sm text-gray-300">
          <div className="mb-4 md:mb-0">
            {filteredCard.length > 0 ? (
              <span>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCard.length)} of {filteredCard.length} entries
              </span>
            ) : (
              <span>No entries found</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md bg-[#10131F] border border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex space-x-1">
              {renderPaginationButtons()}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-md bg-[#10131F] border border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCardTranstranstion;
