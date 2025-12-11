import { useEffect, useState } from 'react';
import axios from 'axios';
import FullHeader from '../components/user/UserHeader.jsx';
import ReviewModal from '../components/user/ReviewModal.jsx'
import TastePanel from '../components/user/landing/TastePanel.jsx';
import YourStyle from '../components/user/landing/StylePanel.jsx';
import PastReviews from '../components/user/PastReviews.jsx';
import BeerProximity from '../components/user/landing/BeerProximity.jsx'
import PanelShell from '../components/user/landing/PanelShell.jsx';
import RecCards from '../components/user/landing/RecCards.jsx'
import Friends from '../components/user/Friends.jsx'
import beer_mug from "../assets/beer_mug.png";
import supabase from '../supabaseClient.js';
import { useBreweryMap } from '../context/BreweryContext.jsx';
import { useNavigate, useParams } from 'react-router-dom';


export default function NewUserDash() {
    

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

    // style panel variables
    const [selectedStyles, setSelectedStyles] = useState(
        JSON.parse(localStorage.getItem('userStyles') || '[]')
        );
    const [committedStyles, setCommittedStyles] = useState([]);

    // beer proximity variables
    const [proximityCoords, setProximityCoords] = useState(null);
    const [proximityRadius, setProximityRadius] = useState(25);
    const handleClearLocation = () => {
        setProximityCoords(null);
        setProximityRadius(25);
    };

    // review modal variables
    const [selectedBeerId, setSelectedBeerId] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [refreshRecs, setRefreshRecs] = useState(false);

    // pagination variables
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState();
    const breweryMap = useBreweryMap();

    // search vars
    const [searchQ, setSearchQ] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchMode, setSearchMode] = useState(false);

    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  
    // Fetch user and sets username using Supabase user ID
    useEffect(() => {
    const fetchUserProfile = async (session) => {
        if (!session) {
        sessionStorage.setItem("bp_showLogoutModal", "1");
        window.location.reload();
        return;
        }

        const user = session.user;
        setUserId(user.id);
        localStorage.setItem("user_id", user.id);

        const token = session.access_token;
        localStorage.setItem("access_token", token);
        
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

    // whenever searchQ changes, toggle mode
    useEffect(() => {
        setSearchMode(searchQ.trim().length > 0);
    }, [searchQ]);


    // Search API 
    useEffect(() => {
    if (!searchMode) return;
    const fetchSearch = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/import/search/beers`, {
          params: { q: searchQ, page: 0, size: 20 },
        });
        setSearchResults(res.data.content || []);
      } catch (err) {
        console.error("Search failed", err);
      }
    };
    fetchSearch();
  }, [searchQ, searchMode]);
    
    useEffect(() => {
    const fetchFilteredBeers = async () => {
        try {
        const params = {
            tags: committedTags,
            styles: committedStyles,
            page: currentPage,
            size: 4,
            ...(proximityCoords && {
            lat: proximityCoords.lat,
            lng: proximityCoords.lng,
            radius: proximityRadius,
            }),
        };

        // repeat keys for arrays:
        const paramsSerializer = (p) => {
            const usp = new URLSearchParams();
            if (p.page != null) usp.set('page', p.page);
            if (p.size != null) usp.set('size', p.size);
            if (p.lat != null) usp.set('lat', p.lat);
            if (p.lng != null) usp.set('lng', p.lng);
            if (p.radius != null) usp.set('radius', p.radius);
            (p.tags || []).forEach(t => usp.append('tags', t));
            (p.styles || []).forEach(s => usp.append('styles', s));   // ← NEW
            return usp.toString();
        };

        const res = await axios.get(`${BASE_URL}/api/import/filtered-all-beers`, {
            params,
            paramsSerializer,
        });

        setBeers(res.data.content);
        setTotalPages(res.data.totalPages);
        } catch (err) {
        console.error("Failed to fetch beers", err);
        }
    };

    fetchFilteredBeers();
    }, [committedTags, committedStyles,currentPage,proximityCoords,proximityRadius]);

    // resets page
    useEffect(() => {
        setCurrentPage(0);
    }, [committedTags, committedStyles, proximityCoords, proximityRadius])

    // reads in all breweries from db (previously posted from open brewery db)
    useEffect(() => {
        axios.get(`${BASE_URL}/api/brewer/breweries/all`)
        .then(res => setBreweries(res.data))
        .catch(err => console.error(err));

    }, []);

    const filteredBeers = beers;

return (
  <div className="min-h-screen w-full overflow-x-hidden bg-white flex flex-col
                pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
    <FullHeader
        searchQ={searchQ}
        setSearchQ={setSearchQ}
      />

    <div className='flex flex-col'> 

        <div
        className="
            w-full 
            max-w-8xl
            mx-auto         
            px-4 md:px-8 py-4
            flex flex-wrap md:flex-nowrap
            gap-6 md:gap-10 items-start
        "
        >
        {/* Sidebar */}
        <aside className="w-full md:w-[260px] flex-shrink-0 space-y-4">

            <BeerProximity
            committedTags={committedTags}
            onSetProximity={(coords) => {
                if (!coords) {
                setProximityCoords(null);
                setProximityRadius(25);
                } else {
                const { lat, lng, radius } = coords;
                setProximityCoords({ lat, lng });
                setProximityRadius(radius);
                }
            }}
            />

            <PanelShell id="taste" title="Your Palate" capClass="max-h-60" summary={committedTags}>
                <TastePanel
                    withShell={false}
                    flavorTags={flavorTags}
                    setFlavorTags={setFlavorTags}
                    onRefresh={(tags) => setCommittedTags(tags)}
                />
            </PanelShell>

            <PanelShell id="style" title="Your Style" capClass="max-h-60" summary={committedStyles}>
            <YourStyle
                withShell={false}
                selectedStyles={selectedStyles}
                setSelectedStyles={setSelectedStyles}
                onRefresh={(styles) => setCommittedStyles(styles)}
            />
            </PanelShell>


            <PanelShell id="reviews" title="Past Reviews" capClass="max-h-60">
                <PastReviews 
                    withShell={false}
                    userId={userId} 
                    refreshRecs={refreshRecs} 
                />
            </PanelShell>

            {/* <PanelShell id="reviews" title="Friends" capClass="max-h-60">
                <Friends
                    withShell={false}
                    userId={userId} 
                />
            </PanelShell>
             */}

        </aside>

        {/* Main Content */}
            <main className="flex flex-col gap-5 w-full flex-grow">
            <div className="flex flex-row items-center justify-between">
            <h2 className="text-2xl font-bold text-[#8C6F52]">
                Discover Beers
            </h2>
            <div className="ml-4 px-3 py-1 bg-gray-50 border rounded border-[#6E7F99] shadow-sm">
                <p className="text-sm text-[#6E7F99] italic">
                ⚠️ Beta Testing Notice: The current beer list is from an older canned dataset and does not reflect live brewery updates.
                </p>
            </div>
            </div>
            
            <section className="relative grid grid-rows-[1fr_auto] min-h-[850px] overflow-hidden">


                {/* Single large overlay beer image ON TOP of the cards */}
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                    <img
                    src={beer_mug}
                    alt=""
                    className="h-full w-auto opacity-15 object-contain scale-170 -mt-40"
                    />

                </div>

                {/* Beer Cards (underlay, but still clickable because overlay has pointer-events-none) */}
                <div className="relative z-10 overflow-y-auto space-y-4 pr-1 pb-16 md:pb-4">
                    {beers.length > 0 ? (
                    beers.map((beer) => {
                        const brewery = breweryMap[beer.breweryUuid];
                        console.log(brewery)
                        return (
                        <div
                            key={beer.beerId}
                            className="relative flex flex-col md:flex-row items-stretch
                                    w-full bg-[#f2f2f2] shadow-md px-4 py-4 md:px-6 md:py-5 gap-4"
                        >
                            {/* RIGHT: Content */}
                            <div className="flex flex-1 flex-col justify-between">
                            {/* Top: Name + Brewery */}
                            <div>
                                <h3 className="text-3xl tracking-[0.02em] md:text-2xl font-bold  text-[#8C6F52] uppercase">
                                {beer.name}
                                </h3>
                                
                                <p className="mt-1 !text-md md:text-base font-semibold  text-slate-500">
                                {brewery?.breweryName || "Unknown Brewery"}
                                </p>
                                <p className="mt-1 italic text-xs md:text-base font-medium text-slate-500">
                                {brewery ? `${brewery.city}, ${brewery.state}` : "Unknown Address"}
                                </p>

                                {/* Flavor tags and style */}
                                <div className="mt-3 text-[11px] md:text-xs font-semibold  text-slate-600 uppercase">
                                {(
                                    beer.flavorTags && beer.flavorTags.length > 0
                                    ? beer.flavorTags.slice(0, 3)
                                    : ["No Tags"]
                                )
                                    .map((t) => t.toUpperCase())
                                    .join(" • ")}
                                </div>

                                {/* Divider line */}
                                <div className="mt-4 h-px w-full bg-slate-200" />
                            </div>

                            {/* Bottom row: style/ABV + review button */}
                            <div className="mt-4 flex items-center justify-between gap-4">
                                <div className="text-sm md:text-base text-slate-700">
                                <p className="font-medium">
                                    {beer.style || "Style not listed"}
                                </p>
                                <p className="mt-1 text-xs md:text-sm text-slate-500">
                                    ABV {((beer.abv || 0) * 100).toFixed(1)}%
                                </p>
                                </div>

                                <button
                                onClick={() => {
                                    setSelectedBeerId(beer.beerId);
                                    setShowReviewModal(true);
                                }}
                                className="px-7 md:px-10 py-2.5 md:py-3 rounded-md bg-[#3C547A]
                                            text-white text-xs md:text-sm font-semibold 
                                            uppercase hover:bg-[#314466] transition-colors"
                                >
                                Review
                                </button>
                            </div>
                            </div>
                        </div>
                        );
                    })
                    ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-600 italic">
                        No beers found with those search parameters.
                        </div>
                    </div>
                    )}
                </div>
                </section>


                {/* Pagination */}
                <div className="border-t border-[#8C6F52] pt-4 text-center w-full bg-[#ffffff]">
                <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-4 py-1 text-sm font-medium text-[#8C6F52] disabled:opacity-50"
                >
                    <span className="mr-1">&larr;</span>
                </button>
                <span className="mx-2 text-sm text-[#8C6F52]">
                    Page {currentPage + 1} of {totalPages ?? 1}
                </span>
                <button
                    disabled={currentPage === (totalPages ?? 1) - 1}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-4 py-1 text-sm font-medium text-[#8C6F52] disabled:opacity-50"
                >
                    <span className="ml-1">&rarr;</span>
                </button>
                </div>
                        
                <RecCards userId={userId} refreshRecs={refreshRecs}/>
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

  </div>
);

}
