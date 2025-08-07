
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';

export default function Recommendations({ userId, refreshRecs }) {
    const [beers, setBeers] = useState([]);
    const [isFallback, setIsFallback] = useState(false);
    const [breweryMap, setBreweryMap] = useState('');
    const [error, setError] = useState(false);
    const [isOpen, setIsOpen] = useState(false); 

    useEffect(() => {
        if (!userId) return;
        // controller can cancel requests
        const controller = new AbortController();
        const signal = controller.signal;
        const RECOMMENDATION_URL = import.meta.env.VITE_RECOMMENDATION_BASE_URL;
        
        // change to REC_URL when fast api service is deployed 
        axios.get(`${RECOMMENDATION_URL}/live-recs/${userId}`, { signal })
            .then((res) => {
                if (Array.isArray(res.data.beers)) {
                    setBeers(res.data.beers);
                    setIsFallback(res.data.fallback || false);
                } else {
                    console.warn("Unexpected response format:", res.data);
                    setError(true);
                }
            })
            .catch((err) => {
                if (axios.isCancel(err)) {
                    console.log("Request canceled:", err.message);
                } else {
                    console.error("Failed to fetch recommendations:", err.message);
                    setError(true);
                }
            });

        return () => controller.abort();
    }, [userId, refreshRecs]);


    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    useEffect(() => {
        const uniqueIds = [...new Set(beers.map(b => b.breweryUuid))].filter(id => !!id);

        if (uniqueIds.length === 0) return;
        // from postgres db
        axios.post(
        `${BASE_URL}/api/brewer/breweries/details`,
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
        <div className="w-full bg-white rounded-2xl overflow-hidden border shadow-md transition-all">
            {/* Top Toggle Bar */}
            <div
                className="flex items-center justify-between px-4 py-2 text-xl font-semibold cursor-pointer"
                onClick={() => setIsOpen(prev => !prev)}
            >
                <span>Recommendations</span>
                {isOpen ? (
                    <ChevronUpIcon className="w-4 h-4 text-amber-900" />
                ) : (
                    <ChevronDownIcon className="w-4 h-4 text-amber-900" />
                )}
            </div>

            {/* Dropdown Recommendation List */}
            {isOpen && (
                <div className="px-4 pb-4 pt-2 text-amber-900 border-gray-400">
                    {error ? (
                        <p className="text-red-600">Failed to load recommendations.</p>
                    ) : (
                        <>
                            <p className="text-sm mb-2">
                                {isFallback
                                    ? "No reviews yet — here are some popular beers to try!"
                                    : "Based on your tastes, try these local crafts!"}
                            </p>
                            <div className="space-y-4 text-sm font-medium  overflow-y-auto custom-scrollbar pr-1">
                                {beers.slice(0, 8).map((beer) => {
                                    const breweryDetails = breweryMap[beer.breweryUuid];
                                    return (
                                        <div key={beer.beerId} className="flex flex-col">
                                            <span className="font-semibold text-amber-800">{beer.name}</span>
                                            <span className="text-sm text-gray-700">
                                                <a href={`/brewery/${beer.breweryUuid}`} className="text-amber-800 hover:underline">
                                                    {breweryDetails?.name || 'Unknown Brewery'}
                                                </a>
                                            </span>
                                            <span className="text-sm text-gray-700">
                                                {breweryDetails?.city}, {breweryDetails?.state}
                                            </span>
                                            <div className="text-gray-700 italic text-sm">
                                                {beer?.flavorTags?.length > 0
                                                    ? beer.flavorTags.map(tag =>
                                                        tag.charAt(0).toUpperCase() + tag.slice(1)
                                                    ).join(', ')
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
