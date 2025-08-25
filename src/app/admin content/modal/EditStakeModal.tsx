import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react';
interface PoolCardProps {
  id: string;
  min: number;
  max: number;
  cycle: string;
  price: number;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  stake: PoolCardProps | null;
  onSave: (updatedSignal: PoolCardProps) => void;
}
const EditSignalModal:React.FC<EditModalProps> = ({stake, isOpen, onClose, onSave }) => {

    const [min, setMin] = useState(stake?.min || 0);
    const [max, setMax] = useState(stake?.max || 0);
    const [cycle, setCycle] = useState(stake?.cycle || '');
    const [price, setPrice] = useState(stake?.price || 0);
      const [loading, setLoading] = useState(false)
    
      useEffect(()=>{
        if(stake){
            setCycle(stake.cycle)
            setMax(stake.max)
            setMin(stake.min)
            setPrice(stake.price)
        }
      }, [stake])

      const handleSubmit = ()=>{
        if(stake){
            onSave({
                ...stake,
                min:min,
                max:max,
                cycle:cycle,
                price:price
            })
            setLoading(true)
        }
      }

      if(!isOpen) return null;
  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
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

        <div className='space-y-4'>
            <div>
                <label className='block text-gray-700 mb-2'>Minimum Amount</label>
                <input type="number" value={min} onChange={(e)=>setMin(Number(e.target.value))} className='w-full border border-gray-300 text-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                placeholder='Enter minimum amount'
                />
            </div>

            <div>
                <label className='block text-gray-700 mb-2'>Maximum Amount</label>
                <input type="number" value={max} onChange={(e)=>setMax(Number(e.target.value))} className='w-full border border-gray-300 text-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                placeholder='Enter maximum amount'
                />
        </div>

            <div>
                <label className='block text-gray-700 mb-2'>Cycle (in days)</label>
                <input type="text" value={cycle} onChange={(e)=>setCycle(e.target.value)} className='w-full border border-gray-300 text-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                placeholder='Enter cycle duration in days'
                />
            </div>

            <div>
                <label className='block text-gray-700 mb-2'>Price ($)</label>
                <input type="number" value={price} onChange={(e)=>setPrice(Number(e.target.value))} className='w-full border border-gray-300 text-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                placeholder='Enter price in USD'
                />
            </div>

            <div className='flex justify-end space-x-3 mt-6'>
                <button onClick={onClose} className='px-4 py-2 text-gray-600 hover:text-gray-800 font-medium'>Cancel</button>
                <button onClick={handleSubmit} className='px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium'>
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default EditSignalModal
