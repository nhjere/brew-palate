import Header from '../components/header';
import SearchBar from '../components/SearchBar';
import LocationFilter from '../components/LocationFilter';
// import BreweryMap from '../components/BreweryMap';
// import CrawlGenerator from '../components/CrawlGenerator';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function BrewerDashboard() {

    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
    
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const [filteredBreweries, setFilteredBreweries] = useState([]);
    const [distance, setDistance] = useState(25);
    const [allBreweries, setAllBreweries] = useState([]);
    const navigate = useNavigate();
    const [address, setAddress] = useState(() => {
        return localStorage.getItem('brew_address') || '10120 Pickfair Dr';
    });

    
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
        

    return (
        <div className="min-h-screen bg-orange-100 ">
        <div className="flex items-center justify-between p-4">
            <Header />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
            <div className="col-span-1">
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

            <div className="col-span-2">
                <section className="bg-red-50 border border-gray-300 rounded-lg p-4 shadow-sm">
                    <h2 className="text-2xl font-bold mb-2">Breweries</h2>
                    <p className="text-sm mb-2">Check out these local craft breweries:</p>

                    <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border border-gray-300 text-sm">
                        <thead className="bg-orange-100">
                        <tr>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Address</th>
                            <th className="px-4 py-2 text-left">Distance (mi)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredBreweries.slice(0, 20).map((brewery) => (
                            <tr key={brewery.breweryId} className="border-t">
                            <td className="px-4 py-2 text-amber-800 hover:underline">
                                <Link to={`/brewery/${brewery.breweryId}`}>
                                    {brewery.breweryName}
                                </Link>
                            </td>
                            <td className="px-4 py-2">
                                {brewery.street}, {brewery.city}, {brewery.state}
                            </td>
                            <td className="px-4 py-2">
                                {brewery.distance ? brewery.distance.toFixed(2) : 'N/A'}
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </section>
                </div>
        </div>



        </div>
    );
}
