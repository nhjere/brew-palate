// src/components/Recommendations.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useBreweryMap } from '../context/BreweryContext';

export default function Recommendations({ userId, refreshRecs }) {
    const [beers, setBeers] = useState([]);
    const [isFallback, setIsFallback] = useState(false);
    const [breweryMap, setBreweryMap] = useState('');

    useEffect(() => {
        if (!userId) return;

        // creates controller that can cancel requests (fast API is expected to handle too many requests)
        const controller = new AbortController();
        const signal = controller.signal;

        axios.get(`http://localhost:8001/live-recs/${userId}`, { signal })
            .then((res) => {
                setBeers(res.data.beers || []);
                setIsFallback(res.data.fallback);
            })
            .catch((err) => {
                // if request cancelled (useEffect called again)
                if (axios.isCancel(err)) {
                    console.log("Request canceled:", err.message);
                } else {
                    console.error("Failed to fetch recommendations:", err);
                }
            });

        return () => {
            // only last request served
            controller.abort();
        };
    }, [userId, refreshRecs]);

    useEffect(() => {
        const uniqueIds = [...new Set(beers.map(b => b.breweryUuid))].filter(id => !!id);

        if (uniqueIds.length === 0) return;

        axios.post(
        'http://localhost:8080/api/brewer/breweries/names',
        uniqueIds,
        {
            headers: {
            'Content-Type': 'application/json',
            },
        }
        )
        .then((res) => setBreweryMap(res.data))
        .catch(console.error);
    }, [beers]);

    return (
        <section className="bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm text-left">
            <h2 className="text-2xl font-bold mb-2">Recs</h2>
            <p className="text-sm mb-2">
                {isFallback
                ? "No reviews yet — here are some popular beers to try!"
                : "Based on your tastes, try these local crafts!"}
            </p>

            <div className="space-y-4 text-sm font-medium">
                {beers.slice(0, 15).map((beer) => {

                    const breweryName = breweryMap[beer.breweryUuid];

                        
                    return (
                    <div key={beer.beerId} className="flex flex-col">
                        <span className="font-semibold text-amber-900">{beer.name}</span>
                        <span className="text-sm text-gray-700">
                            
                            <a href={`/brewery/${beer.breweryUuid}`} className="text-amber-800 hover:underline">
                            {breweryName || 'Unknown Brewery'}
                            </a>
                                            


                        </span>
                        <div className="text-gray-700 italic text-sm">
                        {beer?.flavorTags?.length > 0
                            ? beer.flavorTags.map(tag => tag.charAt(0).toUpperCase() + tag.slice(1)).join(', ')
                            : 'N/A'}
                        </div>
                    </div>
                )}
                
                )}
            </div>
        </section>

    );
}
