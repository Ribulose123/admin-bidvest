'use client'
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import Image from "next/image";
import CopyChart from "./CopyChart";

interface UsersdetailsProps {
  copyData: {
    completionRate: string;
    profitPercentage: string;
    totalPnL: string;
    openPnL: string;
    win: number;
    lose: number;
    // add other properties if needed
  };
}

const Usersdetails: React.FC<UsersdetailsProps> = ({ copyData }) => {
  const [performance, setPerformance] = useState("All");
  const [openCopy, setOpenCopy] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = ["All", "Loser", "Profit"];

  const total = copyData.win + copyData.lose;
  const WiningLength = (copyData.win / total) * 100;
  const losingLength = (copyData.lose / total) * 100;
  const copyTraders = [
    {
      id: 1,
      name: "M_puff3",
      avatar: "/img/DP.png",
      profit: "@markD",
      time: "8 months ago",
    },
    {
      id: 2,
      name: "M_puff3",
      avatar: "/img/DP.png",
      profit: "@markD",
      time: "8 months ago",
    },
    {
      id: 3,
      name: "M_puff3",
      avatar: "/img/DP.png",
      profit: "@markD",
      time: "7 months ago",
    },
    {
      id: 4,
      name: "M_puff3",
      avatar: "/img/DP.png",
      profit: "@markD",
      time: "5 months ago",
    },
    {
      id: 5,
      name: "M_puff3",
      avatar: "/img/DP.png",
      profit: "@markD",
      time: "4 months ago",
    },
  ];

  const tradingPairs = [
    "ATOM/USDT",
    "ATOM/BTC",
    "ADA/USDT",
    "ADA/BTC",
    "AVAX/USDT",
    "AVAX/BTC",
    "MATIC/USDT",
    "LTC/USDT",
    "BTC/USDT",
    "ETH/USDT",
  ];

  //search function
  const filtePair = tradingPairs.filter(pairs => pairs.toLowerCase().includes(searchQuery.toLowerCase()))

  //Copy pair function
   const toggleCopySection = () => {
    setOpenCopy(!openCopy);
  };

  return (
    <div className="md:p-4 w-full mx-auto">
      <div className="flex gap-30 md:flex-row flex-col">
        {/* Left Column - Performance */}
        <div className="md:w-[35%] w-full">
          <div className="flex justify-between items-center gap-6">
            <p className="text-[20px] text-[#E8E8E8] font-semibold">
               Performances
            </p>
            <div className="relative flex-1 min-w-[100px]">
              <select
                className="w-full border border-[#141E32]  rounded-full px-3 py-2 text-white text-sm  appearance-none pr-7"
                onChange={(e) => setPerformance(e.target.value)}
                value={performance}
              >
                {tabs.map((tab) => (
                  <option
                    value={tab}
                    key={tab}
                    className="bg-[#10131F] text-white"
                  >
                    {tab}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[14px] text-[#797A80]">RIO</p>
                <span className="text-[#01BC8D]">
                  {copyData.profitPercentage}
                </span>
              </div>
              <div>
                <p className="text-[14px] text-[#797A80] text-end">
                  Total Profit
                </p>
                <span className="text-white">{copyData.totalPnL}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[14px] text-[#797A80]">Win profit</p>
                <span className="text-white">{copyData.completionRate}</span>
              </div>
              <div>
                <p className="text-[14px] text-[#797A80] text-end">
                  Followers&#39; PnL
                </p>
                <span className="text-white text-end flex justify-self-end items-end">
                  {copyData.openPnL}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[14px] text-[#797A80]">Max.Drawdown</p>
                <span className="text-white">34.4%</span>
              </div>
              <div>
                <p className="text-[14px] text-[#797A80] text-end">
                  Avg. PnL per Trade
                </p>
                <span className="text-white text-end flex justify-self-end items-end">
                  +25.5
                </span>
              </div>
            </div>
          </div>
          {/* Win & lose */}
          <div className="mt-6">
            <div className="flex justify-between text-sm font-medium">
              <p>
                Win <span className="text-[#01BC8D]">{copyData.win}</span>
              </p>
              <p>
                Loss <span className="text-[#F23645]">{copyData.lose}</span>
              </p>
            </div>
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="flex h-full">
                <div
                  className="bg-[#01BC8D]"
                  style={{ width: `${WiningLength}%` }}
                ></div>
                <div
                  className="bg-[#F23645]"
                  style={{ width: `${losingLength}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Total assest */}
          <div className="flex flex-col gap-6 mt-6">
            <div className="flex justify-between items-center">
              <p className="text-[13px] text-[#797A80]">Total Assets</p>
              <span className="text-[14px] text-white">*****</span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[13px] text-[#797A80]">Avg.Holding Time</p>
              <span className="text-[14px] text-white">8.71Days</span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[13px] text-[#797A80]">ROI Volatitily</p>
              <span className="text-[14px] text-white">15.86%</span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[13px] text-[#797A80]">Profit Shared Ratio</p>
              <span className="text-[14px] text-white">10%</span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[13px] text-[#797A80]">Last Trade At</p>
              <span className="text-[14px] text-white">2025/05/11 12:09pm</span>
            </div>
          </div>

          {/* Recent Trade */}
          <div className="mt-6">
            <h2>Recent Copy Traders</h2>
            {copyTraders.map((profile) => (
              <div key={profile.id} className=" mt-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div>
                      <Image
                        src={profile.avatar}
                        alt={profile.name}
                        width={50}
                        height={50}
                      />
                    </div>
                    <div className="flex flex-col">
                      <p>{profile.name}</p>
                      <p>{profile.profit}</p>
                    </div>
                  </div>

                  <div>
                    <span>{profile.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trading pair */}
          <div className="mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[16px] text-[#E8E8E8] ">
                Copy Trading Pairs
              </h3>
               <button 
                onClick={toggleCopySection}
                className="text-[#E8E8E8] hover:text-white transition-colors"
                aria-expanded={openCopy}
                aria-label={openCopy ? "Collapse pairs" : "Expand pairs"}
              >
                {openCopy ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
            </div>

            {openCopy && (
              <div>
                <div className="relative flex-1 mt-3">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full bg-[#10131F] px-3 py-2 pr-7 rounded-full text-sm text-gray-200 focus:outline-none placeholder:text-[#E8E8E8] placeholder:text-[12px] border border-[#2D2F3D]"
                     value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#E8E8E8]"
                    size={14}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-3 ml-2">
                  {filtePair.map((pair, index) => (
                    <div
                      key={index}
                      className="text-xs  cursor-pointer text-[#E8E8E8]"
                    >
                      {pair}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
         {/* Left Column - Chart */}
            <div className="w-ful md:w-[65%]">
              <CopyChart/>
            </div>
      </div>
    </div>
  );
};

export default Usersdetails;
