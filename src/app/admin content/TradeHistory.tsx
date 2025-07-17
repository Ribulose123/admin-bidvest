import React, { useMemo , useState} from 'react';
import { Calendar } from 'lucide-react';

interface TradeHistoryItem {
  id: string;
  coin: string;
  amount: string;
  description: string;
  icon: string;
  color: string;
}

const TradeHistory: React.FC = () => {
  const [selectedDate] = useState('12/09/22');

  const tradeHistory = useMemo<TradeHistoryItem[]>(() => [
    {
      id: '1',
      coin: 'Bitcoin',
      amount: '-$10.00',
      description: 'Bitcoin is a decentralized digital currency. 23.04000 Satoshis. Consumers from 107 Countries.',
      icon: '₿',
      color: 'bg-orange-500'
    },
    {
      id: '2',
      coin: 'Ethereum',
      amount: '-$50.00',
      description: 'Ethereum is a decentralized blockchain with smart contract functionality.',
      icon: 'Ξ',
      color: 'bg-blue-500'
    },
    {
      id: '3',
      coin: 'Litecoin',
      amount: '-$50.00',
      description: 'Litecoin is a peer-to-peer cryptocurrency and open-source software.',
      icon: 'Ł',
      color: 'bg-gray-400'
    }
  ], []);

  return (
    <div className="bg-[#060A17] text-white p-4 w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">History</h2>
        <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">{selectedDate}</span>
        </div>
      </div>

      <div className="space-y-3"> {/* This creates consistent spacing between items */}
  {tradeHistory.map((item) => (
    <div 
      key={item.id}
      className="bg-[#10131F] rounded-lg p-3" /* Same bg color for each item */
    >
      <div className="flex items-start gap-3">
        {/* Coin Icon */}
        <div className={`w-8 h-8 ${item.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
          {item.icon}
        </div>
        
        {/* Coin Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-white">{item.coin}</span>
            <span className="text-red-500 font-semibold ml-2">
              {item.amount}
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  ))}
</div>
    </div>
  );
};

export default TradeHistory;