"use client";
import React, { useEffect, useState } from "react";
import { Edit, Trash, Search, Plus } from "lucide-react";
import { getAuthToken } from "../utils/auth";
// Assuming this is your API endpoint configuration file
import { API_ENDPOINT } from "../config/api";
import EditsubModal from "./modal/EditsubModal";
import DeletaSubModal from "./modal/DeletaSubModal";
import AddSubModal from "./modal/AddSubModal";

interface SubProps {
  id: string;
  name: string;
  max: number;
  min: number;
  roi: number;
  duration: number;
  price: number;
}

interface SubCardProps extends SubProps {
  onEdit: (id: string) => void;
  onDelete: (sub:SubProps) => void;
}

const SubCard: React.FC<SubCardProps> = ({
  id,
  name,
  max,
  min,
  roi,
  duration,
  price,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-b from-[#06023daf] via-[#240a6b] to-[#644ca1] shadow-lg h-[250px] sm:w-[325px]">
      <div className="rounded-2xl p-4 h-full flex flex-col justify-between gradient-border">
        <h2 className="text-lg font-semibold text-[#D2D1EE] mb-4">{name}</h2>
        <div className="space-y-2 text-sm text-[#C4C4C4]">
          <div className="flex justify-between">
            <span>Minimum</span>
            <span className="text-white font-medium">${min.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Maximum</span>
            <span className="text-white font-medium">${max.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Plan Duration</span>
            <span className="text-white font-medium">{duration} days</span>
          </div>
          <div className="flex justify-between">
            <span>ROI</span>
            <span className="text-green-400 font-medium">{roi}%</span>
          </div>
          <div className="flex justify-between">
            <span>Price</span>
            <span className="text-white font-medium">${price.toFixed(2)}</span>
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
            onClick={() => onDelete({id, name, max, min, roi, duration, price})}
            className="w-full bg-gradient-to-b from-[#6967AE]/30 to-[#6967AE]/10 text-white py-3 rounded-lg text-sm hover:opacity-80 transition cursor-pointer font-medium flex items-center justify-center gap-2"
          >
            Delete <Trash />
          </button>
        </div>
      </div>
    </div>
  );
};
const AdminSub = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubProps[]>([]);
  const [deletingSubscriptions, setDeletingSubscriptions] = useState<SubProps | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubscriptions, setEditingSubscriptions] = useState<SubProps | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const token = getAuthToken();
      setIsLoading(true);
      setError(null);
      if (!token) {
        setError("No auth token found");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(API_ENDPOINT.SUBSCRIPTION.GET_SUBSCRIPTIONS, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (result && result.data) {
          setSubscriptions(result.data);
        } else {
          throw new Error('Invalid data format received from the server.');
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const filteredSubscriptions = subscriptions.filter(sub =>{
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch;
  });

  const handleEditClick = (subscriptionid: string) => {
    const subscriptionEdit = subscriptions.find(subs => subs.id === subscriptionid);
    if (subscriptionEdit) {
      setEditingSubscriptions(subscriptionEdit);
      setIsEditModalOpen(true);
    }
  };
  const handleDeleteClick = (subscription: SubProps) => {
    setDeletingSubscriptions(subscription);
    setIsDeleteModalOpen(true);
  };

  const handleEdit = async (updateSubscription:SubProps)=>{
    const token = getAuthToken();
    setIsLoading(true);
    setError(null);

    if (!token) {
      setError('Authentication token is missing. Please log in.');
      setIsLoading(false);
      return;
    }

    try{
      const upLoade ={
        name: updateSubscription.name,
        max: updateSubscription.max,
        min: updateSubscription.min,
        roi: updateSubscription.roi,
        duration: updateSubscription.duration,
        price: updateSubscription.price
      }

      const response = await fetch(API_ENDPOINT.SUBSCRIPTION.UPDATE_SUBSCRIPTION.replace('{id}', updateSubscription.id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(upLoade)
      })

      if(!response.ok){
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if(result.data){
        setSubscriptions(prevSub =>
          prevSub.map(subItems =>
            subItems.id === result.data.id ? result.data : subItems
          )
        )
      } else{
        throw new Error('Invalid data format received from the server.');
      }
    }catch(err){
      setError((err as Error).message);
      console.error('Error updating subscription:', err);
    }
  }

  const handleDelete = async (subscription: SubProps) => {
    const token = getAuthToken();
    setIsLoading(true);
    setError(null);

    if (!token) {
      setError('Authentication token is missing. Please log in.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINT.SUBSCRIPTION.DELETE_SUBSCRIPTION.replace('{id}', subscription.id), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      setSubscriptions(prevSubs => prevSubs.filter(sub => sub.id !== subscription.id));
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error deleting subscription:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAdd = async (newSubscription: Omit<SubProps, 'id'>) => {
    const token = getAuthToken();
    setIsLoading(true);
    setError(null);

    if (!token) {
      setError('Authentication token is missing. Please log in.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINT.SUBSCRIPTION.CREATE_SUBSCRIPTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSubscription)
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.data) {
        setSubscriptions(prevSubs => [...prevSubs, result.data]);
        setIsAddModalOpen(false);
      } else {
        throw new Error('Invalid data format received from the server.');
      }
    } catch (err) {
      setError((err as Error).message);
      console.error('Error adding subscription:', err);
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
            {filteredSubscriptions.length > 0 ? (
              filteredSubscriptions.map(sub => (
                <SubCard
                  key={sub.id}
                  id={sub.id}
                  name={sub.name}
                  max={sub.max}
                  min={sub.min}
                  roi={sub.roi}
                  duration={sub.duration}
                  price={sub.price}
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

      <EditsubModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEdit}
        subscription={editingSubscriptions}
      />

      <DeletaSubModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
        subscription={deletingSubscriptions}
        isLoading={isLoading}
      />

      <AddSubModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAdd}
      />
    </div>
  );
};

export default AdminSub;
