
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
    <section className="max-w-260">
        <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-2xl font-bold text-[#8C6F52]">
            Recommendations for you!
        </h2>
        {isFallback && (
            <span className="text-center text-[#8C6F52]">
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
  <div className="space-y-2">

    <div className="grid grid-flow-col auto-cols-[20rem] gap-5 overflow-x-auto no-scrollbar pb-3">
      {beers.map((beer) => (
        <BeerCard
          key={beer.beerId}
          beer={beer}
          brewery={breweryMap?.[beer.breweryUuid]}
        />
      ))}
    </div>
  </div>
)}

            </section>
    );


function BeerCard({ beer, brewery }) {
    return (
        <article
        className="
            w-full 
            bg-[#445A7D] 
            text-white 
            shadow-md 
            border border-[#314466]
            px-6 py-5 
            flex flex-col 
            h-full
        "
        >
        {/* Beer Name */}
        <h3 className="text-lg font-bold tracking-[0.05em] uppercase">
            {beer?.name}
        </h3>

        {/* Brewery */}
        <div className="mt-1 text-sm opacity-90">
            <a 
            href={`/brewery/${beer.breweryUuid}`} 
            className=" !text-white underline-offset-2 !text-md *:underline hover:underline"
            >
            {brewery?.name || "Unknown Brewery"}
            </a>
            <div className="text-sm mt-1 italic opacity-80">
            {brewery?.city}, {brewery?.state}
            </div>
        </div>

        {/* Divider Line */}
        <div className="mt-4 h-px w-full bg-white/30" />

        {/* Style + ABV */}
        <div className="mt-3 text-sm opacity-90">
            <p>{beer.style}</p>
            <p className="text-xs mt-1 font-semibold opacity-80">
            ABV {((beer.abv || 0) * 100).toFixed(1)}%
            </p>
        </div>

        {/* Flavor Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
            {beer.flavorTags.slice(0, 6).map((tag) => (
            <span
                key={tag}
                className="
                px-3 py-1
                text-xs 
                font-semibold
                border border-white/40 
                bg-[#9f9b97] 
                text-white 
                uppercase tracking-wide
                "
            >
                {tag}
            </span>
            ))}

            {beer.flavorTags.length === 0 && (
            <span className="px-3 py-1 text-xs border border-white/40 bg-white/10 text-white opacity-80">
                No flavor tags
            </span>
            )}
        </div>
        </article>
    );
    }


}