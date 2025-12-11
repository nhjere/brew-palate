import React, { useEffect, useState } from "react";
import "../../index.css";

export default function LocationFilter({
  address,
  onAddressChange,
  distance,
  setDistance,
  onSearch,
}) {
  const [localDistance, setLocalDistance] = useState(distance);
  const [newAddress, setNewAddress] = useState(address);

  useEffect(() => {
    setLocalDistance(distance);
  }, [distance]);

  return (
    <section className="w-full bg-[#f2f2f2] border border-slate-200 shadow-sm px-4 py-3 md:px-6 md:py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        {/* Address */}
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-sm font-semibold text-[#8C6F52]">
          <span >Address</span>
          <input
            type="text"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            className="w-full md:w-72 rounded-full bg-white px-4 py-2 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3C547A]/50"
            placeholder="Enter city, neighborhood, or address"
          />
        </div>

        {/* Distance */}
        <div className="flex items-center gap-2 text-sm font-semibold text-[#8C6F52]">
          <span>Max distance</span>
          <input
            type="number"
            min={1}
            value={localDistance}
            onChange={(e) => setLocalDistance(Number(e.target.value))}
            className="w-20 rounded-full bg-white px-3 py-2 text-sm text-center border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3C547A]/50"
          />
          <span>miles</span>
        </div>

        {/* Button */}
        <button
          onClick={() => {
            if (!newAddress || newAddress.length < 3) {
              alert("Please enter a more complete address.");
              return;
            }
            onSearch(newAddress.trim(), localDistance);
            setDistance(localDistance);
            onAddressChange(newAddress.trim());
          }}
          className="mt-1 md:mt-0 md:ml-auto rounded-full px-6 py-2 text-sm font-semibold bg-[#3C547A] text-white hover:bg-[#314466] transition-colors"
        >
          Search
        </button>
      </div>
    </section>
  );
}
