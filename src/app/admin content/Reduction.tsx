// components/Reduction.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { getAuthToken } from '../utils/auth'
import { API_ENDPOINT } from '../config/api'
import { ChevronDown } from 'lucide-react'
import { Transaction } from "../type/transctions";

interface ReductionProps {
  userId?: string;
}

interface TransactionSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  lastDeposit: number;
  lastWithdrawal: number;
  lastDepositTime: string | null;
  lastWithdrawalTime: string | null;
}

const Reduction: React.FC<ReductionProps> = ({ userId }) => {
  const [expanded, setExpanded] = useState(true);
  const [summary, setSummary] = useState<TransactionSummary | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = getAuthToken()
      setLoading(true)
      setError(null)
      
      if (!token) {
        setError("Authentication failed.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(API_ENDPOINT.TRANSACTION.GET_TRANSACTIONS, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch transactions: ${response.statusText}`)
        }

        const result = await response.json() 
        
        const transactionData = result.data || result.transactions || result
        console.log('Transaction data:', transactionData); 

        if (Array.isArray(transactionData)) {
          // Filter transactions by userId if provided
          const userTransactions = userId 
            ? transactionData.filter((t: Transaction) => t.userId === userId)
            : transactionData;
          
          console.log('Filtered transactions:', userTransactions); 
          
          // Calculate summary
          const calculatedSummary = calculateTransactionSummary(userTransactions)
          console.log('Calculated summary:', calculatedSummary); 
          
          setSummary(calculatedSummary)
        } else {
          throw new Error('Invalid transactions data format')
        }
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : 'Failed to load transactions')
      } finally {
        setLoading(false)
      }
    }
    
    fetchTransactions()
  }, [userId])

  // Function to calculate the summary
  const calculateTransactionSummary = (transactions: Transaction[]): TransactionSummary => {
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let lastDeposit = 0;
    let lastWithdrawal = 0;
    let lastDepositTime: string | null = null;
    let lastWithdrawalTime: string | null = null;

    const depositTypes = ['DEPOSIT', 'SIGNALS', 'STAKING', 'SUBSCRIPTION'];

    // Sort transactions by date to find the last ones (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );


    // Calculate totals and find last transactions
    for (const transaction of sortedTransactions) {
      console.log('Processing transaction:', transaction); 
      
      if (depositTypes.includes(transaction.type)) {
        totalDeposits += transaction.amount;
        

        if (lastDeposit === 0) {
          lastDeposit = transaction.amount;
          lastDepositTime = transaction.createdAt;
          console.log('Found last deposit:', lastDeposit, lastDepositTime); 
        }
      } else if (transaction.type === 'WITHDRAWAL') {
        totalWithdrawals += transaction.amount;
        if (lastWithdrawal === 0) {
          lastWithdrawal = transaction.amount;
          lastWithdrawalTime = transaction.createdAt;
        }
      }
    }

    return {
      totalDeposits,
      totalWithdrawals,
      lastDeposit,
      lastWithdrawal,
      lastDepositTime,
      lastWithdrawalTime
    };
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading transactions...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold">Deposit & Withdrawal</h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="cursor-pointer"
        >
          <ChevronDown
            className={`w-5 h-5 text-gray-400 ${
              expanded ? "rotate-0" : "rotate-180"
            }`}
          />
        </button>
      </div>
      
      {expanded && summary && (
        <div className="bg-[#141E323D] border border-[#141E32] rounded-lg p-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Deposit */}
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Deposit</p>
              <p className="text-2xl font-bold">${summary.totalDeposits.toFixed(2)}</p>
            </div>
            
            {/* Total Withdrawal */}
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Withdrawal</p>
              <p className="text-2xl font-bold">${summary.totalWithdrawals.toFixed(2)}</p>
            </div>
            
            {/* Last Deposit */}
            <div>
              <p className="text-gray-400 text-sm mb-1">Last Deposit</p>
              <p className="text-2xl font-bold text-emerald-400">
                ${summary.lastDeposit.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(summary.lastDepositTime)}
              </p>
            </div>
            
            {/* Last Withdrawal */}
            <div>
              <p className="text-gray-400 text-sm mb-1">Last Withdrawal</p>
              <p className="text-2xl font-bold">
                ${summary.lastWithdrawal.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(summary.lastWithdrawalTime)}
              </p>
            </div>
          </div>
        </div>
      )}

      {expanded && !summary && !loading && !error && (
        <div className="bg-[#141E323D] border border-[#141E32] rounded-lg p-6 w-full">
          <p className="text-gray-400 text-center">No transaction data available</p>
        </div>
      )}
    </div>
  )
}

export default Reduction