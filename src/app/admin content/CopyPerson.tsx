'use client'
import Image from "next/image";
import { Star } from "lucide-react";
import { PiUsersThree } from "react-icons/pi";
import { BiSolidUpArrow } from "react-icons/bi";
import { API_ENDPOINT } from "../config/api";
import { useEffect, useState } from "react";
import { getAuthToken } from "../utils/auth";
import EditTraderModal from "./modal/EditTraderModal";
import { Trader, ChartData, Trade } from '../type/trader'; 

const generateChartData = (id: string, currentValue: number): ChartData => {
  const minValue: number = 0.1;
  const hash = id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const maxValue: number = 50 + (hash % 50);
  const dataPoints: number[] = Array.from({ length: 10 }, (_, i: number) => { 
    const progress = i / 9;
    const variation = ((hash + i) % 10) * 0.02;
    return minValue + (currentValue - minValue) * progress * (0.9 + variation);
  });

  return { minValue, maxValue, dataPoints };
};

const CopyPerson = () => {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTrader, setEditingTrader] = useState<Trader | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTraders = async () => {
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
          const mappedTraders: Trader[] = result.data.traders.map((trader: Record<string, unknown>) => ({ 
            id: trader.id as string,
            username: (trader.username as string) || 'Unknown',
            profilePicture: (trader.profilePicture as string) || "/img/Avatar DP.png",
            bio: (trader.bio as string) || 'No bio available', 
            status: (trader.status as Trader['status']) || 'PAUSED',
            maxCopiers: (trader.maxCopiers as number) || 0,
            currentCopiers: (trader.currentCopiers as number) || 0,
            totalCopiers: (trader.totalCopiers as number) || 0,
            totalPnL: (trader.totalPnL as number) || 0,
            copiersPnL: (trader.copiersPnL as number) || 0,
            aum: (trader.aum as number) || 0,
            riskScore: (trader.riskScore as number) || 0,
            badges: (trader.badges as string[]) || [],
            isVerified: (trader.isVerified as boolean) || false,
            isPublic: trader.isPublic as boolean ?? true,
            commissionRate: (trader.commissionRate as number) || 0,
            minCopyAmount: (trader.minCopyAmount as number) || 0,
            maxCopyAmount: trader.maxCopyAmount as number | undefined,
            tradingPairs: (trader.tradingPairs as string[]) || [],
            followers: (trader.followers as Trader['followers']) || [], 
            performances: (trader.performances as Trader['performances']) || [],
            trades: (trader.trades as Trader['trades']) || [],
            socialMetrics: (trader.socialMetrics as Trader['socialMetrics']),
            favoritedBy: (trader.favoritedBy as Trader['favoritedBy']) || [],
            actualTrades: (trader.actualTrades as Trade[]) || [],
            createdAt: new Date(trader.createdAt as string),
            updatedAt: new Date(trader.updatedAt as string),
            copied: false,
            favorited: (trader.favoritedBy as unknown[] || []).length > 0, 
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
    fetchTraders();
  }, []);

  const handleEdit = (trader: Trader) => {
    setEditingTrader(trader);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedTrader: Trader) => {
    const token = getAuthToken();
    setIsSaving(true);
    
    try {
      const payload = {
        profilePicture: updatedTrader.profilePicture,
        bio: updatedTrader.bio, 
        status: updatedTrader.status,
        maxCopiers: updatedTrader.maxCopiers,
        isVerified: updatedTrader.isVerified, 
        isPublic: updatedTrader.isPublic,
        commissionRate: updatedTrader.commissionRate,
        minCopyAmount: updatedTrader.minCopyAmount,
        maxCopyAmount: updatedTrader.maxCopyAmount,
        tradingPairs: updatedTrader.tradingPairs,
        badges: updatedTrader.badges,
      };

      const response = await fetch(API_ENDPOINT.TRADERS.EDIT_TRADERS.replace("{traderId}", updatedTrader.id), {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to edit trader: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (result.data) {
        setTraders(prevTraders => prevTraders.map(trader => 
          trader.id === result.data.id ? { 
            ...result.data, 
            copied: trader.copied, 
            favorited: trader.favorited 
          } : trader
        ));
        setIsEditModalOpen(false);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Failed to edit trader', err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-white text-center py-8">Loading traders...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">Error: {error}</div>;
  }

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-13">
       <h2 className="text-xl mb-6 font-semibold text-white">Manage Copy Traders</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {traders.length > 0 ? (
           traders.map((trader) => {
             const aum = trader.aum || 1;
             const profitPercentage = aum > 0 ? ((trader.totalPnL || 0) / aum) * 100 : 0;
             
             const actualTrades = trader.actualTrades || [];
             const closedTrades = actualTrades.filter((t: Trade) => t.status === "CLOSED");
             const winRate = actualTrades.length > 0 ? 
               (closedTrades.length / actualTrades.length) * 100 : 0;
             
             const { minValue, maxValue, dataPoints } = generateChartData(trader.id, profitPercentage);
             const completionRate = '99.1%'; 
             const country = 'USA'; 
             const traderType = 'Expert'; 

             return (
               <div
                 key={trader.id}
                 className="bg-[#141E32]/25 border border-[#1E2A4A] rounded-xl overflow-hidden p-4 hover:border-[#2A3A5F] transition-all duration-300 hover:shadow-lg hover:shadow-[#1E2A4A]/20 cursor-pointer group flex flex-col justify-between h-full"
               >
                 <div className="flex-grow">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                       <div className="relative">
                         <div className="w-12 h-12 bg-gradient-to-br from-[#2A3A5F] to-[#1E2A4A] rounded-full overflow-hidden flex items-center justify-center">
                           <Image
                             src={trader.profilePicture || "/img/Avatar DP.png"}
                             alt={trader.username}
                             width={48}
                             height={48}
                             className="w-full h-full object-cover"
                             unoptimized
                           />
                         </div>
                         {trader.status === "ACTIVE" && (
                           <div className="absolute -right-0.5 -bottom-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#141E32]"></div>
                         )}
                       </div>

                       <div>
                         <div className="flex items-center gap-2">
                           <h3 className="text-white font-medium group-hover:text-[#F2AF29] transition-colors">
                             {trader.username}
                           </h3>
                           {trader.badges?.includes("Verified") && (
                             <span className="text-[#439A86] text-xs bg-[#439A86]/10 px-1.5 py-0.5 rounded">
                               Verified
                             </span>
                           )}
                         </div>
                         <div className="flex items-center gap-2 mt-1">
                           <span className="text-xs text-gray-400">{traderType}</span>
                           <span className="text-xs text-gray-400">•</span>
                           <span className="text-xs text-gray-400">{country}</span>
                         </div>
                       </div>
                     </div>

                     <button className="text-gray-400 hover:text-[#F2AF29] transition-colors">
                       <Star size={18} fill={(trader.favoritedBy || []).length > 0 ? "#F2AF29" : "transparent"} />
                     </button>
                   </div>

                   <div className="flex justify-between items-center mb-6">
                     <div className="flex items-center gap-2 text-sm">
                       <PiUsersThree className="text-gray-400" size={14} />
                       <span className="text-gray-300">{trader.totalCopiers || 0} total copiers</span>
                     </div>

                     <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                       <BiSolidUpArrow size={12} />
                       <span>{profitPercentage.toFixed(2)}%</span>
                     </div>
                   </div>

                   <div className="relative h-24 mb-6 bg-[#1E2A4A]/30 rounded-lg p-2">
                     <div className="absolute inset-0 flex flex-col justify-between text-[8px] text-gray-500 px-1 py-2">
                       <span>{maxValue.toFixed(1)}%</span>
                       <span>{minValue.toFixed(1)}%</span>
                     </div>

                     <svg viewBox="0 0 100 40" className="w-full h-full">
                       <defs>
                         <linearGradient id={`gradient-${trader.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                           <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                           <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                         </linearGradient>
                       </defs>

                       <path
                         d={`M0,40 ${dataPoints.map((value: number, i: number) => {
                           const x = i * 10;
                           const y = 40 - ((value - minValue) / (maxValue - minValue)) * 35;
                           return `L${x},${y}`;
                         }).join(' ')} L100,40 Z`}
                         fill={`url(#gradient-${trader.id})`}
                       />

                       <path
                         d={`M0,40 ${dataPoints.map((value: number, i: number) => {
                           const x = i * 10;
                           const y = 40 - ((value - minValue) / (maxValue - minValue)) * 35;
                           return `L${x},${y}`;
                         }).join(' ')}`}
                         stroke="#10B981"
                         strokeWidth="1.5"
                         fill="none"
                       />
                     </svg>
                   </div>

                   <div className="grid grid-cols-3 gap-2 mb-6">
                     <div className="bg-[#1E2A4A]/50 rounded-lg p-2 text-center">
                       <div className="text-xs text-gray-400 mb-1">Win Rate</div>
                       <div className="text-white font-medium">
                         {winRate.toFixed(1)}%
                       </div>
                     </div>
                     <div className="bg-[#1E2A4A]/50 rounded-lg p-2 text-center">
                       <div className="text-xs text-gray-400 mb-1">Completed</div>
                       <div className="text-white font-medium">{completionRate}</div>
                     </div>
                     <div className="bg-[#1E2A4A]/50 rounded-lg p-2 text-center">
                       <div className="text-xs text-gray-400 mb-1">ROI 30D</div>
                       <div className="text-green-500 font-medium">{profitPercentage.toFixed(2)}%</div>
                     </div>
                   </div>

                   <div className="space-y-2 mb-6">
                     <div className="flex justify-between text-sm">
                       <span className="text-gray-400">Total PnL</span>
                       <span className="text-white font-medium">${(trader.totalPnL || 0).toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                       <span className="text-gray-400">Closed PnL</span>
                       <span className="text-white font-medium">${(trader.copiersPnL || 0).toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                       <span className="text-gray-400">Open PnL</span>
                       <span className="text-white font-medium">${((trader.totalPnL || 0) - (trader.copiersPnL || 0)).toFixed(2)}</span>
                     </div>
                   </div>
                 </div>

                 <div>
                   <button
                     onClick={() => handleEdit(trader)}
                     className="w-full py-3 bg-gradient-to-r from-[#F2AF29] to-[#E6A522] hover:from-[#E6A522] hover:to-[#D99C1F] text-[#01040F] font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-[#F2AF29]/20"
                   >
                     Edit
                   </button>
                 </div>
               </div>
             );
           })
         ) : (
           <p className="col-span-3 text-center text-gray-400 py-12">No traders found.</p>
         )}
       </div>
       <EditTraderModal
         trader={editingTrader}
         isOpen={isEditModalOpen}
         onClose={() => setIsEditModalOpen(false)}
         onSave={handleSaveEdit}
         isLoading={isSaving}
       />
     </div>
  );
};

export default CopyPerson;