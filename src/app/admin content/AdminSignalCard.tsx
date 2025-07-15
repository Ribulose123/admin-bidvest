'use client'
import React, { useState } from 'react';
import { Search, X, Plus } from 'lucide-react';

interface SignalProps {
  id: string;
  status: string;
  pair: string;
  minimum: string;
  signalStrength: number;
  amount: string;
  currency: string;
  onEdit?: (id: string) => void;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: SignalProps | null;
  onSave: (signal: SignalProps) => void;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, signal, onSave }) => {
  const [formData, setFormData] = useState({
    pair: '',
    description: '',
    assignTo: '',
    comment: ''
  });

  React.useEffect(() => {
    if (signal) {
      setFormData({
        pair: signal.pair,
        description: 'brought to you by yours truly',
        assignTo: 'Assignment',
        comment: ''
      });
    }
  }, [signal]);

  const handleSubmit = () => {
    if (signal) {
      onSave({
        ...signal,
        pair: formData.pair
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Edit Signal</h2>
          <button 
            onClick={onClose}
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
              value={formData.pair}
              onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              value={formData.assignTo}
              onChange={(e) => setFormData({ ...formData, assignTo: e.target.value })}
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
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-20 resize-none"
              placeholder="Add your comment..."
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {formData.comment.length}/100
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const SignalCard: React.FC<SignalProps> = ({
  id,
  pair,
  minimum,
  signalStrength,
  currency,
  status,
  onEdit
}) => {
  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-b from-[#06023daf] from-25%   via-[#240a6b] to-[#644ca1] shadow-lg h-[380px] w-full max-w-[365px]">
      <div className="rounded-2xl p-4 h-full flex flex-col justify-between bg-gradient-to-b from-[#06023daf] from-25%   via-[#240a6b] to-[#644ca1]">
        
        {/* Status Badge */}
        <div className="flex justify-between items-start mb-6">
          <span className={`text-black text-xs px-2 py-1 rounded font-medium ${
            status === 'active' ? 'bg-[#00F66C]' : 'bg-[#FF6B6B]'
          }`}>
            {status === 'active' ? 'Approved' : 'Inactive'}
          </span>
        </div>
        
        {/* Pair Name */}
        <div className="mb-6">
          <h2 className="text-[#D2D1EE] text-[20px] font-medium">{pair}</h2>
        </div>
    
        {/* Details */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center border-b border-[#6967AE29] pb-2">
            <span className="text-[#C4C4C4] text-[14px] font-medium">Minimum</span>
            <span className="text-white text-[14px] font-medium">{minimum}</span>
          </div>
    
          <div className="flex justify-between items-center border-b border-[#6967AE29] pb-2">
            <span className="text-[#C4C4C4] text-[14px] font-medium">Signal Strength</span>
            <span className="text-[#00F66C] text-[14px] font-medium">{signalStrength}%</span>
          </div>
    
          <div className="flex justify-between items-center">
            <span className="text-[#C4C4C4] text-[14px] font-medium">Amount</span>
            <span className="text-white text-[14px] font-medium">{currency}</span>
          </div>
        </div>
    
        {/* Bottom Button */}
        <button 
          onClick={() => onEdit && onEdit(id)}
          className="w-full bg-gradient-to-b from-[#6967AE]/30 to-[#6967AE]/10 text-white py-3 rounded-lg text-sm hover:opacity-80 transition cursor-pointer font-medium"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

const SignalManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [editingSignal, setEditingSignal] = useState<SignalProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allSignals = [
    {
      id: '1',
      status: 'active',
      pair: 'CD VS',
      minimum: '1ETH',
      signalStrength: 10,
      amount: '11,000.00',
      currency: 'USD'
    },
    {
      id: '2',
      status: 'active',
      pair: 'BTC USD',
      minimum: '0.5ETH',
      signalStrength: 85,
      amount: '25,000.00',
      currency: 'USD'
    },
    {
      id: '3',
      status: 'inactive',
      pair: 'ETH USD',
      minimum: '2ETH',
      signalStrength: 45,
      amount: '5,000.00',
      currency: 'USD'
    },
    {
      id: '4',
      status: 'active',
      pair: 'ADA SOL',
      minimum: '1ETH',
      signalStrength: 70,
      amount: '8,500.00',
      currency: 'USD'
    },
    {
      id: '5',
      status: 'inactive',
      pair: 'DOT AVAX',
      minimum: '1.5ETH',
      signalStrength: 30,
      amount: '12,000.00',
      currency: 'USD'
    },
    {
      id: '6',
      status: 'active',
      pair: 'LINK UNI',
      minimum: '0.8ETH',
      signalStrength: 95,
      amount: '18,000.00',
      currency: 'USD'
    }
  ];

  const filteredSignals = allSignals.filter(signal => {
    const matchesSearch = signal.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         signal.currency.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || 
                         signal.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleEditSignal = (id: string) => {
    const signalToEdit = allSignals.find(signal => signal.id === id);
    if (signalToEdit) {
      setEditingSignal(signalToEdit);
      setIsModalOpen(true);
    }
  };

  const handleSaveSignal = (updatedSignal: SignalProps) => {
    // In a real app, you would update the state or make an API call here
    console.log('Updated signal:', updatedSignal);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a23] to-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-white text-2xl font-medium">Signal Management</h1>
        
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#1a1a2e] border border-[#6967AE29] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#6967AE] w-64"
            />
          </div>
          
          {/* Active Dropdown */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1a1a2e] border border-[#6967AE29] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#6967AE]"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="All">All</option>
          </select>
        </div>
      </div>

      {/* Signals Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-lg font-medium">Signals</h2>
          <button className="bg-[#F2AF29] hover:bg-[#ff8c00] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition">
            
            Add Signal
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSignals.length > 0 ? (
            filteredSignals.map(signal => (
              <SignalCard 
                key={signal.id}
                id={signal.id}
                status={signal.status}
                pair={signal.pair}
                minimum={signal.minimum}
                signalStrength={signal.signalStrength}
                amount={signal.amount}
                currency={signal.currency}
                onEdit={handleEditSignal}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">No signals found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        signal={editingSignal}
        onSave={handleSaveSignal}
      />
    </div>
  );
};

export default SignalManagement;