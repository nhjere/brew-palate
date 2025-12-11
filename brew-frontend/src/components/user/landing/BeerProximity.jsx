import React, { useState } from 'react';
import axios from 'axios';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';

export default function BeerProximity({ committedTags, onSetProximity }) {
  const [address, setAddress] = useState('');
  const [distance, setDistance] = useState(25);
  const [isOpen, setIsOpen] = useState(true);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleClearLocation = () => {
    setAddress('');
    setDistance(25);
    onSetProximity?.(null);
  };

  const handleNearbyBeerSearch = async () => {
    try {
      if (!address.trim()) return;

      const geo = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address
        )}.json`,
        { params: { access_token: MAPBOX_TOKEN } }
      );

      if (!geo.data.features?.length) {
        console.warn('No results for that address');
        return;
      }

      const [lng, lat] = geo.data.features[0].center;

      await axios.get(`${BASE_URL}/api/import/filtered-all-beers`, {
        params: {
          lat,
          lng,
          radius: distance,
          tags: committedTags,
        },
        paramsSerializer: (params) =>
          new URLSearchParams(params).toString(),
      });

      onSetProximity?.({ lat, lng, radius: distance });
    } catch (err) {
      console.error('Error fetching nearby beers:', err);
    }
  };

  return (
    <div className="w-full bg-[#f2f2f2] shadow-md border border-[#d7d7d7] overflow-hidden text-[#8A5A3C]">
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-4 py-3 
                   bg-[#445A7D] text-white font-semibold cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="tracking-[0.12em] uppercase">Location</span>
        {isOpen ? (
          <ChevronUpIcon className="w-5 h-5 text-white" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Content */}
      {isOpen && (
        <div className="px-4 pb-4 pt-2 text-sm">
          <p className="mb-2 font-bold">
            Find Beers in your area:
          </p>

          <div className="flex flex-col gap-3">
            {/* Address */}
            <label className="w-full">
              <span className="block font-medium mb-1">Address</span>
              <input
                type="text"
                className="
                  w-full px-3 py-2 
                  border border-gray-300 
                  rounded-md 
                  text-sm 
                  placeholder:text-gray-400 
                  focus:outline-none
                "
                value={address}
                placeholder="Enter address, city, state"
                onChange={(e) => setAddress(e.target.value)}
              />
            </label>

            {/* Radius */}
            <label className="w-full">
              <span className="block font-medium mb-1">Radius (miles)</span>
              <input
                type="number"
                min={1}
                className="
                  w-full px-3 py-2 
                  border border-gray-300 
                  rounded-md 
                  text-sm text-center 
                  focus:outline-none
                "
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value) || 1)}
              />
            </label>

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleNearbyBeerSearch}
                className="
                  w-full 
                  bg-[#8C6F52] 
                  hover:bg-[#8c6f52af] 
                  text-white 
                  font-semibold 
                  py-2 
                  rounded-md
                "
              >
                Search
              </button>

              <button
                type="button"
                onClick={handleClearLocation}
                className="
                  w-full 
                  bg-[#9f9f9f] 
                  border border-[#8A5A3C] 
                  text-[#f7f7f7] 
                  font-semibold 
                  py-2 
                  rounded-md
                  hover:bg-[#aeacac]
                "
                title="Clear the address and remove location filter"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
