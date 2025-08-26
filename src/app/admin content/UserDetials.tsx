"use client";
import {
  CircleCheck,
  UploadIcon,
  Mail,
  MapPin,
  Phone,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useState } from "react";

interface TradeData {
  id: string;
  pair: string;
  type: "Long" | "Short";
  amount: number;
  status: "Closed" | "Open";
  outcome: number;
  timestamp: string;
}
const UserDetails = () => {
  const params = useParams();
  const id = params.id as string;
  const [exporting, setExporting] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [selectedPage, setSelectedPage] = useState("All");
  const [selectedTradeType, setSelectedTradeType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const tradeHistory: TradeData[] = [
    {
      id: "TRD-0012837",
      pair: "BTC/USDT",
      type: "Long",
      amount: 5000,
      status: "Closed",
      outcome: 380.45,
      timestamp: "2025-05-22 14:34 UTC",
    },
    {
      id: "TRD-0012837",
      pair: "BTC/USDT",
      type: "Long",
      amount: 5000,
      status: "Closed",
      outcome: 380.45,
      timestamp: "2025-05-22 14:34 UTC",
    },
    {
      id: "TRD-0012837",
      pair: "BTC/USDT",
      type: "Long",
      amount: 5000,
      status: "Closed",
      outcome: 380.45,
      timestamp: "2025-05-22 14:34 UTC",
    },
  ];
  const userData = {
    name: "Nelson Peter",
    email: "nelsopeter@gmail.com",
    location: "England",
    phone: "+24566896643",
    wallets: ["MetaMask", "Trustwallet", "Phantom"],
    lastLogin: "2023-10-15T14:30:00Z",
    status: "Verified",
  };

  const handleExport = () => {
    setExporting(true);
    // Simulate export process
    setTimeout(() => {
      setExporting(false);
      alert(`User data for ${userData.name} exported successfully!`);
    }, 1500);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 w-full">
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
                <h2 className="text-2xl font-bold">{userData.name}</h2>

                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[#797A80]" />
                  <p>{userData.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#797A80]" />
                  <p>{userData.location}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[#797A80]" />
                  <p>{userData.phone}</p>
                </div>

                <div className="bg-[#439A861F] text-[#439A86] w-fit px-3 py-1.5 flex items-center gap-1.5 rounded-md mt-2">
                  <CircleCheck size={14} />
                  <span>Verified User</span>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {userData.wallets.map((wallet, index) => (
                    <p
                      key={index}
                      className="bg-[#01BC8D0A] text-xs px-3 py-1.5 rounded-md"
                    >
                      {wallet}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-12">
              <div className="flex flex-col gap-1">
                <h3 className="text-[#E8E8E880] text-sm uppercase">UID</h3>
                <p className="text-lg font-medium">{id}</p>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-[#E8E8E880] text-sm">Last login time</h3>
                <p className="text-lg font-medium">
                  {formatDate(userData.lastLogin)}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-[#E8E8E880] text-sm">Account status</h3>
                <p className="text-lg text-[#01BC8D] font-medium flex items-center gap-1.5">
                  {userData.status} <CircleCheck size={16} />
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

      <div className="mt-6">
        <div className="flex items-center  mb-6">
          <h2 className="text-xl font-bold">Trading Information</h2>
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
        {expanded && (
          <div className="bg-[#141E323D] border border-[#141E32] rounded-lg p-6 w-full">
            <div className="grid grid-cols-5 gap-6 mb-8">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Trades</p>
                <p className="text-2xl font-bold">131</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Win Rate</p>
                <p className="text-2xl font-bold">62%</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Profit/Loss</p>
                <p className="text-2xl font-bold text-emerald-400">
                  +$19,920.45
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">
                  Total Volume Traded
                </p>
                <p className="text-2xl font-bold">$1,372,800</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Average Trade Size</p>
                <p className="text-2xl font-bold">$4,835</p>
              </div>
            </div>

            <div className="flex gap-10">
              <div>
                <p className="text-gray-400 text-sm mb-2">Active Markets</p>
                <div className="space-y-1">
                  <span className="inline-block text-xs bg-[#141E325C] px-2 py-1 rounded">
                    Margin
                  </span>
                  <span className="inline-block text-xs bg-[#141E325C] px-2 py-1 rounded ml-1">
                    Spot
                  </span>
                  <span className="inline-block text-xs bg-[#141E325C] px-2 py-1 rounded ml-1">
                    Copy Trading
                  </span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">
                  Primary Pairs Traded
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 p-2 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">₿</span>
                  </div>
                  <span className="text-sm">BTC/USDT</span>
                  <div className="w-2 h-2 p-2 bg-gray-600 rounded-full flex items-center justify-center ml-2">
                    <span className="text-xs font-bold">Ξ</span>
                  </div>
                  <span className="text-sm">ETH/USDT</span>
                  <div className="w-2 h-2 p-2 bg-blue-500 rounded-full flex items-center justify-center ml-2">
                    <span className="text-xs font-bold">L</span>
                  </div>
                  <span className="text-sm">LTC/USDT</span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">
                  Copy Trade Subscribed
                </p>
                <p className="text-sm">JapidTRex</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Copy Mode</p>
                <p className="text-sm">FixedRatio:1:1.5</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trade History */}
      <div className="pt-4">
        <h2 className="text-xl font-bold mb-6">Trade History</h2>

        {/* Filters */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Pair</label>
            <div className="relative flex items-center">
              <select
                className="w-full bg-[#10131F] border rounded-lg px-3 py-2 text-white appearance-none pr-8"
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
              >
                <option>All</option>
                <option>1</option>
                <option>2</option>
              </select>
              <ChevronDown className="absolute right-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              Trade Type
            </label>
            <div className="relative">
              <select
                className="w-full bg-[#10131F] border rounded-lg px-3 py-2 text-white appearance-none pr-8"
                value={selectedTradeType}
                onChange={(e) => setSelectedTradeType(e.target.value)}
              >
                <option>All</option>
                <option>Long</option>
                <option>Short</option>
              </select>
              <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Status</label>
            <div className="relative">
              <select
                className="w-full bg-[#10131F] border rounded-lg px-3 py-2 text-white appearance-none pr-8"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option>All</option>
                <option>Open</option>
                <option>Closed</option>
              </select>
              <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

         {/* Trade History Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-[#141E32]">
                <th className="text-left py-3 px-2">Trade ID</th>
                <th className="text-left py-3 px-2">Pair</th>
                <th className="text-left py-3 px-2">Type</th>
                <th className="text-left py-3 px-2">Amount</th>
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Outcome</th>
                <th className="text-left py-3 px-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {tradeHistory.map((trade, index) => (
                <tr key={index} className="border-b border-[#141E32] hover:bg-slate-750">
                  <td className="py-4 px-2 text-sm">{trade.id}</td>
                  <td className="py-4 px-2 text-sm">{trade.pair}</td>
                  <td className="py-4 px-2">
                    <span className={`text-sm px-2 py-1 rounded ${
                      trade.type === 'Long' 
                        ? 'text-emerald-400 bg-emerald-400/10' 
                        : 'text-red-400 bg-red-400/10'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-sm">${trade.amount.toLocaleString()}</td>
                  <td className="py-4 px-2 text-sm">{trade.status}</td>
                  <td className="py-4 px-2 text-sm text-emerald-400">+${trade.outcome}</td>
                  <td className="py-4 px-2 text-sm text-gray-400">{trade.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
