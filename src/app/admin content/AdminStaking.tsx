"use client";
import { Edit, Trash, Search, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getAuthToken } from "../utils/auth";
import { API_ENDPOINT } from "../config/api";
import EditSignalModal from "./modal/EditStakeModal";
import DeleteStakeModal from "./modal/DeleteStakeModal";
import AddStakingModal from "./modal/AddStakingModal";

interface PoolCardProps {
  id: string;
  min: number;
  max: number;
  cycle: string;
  price: number;
}

interface SignalCardProps extends PoolCardProps {
  onEdit: (id: string) => void;
  onDelete: (signal: PoolCardProps) => void;
}

const StakingCard: React.FC<SignalCardProps> = ({
  id,
  min,
  max,
  cycle,
  price,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-b from-[#06023daf] via-[#240a6b] to-[#644ca1] shadow-lg h-[250px] sm:w-[325px]">
      <div className="rounded-2xl p-4 h-full flex flex-col justify-between gradient-border">
        <div className="flex items-center mb-4 gap-3">
          <span>Price</span>
          <p>${price.toFixed(2)}</p>
        </div>

        <div className="text-sm space-y-3 flex-grow">
          <div className="flex justify-between border-b border-indigo-800/30 pb-1">
            <span className="text-gray-300">Minimum</span>
            <span className="text-white">${min.toFixed(2)}</span>
          </div>

          <div className="flex justify-between border-b border-indigo-800/30 pb-1">
            <span className="text-gray-300">Maximum</span>
            <span className="text-white">${max.toFixed(2)}</span>
          </div>

          <div className="flex justify-between border-b border-indigo-800/30 pb-1">
            <span className="text-gray-300">Cycle</span>
            <span className="text-white">{cycle} days</span>
          </div>
        </div>

        <div className="flex justify-between mt-4 gap-2.5">
          <button
            onClick={() => onEdit(id)}
            className="w-full bg-gradient-to-b from-[#6967AE]/30 to-[#6967AE]/10 text-white py-3 rounded-lg text-sm hover:opacity-80 transition cursor-pointer font-medium flex items-center justify-center gap-2"
          >
            Edit <Edit />
          </button>
          <button
            onClick={() => onDelete({ id, min, max, cycle, price })}
            className="w-full bg-gradient-to-b from-[#6967AE]/30 to-[#6967AE]/10 text-white py-3 rounded-lg text-sm hover:opacity-80 transition cursor-pointer font-medium flex items-center justify-center gap-2"
          >
            Delete <Trash />
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminStaking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stake, setStake] = useState<PoolCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingStake, setDeletingStake] = useState<PoolCardProps | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStake, setEditingStake] = useState<PoolCardProps | null>(null);

  useEffect(() => {
    const fetchStakes = async () => {
      const token = getAuthToken();
      setIsLoading(true);
      setError(null);

      if (!token) {
        setError('No authentication token found. Please log in.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(API_ENDPOINT.STAKE.GET_ALL_STAKING, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch stakes');
        }

        const result = await response.json();
        if (result && result.data) {
          setStake(result.data);
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
    }
    fetchStakes();
  }, [])

  const filteredStakes = stake.filter(stake => {
    const matchesSearch = stake.price.toString().includes(searchTerm)
    return matchesSearch;
  })

  const handleEditClick = (stakeid: string) => {
    const stakeToEdit = stake.find(stakes => stakes.id === stakeid);
    if (stakeToEdit) {
      setEditingStake(stakeToEdit);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteClick = (signal: PoolCardProps) => {
    setDeletingStake(signal);
    setIsDeleteModalOpen(true);
  };

  const handleEditStake = async (updateStake: PoolCardProps) => {
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
        min: updateStake.min,
        max: updateStake.max,
        cycle: updateStake.cycle,
        price: updateStake.price
      }

      const response = await fetch(API_ENDPOINT.STAKE.UPDATE_STAKING.replace('{id}', updateStake.id), {
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
        setStake(prevStake =>
          prevStake.map(stakeItem =>
            stakeItem.id === result.data.id ? result.data : stakeItem
          )
        )
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Failed to edit stake', err);
    } finally {
      setIsLoading(false);
      setIsEditModalOpen(false);
    }
  }

  const handleDeleteStake = async (stakeToDelete: PoolCardProps) => {
    const token = getAuthToken();
    setIsLoading(true);
    setError(null);

    if (!token) {
      setError('Authentication token is missing. Please log in.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINT.STAKE.DELETE_STAKING.replace('{id}', stakeToDelete.id), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete stake: ${response.statusText}`);
      }

      setStake(prevStakes => prevStakes.filter(stakeItem => stakeItem.id !== stakeToDelete.id));
    } catch (err) {
      console.error('Failed to delete stake', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while deleting the stake.');
      }
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setDeletingStake(null);
    }
  }

  const handleAddStake = async (newStake: Omit<PoolCardProps, 'id'>) => {
    const token = getAuthToken();
    setIsLoading(true);
    setError(null);
    if (!token) {
      setError('Authentication token is missing. Please log in.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINT.STAKE.ADMIN_CREATE_STAKING, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStake)
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add stake: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.data) {
        setStake(prevStakes => [...prevStakes, result.data]);
      } else {
        throw new Error('Invalid response format from server');
      }
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to add stake', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while adding the stake.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-white text-2xl font-medium">Stake Management</h1>
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
          <h2 className="text-white text-lg font-medium">Stake</h2>
          <button
            className="bg-[#F2AF29] hover:bg-[#ff8c00] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Signal
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-lg">Loading stakes...</p>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <p className="text-red-400 text-lg">Error: {error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStakes.length > 0 ? (
              filteredStakes.map(stake => (
                <StakingCard
                  key={stake.id}
                  id={stake.id}
                  min={stake.min}
                  max={stake.max}
                  cycle={stake.cycle}
                  price={stake.price}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
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

      <EditSignalModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        stake={editingStake}
        onSave={handleEditStake}
      />

      <DeleteStakeModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        stake={deletingStake}
        onSave={handleDeleteStake}
        isLoading={isLoading}
      />

      <AddStakingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddStake}
      />
    </div>
  );
};

export default AdminStaking;
