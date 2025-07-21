import Header from '../components/header'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

export default function BreweryPage() {
    // User clicks on a brewery link and takes them to an informative page about the brewery

    const [brewery, setBrewery] = useState([]);
    const { breweryId } = useParams();

    useEffect(() => {

        if (!breweryId) return;
        console.log("Fetching brewery:", breweryId); // helpful debug log
        axios.get(`http://localhost:8080/api/brewer/breweries/${breweryId}`)
        .then(res => setBrewery(res.data))
        .catch(err => console.error('Error fetching brewery ', err));
    }, [breweryId]);

    return(

       <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-orange-100 p-4 shadow-md">
        <Header />
      </div>

      {/* Brewery Info Card */}
      <main className="flex justify-center py-12 px-4">
        <div className="bg-red-50 rounded-2xl shadow-lg border border-gray-200 p-8 max-w-2xl w-full space-y-4">
          <h2 className="text-3xl text-amber-800 font-bold">{brewery.name}</h2>
          <p className="text-gray-800 text-lg italic">{brewery.brewery_type?.charAt(0).toUpperCase() + brewery.brewery_type?.slice(1)} Brewery</p>
          
          <div className="text-gray-700 text-md space-y-1">
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
              ) : (
                'Not listed'
              )}
            </p>
            <p><strong>Country:</strong> {brewery.country}</p>

          </div>
        </div>
      </main>
    </div>
    )

}

