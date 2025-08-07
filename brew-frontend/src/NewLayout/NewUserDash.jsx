import { useEffect, useState } from 'react';
import axios from 'axios';
import NewHeader from './NewHeader';
import ReviewModal from '../components/ReviewModal'
import TastePanel from '../components/TastePanel';
import beer27 from "../assets/beer-27.svg";
import supabase from '../supabaseClient';
import RecPanel from '../components/RecPanel'
import PastReviews from '../components/PastReviews';
import { useBreweryMap } from '../context/BreweryContext';
import { useNavigate, useParams } from 'react-router-dom';

import BeerFilter from '../components/BeerFilter';


export default function NewUserDash() {
    
    const [proximityCoords, setProximityCoords] = useState(null);
    const [proximityRadius, setProximityRadius] = useState(25);

    // set user 
    const [userId, setUserId] = useState(null);
    const {userId: paramUserId } = useParams();
    const navigate = useNavigate();

    // main dashboard variables
    const [beers, setBeers] = useState([]);
    const [breweries, setBreweries] = useState([]);
    const [username, setUsername] = useState('');
    const [address, setAddress] = useState('');

    // taste panel variables
    const [flavorTags, setFlavorTags] = useState([]);
    const [committedTags, setCommittedTags] = useState([]);

    // review modal variables
    const [selectedBeerId, setSelectedBeerId] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [refreshRecs, setRefreshRecs] = useState(false);

    // pagination variables
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState();
    const breweryMap = useBreweryMap();

    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  
    // Fetch user and sets username using Supabase user ID
    useEffect(() => {
    const fetchUserProfile = async (session) => {
        if (!session) {
        console.warn("No Supabase session found.");
        return;
        }

        const user = session.user;
        setUserId(user.id);
        localStorage.setItem("user_id", user.id);

        const token = session.access_token;
        try {
        const res = await axios.get(`${BASE_URL}/api/user/profile`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        setUsername(res.data.username || '');
        setAddress(res.data.address || '');
        } catch (err) {
        console.error("Failed to fetch user profile:", err);
        }
    };

    // listens for auth state changes (login, logout, refresh, token renewal)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
            fetchUserProfile(session);
        }
    })

    // if active session, fetch profile
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) fetchUserProfile(session);
    });


    return () => {
        authListener.subscription.unsubscribe();
    };
    }, []);

    
    // fetch filtered beers from csv backed db
    useEffect(() => {
    const fetchFilteredBeers = async () => {
        try {
        const res = await axios.get(`${BASE_URL}/api/import/filtered-all-beers`, {
            params: {
                tags: committedTags,
                page: currentPage,
                size: 7,
                ...(proximityCoords && {
                    lat: proximityCoords.lat,
                    lng: proximityCoords.lng,
                    radius: proximityRadius
                })
            },
            paramsSerializer: params => new URLSearchParams(params).toString()
        });

        setBeers(res.data.content);
        setTotalPages(res.data.totalPages);
        } catch (err) {
        console.error("Failed to fetch beers", err);
        }
    };

    fetchFilteredBeers();
    }, [committedTags, currentPage, proximityCoords, proximityRadius]);

    // resets page
    useEffect(() => {
        setCurrentPage(0);
    }, [committedTags, proximityCoords, proximityRadius]);

    // reads in all breweries from db (previously posted from open brewery db)
    useEffect(() => {
        axios.get(`${BASE_URL}/api/brewer/breweries/all`)
        .then(res => setBreweries(res.data))
        .catch(err => console.error(err));

    }, []);

    const filteredBeers = beers;

    return (

          
      <div className="min-h-screen bg-[#fff4e6] flex flex-col">
      <NewHeader />
        <div className="flex flex-row w-full min-h-[500px] gap-4 p-4">

          <aside className="w-[240px] flex-shrink-0 space-y-4">
            <TastePanel
              flavorTags={flavorTags}
              setFlavorTags={setFlavorTags}
              onRefresh={() => setCommittedTags(flavorTags)}
            />
            <section className="bg-white border rounded-xl p-4 shadow">
              <h2 className="text-lg font-bold text-[#3f3f3f] mb-2">Your Recs</h2>
              <RecPanel userId={userId} refreshRecs={refreshRecs} />
            </section>
            <section className="bg-white border rounded-xl p-4 shadow">
              <h2 className="text-lg font-bold text-[#3f3f3f] mb-2">Your Past Reviews</h2>
              <PastReviews userId={userId} refreshRecs={refreshRecs} />
            </section>
          </aside>

          <main className="flex-1 flex flex-col space-y-4">
            <h2 className="text-2xl font-bold text-[#3f3f3f]">Find Beers</h2>
            <BeerFilter
              committedTags={committedTags}
              onSetProximity={({ lat, lng, radius }) => {
                setProximityCoords({ lat, lng });
                setProximityRadius(radius);
              }}
              inline={true}
            />

            {beers.length > 0 ? (
              beers.map((beer) => {
                const brewery = breweryMap[beer.breweryUuid];
                return (
                  <div
                    key={beer.beerId}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#4e2105] to-[#241200] text-white shadow-md"
                  >
                    <div className="flex items-center gap-4 w-2/3">
                      <img src={beer27} alt="Beer" className="w-24 h-24 rounded object-cover" />
                      <div className="flex flex-col">
                        <h3 className="text-xl font-bold">{beer.name}</h3>
                        <p className="text-sm text-white/80">From {brewery?.breweryName || 'Unknown Brewery'}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div>
                        <p className="text-sm font-medium">{beer.style}</p>
                        <p className="text-sm">ABV = {(beer.abv * 100).toFixed(1)}%</p>
                      </div>
                      <button
                        className="bg-[#d1f0f7] text-black px-4 py-1 rounded-full font-semibold"
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

            <div className="mt-4 border-t pt-4 text-center">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-4 py-1 text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="mx-2 text-sm text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-1 text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </main>
        </div>

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
