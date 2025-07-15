import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useBeerMap } from '../context/BeerContext';
import "../index.css"


export default function RecPanel({userId, refreshRecs}) {

    const [beers, setBeers] = useState([]);
    const [reviews, setReviews] = useState([]);
    const beerMap = useBeerMap();


    // Fetch beers
    useEffect(() => {
        if (!userId) return;

        axios.get(`http://localhost:8001/live-recs/${userId}`)
        .then(res => setBeers(res.data))
        .catch(err => console.error("Failed to fetch recommendations:", err));
    }, [userId, refreshRecs]);

    // Fetch reviews
    useEffect(() => {
        if (!userId) return;

        axios.get(`http://localhost:8001/reviews/${userId}`)
        .then(res => setReviews(res.data))
        .catch(err => console.error("Failed to fetch user's past reviews:", err));
    }, [userId, refreshRecs]);


    // Log each beer
    useEffect(() => {
        beers.forEach(beer => {
            console.log(beer);
        });
    }, [beers]);

    return (
        <>
            <section className="bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm">
                <h2 className="text-2xl font-bold mb-2">Your Past Reviews</h2>
                <p className="text-sm mb-2">History: </p>
                <ul className="list-disc list-outside pl-5 space-y-1 text-sm font-medium">
                {reviews.slice(0, 5).map((review) => {
                    const beer = beerMap[review.beerId];

                    return (
                         <li key={review.beerId} className="mb-4">
                            <span className="font-semibold">{beer?.name || 'Unknown Beer'}</span>
                            <ul className="ml-4 text-gray-700 list-disc list-inside">
                                <ul className="text-sm">Your Rating: {review.overallEnjoyment}</ul>
                                <ul className="text-sm italic">
                                {
                                    beer?.flavorTags?.length > 0
                                    ? beer.flavorTags.map(tag =>
                                        tag.charAt(0).toUpperCase() + tag.slice(1)
                                        ).join(', ')
                                    : 'N/A'
                                }
                                </ul>
                            </ul>
                            </li>
                    );
                })}
                </ul>
            </section>

            <section className="bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm">
                <h2 className="text-2xl font-bold mb-2">Recs</h2>
                <p className="text-sm mb-2">Try these local crafts!</p>
                <ul className="list-disc list-outside pl-5 space-y-1 text-sm font-medium">
                {beers.slice(0, 20).map((beer) => (
                    <li key={beer.beerId} className="mb-4">
                        <span className="font-semibold">{beer.name}</span>
                        <ul className="ml-4 text-gray-700 list-disc list-inside">
                            {beer.flavorTags.map((tag, index) => (
                                <div key={index} className="italic">
                                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                </div>
                            ))}
                        </ul>
                    </li>
                ))}
                </ul>
            </section>
        </>
    )
}