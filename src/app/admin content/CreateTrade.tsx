"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { getAuthToken } from "../utils/auth";
import { API_ENDPOINT } from "../config/api";
import { X } from "lucide-react";

interface CreateTradeProps {
  traderId: string;
  tradePair: string;
  price: number;
  amount: number;
  side: "BUY" | "SELL";
  leverage: number;
  orderType: string;
  notes: string;
}

/* interface TradeResponse {
  id: string;
  traderId: string;
  tradePair: string;
  price: number;
  amount: number;
  side: "BUY" | "SELL";
  action: string;
  leverage: number;
  orderType: string;
  executionStatus: string;
  realizedPnL: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  copiedToFollowers: number;
} */

const SYMBOL_TO_FULL_NAME: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  USDT: "Tether",
  USDC: "USD Coin",
  BNB: "Binance Coin",
  SOL: "Solana",
  XRP: "Ripple",
  ADA: "Cardano",
  DOGE: "Dogecoin",
  DOT: "Polkadot",
  SHIB: "Shiba Inu",
  AVAX: "Avalanche",
  MATIC: "Polygon",
  LTC: "Litecoin",
  TRX: "Tron",
  UNI: "Uniswap",
  LINK: "Chainlink",
  ATOM: "Cosmos",
  XLM: "Stellar",
  XMR: "Monero",
  ETC: "Ethereum Classic",
};

interface CreateTradeComponentProps {
    onClose: () => void;
    isOpen:boolean;
}

