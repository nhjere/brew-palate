import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import BrewerHeader from '../../components/brewer/BrewerHeader.jsx';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import { useBrewerContext } from '../../context/BrewerContext';
import AnalyticsWidget from '../../components/brewer/AnalyticsWidget.jsx';
import axios from 'axios';

import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

export default function Analytics() {
    const { brewerId: urlBrewerId } = useParams();
    const { brewerId, token, isAuthenticated, loading, isAuthorizedFor } = useBrewerContext();

    const [dataLoading, setDataLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [error, setError] = useState(null);

    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const isAuthorized = isAuthorizedFor(urlBrewerId);

    useEffect(() => {
        if (!isAuthorized || !token) return;

        const fetchAnalytics = async () => {
            setDataLoading(true);
            setError(null);
            
            try {
                // Single API call to get all analytics data
                const { data: analytics } = await axios.get(
                    `${BASE_URL}/api/analytics/brewery-dashboard`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                setAnalyticsData(analytics);
                console.log(analytics)
                console.log(analytics.beers)

            } catch (e) {
                console.error('Failed to fetch analytics data:', e);
                setError('Failed to load analytics data');
                setAnalyticsData({ beers: [], totalReviews: 0, avgBreweryRating: 0.0, breweryName: null });
                
            } finally {
                setDataLoading(false);
            }
        };

        fetchAnalytics();
    }, [BASE_URL, token, isAuthorized]);

    if (loading) return <LoadingScreen message="Authenticating..." />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (isAuthenticated && brewerId && brewerId !== urlBrewerId) {
        return <Navigate to={`/brewer/analytics/${brewerId}`} replace />;
    }
    if (dataLoading) return <LoadingScreen message="Loading analytics..." />;

    // Extract data from the new backend response structure
    const breweryName = analyticsData?.breweryName || '—';
    const totalBeers = analyticsData?.beers?.length || 0;
    const totalReviews = analyticsData?.totalReviews || 0;
    const avgBreweryRating = analyticsData?.avgBreweryRating || 0;
    const beers = analyticsData?.beers || [];

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-[#fff4e6] flex flex-col
                        pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            <BrewerHeader />
            <div className="flex flex-col gap-5 w-full p-5">
                {/* Error Display */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

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
                        <div className="bg-orange-100 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-amber-900">Total Beers</h3>
                            <p className="text-2xl font-bold text-amber-800">{totalBeers}</p>
                        </div>
                        <div className="bg-orange-100 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-amber-900">Total Reviews</h3>
                            <p className="text-2xl font-bold text-amber-800">{totalReviews}</p>
                        </div>
                        <div className="bg-orange-100 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-amber-900">Avg Rating</h3>
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

                <div className='flex flex-row gap-5 h-[700px]'>

                {/* Beer Details Section */}
                <section className="w-full bg-white p-6 rounded-2xl overflow-hidden border shadow-md flex-1 overflow-y-auto custom-scrollbar">
                    <h3 className="text-2xl font-bold text-amber-900 mb-4">Beer Performance Details</h3>
                    
                    {beers.length === 0 ? (
                        <p className="text-gray-600">No beers found for this brewery.</p>
                    ) : (
                        <div className="space-y-6">
                            {beers.map((beer) => (
                                <BeerAnalyticsCard key={beer.beerId} beer={beer} />
                            ))}
                        </div>
                    )}
                </section>

                <section className="w-auto bg-white p-6 rounded-2xl overflow-hidden border shadow-md flex-2">
                <h3 className="text-2xl font-bold text-amber-900 mb-4">Statistics</h3>
                {beers.length === 0 ? (
                    <p className="text-gray-600">No statistics available.</p>
                ) : (
                    <AnalyticsWidget beers={beers} />
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
                    <h4 className="text-xl font-bold text-white">{beer.name || 'Unnamed Beer'}</h4>
                    <p className="text-gray-200">{beer.style || 'Unknown Style'} • {beer.abv ? (beer.abv * 100).toFixed(1) : '0.0'}% ABV</p>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-white">
                            {(beer.avgRating || 0).toFixed(1)}
                        </span>
                        <div className="flex text-yellow-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className="text-sm">
                                    {(beer.avgRating || 0) >= star ? '★' : '☆'}
                                </span>
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-gray-200">{beer.reviewCount || 0} reviews</p>
                </div>
            </div>

            {/* Tags Summary */}
            {(Object.keys(beer.positiveTagCounts || {}).length > 0 || Object.keys(beer.negativeTagCounts || {}).length > 0) && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {Object.entries(beer.positiveTagCounts || {}).map(([tag, count]) => (
                        <span key={tag} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            ✓ {tag} ({count})
                        </span>
                    ))}
                    {Object.entries(beer.negativeTagCounts || {}).map(([tag, count]) => (
                        <span key={tag} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            ✗ {tag} ({count})
                        </span>
                    ))}
                </div>
            )}

            {/* Expand/Collapse Button */}
            {beer.reviews && beer.reviews.length > 0 && (
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
            {expanded && beer.reviews && beer.reviews.length > 0 && (
                <div className=" space-y-3 pt-4">
                    {beer.reviews.map((review) => (
                        <ReviewCard key={review.reviewId} review={review} />
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
                            <div className='text-white text-sm font-semibold'> Rating: {review.overallEnjoyment || 0}</div>
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