
import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
    <section className="mt-6 max-w-250">
        <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-2xl font-bold text-amber-900">
            Recommended Beers
        </h2>
        {isFallback && (
            <span className="text-sm px-2 py-1 rounded border border-amber-300 text-amber-700 bg-amber-50">
            Getting to know your taste — showing starter picks
            </span>
        )}
        </div>

        {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
            Couldn’t load recommendations. Please try again.
        </div>
        )}

        {!error && beers.length > 0 && (
        <div className="flex gap-5 overflow-x-auto w-scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-transparent">
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
  // beer fields: { beerId, name, style, abv, tags?: string[], breweryUuid }
  // brewery fields: { breweryName, city, state, distanceMi? }
  const name = beer?.name ?? 'Untitled Beer';
  const style = beer?.style ?? '—';
  const abv = (beer?.abv ?? null);
  const tags = Array.isArray(beer?.tags) ? beer.tags : [];

  const breweryName = brewery?.breweryName ?? 'Unknown Brewery';
  const location =
    brewery?.city && brewery?.state ? `${brewery.city}, ${brewery.state}` : '';
  const distanceLabel =
    typeof brewery?.distanceMi === 'number'
      ? ` • ${brewery.distanceMi.toFixed(1)} mi`
      : '';

    return (
        <article className="rounded-2xl border border-amber-200 bg-[#fff7ec] shadow-sm p-5 grid grid-rows-[auto_auto_1fr_auto] gap-2 min-h-[220px]">
        {/* Title */}
        <h3 className="text-2xl font-extrabold text-amber-900 leading-tight line-clamp-2">
            {name}
        </h3>

        {/* Brewery + meta */}
        <div className="text-amber-800/90">
            <div className="font-semibold">{breweryName}</div>
            <div className="text-sm">
            {location}
            {distanceLabel}
            </div>
            <div className="text-sm mt-1">
            {style !== '—' ? style : ''}{abv ? ` • ABV ${Number(abv) * (Number(abv) <= 1 ? 100 : 1)}%` : ''}
            </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-1">
            {tags.slice(0, 6).map((t) => (
            <span
                key={t}
                className="px-3 py-1 rounded-full text-sm border border-amber-300 bg-amber-50 text-amber-800"
            >
                {t}
            </span>
            ))}
            {tags.length === 0 && (
            <span className="px-3 py-1 rounded-full text-sm border border-amber-200 text-amber-500">
                No flavor tags
            </span>
            )}
        </div>

        {/* CTA */}
        <div className="mt-3">
            <button
            type="button"
            className="ml-auto block rounded-lg border border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold px-4 py-2 transition"
            onClick={() => {
                // TODO: open your Review modal here
                // openReviewModal(beer)
                console.log('Review click', beer?.beerId || beer?.id);
            }}
            >
            Review
            </button>
        </div>
        </article>
    );
    }

}
