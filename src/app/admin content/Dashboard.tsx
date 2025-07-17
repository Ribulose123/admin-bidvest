"use client";
import React, { useState } from "react";
import { TrendingUp, TrendingDown, Eye, EyeOff } from "lucide-react";
import TradingPlatform from "./TradingPlatform";
import TradingActivitiesPanel from "./TradingActivitiesPanel";

const Dashboard = () => {
  const [showBalance, setShowBalance] = useState(false);
  const [showTotal, setShowTotal] = useState(false);
  const balanceCards = [
    {
      title: "Total Balance",
      value: "1,2471",
      showEye: true,
      icon: <TrendingUp size={25} className="text-[#01BC8D]" />,
      showValue: true,
    },
    {
      title: "Total Users",
      value: "1,2471",
      showEye: false,
      icon: <TrendingUp size={25} className="text-[#01BC8D]" />,
      showValue: true,
    },
    {
      title: "Revenue",
      value: "1,2471",
      showEye: false,
      icon: <TrendingUp size={25} className="text-[#01BC8D]" />,
      showValue: false,
    },
    {
      title: "Total Trade",
      value: "1,2471",
      showEye: false,
      icon: <TrendingUp size={25} className="text-[#01BC8D]" />,
      showValue: true,
    },
  ];

  const TotalUsd = [
    {
      title:"User Balance",
      value: "1,2471",
      showEye: true,
      icon: <TrendingDown size={25} className="text-[#F23645]" />,
      showValue: true,
    },
    {
       title:"User Total",
      value: "1,2471",
      showEye: true,
      icon: <TrendingDown size={25} className="text-[#F23645]" />,
      showValue: true,
    }
  ]
  const handleShowBalance = () => {
    setShowBalance(!showBalance);
  };
  const handleShowTotal = () => {
    setShowTotal(!showTotal);
  };
  return (
    <div className="min-h-screen text-gray-100 p-8 font-inter">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        {/* Total Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 w-full max-w-6xl mx-auto">
          {balanceCards.map((card, index) => (
            <div
              key={index}
              className="bg-linear-to-bl from-[#141E323D] to-[#01040F] rounded-lg p-6 border border-gray-700 w-full min-w-[250px]"
            >
              <div className="flex justify-between">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{card.title}</span>
                    {card.showEye && (
                      <button
                        onClick={handleShowBalance}
                        className="hover:text-gray-300"
                      >
                        {showBalance ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {card.showEye && !showBalance ? "****" : card.value}
                  </div>
                </div>
                <div className="space-y-6">
                  <div>{card.icon}</div>
                  {card.showValue && (
                    <div className="bg-[#1F3F29B8] p-1 rounded-md text-center text-[#01BC8D] text-sm">21%</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

       <div className="grid grid-cols-2 gap-6 w-full max-w-6xl mx-autol">
         {TotalUsd.map((total, index)=>(
          <div key={index} className="bg-linear-to-bl from-[#141E323D] to-[#01040F] rounded-lg p-6 border border-gray-700 w-full min-w-[250px]">
            <div className="flex justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">{total.title}</span>
                  {total.showEye && (
                      <button
                        onClick={handleShowTotal}
                        className="hover:text-gray-300"
                      >
                        {showTotal ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    )}
                </div>
                 <div className="text-2xl font-bold text-white">
                    {total.showEye && !showTotal ? "****" : total.value}
                  </div>
              </div>
              <div className="space-y-6">
                  <div>{total.icon}</div>
                  {total.showValue && (
                    <div className="bg-[#1F3F29B8] p-1 rounded-md text-center text-[#01BC8D] text-sm">21%</div>
                  )}
                </div>
            </div>
          </div>
        ))}
       </div>

       {/* Chart content */}

       <div>
        <TradingPlatform/>
       </div>

       <div className="pt-5">
        <TradingActivitiesPanel/>
       </div>
      </div>
    </div>
  );
};

export default Dashboard;
