import React, { useState } from 'react';
import axios from 'axios';

export default function BeerProximity({ committedTags, onSetProximity }) {
  const [address, setAddress] = useState('');
  const [distance, setDistance] = useState(25);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleNearbyBeerSearch = async () => {
    try {
      const geo = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`, {
        params: { access_token: MAPBOX_TOKEN }
      });

      const [lng, lat] = geo.data.features[0].center;

      const res = await axios.get(`${BASE_URL}/api/import/filtered-beers`, {
        params: {
          lat,
          lng,
          radius: distance,
          tags: committedTags
        },
        paramsSerializer: params => new URLSearchParams(params).toString()
      });

      onSetProximity({ lat, lng, radius: distance })

    } catch (err) {
      console.error("Error fetching nearby beers:", err);
    }
  };

  return (
    <div className="bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-800">Address:</label>
        <input
          type="text"
          className="w-52 px-2 py-1 border border-gray-300 rounded-md text-sm"
          value={address}
          placeholder='Enter Address, City, State '
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-800">Radius (miles):</label>
        <input
          type="number"
          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm text-center"
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
        />
      </div>

      <button
        className="bg-amber-800 hover:bg-amber-700 text-white font-bold py-1 px-4 rounded"
        onClick={handleNearbyBeerSearch}
      >
        Search
      </button>

      </div>
    </div>
  );
}
