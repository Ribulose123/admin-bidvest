'use client'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Search, ChevronDown, ChevronRight, ChevronLeft, Eye, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Trade {
  id: string;
  userId: string;
  date: string;
  asset: string;
  amount: string;
  outcome: 'Active' | 'Inactive';
  status: 'Open' | 'Closed';
}


const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const mockTrades: Trade[] = Array.from({ length: 256 }, (_, i) => {
  const seed = i + 1;
  const assetIndex = Math.floor(seededRandom(seed * 1000) * 4);
  const amount = (seededRandom(seed * 2000) * 10000).toFixed(2);
  const outcomeRandom = seededRandom(seed * 3000);
  const statusRandom = seededRandom(seed * 4000);
  
  return {
    id: `trade-${i + 1}`,
    userId: `41629229411`,
    date: `2024-01-23`,
    asset: ['AUDCAD', 'EURUSD', 'GBPUSD', 'USDJPY'][assetIndex],
    amount: `$${amount}`,
    outcome: outcomeRandom > 0.5 ? 'Active' : 'Inactive',
    status: statusRandom > 0.5 ? 'Open' : 'Closed',
  };
});

const AdminTradeContent = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterOutcome, setFilterOutcome] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(14);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{top: number, left: number} | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const filteredTrades = useMemo(() => {
    return mockTrades.filter(trade => {
      const matchesSearch = searchTerm === '' ||
        trade.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.amount.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesOutcome = filterOutcome === 'All' || trade.outcome === filterOutcome;
      const matchesStatus = filterStatus === 'All' || trade.status === filterStatus;
      return matchesSearch && matchesOutcome && matchesStatus;
    });
  }, [searchTerm, filterOutcome, filterStatus]);

  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);
  const currentTrades = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTrades.slice(startIndex, endIndex);
  }, [currentPage, filteredTrades, itemsPerPage]);

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

  const handleNavigation= (id:string)=>{
    router.push(`/admin/trademangment/${id}`)
  }
  return (
    <div className="min-h-screen  text-gray-100 p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        
    <div className='flex items-center justify-between'>
      <h1 className="text-2xl font-semibold mb-6">Trades ({filteredTrades.length})</h1>
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
                className="block appearance-none  bg-[#10131F] border border-gray-600 text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none truncate "
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

             <div className="relative">
              <select
                className="block appearance-none bg-[#10131F] border border-gray-600 text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none truncate "
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Frozen">Frozen</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Asset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Outcome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody >
              {currentTrades.length > 0 ? (
                currentTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-700 transition-colors duration-200" onClick={()=>handleNavigation(trade.id)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{trade.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{trade.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{trade.asset}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{trade.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        trade.outcome === 'Active' ? 'bg-[#01BC8D14] text-[#01BC8D]' : 'bg-[#F2364514] text-[#F2364514]'
                      }`}>
                        {trade.outcome}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        trade.status === 'Open' ? ' text-[#01BC8D]' : ' text-[#7D8491]'
                      }`}>
                        {trade.status}
                      </span>
                    </td>
                   <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        className="text-gray-400 hover:text-white focus:outline-none p-1 rounded-md hover:bg-gray-600 transition-colors duration-200"
                        onClick={(e) => handleActionClick(trade.id, e)}
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
                <Eye className="w-4 h-4 mr-2" /> View
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
              <button
                onClick={handleAccept}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Accept
              </button>
              <button
                onClick={handleDecline}
                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 w-full text-left transition-colors duration-200"
              >
                <XCircle className="w-4 h-4 mr-2" /> Decline
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-6 text-sm text-gray-300">
          <div className="mb-4 md:mb-0">
            {filteredTrades.length > 0 ? (
              <span>
                {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredTrades.length)} of {filteredTrades.length}
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
  );
};

export default AdminTradeContent;