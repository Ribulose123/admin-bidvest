import React from "react";
import Image from "next/image";
import {
  Calendar,
  CircleDollarSign,
  Wallet,
  PieChart,
  Share2,
  Heart,
} from "lucide-react";
import CopyTable from "./CopyTable";
import CopyPerson from "./CopyPerson";
import Usersdetails from "./Usersdetails";

// Define the copyData object with all required properties
const copyData = {
  completionRate: "98.5%",
  profitPercentage: "+42.13%",
  totalPnL: "$163,152.56",
  openPnL: "$33,942.76",
  win: 12,
  lose: 4
};

const AdminCopyExpert = () => {
  return (
    <div className="min-h-full p-4 sm:p-6 md:p-8 ">
      <div className="mx-auto max-w-7xl">
        {/* User info section */}
        <div className="flex flex-col md:flex-row justify-between gap-6 bg-[#141E32]/25 rounded-xl p-4 md:p-6 border border-[#1E2A4A]">
          {/* Left side */}
          <div className="flex-1 flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Image
                src="/img/Avatar DP.png"
                alt="profile"
                width={100}
                height={100}
                className="rounded-full border-2 border-[#439A86] object-cover"
                priority
              />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-white text-xl font-bold">Mr_profits</h3>
                <div className="flex items-center gap-2 text-sm">
                  <p className="text-[#797A80] border-r border-[#797A80] pr-2">
                    @HappyPlanets
                  </p>
                  <p className="flex items-center text-[#797A80] gap-1">
                    <Calendar size={13} />
                    Registered 626 day(s) ago
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="border-r border-[#797A80] pr-4">
                  <p className="text-[#797A80] text-sm">Followers</p>
                  <h3 className="text-white text-lg font-bold">12</h3>
                </div>
                <div className="border-r border-[#797A80] pr-4">
                  <p className="text-[#797A80] text-sm">Trading Days</p>
                  <h3 className="text-white text-lg font-bold">33</h3>
                </div>
                <div className="border-r border-[#797A80] pr-4">
                  <p className="text-[#797A80] text-sm">Stability Index</p>
                  <h3 className="text-white text-lg font-bold">
                    255<span className="text-xs">/50</span>
                  </h3>
                </div>
                <div>
                  <p className="text-[#797A80] text-sm">7 Day(s)</p>
                  <h3 className="text-white text-lg font-bold">270</h3>
                </div>
              </div>

              {/* Financial info */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-sm">
                <div className="flex items-center gap-1 border-r border-[#797A80] pr-4">
                  <CircleDollarSign size={13} className="text-[#797A80]" />
                  <p className="text-[#797A80] font-medium">
                    AUM 1,149.00 USDT
                  </p>
                </div>
                <div className="flex items-center gap-1 border-r border-[#797A80] pr-4">
                  <Wallet size={13} className="text-[#797A80]" />
                  <p className="text-[#797A80] font-medium">
                    Total Assets 933.20 USDT
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <PieChart size={13} className="text-[#797A80]" />
                  <p className="text-[#797A80] font-medium">
                    Profit Sharing 10%
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right section - Actions */}
          <div className="flex flex-col md:items-end items-start gap-4 mt-2 mb-4 md:mt-0 md:mb-0">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-[#E8E8E8] hover:text-white transition-colors">
                <Share2 size={15} />
                <span className="text-sm">Share</span>
              </button>
              <button className="flex items-center gap-1 text-[#E8E8E8] hover:text-white transition-colors">
                <Heart size={15} />
                <span className="text-sm">Subscribe</span>
              </button>
            </div>
            <button className="bg-gradient-to-r from-[#439A86] to-[#3a8a77] hover:from-[#3a8a77] hover:to-[#327a68] text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-[#439A86]/30">
              Copy Trader
            </button>
          </div>
        </div>

        {/* Table content */}
        <div className="mt-6">
          <CopyTable />
        </div>

        {/* Copy card */}
        <div className="mt-6">
          <CopyPerson />
        </div>

        {/* Chart */}
        <div className="mt-6">
          <Usersdetails copyData={copyData} />
        </div>
      </div>
    </div>
  );
};

export default AdminCopyExpert;