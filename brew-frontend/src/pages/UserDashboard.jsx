import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/header';
import SearchBar from '../components/SearchBar';
import ReviewModal from '../components/ReviewModal'
import TastePanel from '../components/TastePanel';
import { createClient } from '@supabase/supabase-js';
import RecPanel from '../components/RecPanel';
import { useBreweryMap } from '../context/BreweryContext';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function UserDashboard() {

  // main dashboard variables
  const [beers, setBeers] = useState([]);
  const [breweries, setBreweries] = useState([]);
  const [username, setUsername] = useState('');
  const [beerPool, setBeerPool] = useState([]);

  // taste panel variables
  const [flavorTags, setFlavorTags] = useState([]);
  const [committedTags, setCommittedTags] = useState([]);

  // review modal variables
  const [selectedBeerId, setSelectedBeerId] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // pagination variables
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState();
  const breweryMap = useBreweryMap();

  // Fetch username from backend using Supabase user ID
  useEffect(() => {
    const fetchUsername = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (userId) {
        try {
          const BASE_URL = import.meta.env.VITE_BACKEND_URL;
          const res = await axios.get(`${BASE_URL}/api/user/username/${userId}`);
          setUsername(res.data.username);
        } catch (err) {
          console.error("Failed to load username:", err);
        }
      }
    };

    fetchUsername();
  }, []);

  // refetch beer data on currentPage change
  useEffect(() => {
    axios.get(`http://localhost:8080/api/import/show-beers?page=${currentPage}&size=20`)
    .then(res => {
      setBeers(res.data.content), 
      setTotalPages(res.data.totalPages)
    })
    .catch(err => console.error(err));
  }, [currentPage]);

  // refetch brewery data on currentPage change
  useEffect(() => {
  axios.get(`http://localhost:8080/api/import/show-breweries?page=${currentPage}&size=20`)
    .then(res => {
      setBreweries(res.data.content);
      setTotalPages(res.data.totalPages);
    })
    .catch(err => console.error(err));
  }, [currentPage]);

  // fetch entire pool of beers available
  useEffect(() => {
    axios.get(`http://localhost:8080/api/import/all-beers`)
      .then(res => {
        setBeerPool(res.data);
      })
      .catch(err => console.error(err));
  }, []);


  // filtering logic to for main beer feed
  const filteredBeers = committedTags.length === 0
  ? beers
  : beers.filter(beer =>
      Array.isArray(beer.flavorTags) &&
      committedTags.every(tag => beer.flavorTags.includes(tag))
    );
  


  return (
   
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-amber-100 p-4 shadow-md">
        <Header />
        <div className="w-5/6">
          <SearchBar />
        </div>
        <div className="text-lg text-amber-800 font-semibold ml-2">
          Welcome, {username}!
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-row flex-1 w-full min-h-[500px]">

        {/* Left Sidebar */}
        <aside className="w-1/5 min-w-[220px] flex-shrink-0 bg-amber-100 p-4 space-y-4 text-left text-amber-800">
          <button className="bg-orange-100 w-full py-2 rounded-md">My Profile</button>
          <button className="bg-orange-100 w-full py-2 rounded-md">Following</button>

          {/* Filter Section  */}
          <TastePanel
            flavorTags={flavorTags}
            setFlavorTags={setFlavorTags}
            onRefresh={() => setCommittedTags(flavorTags)}
          />

          {/* Discover Breweries Section */}
          <section className="bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm">
            <h2 className="text-2xl font-bold mb-2">Breweries</h2>
            <p className="text-sm mb-2">Check out these local craft breweries:</p>
            <ul className="list-disc list-outside pl-5 space-y-1 text-sm font-medium">
              {breweries.slice(0, 20).map((brewery) => (
                <li key={brewery.breweryId}>
                  <a
                    href={`/brewery/${brewery.breweryId}`}
                    className="text-amber-800 hover:underline"
                  >
                    {brewery.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-[500px] p-6">
          <div className="flex flex-col gap-5 w-full">
          <h2 className="text-2xl text-left text-amber-800 font-bold"> Discover Beers </h2>
            
            {filteredBeers.length > 0 ? (
              filteredBeers.map((beer) => {

                const brewery = breweryMap[beer.breweryId];
                
                return (
                  <div
                    key={beer.id}
                    className="w-full bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm flex justify-between items-center"
                  >
                    {/* Beer Info */}
                    <div className="text-left">
                      <h2 className="text-xl text-amber-800 font-bold mt-0">{beer.name}</h2>
                      <p>
                        from {brewery?.name || 'Unknown Brewery'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {brewery?.city}, {brewery?.state}
                      </p>
                      <p className="text-sm text-gray-800">{beer.flavorTags.join(', ')}</p>
                    </div>

                    {/* Style + Action */}
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{beer.style}</p>
                      <p className="mb-2 font-medium text-gray-700">ABV = {(beer.abv * 100).toFixed(1)}%</p>
                      <button
                        className="bg-blue-200 px-4 py-2 rounded-full text-black"
                        onClick={() => {
                          setSelectedBeerId(beer.beerId);
                          setShowReviewModal(true);
                        }}
                      >
                        Review!
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-600 italic pt-16">
                No beers found with those flavor tags.
              </div>
            )}

            <div className="pagination-controls">
              <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
              <span className="ml-2 mr-2">  {currentPage + 1} of {totalPages} </span>
              <button disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
            </div>

          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-1/5 min-w-[220px] flex-shrink-0 bg-amber-100 p-4 space-y-4 text-left text-amber-800">
          <RecPanel selectedTags={committedTags} />
        </aside>
      </div>

      {/* modal (placed outside of flex container bc it overlays) */}
      {showReviewModal && (
        <ReviewModal
          beerId={selectedBeerId}
          onClose={() => setShowReviewModal(false)}
        />
      )}
      
    </div>
  );
}

export default UserDashboard;
