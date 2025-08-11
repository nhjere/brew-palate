
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TagIcon } from '@heroicons/react/20/solid';

export default function Recommendations({ userId, refreshRecs }) {
    const [beers, setBeers] = useState([]);
    const [isFallback, setIsFallback] = useState(false);
    const [breweryMap, setBreweryMap] = useState('');
    const [error, setError] = useState(false);

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
    <section className="max-w-250">
        <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-2xl font-bold text-amber-900">
            Recommended Beers
        </h2>
        {isFallback && (
            <span className="text-center text-amber-800">
            We are getting to know your taste so review some beers! Here are some starter picks:
            </span>
        )}
        </div>

        {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
            Couldn’t load recommendations. Please try again.
        </div>
        )}

        {!error && beers.length > 0 && (
        <div className="flex gap-5 overflow-x-auto custom-scrollbar !h-5px">
            {beers.slice(0, 10).map((beer) => (
            <div key={beer.beerId} className="flex-shrink-0 w-80">
                <BeerCard beer={beer} brewery={breweryMap?.[beer.breweryUuid]} />
            </div>
            ))}
        </div>
        )}
    </section>
    );


function BeerCard({ beer, brewery }) {

    return (
        <article className="w-full bg-red-50 rounded-2xl overflow-hidden border transition-all shadow-sm mb-5 p-5 grid min-h-[220px]">
        {/* Title */}
        <div className="text-xl font-extrabold text-amber-900">
            {beer?.name}
        </div>

        {/* Brewery + meta */}
        <div className="text-amber-800 mt-1">
            <a href={`/brewery/${beer.breweryUuid}`}>
                {brewery?.name || 'Unknown Brewery'}
            </a>
            <div className="text-s mt-1">
                {brewery?.city} , {brewery?.state}
            </div>
            <div className="text-s mt-1">
                {beer.style} • ABV = {(beer.abv * 100).toFixed(1)}%
            </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-1">
            {beer.flavorTags.slice(0, 6).map((tag) => (
            <span
                key={tag}
                className="px-3 py-1 h-8 rounded-full text-sm border border-amber-300 bg-amber-50 text-amber-800">
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </span>
            ))}
            {beer.flavorTags.length === 0 && (
            <span className="px-3 py-1 rounded-full text-sm border border-amber-300 bg-amber-50 text-amber-800">
                No flavor tags
            </span>
            )}
        </div>

        </article>
    );
    }

}