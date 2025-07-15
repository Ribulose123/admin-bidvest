'use client'
import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { Search, ChevronDown, ChevronRight, ChevronLeft, Eye, Trash2} from 'lucide-react';

interface User {
  id: string;
  userId: string;
  email: string;
  submissionDate: string;
  status: "Verified" | "Processing";
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 100;
  return x - Math.floor(x);
};

const mockUsers: User[] = Array.from({ length: 300 }, (_, i) => {
  const seed = i + 1;
  const statusRandom = seededRandom(seed * 3000);

  return {
    id: `user-${i + 1}`,
    userId: `41629229411`,
    email: 'jamessmith14@gmail.com',
    submissionDate: `2024-01-23`,
    status: statusRandom > 0.5 ? "Verified" : "Processing"
  };
});

const AdminKYCVerfication = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(14);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const matchesSearch = searchTerm === '' ||
        user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.submissionDate.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const currentUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [currentPage, filteredUsers, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const renderPaginationButtons = useCallback(() => {
    const pagesToShow = 7;
    const buttons = [];
    const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    if (startPage > 1) {
      buttons.push(
        <button key={1} onClick={() => handlePageChange(1)} className="px-3 py-1 rounded-md hover:bg-gray-700 text-gray-400">
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="dots-start" className="px-3 py-1 text-gray-400">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots-end" className="px-3 py-1 text-gray-400">...</span>);
      }
      buttons.push(
        <button key={totalPages} onClick={() => handlePageChange(totalPages)} className="px-3 py-1 rounded-md hover:bg-gray-700 text-gray-400">
          {totalPages}
        </button>
      );
    }

    return buttons;
  }, [currentPage, totalPages, handlePageChange]);

  const handleActionClick = useCallback((userId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    const viewportWidth = window.innerWidth;
    const menuWidth = 160;

    let left = rect.left + window.scrollX - menuWidth - 10;
    
    if (left < 0) {
      left = rect.right + window.scrollX + 10;
    }
    
    if (left + menuWidth > viewportWidth) {
      left = rect.left + window.scrollX - menuWidth - 10;
    }
    
    setSelectedUserId(userId);
    setMenuPosition({
      top: rect.bottom + window.scrollY + 5,
      left: Math.max(10, left)
    });
    setShowActionMenu(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setShowActionMenu(false);
        setSelectedUserId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleView = useCallback(() => {
    alert(`Viewing user: ${selectedUserId}`);
    setShowActionMenu(false);
  }, [selectedUserId]);

  const handleDelete = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete user: ${selectedUserId}?`)) {
      alert(`Deleting user: ${selectedUserId}`);
    }
    setShowActionMenu(false);
  }, [selectedUserId]);

  return (
    <div className="min-h-screen  text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl font-medium mb-6 text-gray-200">Transactions(1,267)</h1>

        {/* Search and Filter Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#10131F] border border-gray-700 focus:outline-none focus:border-blue-500 text-white placeholder-gray-400 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <select
              className="block appearance-none bg-[#10131F] border border-gray-700 text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:border-blue-500 text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Verified">Verified</option>
              <option value="Processing">Processing</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className=" rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-[#060A17]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Submission Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody >
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id} className=" transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.submissionDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 w-20 text-center inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'Verified' ? 'bg-[#01BC8D14] text-[#01BC8D] px-4' : 'bg-[#7D849114] text-[#7D8491]'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="currency-display text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                        onClick={(e) => handleActionClick(user.id, e)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-400">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Action Menu */}
          {showActionMenu && selectedUserId && menuPosition && (
            <div
              ref={actionMenuRef}
              className="fixed z-50 bg-gray-800 border border-gray-600 rounded-md shadow-lg py-1 w-40"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              <button
                onClick={handleView}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 w-full text-left transition-colors duration-200"
              >
                <Eye className="w-4 h-4 mr-2" /> View Details
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 w-full text-left transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 text-sm text-gray-400">
          <div>
            {filteredUsers.length > 0 ? (
              <span>
                {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
              </span>
            ) : (
              <span>0 - 0 of 0</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex space-x-1">
              {renderPaginationButtons()}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminKYCVerfication;