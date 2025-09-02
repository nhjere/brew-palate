import { useEffect, useState } from 'react';
import axios from 'axios';
import FullHeader from '../components/user/UserHeader.jsx';
import ReviewModal from '../components/user/ReviewModal.jsx'
import TastePanel from '../components/user/TastePanel.jsx';
import YourStyle from '../components/user/StylePanel.jsx';
import PastReviews from '../components/user/PastReviews.jsx';
import BeerProximity from '../components/user/BeerProximity.jsx'
import PanelShell from '../components/user/PanelShell.jsx';
import RecCards from '../components/user/RecCards.jsx'
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

        // repeat keys for arrays: ?tags=a&tags=b&styles=Lager&styles=IPA
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
  <div className="min-h-screen w-full overflow-x-hidden bg-[#fff4e6] flex flex-col
                pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
    <FullHeader
        searchQ={searchQ}
        setSearchQ={setSearchQ}
      />

    <div className='flex flex-col'> 

        <div className="w-full max-w-screen-xl mx-auto p-4
                flex flex-wrap md:flex-nowrap
                gap-4 md:gap-10 items-start">

        
        {/* Sidebar */}
        <aside className="w-full md:w-[260px] flex-shrink-0 space-y-4
                  mx-auto md:mx-0 md:pr-4">
            
            <BeerProximity
                committedTags={committedTags}
                onSetProximity={({ lat, lng, radius }) => {
                    setProximityCoords({ lat, lng });
                    setProximityRadius(radius);
                }}
                inline={true}
            />

            <PanelShell id="taste" title="Your Taste" capClass="max-h-60" summary={committedTags}>
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
            

        </aside>

        {/* Main Content */}
            <main className="flex flex-col gap-5 w-full flex-grow">
            <div className="flex flex-row items-center justify-between">
            <h2 className="text-2xl font-bold text-amber-900">
                Discover Beers
            </h2>
            <div className="ml-4 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg shadow-sm">
                <p className="text-sm text-amber-800 italic">
                ⚠️ Beta Testing Notice: The current beer list is from an older canned dataset and does not reflect live brewery updates.
                </p>
            </div>
            </div>
            
            <section className="grid grid-rows-[1fr_auto] min-h-[850px]">

                {/* Beer Cards */}
                <div className="overflow-y-auto space-y-4 pr-1 pb-16 md:pb-4">
                {beers.length > 0 ? (
                    beers.map((beer) => {
                    const brewery = breweryMap[beer.breweryUuid];
                    
                    return (
                        <div
                            key={beer.beerId}
                            className="relative flex flex-col md:flex-row md:items-center justify-between
                                        p-4 rounded-2xl bg-gradient-to-r from-[#4e2105] to-[#241200] text-white
                                        shadow-md w-full h-auto md:h-[180px]"
                            >

                            <div className="absolute bottom-0 left-90 w-100 h-32 overflow-hidden rounded-xl pointer-events-none">
                                <img
                                src={beer_mug}
                                alt=""
                                className="w-full h-full object-cover object-top scale-[2.6]"
                                />
                            </div>
                            

                            <div className="flex items-center gap-4 w-full md:w-2/3 pr-40">
                                <div className="flex flex-col">
                                <h3 className="text-xl font-bold">{beer.name}</h3>
                                <a href={`/brewery/${beer.breweryUuid}`} className="text-l !text-white/80 font-semibold">
                                    From {brewery?.breweryName || 'Unknown Brewery'}
                                </a>
                                <p className="text-l text-white/80">{brewery?.city}, {brewery?.state}</p>
                                <p className="flex flex-wrap gap-2 mt-1">
                                    {beer.flavorTags.slice(0, 6).map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 rounded-full text-sm border border-amber-300 bg-amber-50 text-amber-800"
                                    >
                                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                    </span>
                                    ))}
                                    {beer.flavorTags.length === 0 && (
                                    <span className="px-3 py-1 rounded-full text-sm border border-amber-200 text-amber-500">
                                        No flavor tags
                                    </span>
                                    )}
                                </p>
                                </div>
                            </div>

                            <div className="text-right flex flex-col items-end gap-2 mt-4 md:mt-0 z-10">
                                <div>
                                <p className="text-sm font-medium">{beer.style}</p>
                                <p className="text-sm">ABV = {(beer.abv * 100).toFixed(1)}%</p>
                                </div>
                                <button
                                className="bg-blue-200 hover:bg-blue-300 text-black px-4 py-1 rounded-full font-semibold"
                                onClick={() => { setSelectedBeerId(beer.beerId); setShowReviewModal(true); }}
                                >
                                Review!
                                </button>
                            </div>
                        </div> );
                    })
                ) : (
                    <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-600 italic">
                        No beers found with those search parameters.
                    </div>
                    </div>
                )}
                </div>

                {/* Pagination */}
                <div className="border-t pt-4 text-center w-full bg-[#fff4e6]">
                <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-4 py-1 text-sm font-medium text-gray-700 disabled:opacity-50"
                >
                    <span className="mr-1">&larr;</span>
                </button>
                <span className="mx-2 text-sm text-gray-600">
                    Page {currentPage + 1} of {totalPages ?? 1}
                </span>
                <button
                    disabled={currentPage === (totalPages ?? 1) - 1}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-4 py-1 text-sm font-medium text-gray-700 disabled:opacity-50"
                >
                    <span className="ml-1">&rarr;</span>
                </button>
                </div>
            </section>
                        
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
