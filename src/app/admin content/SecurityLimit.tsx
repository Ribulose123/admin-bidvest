"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";

const SecurityLimit = () => {
  const route = useRouter();
  const [select, setSelect] = useState("Percentage");
  return (
    <div className="min-h-screen  text-white mt-3">
      {/* Header */}
      <div className="flex items-center p-4 ">
        <button onClick={route.back} className="cursor-pointer">
          <ArrowLeft className="w-6 h-6 mr-3" />
        </button>
        <h1 className="text-xl font-semibold">KYC Verification Details</h1>
      </div>

      <div className="p-4 space-y-7  rounded-lg max-w-3xl">
        <div>
          <h2 className="text-[#E8E8E8] text-xl mb-2 font-semibold">
            Global Withdrawal Fee
          </h2>
          <p className="text-[#A4A4A4] text-sm">
            Apply a consistent withdrawal fee across all users. Choose between a
            fixed rate or a percentage to <br /> ensure smooth and transparent
            processing.
          </p>
        </div>

        <div className="max-w-xl">
          <div className="flex items-center justify-between">
            <div className="relative">
              <select
                className="block appearance-none bg-[#0A0E1A] border border-gray-700 text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-0 "
                value={select}
                onChange={(e) => setSelect(e.target.value)}
              >
                <option value="Percentage">Percetage</option>
                <option value="Fraction">Fraction</option>
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <input
              type="text"
              className="border border-[#141E32] outline-0 p-2 rounded-lg focus:outline-0"
            />
          </div>

          <div className="mt-5 space-y-3">
            <h2 className="text-[#E8E8E8] text-xl mb-2 font-semibold">
              Set Limit
            </h2>

            <div className="flex items-center justify-between">
              <p className="text-[#A4A4A4] text-sm">Daily Limit:</p>
              <input
                type="text"
                className="border border-[#141E32] outline-0 p-2 rounded-lg focus:outline-0"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[#A4A4A4] text-sm">per-transaction limit:</p>
              <input
                type="text"
                className="border border-[#141E32] outline-0 p-2 rounded-lg focus:outline-0"
              />
            </div>
          </div>

          <div >
            <label className="space-x-1">
              <input type="checkbox" />
              <span className="text-sm text-[#E8E8E8] font-semibold">
                Auto-Approval Toggle for Small Transactions
              </span>
            </label>
          </div>
        </div>

        <button className="bg-[#439A86] p-2 w-24 rounded-lg text-center hover:bg-[#488073]">
          Save
        </button>
      </div>
    </div>
  );
};

export default SecurityLimit;
