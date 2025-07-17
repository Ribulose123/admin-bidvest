import React, { useState } from 'react';

interface TradingItem {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume: number;
  icon: string;
}

const TradingActivitiesPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Monthly' | 'Weekly' | 'Today'>('Monthly');

  const tradingData: TradingItem[] = [
    {
      id: '1',
      name: 'Bitcoin',
      symbol: 'BTC',
      price: 40501.97,
      change24h: 8.93,
      change7d: -4.28,
      marketCap: 654468,
      volume: 373359580165,
      icon: '🟡'
    },
    {
      id: '2',
      name: 'Ethereum',
      symbol: 'ETH',
      price: 2796.60,
      change24h: 6.67,
      change7d: 15.48,
      marketCap: 434468,
      volume: 373359580165,
      icon: '🟢'
    },
    {
      id: '3',
      name: 'Litecoin',
      symbol: 'LTC',
      price: 51.00,
      change24h: -3.33,
      change7d: 15.54,
      marketCap: 2355446,
      volume: 373359580165,
      icon: '🟡'
    },
    {
      id: '4',
      name: 'Monero',
      symbol: 'XMR',
      price: 40501.97,
      change24h: -6.93,
      change7d: 14.86,
      marketCap: 1765446,
      volume: 373359580165,
      icon: '🟠'
    },
    {
      id: '5',
      name: 'Binance',
      symbol: 'BNB',
      price: 2796.60,
      change24h: 0.00,
      change7d: 0.02,
      marketCap: 954468,
      volume: 373359580165,
      icon: '🟢'
    },
    {
      id: '6',
      name: 'Bitcoin',
      symbol: 'BTC',
      price: 2796.60,
      change24h: 0.00,
      change7d: -4.28,
      marketCap: 654468,
      volume: 373359580165,
      icon: '🟠'
    },
    {
      id: '7',
      name: 'Litecoin',
      symbol: 'LTC',
      price: 40501.97,
      change24h: 0.00,
      change7d: 15.45,
      marketCap: 454468,
      volume: 373359580165,
      icon: '🟡'
    },
    {
      id: '8',
      name: 'Monero',
      symbol: 'XMR',
      price: 51.00,
      change24h: 0.00,
      change7d: 14.86,
      marketCap: 955446,
      volume: 373359580165,
      icon: '🟢'
    },
    {
      id: '9',
      name: 'Cardano',
      symbol: 'ADA',
      price: 1.25,
      change24h: 2.45,
      change7d: -1.23,
      marketCap: 421234,
      volume: 156789012345,
      icon: '🔵'
    },
    {
      id: '10',
      name: 'Solana',
      symbol: 'SOL',
      price: 98.76,
      change24h: -5.67,
      change7d: 8.90,
      marketCap: 876543,
      volume: 298765432109,
      icon: '🟣'
    }
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getChangePrefix = (change: number): string => {
    if (change > 0) return '+';
    return '';
  };

  const TabButton: React.FC<{ tab: 'Monthly' | 'Weekly' | 'Today', isActive: boolean }> = ({ tab, isActive }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-orange-500 text-white shadow-lg' 
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {tab}
    </button>
  );

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-xl max-w-6xl mx-auto pt-4 ">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Recent Trading Activities</h2>
          <p className="text-gray-400 text-sm">Lorem ipsum dolor sit amet, consectetur</p>
        </div>
        <div className="flex space-x-2">
          <TabButton tab="Monthly" isActive={activeTab === 'Monthly'} />
          <TabButton tab="Weekly" isActive={activeTab === 'Weekly'} />
          <TabButton tab="Today" isActive={activeTab === 'Today'} />
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-7 gap-4 mb-4 text-sm text-gray-400 border-b border-gray-700 pb-3">
        <div className="flex items-center space-x-2">
          <span>Name</span>
        </div>
        <div className="text-right">Price</div>
        <div className="text-right">24H%</div>
        <div className="text-right">7D%</div>
        <div className="text-right">Market CAP</div>
        <div className="text-right">Volume (24H)</div>
        <div className="text-right">Actions</div>
      </div>

      {/* Scrollable Table Body */}
      <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <div className="space-y-3">
          {tradingData.map((item) => (
            <div key={item.id} className="grid grid-cols-7 gap-4 items-center py-3 hover:bg-gray-800 rounded-lg transition-colors duration-200 px-2">
              {/* Name */}
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-400">{item.symbol}</div>
                </div>
              </div>

              {/* Price */}
              <div className="text-right font-medium">
                ${formatPrice(item.price)}
              </div>

              {/* 24H Change */}
              <div className={`text-right font-medium ${getChangeColor(item.change24h)}`}>
                {item.change24h === 0 ? (
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">MARKET</span>
                ) : (
                  `${getChangePrefix(item.change24h)}${item.change24h.toFixed(2)}%`
                )}
              </div>

              {/* 7D Change */}
              <div className={`text-right font-medium ${getChangeColor(item.change7d)}`}>
                {getChangePrefix(item.change7d)}{item.change7d.toFixed(2)}%
              </div>

              {/* Market Cap */}
              <div className="text-right text-gray-300">
                {formatNumber(item.marketCap)}
              </div>

              {/* Volume */}
              <div className="text-right">
                <div className="text-gray-300">${formatNumber(item.volume)}</div>
                <div className="text-xs text-gray-500">24h</div>
              </div>

              {/* Actions */}
              <div className="text-right">
                <button className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors">
                  Trade
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TradingActivitiesPanel;