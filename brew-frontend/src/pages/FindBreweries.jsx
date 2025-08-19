import FullHeader from '../components/FullHeader';
import LocationFilter from '../components/LocationFilter';
import BreweryMap from '../components/BreweryMap';
import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export default function BrewerDashboard() {

    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
    
    const location = useLocation();
    const [filteredBreweries, setFilteredBreweries] = useState([]);
    const [distance, setDistance] = useState(25);
    const [allBreweries, setAllBreweries] = useState([]);
    const [mapCenter, setMapCenter] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const queryParams = new URLSearchParams(location.search);

    const [address, setAddress] = useState('');
    const isFirstLoad = useRef(true);
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    
    // handles address loading in first spot
    useEffect(() => {
        if (!isFirstLoad.current) return;
        const queryAddress = queryParams.get('address');
        const stored = localStorage.getItem('brew_address');
        const base = queryAddress || stored || 'Austin';
        isFirstLoad.current = false;
        refetchNearby(base, distance);
    }, []);

    // store new value when user updates address
    const handleAddressChange = (newAddress) => {
        setAddress(newAddress);
        localStorage.setItem('brew_address', newAddress);
        };

    // add this unified fetch (accepts optional override)
    const refetchNearby = async (overrideAddress, overrideRadius) => {
        const addr = overrideAddress ?? address;
        const radius = overrideRadius ?? distance;
        if (!addr) return;

        try {
            const geo = await axios.get(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addr)}.json`,
            { params: { access_token: MAPBOX_TOKEN, autocomplete: true } }
            );
            const coords = geo.data.features[0]?.center;
            if (!coords) return;
            const [lng, lat] = coords;

            if (addr !== address) {
            setAddress(addr);
            localStorage.setItem('brew_address', addr);
            }

            setMapCenter({ lat, lng });
            setCurrentPage(1);

            const nearby = await axios.get(`${BASE_URL}/api/brewer/breweries/nearby`, {
            params: { lat, lng, radius }
            });
            setFilteredBreweries(nearby.data);
        } catch (err) {
            console.error('Search failed:', err);
        }
    };

    // brewery table pages logic 
    const breweriesPerPage = 8;
    const startIdx = (currentPage - 1) * breweriesPerPage;
    const currentPageBreweries = filteredBreweries.slice(startIdx, startIdx + breweriesPerPage);
    const totalPages = Math.ceil(filteredBreweries.length / breweriesPerPage);
            
return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fff4e6] flex flex-col">
        <FullHeader />
        <div className="px-4">
            <LocationFilter
            address={address}
            onAddressChange={handleAddressChange}
            distance={distance}
            setDistance={setDistance}
            onSearch={(addr, rad) => refetchNearby(addr, rad)}
            />

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 px-4 pb-8 mt-4">
            <section className="lg:col-span-3 w-full bg-orange-50 p-4 rounded-2xl overflow-hidden border shadow-md transition-all">
                <h2 className="text-xl font-bold text-amber-900 mb-2">Map View</h2>
                {mapCenter && (
                <div className="overflow-hidden rounded-xl ring-1 ring-amber-800">
                    <BreweryMap breweries={filteredBreweries} center={mapCenter} />
                </div>
                )}
            </section>

            <section className="lg:col-span-2 bg-orange-50 p-4 rounded-2xl overflow-hidden border shadow-md transition-all">
                <h2 className="text-xl font-bold text-amber-900 mb-3">Nearby Breweries</h2>

                <div className="max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-amber-900 backdrop-blur rounded-lg">
                    <tr className="text-white">
                        <th className="px-4 py-2 text-left  font-semibold">Name</th>
                        <th className="px-4 py-2 text-left  font-semibold">Distance</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-900/40">
                    {currentPageBreweries.map((b) => (
                        <tr key={b.breweryId} className="hover:bg-amber-900/10">
                        <td className="px-4 py-2">
                            <a
                                href={`/brewery/${b.breweryId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-amber-950 font-medium hover:underline"
                            >
                            {b.breweryName}
                            </a>
                            <div className="text-[11px] text-amber-900/80">
                            {b.city && b.state ? `${b.city}, ${b.state}` : ''}
                            </div>
                        </td>
                        <td className="px-4 py-2 text-amber-950">
                            {b.distance ? `${b.distance.toFixed(1)} mi` : '—'}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="rounded-full px-4 py-2 ring-1 ring-amber-900 bg-amber-900 text-white disabled:opacity-40"
                >
                    Prev
                </button>
                <span className="text-amber-950">Page {currentPage} of {totalPages || 1}</span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="rounded-full px-4 py-2 ring-1 ring-amber-900 bg-amber-900 text-white disabled:opacity-40"
                >
                    Next
                </button>
                </div>
            </section>
        </div>
    </div>
);

}
