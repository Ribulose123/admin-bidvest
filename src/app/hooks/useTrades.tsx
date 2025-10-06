// hooks/useTrades.ts
import { useState, useEffect, useCallback } from 'react';
import { getAuthToken } from '../utils/auth';
import { API_ENDPOINT } from '../config/api';
import { Trade } from '../type/transctions';

export const useTrades = (traderId?: string) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTrades = useCallback(async () => {
    const token = getAuthToken();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_ENDPOINT.TRADERS.GET_ALL_TRADES, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // First, check if the response is ok (status 200-299)
      if (!response.ok) {
        throw new Error(`Failed to fetch trades: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(result)
      let tradesArray;
      
      if (result.trades && Array.isArray(result.trades)) {
        tradesArray = result.trades;
      } else if (result.data && result.data.trades && Array.isArray(result.data.trades)) {
        // Case 2: trades array is nested under result.data.trades
        tradesArray = result.data.trades;
      } else if (result.data && Array.isArray(result.data)) {
        tradesArray = result.data;
      } else {
        console.error("Unexpected API response structure:", result);
        throw new Error('Invalid trades data format: Could not find trades array');
      }
      let filteredTrades = tradesArray;
      if (traderId) {
        filteredTrades = tradesArray.filter((trade: Trade) => 
          trade.traderId === traderId
        );
      }

      setTrades(filteredTrades);
      
    } catch (err) {
      console.error('Failed to fetch trades', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trades');
    } finally {
      setLoading(false);
    }
  }, [traderId]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return { trades, loading, error, refetch: fetchTrades };
};