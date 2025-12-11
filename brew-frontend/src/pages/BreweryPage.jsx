import UserHeader from '../components/user/UserHeader'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ReviewModal from '../components/user/ReviewModal';

export default function BreweryPage() {
  // User clicks on a brewery link and takes them to an informative page about the brewery

  const [brewery, setBrewery] = useState([]);
  const [beersFromBrewery, setBeersFromBrewery] = useState([]);
  const { breweryId } = useParams();
  
  // review modal variables
  const [selectedBeerId, setSelectedBeerId] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [refreshRecs, setRefreshRecs] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!breweryId) return;

    axios.get(`${BASE_URL}/api/brewer/breweries/${breweryId}`)
      .then(res => setBrewery(res.data))
      .catch(err => console.error('Error fetching brewery ', err));

    axios.get(`${BASE_URL}/api/import/by-brewery/${breweryId}`)
      .then(res => setBeersFromBrewery(res.data))
      .catch(err => console.error('Error fetching brewery ', err));

  }, [breweryId]);


  // Print each beer in beersForBrewery
  beersFromBrewery.forEach(beer => {
    console.log('Beer: ', beer);
  });

  return (
    <div className="min-h-screen bg-white">
      <UserHeader />

      <main className="max-w-3xl mx-auto py-12 px-4 space-y-10">
        {/* Brewery Info */}
        <section className="bg-[#f2f2f2] text-center shadow-sm border border-slate-200 p-8 space-y-4">
          <h2 className="text-4xl text-[#8C6F52] font-bold">{brewery.name}</h2>
          <p className="text-slate-600 text-lg italic">
            {brewery.brewery_type
              ? `${brewery.brewery_type.charAt(0).toUpperCase()}${brewery.brewery_type.slice(1)} Brewery`
              : 'Brewery'}
          </p>

          <div className="text-slate-700 text-md space-y-2">
            <p>
              <strong className="text-slate-800">Address:</strong>{' '}
              {brewery.street}, {brewery.city}, {brewery.state}{' '}
              {brewery.postal_code}
            </p>
            <p>
              <strong className="text-slate-800">Phone:</strong>{' '}
              {brewery.phone || 'Not listed'}
            </p>
            <p>
              <strong className="text-slate-800">Website:</strong>{' '}
              {brewery.website_url ? (
                <a
                  href={brewery.website_url}
                  className="text-[#3C547A] hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {brewery.website_url}
                </a>
              ) : (
                'Not listed'
              )}
            </p>
            <p>
              <strong className="text-slate-800">Country:</strong>{' '}
              {brewery.country}
            </p>
          </div>
        </section>

        {/* Brews List */}
        <section className="bg-[#f2f2f2] shadow-sm border border-slate-200 p-8 space-y-6">
          <h2 className="text-3xl text-center text-[#8C6F52] font-bold">Brews</h2>

          {beersFromBrewery.length > 0 ? (
            <ul className="space-y-4">
              {beersFromBrewery.map((beer) => (
                <li
                  key={beer.beerId}
                  className="
                    bg-white border border-slate-200 
                    p-4 rounded-lg shadow-sm 
                    flex items-center gap-4
                  "
                >
                  {/* Left: beer info */}
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 truncate">
                      {beer.name}
                    </h3>
                    <p className="text-sm text-slate-600 italic">
                      {beer.style || 'Unknown Style'}
                      {beer.ounces ? ` — ${beer.ounces} oz` : ''}
                    </p>
                  </div>

                  {/* Right: Review button pinned far right */}
                  <button
                    className="
                      ml-auto bg-[#3C547A] hover:bg-[#314466] 
                      text-white px-4 py-1 rounded-full font-semibold shrink-0
                      transition-colors
                    "
                    onClick={() => {
                      setSelectedBeerId(beer.beerId);
                      setShowReviewModal(true);
                    }}
                  >
                    Review
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="italic text-slate-500">
              No beers listed for this brewery.
            </p>
          )}
        </section>
      </main>

      {showReviewModal && (
        <ReviewModal
          beerId={selectedBeerId}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmit={() => setRefreshRecs((prev) => !prev)}
        />
      )}
    </div>
  );
}
