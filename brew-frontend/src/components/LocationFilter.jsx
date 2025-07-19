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
    <aside className="bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm">
        <h2 className="text-2xl font-bold mb-1">Filter By Location</h2>

        <label className="text-sm font-medium text-gray-800 mb-1 block">Your Address:</label>
        <div className="flex items-center gap-2 mb-2">
            <input
            type="text"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
            />
            <button
            onClick={handleConfirmAddress}
            className="bg-blue-200 px-4 py-1 rounded text-sm hover:bg-blue-300"
            >
            Enter
            </button>
        </div>

        <p className="text-sm text-gray-700 mb-3 italic">
            {address ? `Searching from: ${address}` : "Location unknown"}
        </p>

        <label className="text-sm font-medium text-gray-800 mb-1 block">
            Max Distance: {localDistance} miles
        </label>
        <input
            type="range"
            min="1"
            max="100"
            value={localDistance}
            onChange={(e) => setLocalDistance(Number(e.target.value))}
            className="appearance-none w-full h-2 bg-white border border-black rounded mb-5"
        />

        <button
            onClick={() => {
            setDistance(localDistance);
            onSearch();
            }}
            className="bg-amber-800 text-white py-2 px-4 rounded hover:bg-amber-700"
        >
            Search Breweries
        </button>
    </aside>
);
}

