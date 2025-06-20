import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/header';
import SearchBar from '../components/SearchBar';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function UserDashboard() {
  const [beers, setBeers] = useState([]);
  const [breweries, setBreweries] = useState([]);
  const [username, setUsername] = useState('');

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

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-amber-100 p-4 shadow-md">
        <Header />
        <div className="w-5/6">
          <SearchBar />
        </div>
        <div className="text-lg text-amber-800 font-semibold ml-2 ">
            Welcome, {username}!
        </div>

      </div>

      {/* Welcome Message */}

      {/* Main Layout */}
      <div className="flex flex-row flex-1 w-full">
        {/* Left Sidebar */}
        <aside className="w-1/5 bg-amber-100 p-4 space-y-4 text-left text-amber-800">
          <button className="bg-orange-100 w-full py-2 rounded-md">My Profile</button>
          <button className="bg-orange-100 w-full py-2 rounded-md">Following</button>

          <section className="bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm">
            <h2 className="text-2xl font-bold mb-2">Breweries</h2>
            <p className="text-sm mb-2">Check out these local craft breweries:</p>
            <ul className="list-disc list-outside pl-5 space-y-1 text-sm font-medium">
              {breweries.slice(0, 15).map((brewery) => (
                <li key={brewery.breweryId}>{brewery.breweryName}</li>
              ))}
            </ul>
          </section>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="flex flex-col gap-5 w-full">
            {beers.map((beer) => (
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
                  <button className="bg-blue-200 px-4 py-2 rounded-full text-black">Review!</button>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-1/5 bg-amber-100 p-4 space-y-4 text-left text-amber-800">
          <section className="bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm">
            <h2 className="text-2xl font-bold mb-2">Recs</h2>
            <p className="text-sm mb-2">Try these local crafts!</p>
            <ul className="list-disc list-outside pl-5 space-y-1 text-sm font-medium">
              {beers.slice(0, 15).map((beer) => (
                <li key={beer.id}>
                  <span className="font-semibold">{beer.name}</span>
                  <div className="ml-4 italic text-gray-700">{beer.breweryName}</div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default UserDashboard;
