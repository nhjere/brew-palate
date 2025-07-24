// src/components/Recommendations.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useBeerMap } from '../context/BeerContext';

export default function Recommendations({ userId, refreshTrigger }) {
  const [beers, setBeers] = useState([]);
  const [isFallback, setIsFallback] = useState(false);
  const beerMap = useBeerMap();

  useEffect(() => {
    if (!userId) return;

    axios.get(`http://localhost:8001/live-recs/${userId}`)
      .then((res) => {
        setBeers(res.data.beers || []);
        setIsFallback(res.data.fallback);
      })
      .catch((err) => console.error("Failed to fetch recommendations:", err));
    }, [userId, refreshTrigger]);

    beers.forEach(beer => console.log(beer));

  return (
    <section className="bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm">
      <h2 className="text-2xl font-bold mb-2">Recs</h2>
      <p className="text-sm mb-2">
        {isFallback
          ? "No reviews yet — here are some popular beers to try!"
          : "Based on your tastes, try these local crafts!"}
      </p>
      <ul className="list-disc list-outside pl-5 space-y-1 text-sm font-medium">
        {beers.slice(0, 20).map((beer) => (
          <li key={beer.beerId} className="mb-4">
            <span className="font-semibold">{beer.name}</span>
            <ul className="ml-4 text-gray-700 list-disc list-inside">
              {beer.flavorTags.map((tag, index) => (
                <li key={index} className="italic">
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
