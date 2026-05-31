
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { TagIcon } from '@heroicons/react/20/solid';
import SurveyButton from '../onboarding/SurveyButton';

const ChevronLeft = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="4 1 8 14" fill="currentColor" aria-hidden="true" {...props}>
        <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0" />
    </svg>
);
const ChevronRight = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="4 1 8 14" fill="currentColor" aria-hidden="true" {...props}>
        <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
    </svg>
);

const CARD_WIDTH = 320; // w-[20rem]
const GAP = 20;         // gap-5

export default function Recommendations({ userId, refreshRecs }) {
    const [beers, setBeers] = useState([]);
    const [isFallback, setIsFallback] = useState(false);
    const [breweryMap, setBreweryMap] = useState('');
    const [error, setError] = useState(false);
    const scrollerRef = useRef(null);
    const [pageCount, setPageCount] = useState(1);
    const [currentPage, setCurrentPage] = useState(0);

    const getPageMetrics = () => {
        const el = scrollerRef.current;
        if (!el) return { cardsPerPage: 1, pageWidth: CARD_WIDTH + GAP };
        const cardsPerPage = Math.max(
            1,
            Math.floor((el.clientWidth + GAP) / (CARD_WIDTH + GAP))
        );
        return { cardsPerPage, pageWidth: cardsPerPage * (CARD_WIDTH + GAP) };
    };

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el || beers.length === 0) return;

        const updateMetrics = () => {
            const { cardsPerPage, pageWidth } = getPageMetrics();
            setPageCount(Math.max(1, Math.ceil(beers.length / cardsPerPage)));
            setCurrentPage(Math.round(el.scrollLeft / pageWidth));
        };

        updateMetrics();
        const onScroll = () => {
            const { pageWidth } = getPageMetrics();
            setCurrentPage(Math.round(el.scrollLeft / pageWidth));
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', updateMetrics);
        return () => {
            el.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', updateMetrics);
        };
    }, [beers.length]);

    const scrollToPage = (pageIdx) => {
        const el = scrollerRef.current;
        if (!el) return;
        const { pageWidth } = getPageMetrics();
        const clamped = Math.max(0, Math.min(pageIdx, pageCount - 1));
        el.scrollTo({ left: clamped * pageWidth, behavior: 'smooth' });
    };

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


    const atStart = currentPage <= 0;
    const atEnd = currentPage >= pageCount - 1;

    return (
    <section className="w-full min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-baseline gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-[#8C6F52]">
                    Recommendations for you!
                </h2>
                {isFallback && (
                    <span className="text-[#8C6F52]">
                        Tell us about your taste to unlock personalized picks.
                    </span>
                )}
            </div>
            <SurveyButton userId={userId} variant="cta" />
        </div>

        {error ? (
            <div className="w-full rounded-lg border border-red-300 bg-red-50 px-5 py-4 text-red-700">
                <p className="font-semibold">Unable to load recommendations</p>
                <p className="mt-1 text-sm opacity-80">The recommendation service could not be reached. Please try again later.</p>
            </div>
        ) : beers.length > 0 && (
            <div className="relative w-full min-w-0">
                {/* Left arrow — desktop only, overlaid on the carousel */}
                {pageCount > 1 && (
                    <button
                        type="button"
                        onClick={() => scrollToPage(currentPage - 1)}
                        disabled={atStart}
                        aria-label="Previous recommendations"
                        className="flex absolute left-2 top-1/2 -translate-y-1/2 z-20
                                   h-11 w-11 items-center justify-center rounded-full
                                   bg-[#8C6F52] text-white shadow-lg
                                   hover:bg-[#7a5f47] transition
                                   disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="h-12 w-7" />
                    </button>
                )}

                <div
                    ref={scrollerRef}
                    className="w-full min-w-0 overflow-x-auto no-scrollbar
                               snap-x snap-mandatory scroll-smooth"
                >
                    <div className="flex w-max gap-5">
                        {beers.map((beer) => (
                            <div key={beer.beerId} className="w-[20rem] shrink-0 snap-start">
                                <BeerCard
                                    beer={beer}
                                    brewery={breweryMap?.[beer.breweryUuid]}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right edge fade — signals more content (hidden at end) */}
                {!atEnd && (
                    <div className="pointer-events-none absolute right-0 top-0 bottom-0
                                    w-16 bg-gradient-to-l from-white to-transparent z-10" />
                )}

                {/* Right arrow — desktop only */}
                {pageCount > 1 && (
                    <button
                        type="button"
                        onClick={() => scrollToPage(currentPage + 1)}
                        disabled={atEnd}
                        aria-label="Next recommendations"
                        className="flex absolute right-2 top-1/2 -translate-y-1/2 z-20
                                   h-11 w-11 items-center justify-center rounded-full
                                   bg-[#8C6F52] text-white shadow-lg
                                   hover:bg-[#7a5f47] transition
                                   disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="h-12 w-7" />
                    </button>
                )}

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