const CreateTrade = ({onClose, isOpen}:CreateTradeComponentProps) => {
  const [traderId, setTraderId] = useState("");
  const [baseAsset, setBaseAsset] = useState("BTC");
  const [quoteAsset, setQuoteAsset] = useState("USDT");
  const [price, setPrice] = useState<number | string>("");
  const [amount, setAmount] = useState<number | string>("");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [leverage, setLeverage] = useState<number>(1);
  const [orderType, setOrderType] = useState("MARKET");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const baseAssetFullName = SYMBOL_TO_FULL_NAME[baseAsset] || baseAsset;
  const quoteAssetFullName = SYMBOL_TO_FULL_NAME[quoteAsset] || quoteAsset;
  const tradePairFull = `${baseAsset}/${quoteAsset}`;

  useEffect(() => {
    const fetchPrice = async () => {
      if (!baseAsset || !quoteAsset || baseAsset === quoteAsset) {
        setPrice("");
        return;
      }
      setIsPriceLoading(true);
      setError("");
      try {
        const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
          BTC: "bitcoin",
          ETH: "ethereum",
          USDT: "tether",
          USDC: "usd-coin",
          BNB: "binancecoin",
          SOL: "solana",
          XRP: "ripple",
          ADA: "cardano",
          DOGE: "dogecoin",
          DOT: "polkadot",
          SHIB: "shiba-inu",
          AVAX: "avalanche-2",
          MATIC: "matic-network",
          LTC: "litecoin",
          TRX: "tron",
          UNI: "uniswap",
          LINK: "chainlink",
          ATOM: "cosmos",
          XLM: "stellar",
          XMR: "monero",
          ETC: "ethereum-classic",
        };

        const baseCoinId = SYMBOL_TO_COINGECKO_ID[baseAsset];
        const quoteCoinId = SYMBOL_TO_COINGECKO_ID[quoteAsset];

        if (!baseCoinId || !quoteCoinId) {
          setError(`Price data not available for ${baseAsset}/${quoteAsset}`);
          return;
        }

        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${baseCoinId},${quoteCoinId}&vs_currencies=usd`,
          { timeout: 5000 }
        );

        const basePrice = response.data[baseCoinId]?.usd;
        const quotePrice = response.data[quoteCoinId]?.usd;

        if (basePrice && quotePrice && quotePrice > 0) {
          const calculatedPrice = basePrice / quotePrice;
          setPrice(calculatedPrice.toFixed(5));
        } else {
          setError(`Could not fetch price for ${baseAsset}/${quoteAsset}`);
        }
      } catch (err) {
        console.error("Error fetching price from CoinGecko:", err);
      } finally {
        setIsPriceLoading(false);
      }
    };

    const timeOutId = setTimeout(fetchPrice, 500);
    return () => clearTimeout(timeOutId);
  }, [baseAsset, quoteAsset, baseAssetFullName, quoteAssetFullName]);

  const handelSumbit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!traderId.trim()) {
      setError("Trader ID is required");
      setLoading(false);
      return;
    }

    if (!price || !amount) {
      setError("Price and amount are required");
      setLoading(false);
      return;
    }

    if (Number(price) <= 0) {
      setError("Price must be greater than 0");
      setLoading(false);
      return;
    }
    if (Number(amount) <= 0) {
      setError("Amount must be greater than 0");
      setLoading(false);
      return;
    }

    if (baseAsset === quoteAsset) {
      setError("Base and quote assets cannot be the same");
      setLoading(false);
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }
      const tradeData: CreateTradeProps = {
        traderId: traderId.trim(),
        tradePair: tradePairFull,
        price: Number(price),
        amount: Number(amount),
        side,
        leverage,
        orderType,
        notes:
          notes.trim() || `Admin created ${side} trade for ${tradePairFull}`,
      };

      const response = await fetch(API_ENDPOINT.TRADERS.TRADER_TRADER, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tradeData),
      });

      if (response.status === 201) {
        setSuccess("Trade created successfully");
        setBaseAsset("BTC");
        setQuoteAsset("USDT");
        setPrice("");
        setAmount("");
        setNotes("");
      } else {
        throw new Error( "Failed to create trade.");
      }
    } catch (err) {
      console.error("Error creating trade:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalValue =
    price && amount ? (Number(price) * Number(amount)).toFixed(4) : "0";

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      setSuccess("");
    }, 5000);
    return () => clearTimeout(timeOutId);
  }, [success]);

  if(!isOpen) return null;
  return (
   <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
  <div className="bg-[#0b101a] rounded-lg p-4 w-full max-w-md mx-4 text-white max-h-[80vh] overflow-y-auto">
   <div className="flex justify-between items-center mb-4">
     <h2 className="text-xl font-bold mb-4 text-center text-white">
      Create Trade for Trader
    </h2>
     <button  onClick={onClose}> <X/></button>
   </div>

    {error && (
      <div className="p-2 mb-3 text-sm text-red-400 bg-red-900/30 rounded">
        {error}
      </div>
    )}
    {success && (
      <div className="p-2 mb-3 text-sm text-green-400 bg-green-900/30 rounded">
        {success}
      </div>
    )}

    <form onSubmit={handelSumbit} className="space-y-3">
      {/* Trader ID */}
      <div>
        <label htmlFor="tradeId" className="block text-xs font-medium text-gray-400">
          Trader ID *
        </label>
        <input
          type="text"
          id="tradeId"
          value={traderId}
          onChange={(e) => setTraderId(e.target.value)}
          className="mt-1 block w-full rounded-md bg-[#10131F] border border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
          placeholder="Enter Trader ID"
          required
        />
      </div>

      {/* Asset Selection */}
      <div className="flex space-x-3">
        <div className="w-1/2">
          <label htmlFor="baseAsset" className="block text-xs font-medium text-gray-400">
            Base Asset
          </label>
          <select
            id="baseAsset"
            value={baseAsset}
            onChange={(e) => setBaseAsset(e.target.value)}
            className="mt-1 block w-full rounded-md bg-[#10131F] border border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
          >
            {Object.keys(SYMBOL_TO_FULL_NAME).map((symbol) => (
              <option value={symbol} key={symbol} className="bg-[#10131F] text-white">
                {SYMBOL_TO_FULL_NAME[symbol]} ({symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="w-1/2">
          <label htmlFor="quoteAsset" className="block text-xs font-medium text-gray-400">
            Quote Asset
          </label>
          <select
            id="quoteAsset"
            value={quoteAsset}
            onChange={(e) => setQuoteAsset(e.target.value)}
            className="mt-1 block w-full rounded-md bg-[#10131F] border border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
          >
            {Object.keys(SYMBOL_TO_FULL_NAME).map((symbol) => (
              <option key={symbol} value={symbol} className="bg-[#10131F] text-white">
                {SYMBOL_TO_FULL_NAME[symbol]} ({symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Trade Pair Display */}
      <div className="p-2 bg-blue-900/20 rounded text-center">
        <span className="text-xs text-gray-400">Trade Pair: </span>
        <span className="font-medium text-white text-sm">{tradePairFull}</span>
      </div>

      {/* Price and Amount */}
      <div className="flex space-x-3">
        <div className="w-1/2">
          <label htmlFor="price" className="block text-xs font-medium text-gray-400">
            Price ({quoteAsset}) *
          </label>
          <input
            type="number"
            id="price"
            value={isPriceLoading ? "Loading..." : price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-md bg-[#10131F] border border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
            placeholder={isPriceLoading ? "Fetching..." : "0.00"}
            step="0.00000001"
            disabled={isPriceLoading}
            required
          />
        </div>
        <div className="w-1/2">
          <label htmlFor="amount" className="block text-xs font-medium text-gray-400">
            Amount ({baseAsset}) *
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md bg-[#10131F] border border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
            placeholder="0.00"
            step="0.00000001"
            required
          />
        </div>
      </div>

      {/* Total Value Display */}
      {price && amount && (
        <div className="p-2 bg-blue-900/20 rounded text-xs">
          <div className="flex justify-between text-white">
            <span>Total Value:</span>
            <span>{totalValue} {quoteAsset}</span>
          </div>
        </div>
      )}

      {/* Side Selection */}
      <div>
        <label className="block text-xs font-medium text-gray-400">Side *</label>
        <div className="mt-1 flex space-x-3">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-green-500 h-3 w-3"
              name="side"
              value="BUY"
              checked={side === 'BUY'}
              onChange={() => setSide('BUY')}
            />
            <span className="ml-1 text-green-500 text-sm">BUY</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-red-500 h-3 w-3"
              name="side"
              value="SELL"
              checked={side === 'SELL'}
              onChange={() => setSide('SELL')}
            />
            <span className="ml-1 text-red-500 text-sm">SELL</span>
          </label>
        </div>
      </div>

      {/* Leverage and Order Type */}
      <div className="flex space-x-3">
        <div className="w-1/2">
          <label htmlFor="leverage" className="block text-xs font-medium text-gray-400">
            Leverage
          </label>
          <select
            id="leverage"
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="mt-1 block w-full rounded-md bg-[#10131F] border border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
          >
            {[1, 5, 10, 20, 50, 100, 500].map(value => (
              <option key={value} value={value} className="bg-[#10131F] text-white">
                {value}x
              </option>
            ))}
          </select>
        </div>
        <div className="w-1/2">
          <label htmlFor="orderType" className="block text-xs font-medium text-gray-400">
            Order Type
          </label>
          <select
            id="orderType"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="mt-1 block w-full rounded-md bg-[#10131F] border border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
          >
            <option value="MARKET" className="bg-[#10131F] text-white">Market</option>
            <option value="LIMIT" className="bg-[#10131F] text-white">Limit</option>
            <option value="STOP_LIMIT" className="bg-[#10131F] text-white">Stop-Limit</option>
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-xs font-medium text-gray-400">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 block w-full rounded-md bg-[#10131F] border border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
          placeholder="Add any notes about this trade..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
        disabled={loading || isPriceLoading}
      >
        {loading ? 'Creating Trade...' : 'Create Trade for Trader'}
      </button>
    </form>
  </div>
</div>
  );
};

export default CreateTrade;
