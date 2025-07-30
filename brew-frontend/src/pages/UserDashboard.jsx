import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import ReviewModal from '../components/ReviewModal'
import TastePanel from '../components/TastePanel';
import beer27 from "../assets/beer-27.svg";
import { createClient } from '@supabase/supabase-js';
import RecPanel from '../components/RecPanel';
import PastReviews from '../components/PastReviews';
import { useBreweryMap } from '../context/BreweryContext';
import { useNavigate, useParams } from 'react-router-dom';
import BeerFilter from '../components/BeerFilter';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function UserDashboard() {
    
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

    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
        fetchUserProfile(session);
        }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
        fetchUserProfile(session);
        }
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
    
        <div className="min-h-screen bg-amber-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between bg-orange-100 p-4 shadow-md">
            <Header />
            <div className="w-5/6">
            <SearchBar />
            </div>
            <div className="text-lg text-amber-800 font-semibold ml-2">
            Welcome, {username}!
            </div>
        </div>

        {/* Main Layout */}
        <div className="flex flex-row w-full max-w-screen-xl mx-auto min-h-[500px]">

            {/* Left Sidebar */}
            <aside className="w-[240px] flex-shrink-0 bg-orange-100 p-4 space-y-4 text-left text-amber-800">
            <button 
                className="bg-red-50 w-full !font-bold py-2 rounded-md"
                onClick= {() => {
                    const url = `/user/profile/${userId}`
                    window.open(url, '_blank')
                }}   
            >
                My Profile
            </button>
            <button
                className="bg-red-50 w-full !font-bold py-2 rounded-md"
                onClick={() => {
                const url = `/brewery/dashboard?address=${encodeURIComponent(address)}`;
                window.open(url, '_blank');
                }}
            >
                Find Breweries
            </button>
            <button
            className="bg-red-50 w-full !font-bold py-2 rounded-md"
            onClick={async () => {
                await supabase.auth.signOut();
                localStorage.removeItem("user_id");
                navigate("/login");
            }}
            >
            Log Out
            </button>

            
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
                        {brewery.breweryName}
                    </a>
                    </li>
                ))}
                </ul>
            </section>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-orange-50 max-w-[800px] p-6 border-gray-300 rounded-lg shadow-sm flex flex-col">
                <div className="flex flex-col gap-5 w-full flex-grow">
                    <h2 className="text-2xl text-left text-amber-800 font-bold"> Discover Beers </h2>

                    <BeerFilter
                    committedTags={committedTags}
                    onSetProximity={({ lat, lng, radius }) => {
                        setProximityCoords({ lat, lng });
                        setProximityRadius(radius);
                    }}
                    inline={true}
                    />

                    {filteredBeers.length > 0 ? (
                    filteredBeers.map((beer) => {
                        const brewery = breweryMap[beer.breweryUuid];
                        return (
                        <div
                            key={beer.beerId}
                            className="h-[180px] w-full bg-red-50 border border-gray-300 rounded-2xl p-6 shadow-sm flex justify-between items-center"
                            >
                            {/* Beer Info */}
                            <div className="flex items-start gap-x-4 text-left w-2/3">
                                <img src={beer27} alt="Brewery Icon" className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                                
                                <div className="flex flex-col justify-between h-full overflow-hidden">
                                <h2 className="text-xl text-amber-800 font-bold leading-tight line-clamp-2 break-words">
                                    {beer.name}
                                </h2>
                                <p className="text-sm text-gray-700 truncate">
                                    from {brewery?.breweryName || 'Unknown Brewery'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {brewery?.city}, {brewery?.state}
                                </p>
                                <p className="text-sm text-gray-800 truncate">
                                    {beer.flavorTags.map(tag => tag.charAt(0).toUpperCase() + tag.slice(1)).join(', ')}
                                </p>
                                </div>
                            </div>

                            {/* Style + Action */}
                            <div className="text-right h-full flex flex-col justify-between items-end">
                                <p className="font-medium text-gray-800">{beer.style}</p>
                                <p className="font-medium text-gray-700">ABV = {(beer.abv * 100).toFixed(1)}%</p>
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

                    <div className="mt-auto border-t pt-4 text-center">
                    <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
                    <span className="ml-2 mr-2"> {currentPage + 1} of {totalPages} </span>
                    <button disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                    </div>
                </div>
                </main>


            {/* Right Sidebar */}
            <aside className="w-[240px] flex-shrink-0 bg-orange-100 p-4 space-y-4 text-left text-amber-800">
            <PastReviews userId={userId} refreshRecs={refreshRecs}/>
            <RecPanel userId={userId} refreshRecs={refreshRecs}/>
            </aside>
        </div>

        {/* modal (placed outside of flex container bc it overlays) */}
        {showReviewModal && (
            <ReviewModal
            beerId={selectedBeerId}
            onClose={() => setShowReviewModal(false)}
            onReviewSubmit={() => setRefreshRecs(prev => !prev)}
            />
        )}
        
        </div>
    );
}

export default UserDashboard;