import React, { useEffect, useState } from 'react';
import "../index.css"

export default function LocationFilter({ address, onAddressChange, distance, setDistance, onSearch }) {

const [localDistance, setLocalDistance] = useState(distance);
const [newAddress, setNewAddress] = useState(address);

useEffect(() => {
    setLocalDistance(distance);
}, [distance]);

const handleConfirmAddress = () => {
    if (!newAddress || newAddress.length < 5) {
    alert("Please enter a more complete address.");
    return;
    }
    onAddressChange(newAddress);
};


return (
<aside className="bg-orange-50 border border-gray-300 rounded-lg p-4 shadow-sm">
  <div className="flex flex-col lg:flex-row items-center justify-between gap-4 w-full">

    <div className="flex items-center gap-2 flex-wrap">
      <label className="text-sm font-medium text-gray-800 whitespace-nowrap">Your Address:</label>
      <input
        type="text"
        value={newAddress}
        onChange={(e) => setNewAddress(e.target.value)}
        className="w-64 px-2 py-1 border border-gray-300 rounded-md text-sm"
        placeholder="Enter your location"
      />
    </div>

    <div className="flex items-center gap-2 flex-wrap">
      <label className="text-sm font-medium text-gray-800 whitespace-nowrap">Max Distance:</label>
      <input
        type="number"
        value={localDistance}
        onChange={(e) => setLocalDistance(Number(e.target.value))}
        className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm text-center"
      />
      <span className="text-sm text-gray-800">miles</span>
    </div>

    <button
      onClick={() => {
        handleConfirmAddress();
        setDistance(localDistance);
        onSearch();
      }}
      className="bg-blue-200 px-4 py-2 rounded-full text-black"
    >
      Search Breweries
    </button>
  </div>
</aside>


);
}

