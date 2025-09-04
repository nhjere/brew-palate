import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import BrewerHeader from '../../components/brewer/BrewerHeader.jsx';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import { useBrewerContext } from '../../context/BrewerContext';
import axios from 'axios';

import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";


export default function Analytics() {
    const { brewerId: urlBrewerId } = useParams();
    const { brewerId, token, isAuthenticated, loading, isAuthorizedFor } = useBrewerContext();

    const [status, setStatus] = useState({ hasBrewery: false, brewery: null });
    const [dataLoading, setDataLoading] = useState(true);
    const [brewerBeers, setBrewerBeers] = useState([]);
    const [reviews, setReviews] = useState([]);

    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const isAuthorized = isAuthorizedFor(urlBrewerId);

    useEffect(() => {
        if (!isAuthorized || !token) return;

        const run = async () => {
            setDataLoading(true);
            try {
                // fetch brewery status
                const { data: brewerStatus } = await axios.get(
                    `${BASE_URL}/api/brewer/breweries/status`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setStatus(brewerStatus);

                // get brewery id from payload
                const breweryUuid = brewerStatus?.brewery?.breweryId;

                if (!breweryUuid) {
                    setBrewerBeers([]);
                    setReviews([]);
                    return;
                }

                // fetch the beers from this brewery
                const { data: beers } = await axios.get(
                    `${BASE_URL}/api/import/by-brewery/${breweryUuid}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const normalizedBeers = Array.isArray(beers) ? beers : [];
                setBrewerBeers(normalizedBeers);

                // extract beer IDs and fetch reviews in bulk
                const beerIds = normalizedBeers
                    .map(b => b.beer_id ?? b.beerId ?? b.id ?? b.uuid ?? null)
                    .filter(Boolean)
                    .map(String);

                if (beerIds.length === 0) {
                    setReviews([]);
                } else {
                    const idsCsv = beerIds.join(',');
                    const { data: reviewList } = await axios.get(
                        `${BASE_URL}/api/analytics/reviews`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                            params: { beerIds: idsCsv },
                        }
                    );
                    setReviews(Array.isArray(reviewList) ? reviewList : []);
                }
            } catch (e) {
                console.error('Failed to fetch analytics data:', e);
                setStatus({ hasBrewery: false, brewery: null });
                setBrewerBeers([]);
                setReviews([]);
            } finally {
                setDataLoading(false);
            }
        };

        run();
    }, [BASE_URL, token, isAuthorized]);

    // Process data to group reviews by beer and calculate stats
    const processedBeers = brewerBeers.map(beer => {
        const beerId = beer.beerId;
        const beerReviews = reviews.filter(review => 
            String(review.beerId) === String(beerId)
        );

        // Calculate average rating
        const avgRating = beerReviews.length > 0 
            ? beerReviews.reduce((sum, review) => sum + (review.overallEnjoyment || 0), 0) / beerReviews.length
            : 0;

        // Count positive and negative tags
        const allTags = beerReviews.flatMap(review => review.flavorTags || []);
        const positiveTags = ['Balanced', 'Smooth', 'Refreshing', 'Bold Flavor', 'Light & Easy', 'Clean Finish'];
        const negativeTags = ['Too Bitter', 'Too Sweet', 'Watery', 'Harsh Finish', 'Off Taste', 'Flat'];
        
        const positiveTagCounts = {};
        const negativeTagCounts = {};
        
        allTags.forEach(tag => {
            if (positiveTags.includes(tag)) {
                positiveTagCounts[tag] = (positiveTagCounts[tag] || 0) + 1;
            } else if (negativeTags.includes(tag)) {
                negativeTagCounts[tag] = (negativeTagCounts[tag] || 0) + 1;
            }
        });

        return {
            ...beer,
            reviews: beerReviews,
            avgRating: avgRating,
            reviewCount: beerReviews.length,
            positiveTagCounts,
            negativeTagCounts
        };
    });

    if (loading) return <LoadingScreen message="Authenticating..." />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (isAuthenticated && brewerId && brewerId !== urlBrewerId) {
        return <Navigate to={`/brewer/analytics/${brewerId}`} replace />;
    }
    if (dataLoading) return <LoadingScreen message="Loading analytics..." />;

    const breweryName = status?.brewery?.name || status?.brewery?.breweryName || '—';
    const totalReviews = reviews.length;
    const avgBreweryRating = totalReviews > 0 
        ? reviews.reduce((sum, review) => sum + (review.overallEnjoyment || 0), 0) / totalReviews
        : 0;

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-[#fff4e6] flex flex-col
                        pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            <BrewerHeader />
            <div className="flex flex-col gap-5 w-full p-5">
                {/* Overview Section */}
                <section className="w-full bg-white p-6 rounded-2xl overflow-hidden border shadow-md">
                    <div className="flex flex-row items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-amber-900">Analytics Dashboard</h2>
                        <p className="text-green-600 font-semibold">✓ Authorized Access</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-orange-100 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-amber-900">Brewery</h3>
                            <p className="text-amber-800">{breweryName}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-blue-900">Total Beers</h3>
                            <p className="text-2xl font-bold text-blue-800">{brewerBeers.length}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-green-900">Total Reviews</h3>
                            <p className="text-2xl font-bold text-green-800">{totalReviews}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-yellow-900">Avg Rating</h3>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-yellow-800">
                                    {avgBreweryRating.toFixed(1)}
                                </p>
                                <div className="flex text-yellow-500">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star} className="text-lg">
                                            {avgBreweryRating >= star ? '★' : '☆'}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className='flex flex-row gap-5'>

                {/* Beer Details Section */}
                <section className="w-full bg-white p-6 rounded-2xl overflow-hidden border shadow-md flex-1">
                    <h3 className="text-2xl font-bold text-amber-900 mb-4">Beer Performance Details</h3>
                    
                    {processedBeers.length === 0 ? (
                        <p className="text-gray-600">No beers found for this brewery.</p>
                    ) : (
                        <div className="space-y-6">
                            {processedBeers.map((beer) => (
                                <BeerAnalyticsCard key={beer.beer_id || beer.id} beer={beer} />
                            ))}
                        </div>
                    )}
                </section>

                <section className="w-auto bg-white p-6 rounded-2xl overflow-hidden border shadow-md flex-2">
                <h3 className="text-2xl font-bold text-amber-900 mb-4">Statistics</h3>

                {/* Avg Rating per Beer (Bar Chart) */}
                {processedBeers.length === 0 ? (
                    <p className="text-gray-600">No statistics available.</p>
                ) : (
                    <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 font-semibold">Avg Rating per Beer</span>
                        <span className="text-xs text-gray-500">0 to 5</span>
                    </div>

                    <div className="space-y-2">
                        {processedBeers
                        .slice() // copy
                        .sort((a, b) => b.avgRating - a.avgRating) // highest first
                        .map((beer) => {
                            const value = Math.max(0, Math.min(5, beer.avgRating || 0));
                            const width = `${(value / 5) * 100}%`;
                            const label = beer.name || beer.beerName || 'Unnamed Beer';
                            return (
                            <div key={beer.beer_id || beer.id || label} className="w-full">
                                <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-amber-900 font-medium truncate pr-2">{label}</span>
                                <span className="text-xs text-gray-600">{value.toFixed(1)}</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 rounded-full border border-gray-200 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                                    style={{ width }}
                                    aria-label={`${label} average rating ${value.toFixed(1)} out of 5`}
                                />
                                </div>
                            </div>
                            );
                        })}
                    </div>
                    </div>
                )}
                </section>


                </div>
            </div>
        </div>
    );
}

function BeerAnalyticsCard({ beer }) {
    const [expanded, setExpanded] = useState(false);
    
    return (
        <div className="border border-gray-200 rounded-xl p-4 bg-gradient-to-r from-[#4e2105] to-[#241200] text-white">
            {/* Beer Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h4 className="text-xl font-bold text-white">{beer.name || beer.beerName}</h4>
                    <p className="text-gray-200">{beer.style} • {beer.abv ? (beer.abv * 100).toFixed(1) : 0}% ABV</p>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-white">
                            {beer.avgRating.toFixed(1)}
                        </span>
                        <div className="flex text-yellow-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className="text-sm">
                                    {beer.avgRating >= star ? '★' : '☆'}
                                </span>
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-gray-200">{beer.reviewCount} reviews</p>
                </div>
            </div>

            {/* Tags Summary */}
            {(Object.keys(beer.positiveTagCounts).length > 0 || Object.keys(beer.negativeTagCounts).length > 0) && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {Object.entries(beer.positiveTagCounts).map(([tag, count]) => (
                        <span key={tag} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            ✓ {tag} ({count})
                        </span>
                    ))}
                    {Object.entries(beer.negativeTagCounts).map(([tag, count]) => (
                        <span key={tag} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            ✗ {tag} ({count})
                        </span>
                    ))}
                </div>
            )}
            {/* Expand/Collapse Button */}
            {beer.reviews.length > 0 && (
            <div
                onClick={() => setExpanded(!expanded)}
                className="flex items-center text-sm font-semibold cursor-pointer"
            >
                {expanded ? (
                <>
                    <ChevronUpIcon className="w-4 h-4" />
                    <span>Hide Reviews</span>
                </>
                ) : (
                <>
                    <ChevronDownIcon className="w-4 h-4" />
                    <span>Show {beer.reviews.length} Reviews</span>
                </>
                )}
            </div>
            )}


            {/* Reviews List */}
            {expanded && beer.reviews.length > 0 && (
                <div className=" space-y-3 pt-4">
                    {beer.reviews.map((review, index) => (
                        <ReviewCard key={review.reviewId || index} review={review} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ReviewCard({ review }) {
    return (
        <div className="bg-white-50 p-3 rounded-xl border border-amber-100">
            <div className="flex justify-between items-start mb-2">

                <div className='flex flex-row'> 
                    <div className='flex flex-row gap-5'> 
                            <div className='text-white text-sm font-semibold'> Rating: {review.overallEnjoyment}</div>
                            <div className="flex text-yellow-500">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className="text-sm">
                                        {(review.overallEnjoyment || 0) >= star ? '★' : '☆'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {review.flavorTags && review.flavorTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {review.flavorTags.map((tag, i) => (
                                <span 
                                    key={i} 
                                    className={`px-2 py-1 rounded-full text-xs ${
                                        ['Balanced', 'Smooth', 'Refreshing', 'Bold Flavor', 'Light & Easy', 'Clean Finish'].includes(tag)
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-red-50 text-red-700'
                                    }`}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>                
            {review.comment && (
                <p className="text-gray-200 text-sm italic">"{review.comment}"</p>
            )}
        </div>
    );
}