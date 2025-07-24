import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useBeerMap } from '../context/BeerContext';

export default function PastReviews({ userId, refreshTrigger }) {
    const [reviews, setReviews] = useState([]);
    const beerMap = useBeerMap();

    useEffect(() => {
        if (!userId) return;

        axios
        .get(`http://localhost:8080/api/user/reviews/user/${userId}`)
        .then((res) => setReviews(res.data))
        .catch((err) => console.error('Failed to fetch user reviews:', err));
    }, [userId, refreshTrigger]);

    return (
        <section className="bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm">
        <h2 className="text-2xl font-bold mb-2">Your Past Reviews</h2>
        <p className="text-sm mb-2">History:</p>

        <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {reviews.length === 0 ? (
            <p className="text-gray-600 italic">No reviews yet... start reviewing to get recommendations!</p>
            ) : (
            <ul className="list-disc list-outside pl-5 space-y-1 text-sm font-medium">
                {[...reviews].reverse().map((review) => {
                const beer = beerMap[review.beerId];
                return (
                    <li key={review.beerId} className="mb-4">
                    <span className="font-semibold">{beer?.name || 'Unknown Beer'}</span>
                    <ul className="ml-4 text-gray-700 list-disc list-inside">
                        <li className="text-sm">Your Rating: {review.overallEnjoyment}</li>
                        <li className="text-sm italic">
                        {beer?.flavorTags?.length > 0
                            ? beer.flavorTags.map(tag => tag.charAt(0).toUpperCase() + tag.slice(1)).join(', ')
                            : 'N/A'}
                        </li>
                    </ul>
                    </li>
                );
                })}
            </ul>
            )}
        </div>
        </section>
    );
}