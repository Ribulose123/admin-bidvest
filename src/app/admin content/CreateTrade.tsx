'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINT } from '../config/api';

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

const CreateTrade = () => {
    const [traderId, setTraderId] = useState('');
    const [baseAsset, setBaseAsset] = useState('BTC');
    const [quoteAsset, setQuoteAsset] = useState('USDT');
    const [price, setPrice] = useState<number | string>('');
    const [amount, setAmount] = useState<number | string>('');
    const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
    const [leverage, setLeverage] = useState<number>(1);
    const [orderType, setOrderType] = useState('MARKET');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPriceLoading, setIsPriceLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch price from CoinGecko whenever the baseAsset or quoteAsset changes
    useEffect(() => {
        const fetchPrice = async () => {
            if (!baseAsset || !quoteAsset) return;

            setIsPriceLoading(true);
            setError('');
            setPrice('');

            try {
                const coinId = SYMBOL_TO_COINGECKO_ID[baseAsset];
                const vsCurrency = SYMBOL_TO_COINGECKO_ID[quoteAsset] || quoteAsset.toLowerCase();
                
                if (!coinId) {
                    setError(`Invalid base asset: ${baseAsset}`);
                    setIsPriceLoading(false);
                    return;
                }
                
                const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}`);
                
                const fetchedPrice = response.data[coinId]?.[vsCurrency];
                if (fetchedPrice) {
                    setPrice(fetchedPrice);
                } else {
                    setError(`Could not fetch price for ${baseAsset}/${quoteAsset}.`);
                }
            } catch (err: unknown) {
                console.error('Error fetching price from CoinGecko:', err);
                setError('Failed to fetch real-time price. Please enter it manually.');
            } finally {
                setIsPriceLoading(false);
            }
        };

        fetchPrice();
    }, [baseAsset, quoteAsset]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!traderId || !price || !amount) {
            setError('Please fill in all required fields.');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('Authentication token not found. Please log in again.');
                setLoading(false);
                return;
            }

            const tradeData: CreateTradeProps = {
                traderId,
                // Construct the tradePair string using CoinGecko IDs
                tradePair: `${SYMBOL_TO_COINGECKO_ID[baseAsset]}/${SYMBOL_TO_COINGECKO_ID[quoteAsset] || quoteAsset.toLowerCase()}`,
                price: Number(price),
                amount: Number(amount),
                side,
                leverage,
                orderType,
                notes,
            };

            const response = await axios.post(
                API_ENDPOINT.TRADERS.TRADER_TRADER,
                tradeData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 201) {
                setSuccess('Trade created successfully!');
                setAmount('');
                setPrice('');
                setNotes('');
            } else {
                throw new Error(response.data?.message || 'Failed to create trade.');
            }
        } catch (err: unknown) {
            console.error('Error creating trade:', err);
            if (axios.isAxiosError(err)) {
                const errorMessage = err.response?.data?.message || err.message || 'An error occurred.';
                setError(`Error: ${errorMessage}`);
            } else if (err instanceof Error) {
                setError(`Error: ${err.message}`);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    const quoteAssets = ['USDT', 'USDC', 'BTC', 'ETH'];

    return (
        <div className="p-8 max-w-lg mx-auto bg-[#141E323D] text-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Create a New Trade</h2>
            {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-900/30 rounded">{error}</div>}
            {success && <div className="p-3 mb-4 text-sm text-green-500 bg-green-900/30 rounded">{success}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="traderId" className="block text-sm font-medium text-gray-400">Trader ID</label>
                    <input
                        type="text"
                        id="traderId"
                        value={traderId}
                        onChange={(e) => setTraderId(e.target.value)}
                        className="mt-1 block w-full rounded-md bg-[#10131F] border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                        placeholder="Enter Trader ID"
                        required
                    />
                </div>
                <div className="flex space-x-4">
                    <div className="w-1/2">
                        <label htmlFor="baseAsset" className="block text-sm font-medium text-gray-400">Base Asset</label>
                        <select
                            id="baseAsset"
                            value={baseAsset}
                            onChange={(e) => setBaseAsset(e.target.value)}
                            className="mt-1 block w-full rounded-md bg-[#10131F] border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                        >
                            {Object.keys(SYMBOL_TO_COINGECKO_ID).map(symbol => (
                                <option key={symbol} value={symbol}>
                                    {symbol}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-1/2">
                        <label htmlFor="quoteAsset" className="block text-sm font-medium text-gray-400">Quote Asset</label>
                        <select
                            id="quoteAsset"
                            value={quoteAsset}
                            onChange={(e) => setQuoteAsset(e.target.value)}
                            className="mt-1 block w-full rounded-md bg-[#10131F] border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                        >
                            {quoteAssets.map(symbol => (
                                <option key={symbol} value={symbol}>
                                    {symbol}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex space-x-4">
                    <div className="w-1/2">
                        <label htmlFor="price" className="block text-sm font-medium text-gray-400">Price</label>
                        <input
                            type="number"
                            id="price"
                            value={isPriceLoading ? 'Loading...' : price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="mt-1 block w-full rounded-md bg-[#10131F] border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                            placeholder="e.g., 20000"
                            step="0.01"
                            disabled={isPriceLoading}
                            required
                        />
                    </div>
                    <div className="w-1/2">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-400">Amount</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="mt-1 block w-full rounded-md bg-[#10131F] border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                            placeholder="e.g., 0.5"
                            step="0.00000001"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Side</label>
                    <div className="mt-2 flex space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio text-green-500"
                                name="side"
                                value="BUY"
                                checked={side === 'BUY'}
                                onChange={() => setSide('BUY')}
                            />
                            <span className="ml-2 text-green-500">BUY</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio text-red-500"
                                name="side"
                                value="SELL"
                                checked={side === 'SELL'}
                                onChange={() => setSide('SELL')}
                            />
                            <span className="ml-2 text-red-500">SELL</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label htmlFor="leverage" className="block text-sm font-medium text-gray-400">Leverage</label>
                    <select
                        id="leverage"
                        value={leverage}
                        onChange={(e) => setLeverage(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md bg-[#10131F] border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                    >
                        <option value={1}>1x</option>
                        <option value={5}>5x</option>
                        <option value={10}>10x</option>
                        <option value={20}>20x</option>
                        <option value={50}>50x</option>
                        <option value={100}>100x</option>
                        <option value={500}>500x</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="orderType" className="block text-sm font-medium text-gray-400">Order Type</label>
                    <select
                        id="orderType"
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value)}
                        className="mt-1 block w-full rounded-md bg-[#10131F] border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                    >
                        <option value="MARKET">Market</option>
                        <option value="LIMIT">Limit</option>
                        <option value="STOP_LIMIT">Stop-Limit</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-400">Notes (optional)</label>
                    <textarea
                        id="notes"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1 block w-full rounded-md bg-[#10131F] border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                        placeholder="Add any notes about this trade..."
                    />
                </div>
                <button
                    type="submit"
                    className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    disabled={loading || isPriceLoading}
                >
                    {loading ? 'Creating Trade...' : 'Create Trade'}
                </button>
            </form>
        </div>
    );
};

export default CreateTrade;