// components/DepositHistory.tsx
'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { getAuthToken } from '../utils/auth'
import { API_ENDPOINT } from '../config/api'
import { Transaction, TransactionStatus } from '../type/transctions'
import { Search, Filter, ChevronDown, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DepositHistoryProps {
  transactionId?: string;
  showBackButton?: boolean;
}

const DepositHistory: React.FC<DepositHistoryProps> = ({ 
  transactionId, 
  showBackButton = false 
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<TransactionStatus>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const router = useRouter()

  const fetchTransactions = useCallback(async () => {
    const token = getAuthToken()
    setLoading(true)
    setError(null)

    if (!token) {
      setError("Authentication failed.")
      setLoading(false)
      return
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

      if (Array.isArray(transactionData)) {
        let filteredData = transactionData.filter((t: Transaction) =>
          ['DEPOSIT', 'SIGNALS', 'STAKING', 'SUBSCRIPTION'].includes(t.type)
        )
        
        // If transactionId is provided, show only that specific transaction
        if (transactionId) {
          filteredData = filteredData.filter((t: Transaction) => 
            t.id === transactionId
          )
        }
        
        setTransactions(filteredData)
        setFilteredTransactions(filteredData)
      } else {
        throw new Error('Invalid transactions data format')
      }
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [transactionId])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => {
    let filtered = transactions

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date()
      const filterDate = new Date(today)
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(t => new Date(t.createdAt).toDateString() === today.toDateString())
          break
        case 'week':
          filterDate.setDate(today.getDate() - 7)
          filtered = filtered.filter(t => new Date(t.createdAt) >= filterDate)
          break
        case 'month':
          filterDate.setMonth(today.getMonth() - 1)
          filtered = filtered.filter(t => new Date(t.createdAt) >= filterDate)
          break
      }
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.amount.toString().includes(searchTerm) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, statusFilter, dateFilter])

  const getStatusBadge = (status: Transaction['status']) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    }

    const badgeClass = statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        {(status ?? 'unknown').toUpperCase()}
      </span>
    )
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
        console.error(error)
      return 'Invalid date'
    }
  }

/*   const exportToCSV = () => {
    const headers = ['ID', 'Amount', 'Currency', 'Type', 'Status', 'Created', 'Description']
    const csvData = filteredTransactions.map(t => [
      t.id,
      t.amount,
      t.currency,
      t.type,
      t.status,
      formatDateTime(t.createdAt),
      t.description || ''
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `deposit-details-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }
 */
  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading transaction details...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-700">{error}</div>
        <button
          onClick={fetchTransactions}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="bg-[#141E323D] border border-[#141E32] rounded-lg shadow mt-6">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft size={20} />
                Back
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              {transactionId ? 'Transaction Details' : 'Deposit History'}
            </h2>
          </div>
          
         
        </div>

        {/* Show filters only if not viewing single transaction */}
        {!transactionId && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TransactionStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <Filter className="w-12 h-12 text-gray-300 mb-2" />
                    <p>No transactions found</p>
                    {transactionId && <p className="text-sm mt-1">Transaction ID: {transactionId}</p>}
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${transaction.amount.toFixed(2)} {transaction.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {transaction.type.toLowerCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(transaction.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction.description || 'No description'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredTransactions.length > 0 && !transactionId && (
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DepositHistory