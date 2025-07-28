import Header from '../components/Header'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useBeerMap } from '../context/BeerContext';

export default function BreweryPage() {
    // User clicks on a brewery link and takes them to an informative page about the brewery

    const [brewery, setBrewery] = useState([]);
    const [beersFromBrewery, setBeersFromBrewery] = useState([]);
    const { breweryId } = useParams();
    // const [beerMap, setBeerMap] = useBeerMap();

    useEffect(() => {

        if (!breweryId) return;

        axios.get(`http://localhost:8080/api/brewer/breweries/${breweryId}`)
        .then(res => setBrewery(res.data))
        .catch(err => console.error('Error fetching brewery ', err));

        axios.get(`http://localhost:8080/api/import/by-brewery/${breweryId}`)
        .then(res => setBeersFromBrewery(res.data))
        .catch(err => console.error('Error fetching brewery ', err));

    }, [breweryId]);


    // Print each beer in beersForBrewery
    beersFromBrewery.forEach(beer => {
        console.log('Beer: ', beer);
    });

        

    return(
<div className="min-h-screen bg-amber-50">
  <div className="bg-orange-100 shadow-md px-6 py-4">
    <Header />
  </div>

  <main className="max-w-3xl mx-auto py-12 px-4 space-y-10">

    <section className="bg-red-50 rounded-2xl shadow-md border border-gray-200 p-8 space-y-4">
      <h2 className="text-4xl text-amber-800 font-bold">{brewery.name}</h2>
      <p className="text-gray-800 text-lg italic">
        {brewery.brewery_type?.charAt(0).toUpperCase() + brewery.brewery_type?.slice(1)} Brewery
      </p>

      <div className="text-gray-700 text-md space-y-2">
        <p><strong>Address:</strong> {brewery.street}, {brewery.city}, {brewery.state} {brewery.postal_code}</p>
        <p><strong>Phone:</strong> {brewery.phone || 'Not listed'}</p>
        <p>
          <strong>Website:</strong>{' '}
          {brewery.website_url ? (
            <a
              href={brewery.website_url}
              className="text-blue-700 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {brewery.website_url}
            </a>
          ) : 'Not listed'}
        </p>
        <p><strong>Country:</strong> {brewery.country}</p>
      </div>
    </section>

    <section className="bg-red-50 rounded-2xl shadow-md border border-gray-200 p-8 space-y-6">
      <h2 className="text-3xl text-amber-800 font-bold">Brews</h2>

      {beersFromBrewery.length > 0 ? (
        <ul className="space-y-4">
          {beersFromBrewery.map((beer) => (
            <li
              key={beer.beerId}
              className="bg-amber-800 border border-gray-100 p-4 rounded-lg shadow-sm"
            >
              <h3 className="text-lg font-semibold text-white">{beer.name}</h3>
              <p className="text-sm text-white italic">
                {beer.style || 'Unknown Style'} — {beer.ounces || '?'} oz
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="italic text-gray-600">No beers listed for this brewery.</p>
      )}
    </section>
    
  </main>
</div>


    )

}

