// src/components/Recommendations.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useBeerMap } from '../context/BeerContext';

export default function Recommendations({ userId, refreshRecs }) {
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
}, [userId, refreshRecs]);

return (
    <section className="bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm text-left">
        <h2 className="text-2xl font-bold mb-2">Recs</h2>
        <p className="text-sm mb-2">
            {isFallback
            ? "No reviews yet — here are some popular beers to try!"
            : "Based on your tastes, try these local crafts!"}
        </p>

        <div className="space-y-4 text-sm font-medium">
            {beers.slice(0, 25).map((beer) => (
            <div key={beer.beerId} className="flex flex-col">
                <span className="font-semibold text-amber-900">{beer.name}</span>
                <div className="text-gray-700 italic text-sm">
                {beer?.flavorTags?.length > 0
                    ? beer.flavorTags.map(tag => tag.charAt(0).toUpperCase() + tag.slice(1)).join(', ')
                    : 'N/A'}
                </div>
            </div>
            ))}
        </div>
    </section>

);
}
