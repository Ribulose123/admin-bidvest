"use client";
import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  XCircle,
  Pen,
  X
} from "lucide-react";

interface WalletOverview {
  id: string;
  userId: string;
  email: string;
  balance: string;
  date: string;
  status: "Active" | "Frozen";
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const mockWalletOverview: WalletOverview[] = Array.from(
  { length: 256 },
  (_, i) => {
    const seed = i + 1;
    const balance = (seededRandom(seed * 2000) * 10000).toFixed(2);
    const statusRandom = seededRandom(seed * 4000);

    return {
      id: `trade-${i + 1}`,
      userId: `41629229411`,
      email: `johndoe@gmail.com`,
      date: `2024-01-23`,
      balance: `$${balance}`,
      status: statusRandom > 0.5 ? "Active" : "Frozen",
    };
  }
);
const AdminWalletoverview = () => {
  const [showBalance, setShowBalance] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(14);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const balanceCards = [
    { title: "Total Balance", value: "1,2471", showEye: true },
    { title: "Total Wallets", value: "1,2471", showEye: false },
    { title: "Pending Transactions", value: "1,2471", showEye: false },
    { title: "Frozen Wallets", value: "1,2471", showEye: false },
  ];

  const filteredWallet = useMemo(() => {
    return mockWalletOverview.filter((wallet) => {
      const matchesSearch =
        searchTerm === "" ||
        wallet.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.balance.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch && filterStatus;
    });
  }, [searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredWallet.length / itemsPerPage);
  const currentWallet = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredWallet.slice(startIndex, endIndex);
  }, [currentPage, filteredWallet, itemsPerPage]);

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

      setSelectedWalletId(tradeId);
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
        setSelectedWalletId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
   const handelShowEditModal = ()=>{
    setShowEditModal(!showEditModal)
  }

  const handlEdit =()=>{
    handelShowEditModal()
  }
  /* const handlEdit = useCallback(() => {
    alert(`Editing trade: ${selectedWalletId}`);
    setShowActionMenu(false);
    handelShowEditModal()
  }, [selectedWalletId, handelShowEditModal]); */

  const handleFreeze = useCallback(() => {
    alert(`Freexing trade: ${selectedWalletId}`);
    setShowActionMenu(false);
  }, [selectedWalletId]);

  const handleUnfreeze = useCallback(() => {
    alert(`Accepting trade: ${selectedWalletId}`);
    setShowActionMenu(false);
  }, [selectedWalletId]);

  const handleDelete = useCallback(() => {
    if (
      window.confirm(
        `Are you sure you want to delete trade: ${selectedWalletId}?`
      )
    ) {
      alert(`Deleting trade: ${selectedWalletId}`);
    }
    setShowActionMenu(false);
  }, [selectedWalletId]);

  const handleShowBalance = () => {
    setShowBalance(!showBalance);
  };

 
  return (
    <div className="min-h-screen  text-white p-6">
      <div className="mx-auto max-w-7xl">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {balanceCards.map((card, index) => (
            <div
              key={index}
              className="bg-linear-to-bl from-[#141E323D] to-[#01040F] rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-400 text-sm">{card.title}</span>
                <div className="flex gap-1">
                  {card.showEye && (
                    <button
                      onClick={handleShowBalance}
                      className="hover:text-gray-300"
                    >
                      {showBalance ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {card.showEye && !showBalance ? "****" : card.value}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold mb-6 capitalize">
            Users wallet list
          </h1>
          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row items-center gap-2 p-4 rounded-lg shadow-lg mb-6">
            <div className="relative w-full  mb-4 md:mb-0">
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
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Trades Table */}
        <div className="overflow-x-auto relative">
          <table className="min-w-full">
            <thead className="bg-[#060A17] rounded-lg ">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Last transactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {currentWallet.length > 0 ? (
                currentWallet.map((wallet) => (
                  <tr
                    key={wallet.id}
                    className="hover:bg-gray-700 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      {wallet.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      {wallet.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      {wallet.balance}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      {wallet.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          wallet.status === "Active"
                            ? "bg-[#01BC8D14] text-[#01BC8D]"
                            : "bg-[#F2364514] text-[#F2364514]"
                        }`}
                      >
                        {wallet.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        className="text-gray-400 hover:text-white focus:outline-none p-1 rounded-md hover:bg-gray-600 transition-colors duration-200"
                        onClick={(e) => handleActionClick(wallet.id, e)}
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
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    No User found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Action Menu */}
          {showActionMenu && selectedWalletId && menuPosition && (
            <div
              ref={actionMenuRef}
              className="fixed z-50 bg-[#141E32] border border-gray-600 rounded-md shadow-lg py-1 w-40"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              <button
                onClick={handlEdit}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
              >
                <Pen className="w-4 h-4 mr-2" /> Edit
              </button>
              <button
                onClick={handleFreeze}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
              >
                <XCircle className="w-4 h-4 mr-2" /> Freeze
              </button>
              <button
                onClick={handleUnfreeze}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Unfreeze
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
            </div>
          )}
        </div>
        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-6 text-sm text-gray-300">
          <div className="mb-4 md:mb-0">
            {filteredWallet.length > 0 ? (
              <span>
                {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredWallet.length)} of{" "}
                {filteredWallet.length}
              </span>
            ) : (
              <span>0 - 0 of 0</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md  hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex space-x-1">{renderPaginationButtons()}</div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md  hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Edit Signal</h2>
          <button 
            onClick={()=> setShowEditModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Pair Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State/AVAX
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="State/AVAX"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="brought to you by yours truly"
            />
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign To
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Assignment">Assignment</option>
              <option value="Team A">Team A</option>
              <option value="Team B">Team B</option>
              <option value="Individual">Individual</option>
            </select>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-20 resize-none"
              placeholder="Add your comment..."
            />
            
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={()=> setShowEditModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
        )}
      </div>
    </div>
  );
};

export default AdminWalletoverview;
