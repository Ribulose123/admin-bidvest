"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getAuthToken } from "../utils/auth";
import { API_ENDPOINT } from "../config/api";
import Image from "next/image";
import {
  CircleCheck,
  UploadIcon,
} from "lucide-react";
import Reduction from "./Reduction";
import DepositHistory from "./DepositHistory";

interface UserDetails {
  id: string;
  /* fullName: string;
  email: string; */
}

interface TransactionDetails {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  user: UserDetails;
}

const DepositDetails: React.FC = () => {
  const params = useParams();
  const [transactionDetails, setTransactionDetails] =
    useState<TransactionDetails | null>(null);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      const token = getAuthToken();
      const transactionId = params.id as string;

      if (!transactionId) {
        setError("Transaction ID not found in URL.");
        setLoading(false);
        return;
      }

      if (!token) {
        setError("Authentication failed.");
        setLoading(false);
        return;
      }

      try {
        const url = API_ENDPOINT.TRANSACTION.GET_TRANSACTIONS;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch transactions.");
        }

        let fetchedTransaction = null;

        if (result.data && Array.isArray(result.data)) {
          fetchedTransaction = result.data.find(
            (t: TransactionDetails) => t.id === transactionId
          );

          if (!fetchedTransaction) {
            fetchedTransaction = result.data.find(
              (t: TransactionDetails & { _id?: string }) =>
                t._id === transactionId
            );
          }
        }

        if (!fetchedTransaction) {
          throw new Error("Transaction not found.");
        }

        setTransactionDetails(fetchedTransaction);
      } catch (err) {
        console.error("Error fetching details:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [params.id]);

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
      alert(`User data for ${transactionDetails?.user} exported successfully!`);
    }, 1500);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Transaction Details</h1>
      {transactionDetails ? (
        /*  <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg mx-auto">
          <div className="space-y-4">
            <p><strong className="text-gray-400">Transaction ID:</strong> {transactionDetails.id}</p>
            <p><strong className="text-gray-400">Amount:</strong> ${transactionDetails.amount.toFixed(2)}</p>
            <p><strong className="text-gray-400">Type:</strong> {transactionDetails.type}</p>
            <p><strong className="text-gray-400">Status:</strong> {transactionDetails.status}</p>
            {transactionDetails.user && (
              <>
                <h2 className="text-xl font-semibold mt-6 mb-2">User Information</h2>
                <p><strong className="text-gray-400">User ID:</strong> {transactionDetails.user.id}</p>
                <p><strong className="text-gray-400">Name:</strong> {transactionDetails.user.fullName}</p>
                <p><strong className="text-gray-400">Email:</strong> {transactionDetails.user.email}</p>
              </>
            )}
          </div>
        </div> */
        <div className="bg-[#141E323D] border border-[#141E32] rounded-lg p-6 w-full flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1">
            {/* User details */}
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
                  {/* <div className="flex items-center gap-2">
                    <Mail size={14} className="text-[#797A80]" />
                    <p>{transactionDetails.user.email}</p>
                  </div> */}

                  {/* <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#797A80]" />
                  <p>{userData.location}</p>
                </div> */}

                  {/* <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[#797A80]" />
                  <p>{userData.phone}</p>
                </div> */}

                  <div className="bg-[#439A861F] text-[#439A86] w-fit px-3 py-1.5 flex items-center gap-1.5 rounded-md mt-2">
                    <CircleCheck size={14} />
                    <span>Verified User</span>
                  </div>

                  {/* <div className="flex flex-wrap gap-2 mt-3">
                  {userData.wallets.map((wallet, index) => (
                    <p
                      key={index}
                      className="bg-[#01BC8D0A] text-xs px-3 py-1.5 rounded-md"
                    >
                      {wallet}
                    </p>
                  ))}
                </div> */}
                </div>
              </div>

              <div className="flex gap-12">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[#E8E8E880] text-sm uppercase">UID</h3>
                  <p className="text-lg font-medium">{transactionDetails.id}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-[#E8E8E880] text-sm">
                    Type of Transctions
                  </h3>
                  <p className="text-lg font-medium">
                    {transactionDetails.type}
                  </p>
                </div>

                {/*  <div className="flex flex-col gap-1">
                <h3 className="text-[#E8E8E880] text-sm">Account status</h3>
                <p className="text-lg text-[#01BC8D] font-medium flex items-center gap-1.5">
                  {userData.status} <CircleCheck size={16} />
                </p>
              </div> */}
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
      ) : (
        <div className="text-center text-gray-400">
          No details found for this transaction.
        </div>
      )}

      <div className="pt-3">
        <Reduction userId ={transactionDetails?.user.id}/>
      </div>

      <div>
        <DepositHistory  transactionId={params.id as string}
    showBackButton={true}/>
      </div>
    </div>
  );
};

export default DepositDetails;
