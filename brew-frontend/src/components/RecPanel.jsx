// src/components/Recommendations.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useBreweryMap } from '../context/BreweryContext';

export default function Recommendations({ userId, refreshRecs }) {
    const [beers, setBeers] = useState([]);
    const [isFallback, setIsFallback] = useState(false);
    const [breweryMap, setBreweryMap] = useState('');

    // useEffect(() => {
    //     if (!userId) return;
    //     // controller can cancel requests
    //     const controller = new AbortController();
    //     const signal = controller.signal;
    //     const BASE_URL = import.meta.env.VITE_BACKEND_URL;
        
    //     // change to REC_URL when fast api service is deployed 
    //     axios.get(`${BASE_URL}/live-recs/${userId}`, { signal })
    //         .then((res) => {
    //             if (Array.isArray(res.data.beers)) {
    //                 setBeers(res.data.beers);
    //                 setIsFallback(res.data.fallback || false);
    //             } else {
    //                 console.warn("Unexpected response format:", res.data);
    //                 setError(true);
    //             }
    //         })
    //         .catch((err) => {
    //             if (axios.isCancel(err)) {
    //                 console.log("Request canceled:", err.message);
    //             } else {
    //                 console.error("Failed to fetch recommendations:", err.message);
    //                 setError(true);
    //             }
    //         });

    //     return () => controller.abort();
    // }, [userId, refreshRecs]);


    // const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    // useEffect(() => {
    //     const uniqueIds = [...new Set(beers.map(b => b.breweryUuid))].filter(id => !!id);

    //     if (uniqueIds.length === 0) return;
    //     // from postgres db
    //     axios.post(
    //     `${BASE_URL}/api/brewer/breweries/details`,
    //     uniqueIds,
    //     {
    //         headers: {
    //         'Content-Type': 'application/json',
    //         },
    //     }
    //     )
    //     .then((res) => setBreweryMap(res.data))
    //     .catch(console.error);
    // }, [beers]);

    return (
        <section className="bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm text-left">
            <h2 className="text-2xl font-bold mb-2">Recs</h2>
            {/* <p className="text-sm mb-2">
                {isFallback
                ? "No reviews yet — here are some popular beers to try!"
                : "Based on your tastes, try these local crafts!"}
            </p>

            <div className="space-y-4 text-sm font-medium">
                {beers.slice(0, 10).map((beer) => {

                    const breweryDetails = breweryMap[beer.breweryUuid];
                    console.log(breweryMap)
                        
                    return (
                    <div key={beer.beerId} className="flex flex-col">
                        <span className="font-semibold text-amber-800">{beer.name}</span>
                        <span className="text-sm text-gray-700">
                            
                            <a href={`/brewery/${beer.breweryUuid}`} className="text-amber-800 hover:underline">
                                {breweryDetails?.name || 'Unknown Brewery'}
                            </a>
                                        
                        </span>
                        <span className="text-sm text-gray-700"> {breweryDetails?.city}, {breweryDetails?.state} </span>
                        <div className="text-gray-700 italic text-sm">
                        {beer?.flavorTags?.length > 0
                            ? beer.flavorTags.map(tag => tag.charAt(0).toUpperCase() + tag.slice(1)).join(', ')
                            : 'N/A'}
                        </div>
                    </div>
                )}
                
                )}
            </div> */}
        </section>

    );
}
