import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../index.css"

export default function RecPanel({selectedTags}) {

    const [beers, setBeers] = useState([]);

    // Fetch beers
    useEffect(() => {
        axios.get('http://localhost:8080/api/brewer/beers')
        .then(res => setBeers(res.data))
        .catch(err => console.error(err));
    }, []);

    // filter out beers based on selected tags
    const filteredBeers = selectedTags.length === 0
    ? beers
    : beers.filter(beer =>
        Array.isArray(beer.flavorTags) &&
        selectedTags.every(tag => beer.flavorTags.includes(tag))
    );

    return (
    <section className="bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm">
        <h2 className="text-2xl font-bold mb-2">Recs</h2>
        <p className="text-sm mb-2">Try these local crafts!</p>
        <ul className="list-disc list-outside pl-5 space-y-1 text-sm font-medium">
        {filteredBeers.slice(0, 15).map((beer) => (
            <li key={beer.id} className="mb-4">
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
    )
}