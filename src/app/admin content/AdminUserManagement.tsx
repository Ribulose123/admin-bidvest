'use client'
import React, { useMemo, useState, useCallback, useEffect , useRef} from "react";
import { Search, ChevronDown, ChevronRight, ChevronLeft, Eye, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from "next/navigation";

interface User {
  id: string;
  userId: string;
  email: string;
  joined: string;
  balance: string;
  signal: string;
  outcome: "Active" | "Inactive";
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 100;
  return x - Math.floor(x);
};

const mockUser: User[] = Array.from({ length: 300 }, (_, i) => {
  const seed = i + 1;
  const outcomeRandom = seededRandom(seed * 3000);
  const amount = (seededRandom(seed * 2000) * 10000).toFixed(2);
  const percentage = (seededRandom(seed) * 100).toFixed(2)

  return {
    id: `user-${i + 1}`,
    userId: `41629229411`,
    joined: `2024-01-23`,
    balance: `$${amount}`,
    outcome: outcomeRandom > 0.5 ? "Active" : "Inactive",
    email:'johndoe@gmail.com',
    signal:`${percentage}%`
  };
});
const AdminUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterOutcome, setFilterOutcome] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(14);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const filteredUsers = useMemo(()=>{
    return mockUser.filter(user => {
        const matchesSearch = searchTerm === '' ||
        user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.joined.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.balance.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesOutcome = filterOutcome === 'All' || user.outcome === filterOutcome;
        return matchesSearch && matchesOutcome
    })
  },[searchTerm, filterOutcome])

  const totalPages = Math.ceil(filteredUsers.length/ itemsPerPage)

  const currentUsers = useMemo(()=>{
    const startIndex = (currentPage -1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex)
  },[currentPage, filteredUsers, itemsPerPage])

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
        <button key={1} onClick={() => handlePageChange(1)} className="px-3 py-1 rounded-md hover:bg-gray-700">2</button>
      );
      if (startPage > 2) {
        buttons.push(<span key="dots-start" className="px-3 py-1 text-[#7D8491DE]">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md text-[#7D8491DE] ${currentPage === i ? 'bg-[#7D849114] e' : 'hover:bg-gray-700'}`}
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
        <button key={totalPages} onClick={() => handlePageChange(totalPages)} className="px-3 py-1 rounded-md hover:bg-gray-700">{totalPages}</button>
      );
    }

    return buttons;
  }, [currentPage, totalPages, handlePageChange]);

  
    const handleActionClick = useCallback((tradeId: string, event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      
      
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
        left: Math.max(10, left) // Ensure minimum distance from edge
      });
      setShowActionMenu(true);
    }, []);
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
          setShowActionMenu(false);
          setSelectedTradeId(null);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
  
    const handleView = useCallback(() => {
      alert(`Viewing trade: ${selectedTradeId}`);
      setShowActionMenu(false);
    }, [selectedTradeId]);
  
    const handleDelete = useCallback(() => {
      if (window.confirm(`Are you sure you want to delete trade: ${selectedTradeId}?`)) {
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

    const handNavigation = (id:string)=>{
        router.push(`/admin/usermanagement/${id}`)
    }
  return(
     <div className="min-h-screen  text-gray-100 p-8 font-inter">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Users ({filteredUsers.length})</h1>
    
            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg shadow-lg mb-6">
              <div className="relative w-full md:w-1/3 mb-4 md:mb-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#10131F]  focus:outline-none focus:border-[#F2AF29] text-white placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
    
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
                <div className="relative">
                  <select
                    className="block appearance-none w-full bg-[#10131F] border border-gray-600 text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none "
                    value={filterOutcome}
                    onChange={(e) => setFilterOutcome(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
    
            {/* Trades Table */}
            <div className="  overflow-x-auto relative">
              <table className="min-w-full ">
                <thead className="bg-[#060A17] rounded-lg ">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Signal Strength</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Outcome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody >
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-700 transition-colors duration-200 cursor-pointer" onClick={()=>handNavigation(user.id)}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{user.userId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.joined}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.balance}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">{user.signal}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.outcome === 'Active' ? 'bg-[#01BC8D14] text-[#01BC8D]' : 'bg-[#F2364514] text-[#F2364514]'
                          }`}>
                            {user.outcome}
                          </span>
                        </td>
                       <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            className="text-gray-400 hover:text-white focus:outline-none p-1 rounded-md hover:bg-gray-600 transition-colors duration-200"
                            onClick={(e) => handleActionClick(user.id, e)}
                          >
                            <span className="text-xl font-bold">...</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-400">No trades found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
    
              {/* Action Menu */}
               {showActionMenu && selectedTradeId && menuPosition && (
                <div
                  ref={actionMenuRef}
                  className="fixed z-50 bg-[#141E32] border border-gray-600 rounded-md shadow-lg py-1 w-40"
                  style={{
                    top: `${menuPosition.top}px`,
                    left: `${menuPosition.left}px`,
                  }}
                >
                  <button
                    onClick={handleView}
                    className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
                  >
                    <Eye className="w-4 h-4 mr-2" /> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Suspend
                  </button>
                  <button
                    onClick={handleAccept}
                    className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Delete
                  </button>
                  <button
                    onClick={handleDecline}
                    className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Delete
                  </button>
                </div>
              )}
            </div>
    
            {/* Pagination */}
            <div className="flex flex-col md:flex-row items-center justify-between mt-6 text-sm text-gray-300">
              <div className="mb-4 md:mb-0">
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
                  className="px-3 py-1 rounded-md  hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex space-x-1">
                  {renderPaginationButtons()}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md  hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
  )
};

export default AdminUserManagement;
