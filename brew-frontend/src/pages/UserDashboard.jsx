import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/header';
import SearchBar from '../components/SearchBar';
import ReviewModal from '../components/ReviewModal'
import TastePanel from '../components/TastePanel';
import { createClient } from '@supabase/supabase-js';
import RecPanel from '../components/RecPanel';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function UserDashboard() {

  // main dashboard variables
  const [beers, setBeers] = useState([]);
  const [breweries, setBreweries] = useState([]);
  const [username, setUsername] = useState('');
  const [flavorTags, setFlavorTags] = useState([]);
  const [committedTags, setCommittedTags] = useState([]);

  // review modal variables
  const [selectedBeerId, setSelectedBeerId] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch beers
  useEffect(() => {
    axios.get('http://localhost:8080/api/brewer/beers')
      .then(res => setBeers(res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch breweries
  useEffect(() => {
    axios.get('http://localhost:8080/api/brewer/breweries')
      .then(res => setBreweries(res.data))
      .catch(err => console.error(err));
  }, []);

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

  // filtering logic for main beer feed
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
            tags={flavorTags}
            setTags={setFlavorTags}
            onRefresh={() => setCommittedTags(flavorTags)}
          />

          {/* Discover Breweries Section */}
          <section className="bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm">
            <h2 className="text-2xl font-bold mb-2">Breweries</h2>
            <p className="text-sm mb-2">Check out these local craft breweries:</p>
            <ul className="list-disc list-outside pl-5 space-y-1 text-sm font-medium">
              {breweries.slice(0, 15).map((brewery) => (
                <li key={brewery.breweryId}>
                  <a
                    href={`/brewery/${brewery.breweryId}`}
                    className="text-amber-800 hover:underline"
                  >
                    {brewery.breweryName}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-[500px] p-6">
          <div className="flex flex-col gap-5 w-full">
            <h2 className="text-left text-amber-800 font-bold text-xl">Discover Beers</h2>

            {filteredBeers.length > 0 ? (
              filteredBeers.map((beer) => (
                <div
                  key={beer.id}
                  className="w-full bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm flex justify-between items-center"
                >
                  {/* Beer Info */}
                  <div className="text-left">
                    <h2 className="text-xl text-amber-800 font-bold">{beer.name}</h2>
                    <p className="italic text-sm text-gray-700 mb-2">from {beer.breweryName}</p>
                    <p className="text-sm text-gray-800">{beer.flavorTags.join(', ')}</p>
                  </div>

                  {/* Style + Action */}
                  <div className="text-right">
                    <p className="mb-2 font-medium text-gray-800">{beer.style}</p>
                    <button
                      className="bg-blue-200 px-4 py-2 rounded-full text-black"
                      onClick={() => {
                        setSelectedBeerId(beer.id);
                        setShowReviewModal(true);
                      }}
                    >
                      Review!
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-600 italic pt-16">
                No beers found with those flavor tags.
              </div>
            )}
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
