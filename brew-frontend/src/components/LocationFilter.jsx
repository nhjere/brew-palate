import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../index.css"

export default function LocationFilter({address}) {

    const [distance, setDistance] = useState(25);
    console.log(address)


    return (
        <section className="bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm">
        <h2 className="text-2xl font-bold mb-1">Nearby Breweries</h2>
        <p className="text-sm text-gray-700 mb-3 italic">
            {address ? `Searching from: ${address}` : "Location unknown"}
        </p>

        <label className="text-sm font-medium text-gray-800 mb-1 block">
            Max Distance: {distance} miles
        </label>
        <input
            type="range"
            min="1"
            max="100"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="appearance-none w-full h-2 bg-white border border-black rounded"
        />
    </section>
    );
}


