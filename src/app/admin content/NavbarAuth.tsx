"use client";

import Image from "next/image";
import React, { useState} from "react";
import Flag from "react-world-flags";

const countryOptions = [
  { code: "gb", name: "English" },
  { code: "us", name: "English" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "ng", name: "Nigerian Pidgin" },
  { code: "es", name: "Español (International)" },
  {code: "pt", name: "Português (International)" },

];

const NavbarAuth = () => {
  const [country, setCountry] = useState("gb");
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => setShowModal(!showModal);

  return (
    <nav className="w-full bg-[#10131F] shadow-md py-4 px-6 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Image src="/img/logo1.png" alt="logo" width={100} height={100} />

        {/* Flag Dropdown */}
        <div className="relative">
          <div className="flex items-center cursor-pointer" onClick={toggleModal}>
            <Flag code={country.toUpperCase()} style={{ width: 34, height: 18 }} />
            <svg
              className="w-4 h-4 ml-2 fill-current text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Language Modal */}
      {showModal && (
        <div className="absolute top-14 right-0 bg-white rounded-md shadow-lg p-4 w-80">
          <div className="flex justify-between items-center pb-2 mb-2">
            <h3 className="text-lg font-semibold text-black">Choose Your Language</h3>
            <button onClick={toggleModal} className="text-gray-600">
              ✖
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {countryOptions.map(({ code, name }) => (
              <button
                key={code}
                className={`text-left px-2 py-1 ${
                  country === code ? "text-orange-500 font-bold" : "text-gray-700"
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
    </nav>
  );
};

export default NavbarAuth;
