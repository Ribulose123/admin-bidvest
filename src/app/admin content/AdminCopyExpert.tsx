"use client";
import React, { useEffect, useState } from "react";
import CopyTable from "./CopyTable";
import CopyPerson from "./CopyPerson";
import Usersdetails from "./Usersdetails";
import { getAuthToken } from "../utils/auth";
import { API_ENDPOINT } from "../config/api";

interface TraderFollower {
  id: string;
}

interface TraderPerformance {
  id: string;
}

interface TraderTrade {
  id: string;
}

interface TraderSocialMetrics {
  id: string;
}

interface UserFavoriteTrader {
  id: string;
}

interface Trade {
  id: string;
}

interface Trader {
  id: string;
  username: string;
  profilePicture?: string;
  status: "ACTIVE" | "PAUSED";
  maxCopiers: number;
  currentCopiers: number;
  totalCopiers: number;
  totalPnL: number;
  copiersPnL: number;
  aum: number;
  riskScore: number;
  badges?: string[];
  isPublic: boolean;
  commissionRate: number;
  minCopyAmount: number;
  maxCopyAmount?: number;
  tradingPairs: string[];
  followers: TraderFollower[];
  performances: TraderPerformance[];
  trades: TraderTrade[];
  socialMetrics?: TraderSocialMetrics;
  favoritedBy: UserFavoriteTrader[];
  actualTrades: Trade[];
  createdAt: Date;
  updatedAt: Date;
}

const copyData = {
  completionRate: "98.5%",
  profitPercentage: "+42.13%",
  totalPnL: "$163,152.56",
  openPnL: "$33,942.76",
  win: 12,
  lose: 4,
};

const AdminCopyExpert = () => {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrader = async () => {
      const token = getAuthToken();
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(API_ENDPOINT.TRADERS.GET_ALL_TRADERS, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch traders: ${response.status}`);
        }

        const result = await response.json();
        if (result.data && Array.isArray(result.data.traders)) {
          const mappedTraders = result.data.traders.map((trader: Trader) => ({
            ...trader,
            createdAt: new Date(trader.createdAt),
            updatedAt: new Date(trader.updatedAt),
          }));
          setTraders(mappedTraders);
        } else {
          throw new Error("Invalid data format received from API");
        }
      } catch (err) {
        console.error("Failed to fetch traders", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrader();
  }, []);

  if (isLoading) {
    return (
      <div className="mt-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-white">Loading traders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Failed</div>;
  }
  
  return (
    <div className="min-h-full p-4 sm:p-6 md:p-8 ">
      <div className="mx-auto max-w-7xl">
        <div className="mt-6">
          <CopyTable 
          copyTrade={traders}
          setTraders ={setTraders}
           />
        </div>

        <div className="mt-6">
          <CopyPerson />
        </div>

        <div className="mt-6">
          <Usersdetails copyData={copyData} />
        </div>
      </div>
    </div>
  );
};

export default AdminCopyExpert;