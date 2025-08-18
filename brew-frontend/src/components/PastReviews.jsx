import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';

export default function NewPastReviews({ withShell = true, userId, refreshRecs }) {
    const [reviews, setReviews] = useState([]);
    const [beerMap, setBeerMap] = useState({});
    const [isOpen, setIsOpen] = useState(false); 
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
    if (!userId) return;

    async function fetchReviewsAndBeers() {
        try {
        const reviewsRes = await axios.get(`${BASE_URL}/api/user/reviews/user/${userId}`);
        const reviews = reviewsRes.data;
        setReviews(reviews);

        const uniqueBeerIds = [...new Set(reviews.map(r => r.beerId))];
        if (uniqueBeerIds.length === 0) {
            setBeerMap({});
            return;
        }

        const params = new URLSearchParams();
        uniqueBeerIds.forEach(id => params.append('beerIds', id));

        const beersRes = await axios.get(`${BASE_URL}/api/import/fetchById?${params.toString()}`);
        
        const beerMap = {};
        beersRes.data.forEach(beer => {
            beerMap[beer.beerId] = beer;
        });

        Object.values(beerMap).forEach(beer => {
            console.log(beer);
        });

        setBeerMap(beerMap);
        } catch (err) {
        console.error('Error fetching reviews or beers', err);
        }
    }

    fetchReviewsAndBeers();
    }, [userId, refreshRecs]);

    if (!withShell) {
    return (
    <div className=" text-amber-900">
        {reviews.length === 0 ? (
            <p className="text-gray-600 italic">No reviews yet... start reviewing to get recommendations!</p>
        ) : (
            <div className="space-y-4 text-sm font-medium !no-scrollbar pr-2">
                {[...reviews].reverse().map((review) => {
                    const beer = beerMap[review.beerId];
                    const stars = '★'.repeat(review.overallEnjoyment) + '☆'.repeat(5 - review.overallEnjoyment);

                    return (
                        <div key={review.beerId} className="flex flex-col">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-amber-900">{beer?.name || 'Unknown Beer'}</span>
                                <span className="text-yellow-600 font-bold tracking-wider">{stars}</span>
                            </div>
                            <div className="pl-0 text-gray-700 italic text-sm">
                                {beer?.flavorTags?.length > 0
                                    ? beer.flavorTags.map(tag => tag.charAt(0).toUpperCase() + tag.slice(1)).join(', ')
                                    : 'N/A'}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
    )}
}