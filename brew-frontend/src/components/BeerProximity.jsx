import React, { useState } from 'react';
import axios from 'axios';

export default function BeerProximity({ committedTags, onResults }) {
  const [address, setAddress] = useState('Austin, TX');
  const [distance, setDistance] = useState(25);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleNearbyBeerSearch = async () => {
    try {
      const geo = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`, {
        params: { access_token: MAPBOX_TOKEN }
      });

      const [lng, lat] = geo.data.features[0].center;

      const res = await axios.get(`${BASE_URL}/api/import/beers/nearby`, {
        params: {
          lat,
          lng,
          radius: distance,
          tags: committedTags
        },
        paramsSerializer: params => new URLSearchParams(params).toString()
      });

      onResults(res.data); // lift data back to UserDashboard

    } catch (err) {
      console.error("Error fetching nearby beers:", err);
    }
  };

  return (
    <section className="bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm mb-4">
      <h2 className="text-2xl font-bold mb-2">Find Beers Near You</h2>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Address:</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g., Austin, TX"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Radius (miles):</label>
        <input
          type="number"
          className="w-full border p-2 rounded"
          min="1"
          max="100"
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
        />
      </div>

      <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
        onClick={handleNearbyBeerSearch}
      >
        Search Nearby Beers
      </button>
    </section>
  );
}
