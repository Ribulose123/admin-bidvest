'use client'
import React, { useState } from 'react'
import { X } from 'lucide-react';

export interface NewSignalData {
  name: string;
  amount: number;
  price: number;
  strength: number;
}

interface AddSignalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signal: NewSignalData) => void;
}

const AddSignalModal: React.FC<AddSignalModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    price: 0,
    strength: 50,
    description: 'brought to you by yours truly',
    assignTo: 'Assignment',
    comment: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      amount: formData.amount,
      price: formData.price,
      strength: formData.strength
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'price' || name === 'strength' 
        ? Number(value) 
        : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Add New Signal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Signal Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., BTC/USDT"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Signal Strength *
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                name="strength"
                value={formData.strength}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none"
                min="0"
                max="100"
                required
              />
             
            </div>
          </div>

         

          

         

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
            >
              Add Signal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddSignalModal;