import Header from '../components/Header';
import LocationFilter from '../components/LocationFilter';
import BreweryMap from '../components/BreweryMap';
// import CrawlGenerator from '../components/CrawlGenerator';
import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function BrewerDashboard() {

    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
    
    const location = useLocation();
    const [filteredBreweries, setFilteredBreweries] = useState([]);
    const [distance, setDistance] = useState(25);
    const [allBreweries, setAllBreweries] = useState([]);
    const navigate = useNavigate();
    const [mapCenter, setMapCenter] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const queryParams = new URLSearchParams(location.search);

    const [address, setAddress] = useState('');
    const isFirstLoad = useRef(true);

    // handles address loading in first spot
    useEffect(() => {
        if (isFirstLoad.current) {
            const queryAddress = queryParams.get('address');
            const stored = localStorage.getItem('brew_address');

            if (queryAddress) {
                setAddress(queryAddress);
                localStorage.setItem('brew_address', queryAddress);
            } else if (stored) {
                setAddress(stored);
            } else {
                setAddress('Austin');
            }

            isFirstLoad.current = false;
        }
    }, []);

    // store new value when user updates address
    const handleAddressChange = async (newAddress) => {
    try {
        const res = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(newAddress)}.json`,
        { params: { access_token: MAPBOX_TOKEN } }
        );

        const coords = res.data.features[0]?.center;

        if (coords) {
        setAddress(newAddress);
        localStorage.setItem('brew_address', newAddress);
        } else {
            alert("Invalid address. Please enter a more specific location.");
        }
        } catch (err) {
            console.error("Geocoding failed:", err);
            alert("Unable to verify address. Please try again.");
        }
    };
    

    // geo code address -> long, lat 
    useEffect(() => {
    const fetchCoords = async () => {
        if (!address) return;
        const res = await axios.get(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
            {
                params: {
                access_token: MAPBOX_TOKEN,
                },
            }
        );
        // extract lat, long from the mapbox api response
        const coords = res.data.features[0]?.center;
        if (coords) {
        const [lng, lat] = coords;
        fetchNearbyBreweries(lat, lng);
        setMapCenter({lat, lng})
        }
    };
    fetchCoords();
    }, [address, distance]);

    // fetch nearby breweries in backend w/ geocode parameters
    const fetchNearbyBreweries = async (lat, lng) => {
        try {
            const res = await axios.get(`http://localhost:8080/api/brewer/breweries/nearby`, {
            params: {lat,lng,radius: distance}
            });
            setFilteredBreweries(res.data);
        } catch (err) {
            console.error('Error fetching nearby breweries:', err);
        }
    }; 

    // retrigger a search
    const refetchNearby = () => {
    if (!address) return;

    axios
        .get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`, {
        params: {
            access_token: MAPBOX_TOKEN,
            autocomplete: true
        }
        })
        .then((res) => {
        const coords = res.data.features[0]?.center;
        if (coords) {
            const [lng, lat] = coords;
            fetchNearbyBreweries(lat, lng);
        }
        })
        .catch((err) => {
        console.error('Error geocoding address:', err);
        });
    };


    // brewery table pages logic 
    const breweriesPerPage = 11;
    const startIdx = (currentPage - 1) * breweriesPerPage;
    const currentPageBreweries = filteredBreweries.slice(startIdx, startIdx + breweriesPerPage);
    const totalPages = Math.ceil(filteredBreweries.length / breweriesPerPage);
            

    return (
        <div className="min-h-screen bg-orange-100">

        <div className="p-4">
            <Header />
            <div className="mt-2">
            <LocationFilter
                address={address}
                onAddressChange={handleAddressChange}
                distance={distance}
                setDistance={setDistance}
                breweries={allBreweries}
                onFilter={setFilteredBreweries}
                onSearch={refetchNearby}
            />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 px-4 pb-8">

            <div className="lg:col-span-3">
            <section className="bg-orange-50 border border-gray-300 rounded-lg p-4 shadow-sm h-full">
                <h2 className="text-xl font-semibold mb-2">Map View</h2>
                {mapCenter && (
                <BreweryMap 
                    breweries={filteredBreweries}
                    center={mapCenter}
                />
                )}
            </section>
            </div>

            <div className="lg:col-span-2">
            <section className="bg-orange-50 border border-gray-300 rounded-lg p-4 shadow-sm">
                <h2 className="text-xl font-semibold mb-2">Nearby Breweries</h2>
                <table className="min-w-full table-auto border border-gray-300 text-sm">
                <thead className="bg-orange-100">
                    <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Distance (mi)</th>
                    </tr>
                </thead>
                    <tbody>
                        {currentPageBreweries.map((brewery) => (
                        <tr key={brewery.breweryId} className="border-t">
                            <td className="px-4 py-2">
                            <a
                                href={`/brewery/${brewery.breweryId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-amber-800 hover:underline"
                            >
                                {brewery.breweryName}
                            </a>
                            </td>
                            <td className="px-4 py-2">
                            {brewery.distance ? brewery.distance.toFixed(2) : 'N/A'}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-between items-center mt-4 text-sm">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="bg-blue-100 px-4 py-2 rounded-full text-black"
                    >
                        Prev
                    </button>

                    <span>Page {currentPage} of {totalPages}</span>

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="bg-blue-100 px-4 py-2 rounded-full text-black"
                    >
                        Next
                    </button>
                </div>
            </section>
            </div>

        </div>
        </div>
    );
}
