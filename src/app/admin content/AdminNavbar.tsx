"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Bell, ChevronDown } from "lucide-react";
import Flag from "react-world-flags";

const countryOptions = [
  { code: "gb", name: "English" },
  { code: "us", name: "English" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "ng", name: "Nigerian Pidgin" },
  { code: "es", name: "Español (International)" },
  { code: "pt", name: "Português (International)" },
];

type DropdownMenuType = "buy" | "tools" | "more" | "user";

const AdminNavbar = () => {
  const [activeDropdown, setActiveDropdown] = useState<DropdownMenuType | null>(null);
  const [country, setCountry] = useState("gb");
  const [showModal, setShowModal] = useState(false);
  const [showCopyDetails, setShowCopyDetails] = useState(false);

  const toggleModal = () => setShowModal(!showModal);

  const toggleDropdown = (menu: DropdownMenuType) => {
    setActiveDropdown((prev) => (prev === menu ? null : menu));
    setShowCopyDetails(false);
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 py-3 px-6 flex items-center w-full">
      {/* Logo - Left aligned */}
      <div className="flex-none">
        <Link
          href="/"
          className="text-white font-bold text-xl flex items-center"
        >
          <Image
            src="/img/logo2.jpg"
            alt="logo"
            width={32}
            height={32}
            className="mr-2"
          />
        </Link>
      </div>

      {/* Nav Links - Center aligned */}
      <nav className="flex flex-1 items-center justify-center">
        <div className="flex items-center space-x-8">
          {/* Buy Crypto Dropdown */}
          <div className="relative">
            <button
              className="text-white font-medium flex items-center"
              onClick={() => toggleDropdown("buy")}
            >
              Buy Crypto
              <ChevronDown size={16} className="ml-1" />
            </button>

            {activeDropdown === "buy" && (
              <div className="absolute top-full left-0 mt-3 w-96 bg-[#0D1B2A] text-white rounded-2xl shadow-2xl z-50 p-6 space-y-5">
                <div className="flex item-end justify-end gap-2 text-sm text-gray-300 font-medium">
                  <span>Pay with</span>
                  <span className="flex items-center space-x-1">
                    <Image
                      src="/img/solar_dollar-bold.png"
                      alt="pay"
                      width={17}
                      height={17}
                    />
                    <span>USD</span>
                  </span>
                </div>

                <div className="space-y-4 text-sm">
                  <Link href="/buy/p2p" className="block">
                    <div>
                      <p className="font-semibold flex items-center gap-2 hover:text-blue-400 transition">
                        <Image
                          src="/img/ri_p2p-fill.png"
                          alt="tit"
                          width={17}
                          height={17}
                        />{" "}
                        P2P Trading
                      </p>
                    </div>
                    <p className="text-gray-400 text-xs ml-6">
                      Buy crypto from verified merchants
                    </p>
                  </Link>

                  <Link href="/buy/deposit" className="block">
                    <div>
                      <p className="font-semibold flex items-center gap-2 hover:text-blue-400 transition">
                        <Image
                          src="/img/game-icons_cube.png"
                          alt="tit"
                          width={17}
                          height={17}
                        />{" "}
                        Fiat Deposit
                      </p>
                    </div>
                    <p className="text-gray-400 text-xs ml-6">
                      Fiat to crypto and crypto to fiat bank transfer
                    </p>
                  </Link>

                  <Link href="/buy/quick" className="block">
                    <div>
                      <p className="font-semibold flex items-center gap-2 hover:text-blue-400 transition">
                        <Image
                          src="/img/solar_add-circle-bold-duotone.png"
                          alt="tit"
                          width={17}
                          height={17}
                        />{" "}
                        Quick Buy
                      </p>
                    </div>
                    <p className="text-gray-400 text-xs ml-6">
                      Buy with card, e-wallet and third-party
                    </p>
                  </Link>

                  <Link href="/buy/credit-card" className="block">
                    <div className="flex flex-col">
                      <p className="font-semibold flex items-center gap-2 hover:text-blue-400 transition">
                        <Image
                          src="/img/uimmaster-card.png"
                          alt="tit"
                          width={17}
                          height={17}
                        />{" "}
                        Credit/Debit Card
                      </p>
                    </div>
                    <p className="text-gray-400 text-xs ml-6">
                      Buy crypto via Visa or Mastercard
                    </p>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Market Link */}
          <Link href="/market" className="text-gray-300 hover:text-white">
            Market
          </Link>

          {/* Trade Link */}
          <Link href="/trade" className="text-gray-300 hover:text-white">
            Trade
          </Link>

          {/* Tools Dropdown */}
          <div className="relative">
            <button
              className="text-gray-300 hover:text-white flex items-center"
              onClick={() => toggleDropdown("tools")}
            >
              Tools
              <ChevronDown size={16} className="ml-1" />
            </button>

            {activeDropdown === "tools" && (
              <div className="absolute top-full left-0 mt-3 w-[500px] bg-[#0D1B2A] text-white rounded-xl shadow-xl z-50 p-4 flex gap-4">
                {/* Left Panel */}
                <div className="w-1/2 space-y-4">
                  <div
                    className={`p-4 rounded-lg transition cursor-pointer ${
                      activeDropdown === "tools"
                        ? "bg-[#152232]"
                        : "hover:bg-[#1E2E41]"
                    }`}
                    onMouseEnter={() => setShowCopyDetails(true)}
                    onMouseLeave={() => setShowCopyDetails(false)}
                  >
                    <p className="font-semibold flex items-center gap-2">
                      🔥 Copy Trading
                    </p>
                    <p className="text-gray-400 text-xs">
                      Follow top trading experts
                    </p>
                  </div>

                  <Link
                    href="/tools/leaderboard"
                    className="block p-4 rounded-lg transition"
                  >
                    <p className="font-semibold flex items-center gap-2">
                      📊 Leaderboard
                    </p>
                    <p className="text-gray-400 text-xs">
                      Fiat to crypto and crypto to fiat block trades
                    </p>
                  </Link>
                </div>

                {/* Right Panel (Only if Copy Trading is hovered) */}
                {showCopyDetails && (
                  <div className="w-1/2">
                    <p className="text-sm text-gray-300 mb-2">Copy Trading</p>
                    <p className="text-xs text-gray-500 mb-4">
                      Let experts trade for you.
                    </p>

                    {[1, 2, 3].map((_, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Image
                            src="/avatars/mrporfit.png" // replace with actual avatar path
                            alt="Trader"
                            className="w-6 h-6 rounded-full"
                            width={16}
                            height={16}
                          />
                          <p className="text-sm font-medium">Mr_porFit</p>
                        </div>
                        <p className="text-green-400 text-sm font-semibold">
                          +129.7%
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* More Dropdown */}
          <div className="relative">
            <button
              className="text-gray-300 hover:text-white flex items-center"
              onClick={() => toggleDropdown("more")}
            >
              More
              <ChevronDown size={16} className="ml-1" />
            </button>
            {activeDropdown === "more" && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <Link
                    href="/about"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    About
                  </Link>
                  <Link
                    href="/support"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    Support
                  </Link>
                  <Link
                    href="/blog"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    Blog
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Right Side - Search, Language, Notifications, User */}
      <div className="flex items-center space-x-4 flex-none">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="bg-gray-800 rounded-lg py-1 pl-9 pr-3 text-sm w-32 lg:w-48 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Language Selector */}
        <div className="relative">
          <div
            className="flex items-center cursor-pointer"
            onClick={toggleModal}
          >
            <Flag
              code={country.toUpperCase()}
              style={{ width: 34, height: 18 }}
            />
            <svg
              className="w-4 h-4 ml-2 fill-current text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-1 rounded-full hover:bg-gray-800">
          <Bell size={20} className="text-gray-300" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            className="flex items-center space-x-2"
            onClick={() => toggleDropdown("user")}
          >
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center overflow-hidden">
              <Image
                src="/api/placeholder/32/32"
                alt="Profile"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">Jamie Johnson</p>
              <p className="text-xs text-gray-400">Verified User</p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {activeDropdown === "user" && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
              <div className="py-1">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                >
                  My Profile
                </Link>
                <Link
                  href="/security"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                >
                  Security
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                >
                  Settings
                </Link>
                <div className="border-t border-gray-700 my-1"></div>
                <button className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700">
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Language Modal */}
      {showModal && (
        <div className="absolute top-14 right-0 bg-white rounded-md shadow-lg p-4 w-80 z-20">
          <div className="flex justify-between items-center pb-2 mb-2">
            <h3 className="text-lg font-semibold text-black">
              Choose Your Language
            </h3>
            <button onClick={toggleModal} className="text-gray-600">
              ✖
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {countryOptions.map(({ code, name }) => (
              <button
                key={code}
                className={`text-left px-2 py-1 ${
                  country === code
                    ? "text-orange-500 font-bold"
                    : "text-gray-700"
                }`}
                onClick={() => {
                  setCountry(code);
                  setShowModal(false);
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminNavbar;