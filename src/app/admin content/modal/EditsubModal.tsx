import React, { useEffect, useState } from 'react'
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

interface EditsubModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (sub: SubProps) => void;
    subscription: SubProps | null;
}

const EditsubModal:React.FC<EditsubModalProps> = ({isOpen, onSave, onClose,subscription}) => {

    const [name, setName] = useState(subscription?.name || '');
    const [min, setMin] = useState(subscription?.min || 0);
    const [max, setMax] = useState(subscription?.max || 0);
    const [roi, setRoi] = useState(subscription?.roi || 0);
    const [duration, setDuration] = useState(subscription?.duration || 0);
    const [price, setPrice] = useState(subscription?.price || 0);
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        if(subscription){
            setName(subscription.name)
            setMin(subscription.min)
            setMax(subscription.max)
            setRoi(subscription.roi)
            setDuration(subscription.duration)
            setPrice(subscription.price)
        }

    },[subscription])
    const handleSubmit =()=>{
        if(subscription){
            onSave({
                ...subscription,
                name:name,
                min:min,
                max:max,
                roi:roi,
                duration:duration,
                price:price
            })
            
        setLoading(true)
        }
    }

    if(!isOpen) return null;
  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Edit Signal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className='space-y-4 text-black'>
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
                <input type="text" value={name} onChange={(e)=>setName(e.target.value)} className='w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter name'/>
            </div>
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Minimum Amount</label>
                <input type="number" value={min} onChange={(e)=>setMin(Number(e.target.value))} className='w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ' placeholder='Enter minium amount'/>
            </div>
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Maximum Amount</label>
                <input type="number" value={max} onChange={(e)=>setMax(Number(e.target.value))} className='w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter maximum amount'/>
            </div>
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>ROI (%)</label>
                <input type="number" value={roi} onChange={(e)=>setRoi(Number(e.target.value))} className='w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter ROI'/>
            </div>
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Duration (in days)</label>
                <input type="number" value={duration} onChange={(e)=>setDuration(Number(e.target.value))} className='w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter duration in days'/>
            </div>

            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Price ($)</label>
                <input type="number" value={price} onChange={(e)=>setPrice(Number(e.target.value))} className='w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Enter price'/>
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

export default EditsubModal
