import React from 'react'
import { X } from 'lucide-react';
interface PoolCardProps {
  id: string;
  min: number;
  max: number;
  cycle: string;
  price: number;
}

interface DeleteModalProps {
  isOpen: boolean;
  isLoading:boolean
  onClose: () => void;
  stake: PoolCardProps | null;
  onSave: (stake: PoolCardProps) => void;
}
const DeleteStakeModal:React.FC<DeleteModalProps> = ({onClose, isOpen, stake, onSave, isLoading}) => {

     if (!isOpen) return null;
  return (
    <div  className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Delete Stake</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-6">
          <p className="text-gray-700">
            Are you sure you want to delete the stake <strong>&quot;{stake?.cycle}&quot;</strong>? 
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
            onClick={() => stake && onSave(stake)}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
            disabled={!stake || isLoading}
          >
            {isLoading ? 'Deleting....' : 'Delete'}
          </button>
        </div>
          </div>
      </div>
    </div>
  )
}

export default DeleteStakeModal
