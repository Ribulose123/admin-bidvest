'use client'

import React, { useEffect, useState } from 'react';
import { Search, X, Plus, Trash, Edit } from 'lucide-react';
import { API_ENDPOINT } from '../config/api';
import AddSignalModal from './modal/AddSignalModal';
import { getAuthToken } from '../utils/auth';
import ModalDelet from './modal/ModalDelet';

interface SignalProps {
  id: string;
  name: string;
  amount: number;
  price: number;
  strength: number;
}

interface SignalCardProps extends SignalProps {
  onEdit: (id: string) => void;
  onDelete: (signal: SignalProps) => void;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: SignalProps | null;
  onSave: (updatedSignal: SignalProps) => void;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, signal, onSave }) => {
  const [name, setName] = useState('');
  const [strength, setStrength] = useState(0);
  const [amount, setAmount] = useState(0);
  const [price, setPrice] = useState(0)
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (signal) {
      setName(signal.name || '');
      setStrength(signal.strength || 0);
      setAmount(signal.amount || 0);
      setPrice(signal.price || 0);
    }
  }, [signal]);

  const handleSubmit = () => {
    if (signal) {
      onSave({
        ...signal,
        name: name,
        strength: strength,
        amount: amount,
        price:price
      });
      setLoading(true)
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Signal Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Signal Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Signal Strength
            </label>
            <input
              type="number"
              value={strength}
              onChange={(e) => setStrength(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Signal Strength"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Signal Strength"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Signal price"
            />
          </div>
        </div>

        

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
            {loading ? 'comfirming....' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SignalCard: React.FC<SignalCardProps> = ({
  id,
  name,
  strength,
  price,
  amount,
  onEdit,
  onDelete
}) => {
  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-b from-[#06023daf] via-[#240a6b] to-[#644ca1] shadow-lg h-[250px] sm:w-[325px]">
      <div className="rounded-2xl p-4 h-full flex flex-col justify-between gradient-border">
        <div>
          <h2 className="text-[#D2D1EE] sm:text-[20px] text-[16px] font-medium mb-8">{name}</h2>
          <div className="flex justify-between text-[12px] border-b border-[#6967AE29] font-semibold sm:text-[16px] text-[#C4C4C4] mb-2">
            <span>Amount</span>
            <span className="text-white text-[12px] font-semibold sm:text-[16px]">{amount}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span className='text-[12px] font-semibold sm:text-[16px]'>Signal Strength</span>
            <span className="text-[#00F66C] text-[12px] font-semibold sm:text-[14px]">{strength}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 currency-display rounded-lg">
            <span className='text-[12px] font-semibold sm:text-[16px] text-white'>Price</span>
            <span className="text-white">${price.toFixed(2)}</span>
          </div>
        </div>
       <div className=' flex items-center gap-4'>
         <button
          onClick={() => onEdit && onEdit(id)}
          className="w-full bg-gradient-to-b from-[#6967AE]/30 to-[#6967AE]/10 text-white py-3 rounded-lg text-sm hover:opacity-80 transition cursor-pointer font-medium flex items-center justify-center gap-2"
        >
          Edit <Edit size={15}/>
        </button>
        <button 
        onClick={()=> onDelete && onDelete({id, name, amount, strength, price })}
        className="w-full bg-gradient-to-b from-[#6967AE]/30 to-[#6967AE]/10 text-white py-3 rounded-lg text-sm hover:opacity-80 transition cursor-pointer font-medium flex items-center justify-center gap-2">Delete <Trash size={15}/></button>
       </div>
      </div>
    </div>
  );
};

const SignalManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSignal, setEditingSignal] = useState<SignalProps | null>(null);
   const [deletingSignal, setDeletingSignal] = useState<SignalProps | null>(null);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [signals, setSignals] = useState<SignalProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignals = async () => {
     

     
      
      const token = getAuthToken();
      setIsLoading(true);
      setError(null);

      if (!token) {
        setError('No authentication token found. Please log in.');
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(API_ENDPOINT.SIGNAL.GET_ALL_SIGNAL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch signals: ${res.statusText}`);
        }

        const result = await res.json();

        if (result && result.data) {
          setSignals(result.data);
        } else {
          throw new Error('Invalid data format received from the server.');
        }

      } catch (err) {
        console.error("Failed to get signals:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while fetching signals.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignals();
  }, []);

  const filteredSignals = signals.filter(signal => {
    const matchesSearch = signal.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleEditClick = (signalId: string) => {
    const signalToEdit = signals.find(signal => signal.id === signalId);
    if (signalToEdit) {
      setEditingSignal(signalToEdit);
      setIsEditModalOpen(true);
    }
  };

   const handleDeleteClick = (signal: SignalProps) => {
    setDeletingSignal(signal);
    setIsDeleteModalOpen(true);
  };
  

  const handleDeleteSignal = async (signal: SignalProps) => {
    const token = getAuthToken();
    setIsLoading(true);
    setError(null);

    if (!token) {
      setError('Authentication token is missing. Please log in.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINT.SIGNAL.DELETE_SIGNAL.replace('{id}', signal.id), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete signal: ${response.statusText}`);
      }

      // Remove the deleted signal from the state
      setSignals(prevSignals => prevSignals.filter(s => s.id !== signal.id));
      
    } catch (err) {
      console.error("Failed to delete signal:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while deleting the signal.');
      }
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditSignal = async (updatedSignal: SignalProps) => {
    const token = getAuthToken();
    setIsLoading(true);
    setError(null);

    if (!token) {
      setError('Authentication token is missing. Please log in.');
      setIsLoading(false);
      return;
    }

    try {
      const updatePayload = {
        name: updatedSignal.name,
        strength: updatedSignal.strength,
        amount:updatedSignal.amount,
        price:updatedSignal.price
      };

      
      const updateUrl = API_ENDPOINT.SIGNAL.UPDATE_SIGNAL.replace('{id}', updatedSignal.id);
      
      const response = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload) 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to edit signal: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.data) {
        setSignals(prevSignals => 
          prevSignals.map(signal => 
            signal.id === result.data.id ? result.data : signal
          )
        );
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Failed to edit signal', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while editing the signal.');
      }
    } finally {
      setIsLoading(false);
      setIsEditModalOpen(false);
    }
  };
  
  const handleAddSignal = async(newSignal: Omit<SignalProps, 'id'>) => {
    const token = getAuthToken();
      setIsLoading(true);
      setError(null);

      if (!token) {
        setError('No authentication token found. Please log in.');
        setIsLoading(false);
        return;
      }
    try{
      const response = await fetch (API_ENDPOINT.SIGNAL.ADMIN_CREATE_SIGNALS,{
        method:'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body:JSON.stringify(newSignal)
      })

      if(!response.ok){
          throw new Error(`Failed to add signals: ${response.statusText}`);
      }

      const result = await response.json();

      if(result.data){
        setSignals(prevSignal => [result.data, ...prevSignal])
      } else{
          throw new Error('Invalid response format from server');
      }
    } catch(err){
      console.error('Failed to add new signal', err)
    }finally {
    setIsLoading(false);
    setIsAddModalOpen(false);
  }
  };

  return (
    <div className="min-h-screen p-6 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-white text-2xl font-medium">Signal Management</h1>
        <div className="flex items-center gap-4">
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
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-lg font-medium">Signals</h2>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#F2AF29] hover:bg-[#ff8c00] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
          >
            Add Signal
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-lg">Loading signals...</p>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <p className="text-red-400 text-lg">Error: {error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSignals.length > 0 ? (
              filteredSignals.map(signal => (
                <SignalCard
                  key={signal.id}
                  id={signal.id}
                  name={signal.name}
                  price={signal.price}
                  strength={signal.strength}
                  amount={signal.amount}
                  onEdit={handleEditClick}
                  onDelete = {handleDeleteClick}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400 text-lg">No signals found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        signal={editingSignal}
        onSave={handleEditSignal}
      />

      <AddSignalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddSignal}
      />

      <ModalDelet
      isOpen={isDeleteModalOpen}
      onClose={()=>setIsDeleteModalOpen(false)}
      onSave={handleDeleteSignal}
      signal={deletingSignal}
      isLoading= {isLoading}
      />
    </div>
  );
};

export default SignalManagement;