'use client'
import Image from "next/image";
import {  Star } from "lucide-react";
import { PiUsersThree } from "react-icons/pi";
import { BiSolidUpArrow } from "react-icons/bi";

interface ChartData {
  minValue: number;
  maxValue: number;
  dataPoints: number[];
}
interface TraderProfile {
  id: number;
  name: string;
  completedOrders: string;
  completionRate: string;
  profitPercentage: string;
  totalPnL: string;
  closedPnL: string;
  openPnL: string;
  customers: {
    all: number;
    last30Days: number;
  };
  online: boolean;
  verified: boolean;
  eps: number;
  roe: number;
  pnl: number;
  win: number;
  lose: number;
  traderType: string;
  country: string;
  image: string;
}
interface GenerateChartDataFn {
  (id: number, currentValue: number): ChartData;
}

const generateChartData: GenerateChartDataFn = (id, currentValue) => {
  const minValue: number = 0.1;
  const maxValue: number = 50 + (id % 50);
  const dataPoints: number[] = Array.from({ length: 10 }, (_, i) => {
    const progress = i / 9;
    const variation = ((id + i) % 10) * 0.02;
    return minValue + (currentValue - minValue) * progress * (0.9 + variation);
  });

  return { minValue, maxValue, dataPoints };
};

const CopyProfiles:TraderProfile[] = [
  {
    id: 1,
    name: 'Mr_poFit',
    completedOrders: "107/200",
    completionRate: '98.5%',
    profitPercentage: '+42.13%',
    totalPnL: '$163,152.56',
    closedPnL: '$36,542.36',
    openPnL: '$33,942.76',
    customers: {
      all: 1728,
      last30Days: 147
    },
    online: true,
    verified: true,
    eps: 3,
    roe: 0,
    pnl: 2,
    win:12,
    lose:4,
    traderType:'Expert',
    country:'Germany',
    image:'',
  },
  {
    id: 2,
    name: 'CryptoKing',
    completedOrders: "86/104",
    completionRate: '97.2%',
    profitPercentage: '+38.57%',
    totalPnL: '$142,931.45',
    closedPnL: '$31,842.72',
    openPnL: '$29,457.83',
    customers: {
      all: 1532,
      last30Days: 132
    },
    online: true,
    verified: true,
    eps: 2,
    roe: 1,
    pnl: 3,
    win:16,
    lose:2,
    traderType:'Professional',
    country:'UK',
    image:'',
  },
  {
    id: 3,
    name: 'BitWhale',
    completedOrders: "125/130",
    completionRate: '99.1%',
    profitPercentage: '+45.89%',
    totalPnL: '$187,423.68',
    closedPnL: '$41,235.47',
    openPnL: '$38,721.92',
    customers: {
      all: 1892,
      last30Days: 163
    },
    online: true,
    verified: true,
    eps: 4,
    roe: 0,
    pnl: 3,
    win:10,
    lose:3,
    traderType:'Expert',
    country:'UK',
    image:'',
  },
]
const CopyPerson = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-13">

    <h2 className="text-xl mb-3">Manage Copy Traders</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CopyProfiles.map((copy) => {
          const { minValue, maxValue, dataPoints } = generateChartData(copy.id, parseFloat(copy.profitPercentage.replace('%', '')));
          
          return (
            <div
              key={copy.id}
              className="bg-[#141E32]/25 border border-[#1E2A4A] rounded-xl overflow-hidden p-4 hover:border-[#2A3A5F] transition-all duration-300 hover:shadow-lg hover:shadow-[#1E2A4A]/20 cursor-pointer group"
            >
              {/* Profile Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#2A3A5F] to-[#1E2A4A] rounded-full overflow-hidden flex items-center justify-center">
                      <Image
                        src={copy.image || "/img/Avatar DP.png"}
                        alt={copy.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {copy.online && (
                      <div className="absolute -right-0.5 -bottom-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#141E32]"></div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium group-hover:text-[#F2AF29] transition-colors">
                        {copy.name}
                      </h3>
                      {copy.verified && (
                        <span className="text-[#439A86] text-xs bg-[#439A86]/10 px-1.5 py-0.5 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{copy.traderType}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{copy.country}</span>
                    </div>
                  </div>
                </div>

                <button className="text-gray-400 hover:text-[#F2AF29] transition-colors">
                  <Star size={18} fill={copy.eps > 3 ? "#F2AF29" : "transparent"} />
                </button>
              </div>

              {/* Stats Row */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <PiUsersThree className="text-gray-400" size={14} />
                  <span className="text-gray-300">{copy.customers.last30Days} new</span>
                </div>
                
                <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                  <BiSolidUpArrow size={12} />
                  <span>{copy.profitPercentage}</span>
                </div>
              </div>

              {/* Chart Section */}
              <div className="relative h-24 mb-6 bg-[#1E2A4A]/30 rounded-lg p-2">
                <div className="absolute inset-0 flex flex-col justify-between text-[8px] text-gray-500 px-1 py-2">
                  <span>{maxValue.toFixed(1)}</span>
                  <span>{minValue.toFixed(1)}</span>
                </div>
                
                <svg viewBox="0 0 100 40" className="w-full h-full">
                  <defs>
                    <linearGradient id={`gradient-${copy.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area fill */}
                  <path
                    d={`M0,40 ${dataPoints.map((value, i) => {
                      const x = i * 10;
                      const y = 40 - ((value - minValue) / (maxValue - minValue)) * 35;
                      return `L${x},${y}`;
                    }).join(' ')} L100,40 Z`}
                    fill={`url(#gradient-${copy.id})`}
                  />
                  
                  {/* Line */}
                  <path
                    d={`M0,40 ${dataPoints.map((value, i) => {
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

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-[#1E2A4A]/50 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400 mb-1">Win Rate</div>
                  <div className="text-white font-medium">
                    {Math.round((copy.win / (copy.win + copy.lose)) * 100)}%
                  </div>
                </div>
                <div className="bg-[#1E2A4A]/50 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400 mb-1">Completed</div>
                  <div className="text-white font-medium">{copy.completionRate}</div>
                </div>
                <div className="bg-[#1E2A4A]/50 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400 mb-1">ROI 30D</div>
                  <div className="text-green-500 font-medium">{copy.profitPercentage}</div>
                </div>
              </div>

              {/* PnL Details */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total PnL</span>
                  <span className="text-white font-medium">{copy.totalPnL}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Closed PnL</span>
                  <span className="text-white font-medium">{copy.closedPnL}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Open PnL</span>
                  <span className="text-white font-medium">{copy.openPnL}</span>
                </div>
              </div>

              {/* Copy Button */}
              <button
                className="w-full py-3 bg-gradient-to-r from-[#F2AF29] to-[#E6A522] hover:from-[#E6A522] hover:to-[#D99C1F] text-[#01040F] font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-[#F2AF29]/20"
              >
                Edit
              </button>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default CopyPerson
