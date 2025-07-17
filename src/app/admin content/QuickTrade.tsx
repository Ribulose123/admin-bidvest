import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

interface CryptoAsset {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

const QuickTrade: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<'Buy' | 'Sell'>('Buy');
  const [payAmount, setPayAmount] = useState('3083.85');
  const [receiveAmount, setReceiveAmount] = useState('3083.85');
  const [showPayCurrencyDropdown, setShowPayCurrencyDropdown] = useState(false);
  const [showReceiveCurrencyDropdown, setShowReceiveCurrencyDropdown] = useState(false);
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [selectedPayCurrency, setSelectedPayCurrency] = useState<Currency | CryptoAsset>();
  const [selectedReceiveCurrency, setSelectedReceiveCurrency] = useState<Currency | CryptoAsset>();

  const currencies = useMemo<Currency[]>(() => [
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1547.88 },
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
    { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.81 },
  ], []);

  const cryptoAssets = useMemo<CryptoAsset[]>(() => [
    { code: 'USDT', name: 'Tether', symbol: 'USDT', rate: 1 },
    { code: 'BTC', name: 'Bitcoin', symbol: '₿', rate: 43000 },
    { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', rate: 2500 },
    { code: 'LTC', name: 'Litecoin', symbol: 'Ł', rate: 70 },
  ], []);

  const initializeCurrencies = useCallback(() => {
    if (selectedAction === 'Buy') {
      setSelectedPayCurrency(currencies[0]);
      setSelectedReceiveCurrency(cryptoAssets[0]);
    } else {
      setSelectedPayCurrency(cryptoAssets[0]);
      setSelectedReceiveCurrency(currencies[0]);
    }
  }, [selectedAction, currencies, cryptoAssets]);

  useEffect(() => {
    initializeCurrencies();
  }, [initializeCurrencies]);

  const calculateExchange = useCallback((amount: string, from: Currency | CryptoAsset, to: Currency | CryptoAsset) => {
    const numAmount = parseFloat(amount) || 0;
    if (from && to) {
      const result = (numAmount * from.rate) / to.rate;
      return result.toFixed(2);
    }
    return '0.00';
  }, []);

  const handlePayAmountChange = (value: string) => {
    setPayAmount(value);
    if (selectedPayCurrency && selectedReceiveCurrency) {
      const converted = calculateExchange(value, selectedPayCurrency, selectedReceiveCurrency);
      setReceiveAmount(converted);
    }
  };

  const handleReceiveAmountChange = (value: string) => {
    setReceiveAmount(value);
    if (selectedPayCurrency && selectedReceiveCurrency) {
      const converted = calculateExchange(value, selectedReceiveCurrency, selectedPayCurrency);
      setPayAmount(converted);
    }
  };

  const handleCurrencySelect = (currency: Currency | CryptoAsset, type: 'pay' | 'receive') => {
    if (type === 'pay') {
      setSelectedPayCurrency(currency);
      setShowPayCurrencyDropdown(false);
    } else {
      setSelectedReceiveCurrency(currency);
      setShowReceiveCurrencyDropdown(false);
    }
    
    if (type === 'pay' && selectedReceiveCurrency) {
      const converted = calculateExchange(payAmount, currency, selectedReceiveCurrency);
      setReceiveAmount(converted);
    } else if (type === 'receive' && selectedPayCurrency) {
      const converted = calculateExchange(receiveAmount, currency, selectedPayCurrency);
      setPayAmount(converted);
    }
  };

  const handleActionSelect = (action: 'Buy' | 'Sell') => {
    setSelectedAction(action);
    setShowActionDropdown(false);
    setPayAmount('0.00');
    setReceiveAmount('0.00');
  };

  const handleTrade = () => {
    if (!selectedPayCurrency || !selectedReceiveCurrency) return;
    
    const tradeData = {
      action: selectedAction,
      payAmount: parseFloat(payAmount),
      payCurrency: selectedPayCurrency.code,
      receiveAmount: parseFloat(receiveAmount),
      receiveCurrency: selectedReceiveCurrency.code,
      timestamp: new Date().toISOString(),
    };
    
    console.log('Trade executed:', tradeData);
    alert(`${selectedAction} order placed successfully!`);
  };

  return (
    <div className="bg-[#060A17] text-white p-4 w-full h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Quick Trade</h1>
        <div className="relative">
          <button 
            className="flex items-center space-x-2 bg-transperent px-3 py-1 rounded text-sm"
            onClick={() => setShowActionDropdown(!showActionDropdown)}
          >
            <span>{selectedAction}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
          {showActionDropdown && (
            <div className="absolute right-0 mt-2 w-24 bg-[#10131F] border border-gray-700 rounded shadow-lg z-20">
              <div
                className="px-4 py-2 hover:bg-[#060A17] cursor-pointer"
                onClick={() => handleActionSelect('Buy')}
              >
                Buy
              </div>
              <div
                className="px-4 py-2 hover:bg-[#060A17] cursor-pointer"
                onClick={() => handleActionSelect('Sell')}
              >
                Sell
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pay Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between bg-[#10131F] rounded-lg p-3">
          <input
            type="text"
            className="flex-1 text-2xl font-bold bg-transparent w-[70%] outline-none"
            value={payAmount}
            onChange={(e) => handlePayAmountChange(e.target.value)}
          />
          <div className="relative ml-2">
            <div 
              className="flex items-center space-x-2 cursor-pointer  p-2 rounded"
              onClick={() => setShowPayCurrencyDropdown(!showPayCurrencyDropdown)}
            >
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm">
                {selectedPayCurrency?.code || 'Select'}
              </span>
              <ChevronDown className="w-3 h-3" />
            </div>
            {showPayCurrencyDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-[#10131F] border border-gray-700 rounded shadow-lg z-10">
                {(selectedAction === 'Buy' ? currencies : cryptoAssets).map((currency) => (
                  <div
                    key={currency.code}
                    className="px-4 py-2 hover:bg-[#060A17] cursor-pointer"
                    onClick={() => handleCurrencySelect(currency, 'pay')}
                  >
                    {currency.code} - {currency.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Receive Section */}
      <div className="mb-6">
        <div className="flex justify-between bg-[#10131F] rounded-lg p-3">
          <input
            type="text"
            className=" text-2xl font-bold w-[70%] outline-none "
            value={receiveAmount}
            onChange={(e) => handleReceiveAmountChange(e.target.value)}
          />
          <div className="relative">
            <div 
              className="flex items-center space-x-2 cursor-pointer  p-2 rounded"
              onClick={() => setShowReceiveCurrencyDropdown(!showReceiveCurrencyDropdown)}
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-sm">
                {selectedReceiveCurrency?.code || 'Select'}
              </span>
              <ChevronDown className="w-3 h-3"/>
            </div>
            {showReceiveCurrencyDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-[#10131F] border border-gray-700 rounded shadow-lg z-10">
                {(selectedAction === 'Buy' ? cryptoAssets : currencies).map((currency) => (
                  <div
                    key={currency.code}
                    className="px-4 py-2 hover:bg-[#060A17] cursor-pointer"
                    onClick={() => handleCurrencySelect(currency, 'receive')}
                  >
                    {currency.code} - {currency.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {selectedPayCurrency && selectedReceiveCurrency && (
          <div className="text-xs text-gray-500 mt-1 ml-3">
            1 {selectedReceiveCurrency.code} = {(selectedPayCurrency.rate / selectedReceiveCurrency.rate).toFixed(6)} {selectedPayCurrency.code}
          </div>
        )}
      </div>

      <button 
        className="w-full bg-[#6967AE] hover:bg-[#6967aec2] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        onClick={handleTrade}
      >
        {selectedAction}
      </button>
    </div>
  );
};

export default QuickTrade;