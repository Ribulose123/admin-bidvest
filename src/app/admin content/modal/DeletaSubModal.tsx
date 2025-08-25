import React from 'react'
import { X } from 'lucide-react';
interface SubProps {
  id: string;
  name: string;
  max: number;
  min: number;
  roi: number;
  duration: number;
  price: number;
}

interface DeletaSubModalProps{
    isOpen: boolean;
    isLoading:boolean;
    onClose: () => void;
    onDelete: (sub: SubProps) => void;
    subscription: SubProps | null;
}
const DeletaSubModal:React.FC<DeletaSubModalProps> = ({isLoading, isOpen, onClose, subscription, onDelete}) => {

    if(!isOpen) return null;
  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Delete Subscription</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700">
            Are you sure you want to delete the stake <strong>&quot;{subscription?.name}&quot;</strong>? 
            This action cannot be undone.
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => subscription && onDelete(subscription)}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              disabled={!subscription || isLoading}
            >
              {isLoading ? 'Deleting....' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeletaSubModal
