'use client'
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react'
import { API_ENDPOINT } from '../config/api';
import { getAuthToken } from '../utils/auth';
import Image from 'next/image';
import { CircleCheck, UploadIcon} from "lucide-react";

interface UserDetails {
  id: string;
  fullName: string;
  email: string;
}

interface TransactionDetails {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  user: UserDetails;
}

const WithdrawalDetails: React.FC = () => {
  const params = useParams();
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const transactionId = params.id as string;

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      // Reset states
      setLoading(true);
      setError(null);
      setTransactionDetails(null);

      if (!transactionId) {
        setError("Transaction ID not found in URL.");
        setLoading(false);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        setError("Authentication failed. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching transaction with ID:", transactionId);
        
        let foundTransaction: TransactionDetails | undefined = undefined;
        let currentPage = 1;
        let hasMorePages = true;
        
        while (hasMorePages && !foundTransaction) {
            const url = `${API_ENDPOINT.TRANSACTION.GET_TRANSACTIONS}?page=${currentPage}&limit=50`; 
            
            const response = await fetch(url, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (!response.ok) {
              const errorResult = await response.json();
              throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Check if the response contains transaction data and pagination info
            const transactionsArray = result.data?.transactions || result.data || [];
            
            if (Array.isArray(transactionsArray)) {
                // Search for the transaction in the current page
                const foundInPage = transactionsArray.find((t: TransactionDetails) => t.id === transactionId);
                
                if (foundInPage) {
                    foundTransaction = foundInPage;
                } else {
                    hasMorePages = result.pagination?.hasNextPage || false;
                    if (hasMorePages) {
                        currentPage++;
                    }
                }
            } else {
                console.warn("Unexpected response structure or no transactions:", result);
                hasMorePages = false; 
            }
        }

        if (!foundTransaction) {
          throw new Error(`Transaction with ID ${transactionId} not found.`);
        }

        console.log("Found transaction:", foundTransaction);
        setTransactionDetails(foundTransaction);

      } catch (err) {
        console.error("Error fetching transaction details:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      fetchTransactionDetails();
    }
  }, [transactionId]);

   // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleExport = () => {
    setExporting(true);
    // Simulate export process
    setTimeout(() => {
      setExporting(false);
      alert(`User data for ${transactionDetails?.user.fullName} exported successfully!`);
    }, 1500);
  };
  
  if (!transactionDetails) {
    return (
      <div className="text-center text-gray-400">
        No details found for this transaction.
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Transaction Details</h1>
        <div className="bg-[#141E323D] border border-[#141E32] rounded-lg p-6 w-full flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src="/image/Image-60.png"
                    alt="avatar"
                    height={100}
                    width={100}
                    className="rounded-full border-2 border-[#439A86] object-cover"
                  />
                </div>

                <div className="text-[#E4E4E4] flex flex-col gap-1">
                 {/*  <h2 className="text-2xl font-bold">
                    {transactionDetails.user.fullName}
                  </h2>
 */}
                  <div className="flex items-center gap-2">
                   {/*  <Mail size={14} className="text-[#797A80]" />
                    <p>{transactionDetails.user.email}</p> */}
                  </div>

                  <div className="bg-[#439A861F] text-[#439A86] w-fit px-3 py-1.5 flex items-center gap-1.5 rounded-md mt-2">
                    <CircleCheck size={14} />
                    <span>Verified User</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-12">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[#E8E8E880] text-sm uppercase">UID</h3>
                  <p className="text-lg font-medium">{transactionDetails.id}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-[#E8E8E880] text-sm">
                    Type of Transaction
                  </h3>
                  <p className="text-lg font-medium">
                    {transactionDetails.type}
                  </p>
                </div>
                
                <div className="flex flex-col gap-1">
                  <h3 className="text-[#E8E8E880] text-sm">Amount</h3>
                  <p className="text-lg font-medium">
                    ${transactionDetails.amount.toFixed(2)}
                  </p>
                </div>
                
                <div className="flex flex-col gap-1">
                  <h3 className="text-[#E8E8E880] text-sm">Status</h3>
                  <p className="text-lg font-medium">
                    {transactionDetails.status}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="bg-[#F2AF29] hover:bg-[#e5a524] text-white font-medium w-full md:w-[150px] h-[44px] rounded-md flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
              ) : (
                <>
                  <p>Export</p>
                  <UploadIcon size={16} />
                </>
              )}
            </button>
          </div>
        </div>

       {/*  <div className='pt-3'>
            <Reduction userId={transactionDetails?.user.id}/>
        </div>
        <div>
            <DepositHistory transactionId={params.id as string}
    showBackButton={true} />
        </div> */}
    </div>
  );
};

export default WithdrawalDetails;